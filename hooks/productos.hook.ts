import { ProductoWithId } from '@/interfaces/producto';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { useMemo, useState } from 'react';

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
      const result = await getById<ProductoWithId>(productId, 'productos');
      if (result.success && result.data) {
        return result.data;
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

    // Funciones de búsqueda
    handleSearch,
    clearSearch,
  };
}
