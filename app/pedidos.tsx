import { Button } from '@/components/ui/button';
import { Stack, router } from 'expo-router';
import { ScrollView, Text, View, Image, TouchableOpacity } from 'react-native';
import { useHistorial } from '@/hooks/historial.hook';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { User } from 'firebase/auth';
import { useEffect, useState, useMemo } from 'react';
import { HistorialCompraWithId, ItemHistorialConProducto } from '@/interfaces/historial';

const estados: Record<string, { bg: string; text: string; label: string }> = {
    completado: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-800 dark:text-green-200",
        label: "✅ Completado",
    },
    cancelado: {
        bg: "bg-red-100 dark:bg-red-900",
        text: "text-red-800 dark:text-red-200",
        label: "❌ Cancelado",
    },
    pendiente: {
        bg: "bg-yellow-100 dark:bg-yellow-900",
        text: "text-yellow-800 dark:text-yellow-200",
        label: "⏳ Pendiente",
    },
    "en camino": {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-800 dark:text-blue-200",
        label: "🚚 En camino",
    },
    preparando: {
        bg: "bg-lime-100 dark:bg-lime-900",
        text: "text-lime-800 dark:text-lime-200",
        label: "👨🏼‍🍳 Preparando",
    },
    "listo para recojo": {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-800 dark:text-purple-200",
        label: "📦 Listo para recojo",
    },
};

type FiltroFecha = 'todos' | 'hoy' | '7dias' | '30dias';

