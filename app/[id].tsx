import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { Stack } from 'expo-router';
import { ScrollView, Text, View, Image, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { useProductos } from '@/hooks/productos.hook';
import { useEffect, useState } from 'react';
import { ProductoId } from '@/interfaces/producto';


export default function DetalleScreen() {
    const { id } = useLocalSearchParams();
    const { GetById } = useProductos();

    const [producto, setProducto] = useState<ProductoId | null>(null);
    const [loading, setLoading] = useState(true);


    const loadProducto = async () => {
        if (!id) {
            Alert.alert('Error', 'ID del producto no encontrado');
            router.back();
            return;
        }

        setLoading(true);
        try {
            const product = await GetById(id as string);
            if (product) {
                setProducto(product);
            } else {
                Alert.alert('Error', 'No se pudo cargar el producto');
                router.back();
            }
        } catch (error) {
            console.error('Error al cargar producto:', error);
            Alert.alert('Error', 'No se pudo cargar el producto');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducto();
    }, [id]);

    const [quantity, setQuantity] = useState(1);
    const hasStock = producto ? producto.stock > 0 : false;

    const handleIncreaseQuantity = () => {
        if (quantity < (producto ? producto.stock : 0)) {
            setQuantity(prevQuantity => prevQuantity + 1);
        } else {
            Alert.alert("Límite de Stock", `Solo quedan ${producto ? producto.stock : 0} unidades disponibles.`);
        }
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };

    const handleAddToCart = () => {
        if (!hasStock) {
            Alert.alert("Producto sin stock", "Este producto no está disponible actualmente.");
            return;
        }
        Alert.alert(
            "Agregado al Carrito",
            `Se agregaron ${quantity} unidad(es) de "${producto ? producto.nombre : ''}" al carrito por $${(producto ? producto.precio : 0 * quantity).toFixed(2)}.`
        );
    };

    const goBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View className="flex-1 bg-background items-center justify-center">
                    <Text className="text-foreground text-lg">Cargando producto...</Text>
                </View>
            </>
        );
    }

    if (!producto) {
        return (
            <>
                <Stack.Screen options={{ headerShown: false }} />
                <View className="flex-1 bg-background items-center justify-center">
                    <Text className="text-foreground text-lg">Producto no encontrado</Text>
                    <Button onPress={goBack} className="mt-4 bg-gray-600">
                        <Text className="text-white">← Volver</Text>
                    </Button>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="flex-1 bg-[#FAE3AA] dark:bg-[#3D3D3D]">
                {/* Imagen del producto */}
                <Image
                    source={{ uri: producto.imagenUrl }}
                    className="w-full h-72"
                    resizeMode="cover"
                />

                {/* Contenedor de detalles estilo tarjeta */}
                <View className="bg-white dark:bg-[#1E1E1E] rounded-2xl mx-4 mt-[-60] p-6 shadow-xl">
                    {/* Nombre y Precio del producto */}
                    <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-200">
                        <Text className="text-3xl font-bold text-gray-800 dark:text-orange-200 flex-shrink mr-2">{producto.nombre}</Text>
                        <Text className="text-3xl font-bold text-green-500 dark:text-teal-200">${producto.precio.toFixed(2)}</Text>
                    </View>

                    {/* Descripción */}
                    <Text className="text-lg font-semibold text-gray-800 dark:text-orange-200 mt-5 mb-2">Descripción</Text>
                    <Text className="dark:text-white text-black leading-6">{producto.descripcion}</Text>

                    {/* Detalles adicionales */}
                    <View className="flex-row justify-between items-center mt-4 py-2 border-b border-gray-100">
                        <Text className="text-base font-semibold text-gray-800 dark:text-orange-200">Tamaño</Text>
                        <Text className="text-base text-black dark:text-white">{producto.tamanio}</Text>
                    </View>

                    <View className="flex-row justify-between items-center mt-2 py-2 border-b border-gray-100">
                        <Text className="text-base font-semibold text-gray-800 dark:text-orange-200">Disponibilidad</Text>
                        <Text className={`text-base font-bold ${hasStock ? 'text-green-300' : 'text-red-500'}`}>
                            {hasStock ? `${producto.stock} disponibles ✅` : 'Sin stock 😔'}
                        </Text>
                    </View>

                    <View className="flex-row justify-between items-center mt-2 py-2">
                        <Text className="text-base font-semibold text-gray-800 dark:text-orange-200">Agregado el</Text>
                        <Text className="text text-black dark:text-white">{new Date(producto.createdAt).toLocaleDateString()} 🗓️</Text>
                    </View>

                    {/* Sección de Cantidad */}
                    <Text className="text-lg font-semibold text-orange-300 mt-8 mb-4 self-center">Cantidad</Text>
                    <View className="flex-row justify-center items-center bg-gray-200 rounded-full py-2 w-40 self-center">
                        <TouchableOpacity
                            className="dark:bg-white bg-black rounded-full w-10 h-10 justify-center items-center mx-2"
                            onPress={handleDecreaseQuantity}
                            disabled={quantity === 1}
                        >
                            <Text className="text-white front-bold dark:text-black">-</Text>
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-black dark:text-white w-8 text-center">{quantity}</Text>
                        <TouchableOpacity
                            className="bg-black dark:bg-white rounded-full w-10 h-10 justify-center items-center mx-2"
                            onPress={handleIncreaseQuantity}
                            disabled={quantity >= producto.stock || !hasStock}
                        >
                            <Text className="text-white font-bold dark:text-gray-700">+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón de Agregar al Carrito */}
                    <TouchableOpacity
                        className={`rounded-lg py-4 mt-8 items-center shadow-lg ${hasStock ? 'bg-orange-300' : 'bg-gray-500'}`}
                        onPress={handleAddToCart}
                        disabled={!hasStock}
                    >
                        <Text className=" font-bold text-white dark:text-black text-lg">
                            {hasStock ? `Agregar ${quantity} al Carrito` : 'Producto Agotado'} 🛒
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}