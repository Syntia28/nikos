import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import OrderStatusTracker from '@/components/SeguimientosEstadoTraking';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { HistorialCompraWithId } from '@/interfaces/historial';

export default function DeliveryTrackingScreen() {
    const { id } = useLocalSearchParams();
    const { getById } = useCrudFireStorage();
    const [compra, setCompra] = useState<HistorialCompraWithId | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                const res = await getById<any>(String(id), 'historial');
                if (res.success && res.data) setCompra(res.data as HistorialCompraWithId);
            } catch (e) {
                console.warn('Error cargando compra para seguimiento:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    return (
        <>
            <Stack.Screen options={{ title: 'Seguimiento - Delivery' }} />
            <ScrollView className="flex-1 bg-background p-6">
                {loading ? (
                    <Text className="text-center text-muted-foreground">Cargando...</Text>
                ) : !compra ? (
                    <Text className="text-center text-muted-foreground">Pedido no encontrado</Text>
                ) : (
                    <View className="gap-4">
                        <View>
                            <Text className="text-2xl font-bold">Seguimiento del pedido</Text>
                            <Text className="text-sm text-muted-foreground">ID: {compra.id}</Text>
                        </View>

                        <OrderStatusTracker order={compra} />

                        <View className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Text className="font-semibold text-blue-800 mb-2">📦 Envío a domicilio</Text>
                            <Text className="text-sm text-blue-700">Dirección: {compra.datosEntrega?.direccion}</Text>
                            <Text className="text-sm text-blue-700">Teléfono: {compra.datosEntrega?.telefono}</Text>
                            {((compra.datosEntrega as any)?.repartidor) && (
                                <Text className="text-sm text-blue-700">Repartidor: {(compra.datosEntrega as any).repartidor}</Text>
                            )}

                            {((compra.datosEntrega as any)?.trackingUrl) ? (
                                <TouchableOpacity
                                    onPress={() => {
                                        try {
                                            const url = (compra.datosEntrega as any).trackingUrl;
                                            Linking.openURL(url);
                                        } catch (e) {
                                            console.warn('No se pudo abrir tracking url', e);
                                        }
                                    }}
                                    className="mt-3 bg-blue-600 px-3 py-2 rounded"
                                >
                                    <Text className="text-white text-sm">Abrir seguimiento del repartidor</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text className="text-sm text-muted-foreground mt-3">El seguimiento en tiempo real no está disponible</Text>
                            )}
                        </View>

                        <View className="p-4 bg-card rounded">
                            <Text className="font-semibold">Productos</Text>
                            {compra.items.map((it: any, idx: number) => (
                                <View key={idx} className="mt-2">
                                    <Text className="text-sm">{(it as any).nombre || ((it as any).producto?.nombre) || 'Producto'} x{it.cantidad}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </>
    );
}
