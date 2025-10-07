import { Button } from '@/components/ui/button';
import { Stack, router } from 'expo-router';
import { ScrollView, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useCarrito } from '@/hooks/carrito.hook';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { User } from 'firebase/auth';
import ModalConfirmarCompra from '@/components/ModalConfirmarCompra';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import { useEffect, useState } from 'react';
import { UserProfile } from './perfil';
import { DatosEntrega } from '@/interfaces/historial';

export default function CarritoScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile| null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { onAuthChange } = useFireAuthenticaiton();
    const { searchByField } = useCrudFireStorage();

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    // Cargar perfil del usuario
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!user) {
                setUserProfile(null);
                return;
            }

            try {
                const result = await searchByField<UserProfile>('uid', user.uid, 'usuarios');
                if (result.success && result.data.length > 0) {
                    setUserProfile(result.data[0]);
                }
            } catch (error) {
                console.error('Error al cargar perfil:', error);
            }
        };

        loadUserProfile();
    }, [user]);

    const {
        carritoItems,
        total,
        loading,
        updateCantidad,
        removeFromCarrito,
        clearCarrito,
        confirmarCompra,
    } = useCarrito(user);

    // Navegar a productos
    const navigateToProducts = () => {
        router.push('/carta');
    };

    // Manejar confirmación de compra
    const handleConfirmarCompra = async (datosEntrega: DatosEntrega) => {
        const success = await confirmarCompra(datosEntrega);
        if (success) {
            setModalVisible(false);
            router.push('/pedidos');
        }
    };

    // Abrir modal
    const handleOpenModal = () => {
        setModalVisible(true);
    };

    // Manejar limpieza del carrito
    const handleClearCarrito = () => {
        Alert.alert('Limpiar carrito', '¿Estás seguro de que quieres vaciar el carrito?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Limpiar',
                style: 'destructive',
                onPress: clearCarrito,
            },
        ]);
    };

    if (!user) {
        return (
            <>
                <Stack.Screen options={{ title: 'Carrito de Compras' }} />
                <View className="flex-1 bg-background items-center justify-center p-6">
                    <Text className="text-2xl font-bold text-foreground mb-4">🔐 Inicia sesión</Text>
                    <Text className="text-muted-foreground text-center mb-6">
                        Debes iniciar sesión para ver tu carrito de compras
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
            <Stack.Screen options={{ title: 'Carrito de Compras' }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-bold text-foreground">🛒 Mi Carrito</Text>
                        <TouchableOpacity onPress={navigateToProducts}>
                            <Text className="text-blue-600 font-semibold">Seguir comprando</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="bg-card p-8 rounded-lg">
                            <Text className="text-center text-muted-foreground">Cargando carrito...</Text>
                        </View>
                    ) : carritoItems.length === 0 ? (
                        <View className="bg-card p-8 rounded-lg gap-4">
                            <Text className="text-center text-muted-foreground text-lg">Tu carrito está vacío</Text>
                            <Button onPress={navigateToProducts} className="bg-blue-600">
                                <Text className="text-white">Ver productos</Text>
                            </Button>
                        </View>
                    ) : (
                        <>
                            {/* Items del carrito */}
                            <View className="gap-3">
                                {carritoItems.map((item) => (
                                    <View key={item.idProducto} className="bg-card p-4 rounded-lg border border-border">
                                        <View className="flex-row gap-3">
                                            {/* Imagen */}
                                            <View className="w-20 h-20">
                                                {item.producto.imagenUrl ? (
                                                    <Image
                                                        source={{ uri: item.producto.imagenUrl }}
                                                        className="w-full h-full rounded border border-border"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View className="w-full h-full rounded border border-border bg-muted items-center justify-center">
                                                        <Text className="text-muted-foreground text-xs">Sin imagen</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Información */}
                                            <View className="flex-1">
                                                <Text className="text-lg font-semibold text-card-foreground">
                                                    {item.producto.nombre}
                                                </Text>
                                                <Text className="text-muted-foreground text-sm">
                                                    Precio: ${item.producto.precio.toFixed(2)}
                                                </Text>
                                                <Text className="text-muted-foreground text-sm">
                                                    Stock disponible: {item.producto.stock}
                                                </Text>
                                                <Text className="text-blue-600 font-semibold mt-1">
                                                    Subtotal: ${(item.producto.precio * item.cantidad).toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Controles de cantidad */}
                                        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-border">
                                            <View className="flex-row items-center gap-3">
                                                <TouchableOpacity
                                                    onPress={() => updateCantidad(item.idProducto, item.cantidad - 1)}
                                                    className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded items-center justify-center"
                                                >
                                                    <Text className="text-foreground text-xl font-bold">-</Text>
                                                </TouchableOpacity>

                                                <Text className="text-foreground text-lg font-semibold min-w-[40px] text-center">
                                                    {item.cantidad}
                                                </Text>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (item.cantidad < item.producto.stock) {
                                                            updateCantidad(item.idProducto, item.cantidad + 1);
                                                        } else {
                                                            Alert.alert(
                                                                'Stock máximo',
                                                                `Solo hay ${item.producto.stock} unidades disponibles`
                                                            );
                                                        }
                                                    }}
                                                    className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded items-center justify-center"
                                                >
                                                    <Text className="text-foreground text-xl font-bold">+</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => removeFromCarrito(item.idProducto)}
                                                className="bg-red-600 px-4 py-2 rounded"
                                            >
                                                <Text className="text-white font-semibold">🗑️ Eliminar</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Resumen del carrito */}
                            <View className="bg-card p-6 rounded-lg border border-border mt-4">
                                <Text className="text-xl font-bold text-card-foreground mb-4">
                                    Resumen de la compra
                                </Text>

                                <View className="gap-2 mb-4">
                                    <View className="flex-row justify-between">
                                        <Text className="text-muted-foreground">Productos ({carritoItems.length})</Text>
                                        <Text className="text-foreground">${total.toFixed(2)}</Text>
                                    </View>
                                    <View className="h-px bg-border my-2" />
                                    <View className="flex-row justify-between">
                                        <Text className="text-lg font-bold text-card-foreground">Total</Text>
                                        <Text className="text-lg font-bold text-blue-600">${total.toFixed(2)}</Text>
                                    </View>
                                </View>

                                <View className="gap-3">
                                    <Button
                                        onPress={handleOpenModal}
                                        className="bg-green-600"
                                        disabled={loading}
                                    >
                                        <Text className="text-white font-semibold">
                                            {loading ? 'Procesando...' : '✅ Confirmar Compra'}
                                        </Text>
                                    </Button>

                                    <Button onPress={handleClearCarrito} className="bg-gray-600" disabled={loading}>
                                        <Text className="text-white">🗑️ Vaciar Carrito</Text>
                                    </Button>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Modal de confirmación */}
                <ModalConfirmarCompra
                    visible={modalVisible}
                    total={total}
                    userProfile={userProfile}
                    onConfirm={handleConfirmarCompra}
                    onCancel={() => setModalVisible(false)}
                    loading={loading}
                />
            </ScrollView>
        </>
    );
}