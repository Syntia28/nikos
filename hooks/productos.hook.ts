import { ProductoWithId } from '@/interfaces/producto';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { useMemo, useState, useEffect } from 'react';
import eventBus from '@/lib/eventBus';

export function useProductos() {
  const { getById, getAll } = useCrudFireStorage();

  // Estados para las listas
  const [productos, setProductos] = useState<ProductoWithId[]>([]);

  // Estados para búsqueda
  const [searchValue, setSearchValue] = useState('');
  const [searchField, setSearchField] = useState('nombre');

  // Estados de carga
  const [loading, setLoading] = useState(false);

  // Campos de búsqueda disponibles
  const searchFields = [
    { label: 'Nombre', value: 'nombre' },
    { label: 'Descripción', value: 'descripcion' },
  ];

  // Lista filtrada computada
  const filteredProductos = useMemo(() => {
    if (!searchValue.trim()) {
      return productos;
    }

    return productos.filter((producto) => {
      const value = producto[searchField as keyof ProductoWithId];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchValue.toLowerCase());
      }
      return false;
    });
  }, [productos, searchValue, searchField]);

  // Función para obtener un producto por ID
  const GetById = async (productId: string): Promise<any | null> => {
    try {
      const result = await getById<any>(productId, 'productos');
      if (result.success && result.data) {
        const productoData = result.data;
        if (productoData.createdAt && typeof productoData.createdAt.toDate === 'function') {
          productoData.createdAt = productoData.createdAt.toDate();
        }
        return productoData;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener producto:', error);
      return null;
    }
  };

  // Función para cargar todos los productos
  const GetAll = async () => {
    setLoading(true);
    try {
      const data = await getAll<ProductoWithId>('productos');
      const productList = data.data || [];
      setProductos(productList);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar un producto específico desde el servidor
  const refreshProduct = async (productId: string) => {
    try {
      const result = await getById<ProductoWithId>(productId, 'productos');
      if (result.success && result.data) {
        setProductos((prev) => {
          const exists = prev.find((p) => p.id === productId);
          if (exists) {
            return prev.map((p) => (p.id === productId ? result.data! : p));
          }
          // Si no existía, lo agregamos al inicio
          return [result.data!, ...prev];
        });
      }
    } catch (error) {
      console.error('Error refrescando producto:', error);
    }
  };

  const refreshProducts = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    await Promise.all(ids.map((id) => refreshProduct(id)));
  };

  // Escuchar eventos de recarga desde otras pantallas (p. ej. después de calificar)
  useEffect(() => {
    const unsubscribe = eventBus.on('recargar_productos', async (payload?: any) => {
      try {
        if (!payload) {
          await GetAll();
          return;
        }

        // Si el payload es un array de strings (ids), refrescamos desde el servidor
        if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'string') {
          await refreshProducts(payload as string[]);
          return;
        }

        // Si el payload es un array de objetos con { id, calificacion }, aplicamos actualizacion optimista
        if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'object') {
          const items: any[] = payload;
          setProductos((prev) => {
            const copy = [...prev];
            for (const it of items) {
              const id = it.id;
              const cal = it.calificacion;
              const idx = copy.findIndex((p) => p.id === id);
              if (idx >= 0) {
                const prod = { ...copy[idx] } as any;
                const existing = Array.isArray(prod.calificaciones) ? [...prod.calificaciones] : [];

                // Mejor comprobación de duplicados:
                // 1) si existe compraId, compararlo
                // 2) si no, comparar userId + fecha exacta
                // 3) fallback: userEmail + fecha o userId+comment+score
                const exists = existing.find((c: any) => {
                  if (cal.compraId && c.compraId) return c.compraId === cal.compraId;
                  if (c.userId && cal.userId && c.fecha && cal.fecha) {
                    try {
                      return (
                        c.userId === cal.userId &&
                        new Date(c.fecha).toISOString() === new Date(cal.fecha).toISOString()
                      );
                    } catch (e) {
                      // ignore
                    }
                  }
                  if (c.userEmail && cal.userEmail && c.fecha && cal.fecha) {
                    try {
                      return (
                        c.userEmail === cal.userEmail &&
                        new Date(c.fecha).toISOString() === new Date(cal.fecha).toISOString()
                      );
                    } catch (e) {
                      // ignore
                    }
                  }
                  // fallback por contenido
                  return (
                    (c.userId === cal.userId || c.userEmail === cal.userEmail) &&
                    String(c.comment || '') === String(cal.comment || '') &&
                    Number(c.score || 0) === Number(cal.score || 0)
                  );
                });

                if (!exists) {
                  const nueva = { ...cal };
                  existing.push(nueva);
                  // recalcular ratingPromedio y total
                  const total = existing.length;
                  const promedio = Number(
                    (
                      existing.reduce((acc: any, c: any) => acc + (c.score || 0), 0) / total
                    ).toFixed(1)
                  );
                  prod.calificaciones = existing;
                  prod.totalCalificaciones = total;
                  prod.ratingPromedio = promedio;
                  copy[idx] = prod;
                }
              } else {
                // si no existe localmente, intentamos traer desde servidor
                (async () => {
                  try {
                    await refreshProduct(id);
                  } catch (e) {
                    // ignore
                  }
                })();
              }
            }
            return copy;
          });
          return;
        }
      } catch (e) {
        console.error('Error manejando evento recargar_productos en hook productos:', e);
      }
    });

    return () => unsubscribe();
  }, [GetAll, refreshProduct, refreshProducts]);

  // Obtener comentarios de un producto consultando primero el documento del producto
  // y como fallback buscando en la colección 'historial' compras que incluyan el producto
  const getComentariosPorProducto = async (productId: string, limit = 10) => {
    try {
      // 1) Revisar si el producto en estado local tiene calificaciones
      const local = productos.find((p) => p.id === productId);
      if (local && Array.isArray(local.calificaciones) && local.calificaciones.length > 0) {
        const sorted = [...local.calificaciones].sort((a: any, b: any) => {
          const da = a.fecha ? new Date(a.fecha) : new Date();
          const db = b.fecha ? new Date(b.fecha) : new Date();
          return db.getTime() - da.getTime();
        });
        return sorted.slice(0, limit);
      }

      // 2) Fallback: buscar en historial (cliente) y mapear calificaciones de compras que incluyan el producto
      const hist = await getAll<any>('historial');
      if (!hist.success) return [];
      const comentarios: any[] = [];
      for (const compra of hist.data) {
        try {
          if (!compra.calificacion) continue;
          const items = compra.items || [];
          const incluye = items.find((it: any) => it.idProducto === productId);
          if (!incluye) continue;
          comentarios.push({
            userId: compra.calificacion.userId || compra.user_id,
            userEmail: compra.calificacion.userEmail || compra.user_email || null,
            userName: compra.calificacion.userName || compra.user_id,
            score: compra.calificacion.score,
            comment: compra.calificacion.comment,
            fecha: compra.calificacion.fecha || compra.fecha,
          });
        } catch (e) {
          // ignorar
        }
      }
      comentarios.sort((a, b) => {
        const da = a.fecha ? new Date(a.fecha) : new Date();
        const db = b.fecha ? new Date(b.fecha) : new Date();
        return db.getTime() - da.getTime();
      });
      return comentarios.slice(0, limit);
    } catch (error) {
      console.error('Error obteniendo comentarios por producto:', error);
      return [];
    }
  };

  // Función para buscar productos (ya no necesaria, el filtrado es automático)
  const handleSearch = () => {
    // El filtrado ahora es automático a través del useMemo
    // Esta función se mantiene por compatibilidad pero no hace nada
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchValue('');
  };

  return {
    productos,
    filteredProductos,

    // Estados de búsqueda
    searchValue,
    setSearchValue,
    searchField,
    setSearchField,
    searchFields,

    // Estados de carga
    loading,

    // Funciones CRUD
    GetById,
    GetAll,
    getComentariosPorProducto,
    // Refrescar productos puntuales (estrategia híbrida)
    refreshProduct,
    refreshProducts,

    // Funciones de búsqueda
    handleSearch,
    clearSearch,
  };
}
