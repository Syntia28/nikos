import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { Alert } from 'react-native';

import { User } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { Carrito, CarritoWithId, ItemCarrito, ItemCarritoConProducto } from '@/interfaces/carrito';
import { ProductoWithId } from '@/interfaces/producto';
import { DatosEntrega, HistorialCompra, ItemHistorial } from '@/interfaces/historial';

export function useCarrito(user: User | null) {
  const { register, update, searchByField, getById } = useCrudFireStorage();

  // Estados para el carrito (solo IDs y cantidades)
  const [carritoItems, setCarritoItems] = useState<ItemCarrito[]>([]);
  const [carritoId, setCarritoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estado para productos mapeados con sus datos actuales
  const [carritoConProductos, setCarritoConProductos] = useState<ItemCarritoConProducto[]>([]);
  const [loadingProductos, setLoadingProductos] = useState(false);

  // Mapear items del carrito con los datos actuales de los productos
  const mapearProductos = async (items: ItemCarrito[]) => {
    if (items.length === 0) {
      setCarritoConProductos([]);
      return;
    }

    setLoadingProductos(true);
    try {
      const itemsConProductos: ItemCarritoConProducto[] = [];

      for (const item of items) {
        const productResult = await getById<ProductoWithId>(item.idProducto, 'productos');

        if (productResult.success && productResult.data) {
          itemsConProductos.push({
            ...item,
            producto: productResult.data,
          });
        } else {
          // Si el producto no existe o fue eliminado, lo quitamos del carrito
          console.warn(`Producto ${item.idProducto} no encontrado, será removido del carrito`);
        }
      }

      setCarritoConProductos(itemsConProductos);

      // Si algunos productos no existen, actualizar el carrito
      if (itemsConProductos.length < items.length) {
        const itemsValidos = itemsConProductos.map(({ idProducto, cantidad }) => ({
          idProducto,
          cantidad,
        }));
        setCarritoItems(itemsValidos);
        await saveCarrito(itemsValidos);
      }
    } catch (error) {
      console.error('Error al mapear productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Calcular el total del carrito (desde productos mapeados)
  const total = useMemo(() => {
    return carritoConProductos.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);
  }, [carritoConProductos]);

  // Cargar carrito del usuario desde Firebase
  const loadCarrito = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await searchByField<CarritoWithId>('user_id', user.uid, 'carritos');

      if (result.success && result.data.length > 0) {
        const carritoData = result.data[0];
        setCarritoId(carritoData.id);
        const items = carritoData.items || [];
        setCarritoItems(items);
        await mapearProductos(items);
      } else {
        // Si no existe un carrito, crear uno nuevo
        const newCarrito: Carrito = {
          user_id: user.uid,
          items: [],
          fecha: new Date(),
        };

        const createResult = await register<Carrito>('carritos', newCarrito);
        if (createResult.success && createResult.data) {
          setCarritoId(createResult.data.id);
          setCarritoItems([]);
          setCarritoConProductos([]);
        }
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar carrito en Firebase (solo IDs y cantidades)
  const saveCarrito = async (items: ItemCarrito[]) => {
    if (!user || !carritoId) return;

    try {
      await update(
        carritoId,
        {
          items,
          fecha: new Date(),
        },
        'carritos'
      );
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  // Agregar producto al carrito
  const addToCarrito = async (producto: ProductoWithId, cantidad: number = 1) => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para agregar productos al carrito');
      return false;
    }

    if (cantidad <= 0) {
      Alert.alert('Error', 'La cantidad debe ser mayor a 0');
      return false;
    }

    if (cantidad > producto.stock) {
      Alert.alert('Error', `Solo hay ${producto.stock} unidades disponibles`);
      return false;
    }

    try {
      const existingItemIndex = carritoItems.findIndex((item) => item.idProducto === producto.id);

      let newItems: ItemCarrito[];

      if (existingItemIndex >= 0) {
        // Si el producto ya está en el carrito, actualizar cantidad
        const newCantidad = carritoItems[existingItemIndex].cantidad + cantidad;

        if (newCantidad > producto.stock) {
          Alert.alert(
            'Error',
            `Solo puedes agregar ${producto.stock - carritoItems[existingItemIndex].cantidad} unidades más`
          );
          return false;
        }

        newItems = [...carritoItems];
        newItems[existingItemIndex] = {
          idProducto: producto.id,
          cantidad: newCantidad,
        };
      } else {
        // Si el producto no está en el carrito, agregarlo
        const newItem: ItemCarrito = {
          idProducto: producto.id,
          cantidad,
        };
        newItems = [...carritoItems, newItem];
      }

      setCarritoItems(newItems);
      await saveCarrito(newItems);
      await mapearProductos(newItems);
      Alert.alert('Éxito', 'Producto agregado al carrito');
      return true;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito');
      return false;
    }
  };

  // Actualizar cantidad de un producto en el carrito
  const updateCantidad = async (idProducto: string, cantidad: number) => {
    if (cantidad <= 0) {
      return removeFromCarrito(idProducto);
    }

    // Buscar el producto para validar stock
    const itemConProducto = carritoConProductos.find((i) => i.idProducto === idProducto);
    if (!itemConProducto) return false;

    if (cantidad > itemConProducto.producto.stock) {
      Alert.alert('Error', `Solo hay ${itemConProducto.producto.stock} unidades disponibles`);
      return false;
    }

    try {
      const newItems = carritoItems.map((i) =>
        i.idProducto === idProducto ? { ...i, cantidad } : i
      );

      setCarritoItems(newItems);
      await saveCarrito(newItems);
      await mapearProductos(newItems);
      return true;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return false;
    }
  };

  // Remover producto del carrito
  const removeFromCarrito = async (idProducto: string) => {
    try {
      const newItems = carritoItems.filter((item) => item.idProducto !== idProducto);
      setCarritoItems(newItems);
      await saveCarrito(newItems);
      await mapearProductos(newItems);
      Alert.alert('Éxito', 'Producto eliminado del carrito');
      return true;
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto del carrito');
      return false;
    }
  };

  // Limpiar el carrito
  const clearCarrito = async () => {
    try {
      setCarritoItems([]);
      setCarritoConProductos([]);
      if (carritoId) {
        await saveCarrito([]);
      }
      return true;
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      return false;
    }
  };

  // Confirmar compra - Validar stock, reducir stock, guardar en historial y limpiar carrito
  const confirmarCompra = async (datosEntrega: DatosEntrega): Promise<boolean> => {
    if (!user) {
      Alert.alert('Error', 'Debe iniciar sesión para realizar la compra');
      return false;
    }

    if (carritoConProductos.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return false;
    }

    setLoading(true);
    try {
      // Crear items del historial solo con referencias
      const itemsHistorial: ItemHistorial[] = [];

      // Verificar stock y preparar datos para el historial
      for (const itemCarrito of carritoConProductos) {
        const productResult = await getById<ProductoWithId>(itemCarrito.idProducto, 'productos');

        if (!productResult.success || !productResult.data) {
          Alert.alert('Error', `El producto no está disponible`);
          setLoading(false);
          return false;
        }

        const producto = productResult.data;
        const currentStock = producto.stock;

        if (currentStock < itemCarrito.cantidad) {
          Alert.alert(
            'Error',
            `No hay suficiente stock de ${producto.nombre}. Stock disponible: ${currentStock}`
          );
          setLoading(false);
          return false;
        }

        // Reducir el stock
        const newStock = currentStock - itemCarrito.cantidad;
        await update(itemCarrito.idProducto, { stock: newStock }, 'productos');

        // Agregar al historial solo con referencias (no snapshot)
        itemsHistorial.push({
          idProducto: itemCarrito.idProducto,
          cantidad: itemCarrito.cantidad,
        });
      }

      // Guardar en historial con referencias
      const historial: HistorialCompra = {
        user_id: user.uid,
        items: itemsHistorial,
        total,
        fecha: new Date(),
        estado: 'pendiente',
        datosEntrega,
      };

      await register<HistorialCompra>('historial', historial);

      // Limpiar el carrito
      await clearCarrito();

      Alert.alert('Éxito', '¡Compra realizada correctamente! 🎉');
      return true;
    } catch (error) {
      console.error('Error al confirmar compra:', error);
      Alert.alert('Error', 'No se pudo completar la compra');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cargar carrito al iniciar
  useEffect(() => {
    if (user) {
      loadCarrito();
    } else {
      setCarritoItems([]);
      setCarritoConProductos([]);
      setCarritoId(null);
    }
  }, [user]);

  // Remapear productos cuando cambien los items del carrito
  useEffect(() => {
    if (carritoItems.length > 0) {
      mapearProductos(carritoItems);
    }
  }, [carritoItems.length]); // Solo cuando cambie la cantidad de items

  return {
    carritoItems: carritoConProductos, // Retornamos los items con productos mapeados
    total,
    loading: loading || loadingProductos,
    addToCarrito,
    updateCantidad,
    removeFromCarrito,
    clearCarrito,
    confirmarCompra,
    loadCarrito,
  };
}
