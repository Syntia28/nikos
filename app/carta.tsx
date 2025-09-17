import { View, ScrollView, Image, Dimensions, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingBag,
    Clock,
    Star,
    Plus,
    Minus,
    Pizza,
    Flame,
    ChefHat,
    Package,
    Heart,
    Eye
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Producto } from '@/interfaces/producto';

const { width } = Dimensions.get('window');

// Mock data actualizado con interfaz Producto
const productos: Producto[] = [
    {
        id: '1',
        nombre: 'Margherita Clásica',
        descripcion: 'Salsa de tomate artesanal, mozzarella fresca di bufala, albahaca fresca, aceite de oliva extra virgen',
        tamaño: 'Mediana (30cm)',
        precio: 18.99,
        imagenUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
        stock: 15,
        createdAt: new Date('2024-01-15')
    },
    {
        id: '2',
        nombre: 'Pepperoni Suprema',
        descripcion: 'Pepperoni premium importado, mozzarella especial, salsa de tomate con hierbas secretas',
        tamaño: 'Grande (35cm)',
        precio: 24.99,
        imagenUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
        stock: 12,
        createdAt: new Date('2024-01-10')
    },
    {
        id: '3',
        nombre: 'Quattro Stagioni',
        descripcion: 'Jamón serrano, champiñones portobello, alcachofas mediterráneas, aceitunas kalamata, mozzarella',
        tamaño: 'Familiar (40cm)',
        precio: 28.99,
        imagenUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
        stock: 8,
        createdAt: new Date('2024-01-12')
    },
    {
        id: '4',
        nombre: 'Hawaiana Tropical',
        descripcion: 'Jamón dulce, piña fresca del trópico, mozzarella, salsa barbacoa especial',
        tamaño: 'Mediana (30cm)',
        precio: 21.99,
        imagenUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=300&h=200&fit=crop',
        stock: 10,
        createdAt: new Date('2024-01-08')
    },
    {
        id: '5',
        nombre: 'Vegetariana Suprema',
        descripcion: 'Pimientos rojos y verdes, champiñones frescos, cebolla caramelizada, tomate cherry, aceitunas, mozzarella',
        tamaño: 'Grande (35cm)',
        precio: 23.99,
        imagenUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=300&h=200&fit=crop',
        stock: 14,
        createdAt: new Date('2024-01-05')
    },
    {
        id: '6',
        nombre: 'Meat Lovers Deluxe',
        descripcion: 'Pepperoni, salchicha italiana, jamón ahumado, bacon crujiente, chorizo, mozzarella extra',
        tamaño: 'Familiar (40cm)',
        precio: 32.99,
        imagenUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
        stock: 6,
        createdAt: new Date('2024-01-20')
    },
    {
        id: '7',
        nombre: 'Mediterránea Gourmet',
        descripcion: 'Queso de cabra, tomates secos, rúcula fresca, aceitunas verdes, prosciutto, reducción balsámica',
        tamaño: 'Mediana (30cm)',
        precio: 26.99,
        imagenUrl: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=300&h=200&fit=crop',
        stock: 9,
        createdAt: new Date('2024-01-18')
    },
    {
        id: '8',
        nombre: 'BBQ Chicken Ranch',
        descripcion: 'Pollo a la parrilla, cebolla morada, salsa BBQ ahumada, ranch casero, cilantro fresco',
        tamaño: 'Grande (35cm)',
        precio: 25.99,
        imagenUrl: 'https://images.unsplash.com/photo-1565299585323-38174c8f5530?w=300&h=200&fit=crop',
        stock: 11,
        createdAt: new Date('2024-01-22')
    }
];

