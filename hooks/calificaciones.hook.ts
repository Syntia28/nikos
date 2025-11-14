import { useState } from 'react';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { CalificacionProducto, ProductoWithId } from '@/interfaces/producto';

export const useCalificaciones = () => {
  const { update, getById } = useCrudFireStorage();
  const [loading, setLoading] = useState(false);

  const calificarProducto = async (
    productoId: string,
    calificacion: Omit<CalificacionProducto, 'fecha'>
  ) => {
    setLoading(true);
    try {
      // Obtener el producto actual
      const productoResult = await getById<ProductoWithId>(productoId, 'productos');

      if (!productoResult.success || !productoResult.data) {
        throw new Error('Producto no encontrado');
      }

      const producto = productoResult.data;
      const calificacionesExistentes = producto.calificaciones || [];

      // Agregar nueva calificación
      const nuevaCalificacion: CalificacionProducto = {
        ...calificacion,
        fecha: new Date(),
      };

      const nuevasCalificaciones = [...calificacionesExistentes, nuevaCalificacion];

      // Calcular nuevo rating promedio
      const ratingPromedio = Number(
        (
          nuevasCalificaciones.reduce((acc, cal) => acc + cal.score, 0) /
          nuevasCalificaciones.length
        ).toFixed(1)
      );

      // Actualizar el producto
      const updateResult = await update(
        productoId,
        {
          calificaciones: nuevasCalificaciones,
          ratingPromedio: ratingPromedio,
          totalCalificaciones: nuevasCalificaciones.length,
        },
        'productos'
      );

      return updateResult.success;
    } catch (error) {
      console.error('Error al calificar producto:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    calificarProducto,
    loading,
  };
};
