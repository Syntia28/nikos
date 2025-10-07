import { Link, router } from 'expo-router';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, Text, TextInput, View, TouchableOpacity, Pressable, Image, Modal, Alert } from 'react-native';
import { useProductos } from '@/hooks/productos.hook';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ChefHat, Eye, Flame, Heart, Minus, Package, Plus, ShoppingBag, X } from 'lucide-react-native';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgregarAlCarrito } from '@/components/AgregarAlCArrito';

export default function ProductosScreen() {
   
    const {
        filteredProductos,
        searchValue,
        setSearchValue,
        searchField,
        setSearchField,
        searchFields,
        loading,
        GetAll,
        handleSearch,
        clearSearch,
    } = useProductos();

    React.useEffect(() => {
        GetAll();
        console.log('Productos cargados');
    }, []);

    

    const getSizeColor = (tamanio: string) => {
        if (tamanio.includes('familiar')) return 'bg-green-400 text-white';
        if (tamanio.includes('personal')) return 'bg-green-400 text-crust';
        return 'bg-basil text-white';
    };


    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-4">
                    {/* Header */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-bold text-foreground">Catálogo de Productos</Text>
                    </View>

                    {/* Barra de búsqueda */}
                    <View className="bg-card p-4 rounded-lg gap-3">
                        <Text className="text-lg font-semibold text-card-foreground">Búsqueda</Text>

                        {/* Selector de campo */}
                        <View className="flex-row gap-2">
                            {searchFields.map((field) => (
                                <TouchableOpacity
                                    key={field.value}
                                    onPress={() => setSearchField(field.value)}
                                    className={`px-3 py-2 rounded ${searchField === field.value
                                        ? 'bg-blue-600'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <Text className={
                                        searchField === field.value
                                            ? 'text-white'
                                            : 'text-foreground'
                                    }>
                                        {field.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Campo de búsqueda */}
                        <View className="flex-row gap-2">
                            <TextInput
                                placeholder={`Buscar por ${searchFields.find(f => f.value === searchField)?.label.toLowerCase()}`}
                                value={searchValue}
                                onChangeText={setSearchValue}
                                className="flex-1 border border-border p-3 rounded bg-background text-foreground"
                            />
                            <Button onPress={handleSearch} className="bg-blue-600">
                                <Text className="text-white">🔍</Text>
                            </Button>
                            <Button onPress={clearSearch} className="bg-gray-600">
                                <Text className="text-white">✗</Text>
                            </Button>
                        </View>
                    </View>

                    {/* Lista de productos */}
                    <View className="gap-3">
                        <Text className="text-lg font-semibold text-foreground">
                            Resultados ({filteredProductos.length})
                        </Text>

                        {loading ? (
                            <Text className="text-center text-muted-foreground p-8">Cargando...</Text>
                        ) : filteredProductos.length > 0 ? (
                            filteredProductos.map((producto) => {
                                return (
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

                                            {/* Badge de tamaño */}
                                            <View className="absolute top-4 left-4">
                                                <Badge className={`${getSizeColor(producto.tamanio)} px-3 py-1`}>
                                                    <Text className="text-xs font-semibold">{producto.tamanio}</Text>
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
                                            <View className="absolute bottom-4 right-4 bg-green-200 rounded-se-full rounded-es-full px-3 py-2">
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

                                            <CardDescription className="text-foreground mb-4 leading-6">
                                                {producto.descripcion}
                                            </CardDescription>

                                            {/* Info adicional */}
                                            <View className="flex-row items-center justify-between mb-4">
                                                <View className="flex-row items-center">
                                                    <Icon as={ChefHat} className="text-foreground size-4 mr-2" />
                                                    <Text className="text-sm text-foreground">Hecho a mano</Text>
                                                </View>

                                                <View className="flex-row items-center">
                                                    <Icon as={Package} className="text-foreground size-4 mr-1" />
                                                    <Text className="relative text-sm flex-row w-16 flex-nowrap text-nowrap text-foreground overflow-hidden">
                                                        Stock: {producto.stock} 
                                                    </Text>
                                                </View>
                                            </View>
                                           <View  className='flex-col gap-2'>
                                                <Button onPress={() => router.push(`/producto/${producto.id}`)} className="bg-orange-200" disabled={producto.stock <= 0}>
                                                    <Text className="dark:text-white font-semibold border-b-2 border-transparent hover:border-black">
                                                        Ver detalles 👀</Text>
                                                </Button>
                                                <AgregarAlCarrito producto={producto} cantidad={1} funciónGetAll={GetAll} />

                                           </View>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <View className="bg-card p-8 rounded-lg">
                                <Text className="text-center text-muted-foreground">
                                    {searchValue ? 'No se encontraron productos' : 'No hay productos disponibles'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </>
    );
}