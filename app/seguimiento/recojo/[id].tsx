import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import OrderStatusTracker from '@/components/SeguimientosEstadoTraking';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { HistorialCompraWithId } from '@/interfaces/historial';

export default function PickupTrackingScreen() {
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
            <Stack.Screen options={{ title: 'Seguimiento - Recojo' }} />
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

                        <View className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <Text className="font-semibold text-purple-800 mb-2">📦 Recojo en tienda</Text>
                            <Text className="text-sm text-purple-700">Lugar: {compra.datosEntrega?.direccion || 'Sucursal principal'}</Text>
                            {compra.datosEntrega?.fechaRecojo ? (
                                <Text className="text-sm text-purple-700">Fecha de recojo: {new Date(compra.datosEntrega?.fechaRecojo).toLocaleString()}</Text>
                            ) : (
                                <Text className="text-sm text-muted-foreground">Tu pedido estará listo para recojo próximamente</Text>
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
