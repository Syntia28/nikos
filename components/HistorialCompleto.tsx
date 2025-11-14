import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { ScrollView, Text, View, Image, TouchableOpacity } from 'react-native';
import { useHistorial } from '@/hooks/historial.hook';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { User } from 'firebase/auth';
import React, { useEffect, useState, useMemo } from 'react';
import { HistorialCompraWithId, ItemHistorialConProducto } from '@/interfaces/historial';
import RatingCompra from '@/components/RatingCompra';

const estados: Record<string, { bg: string; text: string; label: string }> = {
    completado: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        label: "✅ Completado",
    },
    entregado: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        label: "✅ Entregado",
    },
    cancelado: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
        label: "❌ Cancelado",
    },
};

const finishedEstados = Object.fromEntries(
    Object.entries(estados).filter(([key]) => ['completado', 'entregado', 'cancelado'].includes(key))
);

type FiltroFecha = 'todos' | '7dias' | '30dias' | '90dias';

export default function HistorialCompleto() {
    const [user, setUser] = useState<User | null>(null);
    const { onAuthChange } = useFireAuthenticaiton();

    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('todos');

    useEffect(() => {
        const unsubscribe = onAuthChange(setUser);
        return unsubscribe;
    }, []);

    const { historial, loading, loadHistorial } = useHistorial(user);

    useEffect(() => {
        if (user) {
            loadHistorial();
        }
    }, [user]);

    const formatDate = (fecha: Date | any) => {
        const date = fecha instanceof Date ? fecha : new Date(fecha.seconds * 1000);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const filtrarPorFecha = (compra: HistorialCompraWithId): boolean => {
        if (filtroFecha === 'todos') return true;

        const fechaCompra = compra.fecha instanceof Date ? compra.fecha : new Date((compra.fecha as any).seconds * 1000);
        const ahora = new Date();
        const diferenciaDias = Math.floor((ahora.getTime() - fechaCompra.getTime()) / (1000 * 60 * 60 * 24));

        switch (filtroFecha) {
            case '7dias': return diferenciaDias <= 7;
            case '30dias': return diferenciaDias <= 30;
            case '90dias': return diferenciaDias <= 90;
            default: return true;
        }
    };

    const historialFiltrado = useMemo(() => {
        const finishedStatuses = ['completado', 'entregado', 'cancelado'];
        return historial.filter(compra => {
            const isFinished = finishedStatuses.includes(compra.estado);
            if (!isFinished) return false;

            const cumpleEstado = filtroEstado === 'todos' || compra.estado === filtroEstado;
            const cumpleFecha = filtrarPorFecha(compra);
            return cumpleEstado && cumpleFecha;
        });
    }, [historial, filtroEstado, filtroFecha]);

    if (loading) {
        return <Text className="text-center text-muted-foreground p-4">Cargando historial...</Text>;
    }

    if (!user) {
        return null; // No mostrar nada si el usuario no ha iniciado sesión
    }

    return (
        <View className="gap-4">
            {/* Filtros */}
            <View className="gap-3">
                <View className="gap-2">
                    <Text className="font-semibold text-foreground">Filtrar por Estado:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setFiltroEstado('todos')}
                                className={`px-3 py-1.5 rounded-full border ${filtroEstado === 'todos' ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                <Text className={`text-sm font-medium ${filtroEstado === 'todos' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Todos</Text>
                            </TouchableOpacity>
                            {Object.entries(finishedEstados).map(([key, value]) => (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => setFiltroEstado(key)}
                                    className={`px-3 py-1.5 rounded-full border ${filtroEstado === key ? value.bg.replace('100', '200').replace('900', '800') : 'bg-card border-border'}`}>
                                    <Text className={`text-sm font-medium ${filtroEstado === key ? value.text : 'text-muted-foreground'}`}>{value.label.split(' ')[1]}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                <View className="gap-2">
                    <Text className="font-semibold text-foreground">Filtrar por Fecha:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => setFiltroFecha('todos')}
                                className={`px-3 py-1.5 rounded-full border ${filtroFecha === 'todos' ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                <Text className={`text-sm font-medium ${filtroFecha === 'todos' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Todos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFiltroFecha('7dias')}
                                className={`px-3 py-1.5 rounded-full border ${filtroFecha === '7dias' ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                <Text className={`text-sm font-medium ${filtroFecha === '7dias' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Últimos 7 días</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFiltroFecha('30dias')}
                                className={`px-3 py-1.5 rounded-full border ${filtroFecha === '30dias' ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                <Text className={`text-sm font-medium ${filtroFecha === '30dias' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Últimos 30 días</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setFiltroFecha('90dias')}
                                className={`px-3 py-1.5 rounded-full border ${filtroFecha === '90dias' ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                                <Text className={`text-sm font-medium ${filtroFecha === '90dias' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>Últimos 90 días</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {historialFiltrado.length === 0 ? (
                <View className="bg-card p-6 rounded-lg items-center">
                    <Text className="text-muted-foreground text-center">
                        {historial.filter(c => ['completado', 'entregado', 'cancelado'].includes(c.estado)).length === 0
                            ? 'Aún no tienes compras finalizadas.'
                            : 'No hay compras que coincidan con tus filtros.'
                        }
                    </Text>
                </View>
            ) : (
                <View className="gap-3">
                    {historialFiltrado.map((compra) => (
                        <View key={compra.id} className="bg-card p-3 rounded-lg border border-border">
                            <View className="flex-row justify-between items-center">
                                <View>
                                    <Text className="font-bold text-foreground">ID: {compra.id.substring(0, 6)}...</Text>
                                    <Text className="text-sm text-muted-foreground">{formatDate(compra.fecha)}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-lg text-primary">${compra.total.toFixed(2)}</Text>
                                    <View className={`px-2 py-0.5 rounded-full mt-1 ${estados[compra.estado]?.bg || "bg-gray-200"}`}>
                                        <Text className={`text-xs font-semibold ${estados[compra.estado]?.text || "text-gray-800"}`}>
                                            {estados[compra.estado]?.label || "Desconocido"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {(compra.estado === 'completado' || compra.estado === 'entregado') && (
                                <View className="mt-3 pt-3 border-t border-border">
                                    {compra.calificacion ? (
                                        <View>
                                            <Text className="font-semibold text-foreground mb-1">Tu calificación:</Text>
                                            <View className="flex-row items-center mb-2">
                                                <Text className="text-yellow-400 text-lg">
                                                    {Array.from({ length: 5 }).map((_, i) => (i < (compra.calificacion?.score || 0) ? '★' : '☆'))}
                                                </Text>
                                                <Text className="text-sm text-muted-foreground ml-2">({compra.calificacion.score}/5)</Text>
                                            </View>
                                            {compra.calificacion.comment && (
                                                <View className="bg-muted/50 p-2 rounded">
                                                    <Text className="text-sm text-muted-foreground italic">“{compra.calificacion.comment}”</Text>
                                                </View>
                                            )}
                                        </View>
                                    ) : (
                                        <RatingCompra
                                            compra={compra}
                                            user={user}
                                            onSaved={loadHistorial}
                                        />
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
