import { HistorialCompraWithId, ItemHistorialConProducto } from '@/interfaces/historial';
import { ProductoWithId } from '@/interfaces/producto';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { app } from '@/config/conexion';
import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export function useHistorial(user: User | null) {
  const { searchByField, getById } = useCrudFireStorage();

  const [historial, setHistorial] = useState<HistorialCompraWithId[]>([]);
  const [loading, setLoading] = useState(false);

  // Mapear productos del historial con sus datos actuales
  const mapearProductosHistorial = async (
    compra: HistorialCompraWithId
  ): Promise<HistorialCompraWithId> => {
    const itemsConProductos: ItemHistorialConProducto[] = [];

    for (const item of compra.items) {
      const productResult = await getById<ProductoWithId>(item.idProducto, 'productos');

      if (productResult.success && productResult.data) {
        itemsConProductos.push({
          ...item,
          producto: productResult.data,
        });
      } else {
        // Si el producto ya no existe, mostramos un placeholder
        console.warn(`Producto ${item.idProducto} no encontrado en historial`);
        itemsConProductos.push({
          ...item,
          producto: {
            id: item.idProducto,
            nombre: '[Producto eliminado]',
            descripcion: 'Este producto ya no está disponible',
            precio: 0,
            stock: 0,
            imagenUrl: '',
            tamanio: '',
            createdAt: new Date(),
          },
        });
      }
    }

    return {
      ...compra,
      items: itemsConProductos as any, // TypeScript trick para mantener compatibilidad
    };
  };

  // Cargar historial del usuario
  const loadHistorial = async () => {
    if (!user) {
      setHistorial([]);
      return;
    }

    setLoading(true);
    try {
      const result = await searchByField<HistorialCompraWithId>('user_id', user.uid, 'historial');

      if (result.success) {
        // Ordenar por fecha descendente (más reciente primero)
        const sortedHistorial = result.data.sort((a, b) => {
          const dateA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
          const dateB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
          return dateB.getTime() - dateA.getTime();
        });

        // Mapear productos de cada compra
        const historialConProductos = await Promise.all(
          sortedHistorial.map((compra) => mapearProductosHistorial(compra))
        );

        setHistorial(historialConProductos);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };
  const getPedidosCompletados = () => {
    return historial.filter(
      (pedido) => pedido.estado === 'completado' || pedido.estado === 'entregado'
    );
  };

  // Método para obtener pedidos por estado
  const getPedidosPorEstado = (estado: string) => {
    return historial.filter((pedido) => pedido.estado === estado);
  };

  // Escuchar historial en tiempo real cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setHistorial([]);
      return;
    }

    setLoading(true);
    const db = getFirestore(app);
    const q = query(collection(db, 'historial'), where('user_id', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const docs = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as any),
          })) as HistorialCompraWithId[];

          // Ordenar por fecha descendente (más reciente primero)
          const sortedHistorial = docs.sort((a, b) => {
            const dateA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
            const dateB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
            return dateB.getTime() - dateA.getTime();
          });

          // Mapear productos de cada compra
          const historialConProductos = await Promise.all(
            sortedHistorial.map((compra) => mapearProductosHistorial(compra))
          );

          setHistorial(historialConProductos);
        } catch (error) {
          console.error('Error procesando snapshot de historial:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Listener de historial error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return {
    historial,
    loading,
    loadHistorial,
  };
}