export default function HistorialScreen() {
    const [user, setUser] = useState<User | null>(null);
    const { onAuthChange } = useFireAuthenticaiton();

    // Estados de filtros
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>('todos');

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const { historial, loading, loadHistorial } = useHistorial(user);

    // Recargar historial cuando el usuario cambie
    useEffect(() => {
        if (user) {
            loadHistorial();
        }
    }, [user]);

    // Formatear fecha
    const formatDate = (fecha: Date | any) => {
        const date = fecha instanceof Date ? fecha : new Date(fecha.seconds * 1000);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Función para filtrar por fecha
    const filtrarPorFecha = (compra: HistorialCompraWithId): boolean => {
        if (filtroFecha === 'todos') return true;

        const fechaCompra = compra.fecha instanceof Date ? compra.fecha : new Date((compra.fecha as any).seconds * 1000);
        const ahora = new Date();
        const diferenciaDias = Math.floor((ahora.getTime() - fechaCompra.getTime()) / (1000 * 60 * 60 * 24));

        switch (filtroFecha) {
            case 'hoy':
                return diferenciaDias === 0;
            case '7dias':
                return diferenciaDias <= 7;
            case '30dias':
                return diferenciaDias <= 30;
            default:
                return true;
        }
    };

    // Historial filtrado usando useMemo para optimización
    const historialFiltrado = useMemo(() => {
        return historial.filter(compra => {
            const cumpleEstado = filtroEstado === 'todos' || compra.estado === filtroEstado;
            const cumpleFecha = filtrarPorFecha(compra);
            return cumpleEstado && cumpleFecha;
        });
    }, [historial, filtroEstado, filtroFecha]);

    if (!user) {
        return (
            <>
                <Stack.Screen options={{ title: 'Historial de Compras' }} />
                <View className="flex-1 bg-background items-center justify-center p-6">
                    <Text className="text-2xl font-bold text-foreground mb-4">🔐 Inicia sesión</Text>
                    <Text className="text-muted-foreground text-center mb-6">
                        Debes iniciar sesión para ver tu historial de compras
                    </Text>
                    <Button onPress={() => router.push('/login')} className="bg-blue-600">
                        <Text className="text-white">Iniciar Sesión</Text>
                    </Button>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Historial de Compras' }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-bold text-foreground">📋 Mis Compras</Text>
                        <Text className="text-muted-foreground">
                            {historialFiltrado.length} {historialFiltrado.length === 1 ? 'compra' : 'compras'}
                        </Text>
                    </View>

                    {/* Filtros */}
                    <View className="gap-3">
                        {/* Filtro por Estado */}
                        <View className="gap-2">
                            <Text className="font-semibold text-foreground">Filtrar por Estado:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => setFiltroEstado('todos')}
                                        className={`px-4 py-2 rounded-full border ${filtroEstado === 'todos'
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'bg-card border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${filtroEstado === 'todos'
                                            ? 'text-white'
                                            : 'text-muted-foreground'}`}>
                                            📦 Todos
                                        </Text>
                                    </TouchableOpacity>
                                    {Object.entries(estados).map(([key, value]) => (
                                        <TouchableOpacity
                                            key={key}
                                            onPress={() => setFiltroEstado(key)}
                                            className={`px-4 py-2 rounded-full border ${filtroEstado === key
                                                ? value.bg + ' ' + value.bg.replace('100', '200').replace('900', '800')
                                                : 'bg-card border-border'}`}
                                        >
                                            <Text className={`text-sm font-semibold ${filtroEstado === key
                                                ? value.text
                                                : 'text-muted-foreground'}`}>
                                                {value.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Filtro por Fecha */}
                        <View className="gap-2">
                            <Text className="font-semibold text-foreground">Filtrar por Fecha:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => setFiltroFecha('todos')}
                                        className={`px-4 py-2 rounded-full border ${filtroFecha === 'todos'
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-card border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${filtroFecha === 'todos'
                                            ? 'text-white'
                                            : 'text-muted-foreground'}`}>
                                            📅 Todas las fechas
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFiltroFecha('hoy')}
                                        className={`px-4 py-2 rounded-full border ${filtroFecha === 'hoy'
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-card border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${filtroFecha === 'hoy'
                                            ? 'text-white'
                                            : 'text-muted-foreground'}`}>
                                            🌟 Hoy
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFiltroFecha('7dias')}
                                        className={`px-4 py-2 rounded-full border ${filtroFecha === '7dias'
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-card border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${filtroFecha === '7dias'
                                            ? 'text-white'
                                            : 'text-muted-foreground'}`}>
                                            📆 Últimos 7 días
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFiltroFecha('30dias')}
                                        className={`px-4 py-2 rounded-full border ${filtroFecha === '30dias'
                                            ? 'bg-purple-600 border-purple-600'
                                            : 'bg-card border-border'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${filtroFecha === '30dias'
                                            ? 'text-white'
                                            : 'text-muted-foreground'}`}>
                                            📊 Últimos 30 días
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {loading ? (
                        <View className="bg-card p-8 rounded-lg">
                            <Text className="text-center text-muted-foreground">Cargando historial...</Text>
                        </View>
                    ) : historialFiltrado.length === 0 ? (
                        <View className="bg-card p-8 rounded-lg gap-4">
                            <Text className="text-center text-muted-foreground text-lg">
                                {historial.length === 0
                                    ? 'No tienes compras realizadas'
                                    : 'No hay compras con los filtros seleccionados'}
                            </Text>
                            {historial.length === 0 ? (
                                <Button onPress={() => router.push('/carta')} className="bg-blue-600">
                                    <Text className="text-white">Ir a productos</Text>
                                </Button>
                            ) : (
                                <Button onPress={() => {
                                    setFiltroEstado('todos');
                                    setFiltroFecha('todos');
                                }} className="bg-blue-600">
                                    <Text className="text-white">Limpiar filtros</Text>
                                </Button>
                            )}
                        </View>
                    ) : (
                        <View className="gap-4">
                            {historialFiltrado.map((compra) => (
                                <View key={compra.id} className="bg-card p-4 rounded-lg border border-border">
                                    {/* Header de la compra */}
                                    <View className="flex-row justify-between items-center mb-4 pb-4 border-b border-border">
                                        <View>
                                            <Text className="text-muted-foreground text-sm">
                                                📅 {formatDate(compra.fecha)}
                                            </Text>
                                            <Text className="text-sm text-muted-foreground mt-1">
                                                ID: {compra.id.substring(0, 8)}...
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-lg font-bold text-green-600">
                                                ${compra.total.toFixed(2)}
                                            </Text>
                                            <View
                                                className={`px-3 py-1 rounded-full mt-1 ${estados[compra.estado]?.bg || "bg-gray-100 dark:bg-gray-900"}`}
                                            >
                                                <Text
                                                    className={`text-xs font-semibold ${estados[compra.estado]?.text || "text-gray-800 dark:text-gray-200"}`}
                                                >
                                                    {estados[compra.estado]?.label || "ℹ️ Desconocido"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Items de la compra */}
                                    <View className="gap-3">
                                        <Text className="font-semibold text-card-foreground">
                                            Productos ({compra.items.length})
                                        </Text>

                                        {compra.items.map((item, index) => {
                                            // Cast del item para acceder a sus propiedades mapeadas
                                            const itemMapeado = item as any as ItemHistorialConProducto;
                                            return (
                                                <View key={`${compra.id}-${item.idProducto}-${index}`} className="flex-row gap-3 bg-muted/50 p-3 rounded">
                                                    {/* Imagen */}
                                                    <View className="w-16 h-16">
                                                        {itemMapeado.producto.imagenUrl ? (
                                                            <Image
                                                                source={{ uri: itemMapeado.producto.imagenUrl }}
                                                                className="w-full h-full rounded border border-border"
                                                                resizeMode="cover"
                                                            />
                                                        ) : (
                                                            <View className="w-full h-full rounded border border-border bg-muted items-center justify-center">
                                                                <Text className="text-muted-foreground text-xs">Sin imagen</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* Información del producto */}
                                                    <View className="flex-1">
                                                        <Text className="font-semibold text-card-foreground">
                                                            {itemMapeado.producto.nombre}
                                                        </Text>
                                                        <Text className="text-muted-foreground text-sm">
                                                            Cantidad: {item.cantidad}
                                                        </Text>
                                                        <Text className="text-muted-foreground text-sm">
                                                            Precio unitario: ${itemMapeado.producto.precio.toFixed(2)}
                                                        </Text>
                                                        <Text className="text-blue-600 font-semibold text-sm mt-1">
                                                            Subtotal: ${(item.cantidad * itemMapeado.producto.precio).toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {/* Información de entrega */}
                                    {compra.datosEntrega && (
                                        <View className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                            <Text className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                                📦 Datos de Entrega
                                            </Text>
                                            <View className="gap-1">
                                                <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                    <Text className="font-semibold">Tipo:</Text>{' '}
                                                    {compra.datosEntrega.tipoEntrega === 'delivery' ? '🚚 Delivery' : '🏪 Recojo en tienda'}
                                                </Text>
                                                <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                    <Text className="font-semibold">Pago:</Text>{' '}
                                                    {compra.datosEntrega.metodoPago.toUpperCase()} (Contra entrega)
                                                </Text>
                                                {compra.datosEntrega.tipoEntrega === 'delivery' && (
                                                    <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                        <Text className="font-semibold">Dirección:</Text>{' '}
                                                        {compra.datosEntrega.direccion}
                                                    </Text>
                                                )}
                                                <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                    <Text className="font-semibold">Teléfono:</Text>{' '}
                                                    {compra.datosEntrega.telefono}
                                                </Text>
                                                {compra.datosEntrega.referencia && (
                                                    <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                        <Text className="font-semibold">Referencia:</Text>{' '}
                                                        {compra.datosEntrega.referencia}
                                                    </Text>
                                                )}
                                                {compra.datosEntrega.fechaRecojo && compra.datosEntrega.tipoEntrega === 'recojo' && (
                                                    <Text className="text-blue-700 dark:text-blue-300 text-sm">
                                                        <Text className="font-semibold">Fecha de Recojo:</Text>{' '}
                                                        {new Date(compra.datosEntrega.fechaRecojo).toLocaleString('es-ES', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </Text>
                                                )}

                                            </View>
                                        </View>
                                    )}

                                    {/* Footer con total */}
                                    <View className="mt-4 pt-4 border-t border-border flex-row justify-between items-center">
                                        <Text className="text-muted-foreground">Total pagado</Text>
                                        <Text className="text-xl font-bold text-card-foreground">
                                            ${compra.total.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Botón de navegación */}
                    <View className="mt-4">
                        <Button onPress={() => router.push('/carta')} className="bg-blue-600">
                            <Text className="text-white">🛍️ Continuar Comprando</Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </>
    );
}