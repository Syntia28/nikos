import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';

type Props = {
    compraId: string;
    userId: string;
    initial?: { score: number; comment?: string } | null;
    onSaved?: () => void;
};

export default function RatingCompra({ compraId, userId, initial = null, onSaved }: Props) {
    const [score, setScore] = useState<number>(initial?.score ?? 0);
    const [comment, setComment] = useState<string>(initial?.comment ?? '');
    const [saving, setSaving] = useState(false);

    const { update } = useCrudFireStorage();

    const submit = async () => {
        if (score < 1) return;
        setSaving(true);
        try {
            const payload = {
                calificacion: {
                    score,
                    comment: comment.trim(),
                    fecha: new Date(),
                    userId,
                },
            };
            const result = await update(compraId, payload, 'historial');
            if (result.success) {
                onSaved && onSaved();
            } else {
                console.warn('Error guardando calificacion:', result.error);
            }
        } catch (error) {
            console.error('Error al guardar calificacion:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg border border-border">
            <Text className="font-semibold text-foreground mb-2">Calificar compra</Text>
            <View className="flex-row items-center mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity
                        key={n}
                        onPress={() => setScore(n)}
                        className={`px-2 py-1 ${score >= n ? 'bg-yellow-400 rounded' : ''} mr-1`}
                    >
                        <Text className={`${score >= n ? 'text-white' : 'text-muted-foreground'} text-lg`}>★</Text>
                    </TouchableOpacity>
                ))}
                <Text className="ml-2 text-sm text-muted-foreground">{score > 0 ? `${score}/5` : 'Selecciona una puntuación'}</Text>
            </View>

            <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Escribe un comentario (opcional)"
                multiline
                numberOfLines={3}
                className="border border-border rounded p-2 text-sm text-foreground bg-card"
                editable={!saving}
            />

            <View className="mt-3 flex-row justify-end">
                <TouchableOpacity
                    onPress={submit}
                    disabled={saving || score < 1}
                    className={`px-4 py-2 rounded ${saving || score < 1 ? 'bg-gray-400' : 'bg-blue-600'}`}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold">Guardar</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
