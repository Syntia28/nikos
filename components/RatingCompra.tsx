import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { useCalificaciones } from '@/hooks/calificaciones.hook';
import eventBus from '@/lib/eventBus';
import { User } from 'firebase/auth';
import { HistorialCompraWithId } from '@/interfaces/historial';
import { Button } from './ui/button';

interface RatingCompraProps {
    compra: HistorialCompraWithId;
    user: User;
    onSaved: () => void;
}

export default function RatingCompra({ compra, user, onSaved }: RatingCompraProps) {
    const [score, setScore] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { update } = useCrudFireStorage();
    const { calificarProducto } = useCalificaciones();

    const handleSubmitRating = async () => {
        if (score === 0) {
            Alert.alert('Error', 'Por favor selecciona una calificación');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. CALIFICAR CADA PRODUCTO DE LA COMPRA
            const calificacionesPromises = compra.items.map(async (item) => {
                const producto = (item as any).producto;

                const calificacion = {
                    userId: user.uid,
                    userEmail: user.email || 'Usuario',
                    userName: user.displayName || user.email?.split('@')[0] || 'Cliente',
                    score: score,
                    comment: comment.trim() || undefined,
                    compraId: compra.id
                };

                return await calificarProducto(item.idProducto, calificacion);
            });

            await Promise.all(calificacionesPromises);

            // 2. GUARDAR EN HISTORIAL (como antes)
            await update(compra.id, {
                calificacion: {
                    score: score,
                    comment: comment.trim() || 'Compra calificada',
                    fecha: new Date(),
                    userId: user.uid,
                }
            }, 'historial');

            Alert.alert('¡Gracias!', 'Tu calificación ha sido guardada');
            // Emitir evento para recargar productos en otras pantallas.
            // Enviamos payload optimista con la calificación para que la UI pueda actualizarse inmediatamente.
            try {
                const productPayload = compra.items
                    .map((it: any) => it.idProducto)
                    .filter(Boolean)
                    .map((id) => ({
                        id,
                        calificacion: {
                            ...{
                                userId: user.uid,
                                userEmail: user.email || null,
                                userName: user.displayName || user.email?.split('@')[0] || 'Cliente',
                                score: score,
                                comment: comment.trim() || undefined,
                                compraId: compra.id,
                            },
                            fecha: new Date(),
                        },
                    }));

                eventBus.emit('recargar_productos', productPayload);
            } catch (e) {
                console.warn('Error emitiendo evento de recarga de productos', e);
            }
            onSaved();

        } catch (error) {
            console.error('Error al guardar calificaciones:', error);
            Alert.alert('Error', 'No se pudieron guardar las calificaciones');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        return Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;

            return (
                <TouchableOpacity
                    key={starValue}
                    onPress={() => setScore(starValue)}
                    activeOpacity={0.7}
                    className="p-2"
                >
                    <Text className={`text-3xl ${starValue <= score ? 'text-yellow-400' : 'text-gray-300'}`}>
                        {starValue <= score ? '★' : '☆'}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <View className="mt-4 p-4 bg-card border border-border rounded-lg">
            <Text className="text-lg font-semibold text-foreground mb-4">
                ⭐ Califica tu compra
            </Text>

            {/* Estrellas */}
            <View className="flex-row justify-center mb-4">
                {renderStars()}
            </View>

            {score > 0 && (
                <Text className="text-center text-sm text-muted-foreground mb-2">
                    Calificación: {score}/5
                </Text>
            )}

            {/* Comentario */}
            <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Comentario opcional..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-background border border-border rounded-lg p-3 text-foreground text-sm mb-4"
            />

            <Button
                onPress={handleSubmitRating}
                disabled={isSubmitting || score === 0}
                className={`${score === 0 ? 'bg-gray-400' : 'bg-green-600'}`}
            >
                <Text className="text-white font-semibold">
                    {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </Text>
            </Button>

            <View className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Text className="text-xs text-blue-600 dark:text-blue-400 text-center">
                    💡 Tu calificación se mostrará en los productos para ayudar a otros clientes
                </Text>
            </View>
        </View>
    );
}