export default function OrdersScreen() {
    const [cart, setCart] = useState<Record<string, number>>({});
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    const addToCart = (productoId: string) => {
        setCart(prev => ({
            ...prev,
            [productoId]: (prev[productoId] || 0) + 1
        }));
    };

    const removeFromCart = (productoId: string) => {
        setCart(prev => ({
            ...prev,
            [productoId]: Math.max((prev[productoId] || 0) - 1, 0)
        }));
    };

    const toggleFavorite = (productoId: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(productoId)) {
                newFavorites.delete(productoId);
            } else {
                newFavorites.add(productoId);
            }
            return newFavorites;
        });
    };

    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, count) => sum + count, 0);
    };

    const getTotalPrice = () => {
        return Object.entries(cart).reduce((total, [id, count]) => {
            const producto = productos.find(p => p.id === id);
            return total + (producto ? producto.precio * count : 0);
        }, 0).toFixed(2);
    };

    const getSizeColor = (tamaño: string) => {
        if (tamaño.includes('Familiar')) return 'bg-pizza text-white';
        if (tamaño.includes('Grande')) return 'bg-cheese text-crust';
        return 'bg-basil text-white';
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Nuestra Carta 🍕',
                    headerStyle: { backgroundColor: 'hsl(14 88% 55%)' },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />

            <View className="flex-1 bg-background">
                {/* Header con carrito flotante */}
                <View className="bg-gradient-to-r from-pizza via-tomato to-cheese px-6 py-6">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-white text-2xl font-bold mb-1">
                                🍕 Carta
                            </Text>
                            <Text className="text-white/90">
                                Pizzas artesanales hechas con amor
                            </Text>
                        </View>

                        {getTotalItems() > 0 && (
                            <View className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-2xl">
                                <View className="flex-row items-center">
                                    <Icon as={ShoppingBag} className="text-white size-5 mr-2" />
                                    <View>
                                        <Text className="text-white font-bold">{getTotalItems()} items</Text>
                                        <Text className="text-white/80 text-sm">${getTotalPrice()}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Grid de productos */}
                    <View className="px-4 py-6 gap-6 pb-32">
                        {productos.map((producto) => (
                            <Card key={producto.id} className="overflow-hidden shadow-lg shadow-black/10 border-0">
                                {/* Imagen del producto */}
                                <View className="relative">
                                    <Image
                                        source={{ uri: producto.imagenUrl }}
                                        className="w-full h-48"
                                        style={{ width: '100%', height: 200 }}
                                        resizeMode="cover"
                                    />

                                    {/* Overlay con gradiente */}
                                    <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Botón de favorito */}
                                    <Pressable
                                        onPress={() => toggleFavorite(producto.id)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center"
                                    >
                                        <Icon
                                            as={Heart}
                                            className={`size-5 ${favorites.has(producto.id) ? 'text-red-500' : 'text-white'}`}
                                            fill={favorites.has(producto.id) ? 'currentColor' : 'none'}
                                        />
                                    </Pressable>

                                    {/* Badge de tamaño */}
                                    <View className="absolute top-4 left-4">
                                        <Badge className={`${getSizeColor(producto.tamaño)} px-3 py-1`}>
                                            <Text className="text-xs font-semibold">{producto.tamaño}</Text>
                                        </Badge>
                                    </View>

                                    {/* Badge de stock bajo */}
                                    {producto.stock <= 5 && (
                                        <View className="absolute bottom-4 left-4">
                                            <Badge className="bg-red-500 text-white">
                                                <Icon as={Flame} className="size-3 mr-1" />
                                                <Text className="text-xs font-bold">¡Últimas {producto.stock}!</Text>
                                            </Badge>
                                        </View>
                                    )}

                                    {/* Precio prominente */}
                                    <View className="absolute bottom-4 right-4 bg-white rounded-full px-3 py-2">
                                        <Text className="text-pizza font-bold text-lg">
                                            S/.{producto.precio}
                                        </Text>
                                    </View>
                                </View>

                                <CardContent className="p-6">
                                    {/* Título y descripción */}
                                    <CardTitle className="text-xl font-bold text-foreground mb-2">
                                        {producto.nombre}
                                    </CardTitle>

                                    <CardDescription className="text-muted-foreground mb-4 leading-6">
                                        {producto.descripcion}
                                    </CardDescription>

                                    {/* Info adicional */}
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="flex-row items-center">
                                            <Icon as={ChefHat} className="text-pizza size-4 mr-2" />
                                            <Text className="text-sm text-muted-foreground">Hecho a mano</Text>
                                        </View>

                                        <View className="flex-row items-center">
                                            <Icon as={Package} className="text-muted-foreground size-4 mr-1" />
                                            <Text className="text-sm text-muted-foreground">
                                                Stock: {producto.stock}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Controles de cantidad y agregar al carrito */}
                                    <View className="flex-row items-center justify-between">
                                        {cart[producto.id] ? (
                                            <View className="flex-row items-center bg-muted rounded-full">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-full"
                                                    onPress={() => removeFromCart(producto.id)}
                                                >
                                                    <Icon as={Minus} className="size-4" />
                                                </Button>

                                                <Text className="px-4 font-bold text-lg min-w-[50px] text-center">
                                                    {cart[producto.id]}
                                                </Text>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-full"
                                                    onPress={() => addToCart(producto.id)}
                                                    disabled={producto.stock <= 0}
                                                >
                                                    <Icon as={Plus} className="size-4" />
                                                </Button>
                                            </View>
                                        ) : (
                                            <Button
                                                className="bg-pizza hover:bg-pizza/90 rounded-full px-6 shadow-lg shadow-pizza/25"
                                                onPress={() => addToCart(producto.id)}
                                                disabled={producto.stock <= 0}
                                            >
                                                <Icon as={Plus} className="text-white size-4 mr-2" />
                                                <Text className="text-white font-semibold">Agregar</Text>
                                            </Button>
                                        )}

                                        <Button variant="outline" size="icon" className="rounded-full border-pizza/30">
                                            <Icon as={Eye} className="text-pizza size-4" />
                                        </Button>
                                    </View>
                                </CardContent>
                            </Card>
                        ))}
                    </View>
                </ScrollView>

                {/* Botón flotante de carrito */}
                {getTotalItems() > 0 && (
                    <View className="absolute bottom-24 right-6">
                        <Pressable className="bg-pizza shadow-xl shadow-pizza/30 h-16 w-16 rounded-full items-center justify-center">
                            <Icon as={ShoppingBag} className="text-white size-7" />
                            <View className="absolute -top-2 -right-2 bg-tomato w-7 h-7 rounded-full items-center justify-center border-2 border-white">
                                <Text className="text-white text-xs font-bold">{getTotalItems()}</Text>
                            </View>
                        </Pressable>
                    </View>
                )}
            </View>
        </>
    );
}