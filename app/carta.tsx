import { Link, router } from 'expo-router';
import { Stack } from 'expo-router';
import * as React from 'react';
import { ScrollView, Text, TextInput, View, TouchableOpacity, Pressable, Image, Modal, Alert } from 'react-native';
import { useProductos } from '@/hooks/productos.hook';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { User } from 'firebase/auth';
import eventBus from '@/lib/eventBus';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ChefHat, Eye, Flame, Heart, Minus, Package, Plus, ShoppingBag, X, Star } from 'lucide-react-native';
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
        refreshProducts,
        getComentariosPorProducto,
    } = useProductos();

    const [comentariosCargados, setComentariosCargados] = React.useState<{ [key: string]: any[] }>({});

    React.useEffect(() => {
        GetAll();
    }, [GetAll]);

    // Escuchar evento de recarga puntual (estrategia híbrida)
    React.useEffect(() => {
        // Antes la tarjeta escuchaba el evento, ahora la lógica centralizada está en useProductos.
        // Dejar vacía esta suscripción para evitar duplicidad.
        return () => { };
    }, [GetAll, refreshProducts]);

    // Estado para modal de opiniones
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [selectedProductForModal, setSelectedProductForModal] = React.useState<any | null>(null);
    const [user, setUser] = React.useState<User | null>(null);
    const { onAuthChange } = useFireAuthenticaiton();

    React.useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => setUser(currentUser));
        return () => unsubscribe();
    }, [onAuthChange]);

    const openCommentsModal = (producto: any) => {
        (async () => {
            // Siempre obtener comentarios desde historial como fallback y fusionarlos con lo que tenga el documento
            try {
                const fallback = await getComentariosPorProducto(producto.id, 200);

                // combinar calificaciones del doc y fallback
                const docComments = Array.isArray(producto.calificaciones) ? producto.calificaciones : [];
                const combined = [...docComments, ...(fallback || [])];

                // deduplicate por compraId, userId+fecha, o userEmail+fecha, o userId+comment+score
                const seen = new Map();
                const dedup: any[] = [];
                for (const c of combined) {
                    const key = c.compraId
                        ? `compra:${c.compraId}`
                        : c.userId && c.fecha
                            ? `userDate:${c.userId}:${new Date(c.fecha).toISOString()}`
                            : c.userEmail && c.fecha
                                ? `emailDate:${c.userEmail}:${new Date(c.fecha).toISOString()}`
                                : `userComment:${c.userId || c.userEmail}:${String(c.comment || '')}:${c.score}`;
                    if (!seen.has(key)) {
                        seen.set(key, true);
                        dedup.push(c);
                    }
                }

                // ordenar por fecha desc
                dedup.sort((a: any, b: any) => {
                    const da = a.fecha ? new Date(a.fecha) : new Date();
                    const db = b.fecha ? new Date(b.fecha) : new Date();
                    return db.getTime() - da.getTime();
                });

                setComentariosCargados((prev) => ({ ...prev, [producto.id]: dedup }));
                setSelectedProductForModal({ ...producto, calificaciones: dedup });
            } catch (e) {
                console.error('Error cargando comentarios para modal:', e);
                setSelectedProductForModal(producto);
            }
        })();
        setModalVisible(true);
    };

    const closeCommentsModal = () => {
        setSelectedProductForModal(null);
        setModalVisible(false);
    };

    const renderStars = (score: number, size: number = 12) => (
        <View className="flex-row">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    color={index < Math.round(score) ? '#F59E0B' : '#D1D5DB'}
                    fill={index < Math.round(score) ? '#F59E0B' : 'transparent'}
                />
            ))}
        </View>
    );



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

                        {loading && filteredProductos.length === 0 ? (
                            <Text className="text-center text-muted-foreground p-8">Cargando...</Text>
                        ) : filteredProductos.length > 0 ? (
                            filteredProductos.map((producto) => {
                                // combinar calificaciones del documento y fallback cacheado para búsqueda y snippet
                                const allCommentsForCard = (producto.calificaciones && Array.isArray(producto.calificaciones) && producto.calificaciones.length > 0)
                                    ? producto.calificaciones
                                    : (comentariosCargados[producto.id] || []);

                                const userReview = (user && Array.isArray(allCommentsForCard))
                                    ? allCommentsForCard.find((c: any) => c.userId === user.uid || c.userEmail === user.email)
                                    : null;

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

                                            {/* Si el usuario autenticado dejó una reseña, mostrarla aquí */}
                                            {userReview ? (
                                                <View className="mb-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-2">
                                                            <Text className="text-sm font-semibold">{user && user.uid === userReview.userId ? 'Tu reseña' : (userReview.userName || 'Usuario')}</Text>
                                                            <View>{renderStars(Number(userReview.score) || 0, 14)}</View>
                                                        </View>
                                                        <Text className="text-sm text-muted-foreground">{Number(userReview.score) || 0}/5</Text>
                                                    </View>
                                                    {userReview.comment ? <Text className="text-sm text-foreground mt-2">{userReview.comment}</Text> : null}
                                                </View>
                                            ) : null}

                                            {/* Rating y snippet de comentario */}
                                            {(producto.ratingPromedio ?? 0) > 0 && (
                                                <TouchableOpacity onPress={() => openCommentsModal(producto)} className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                                    <View className="flex-row items-center justify-between">
                                                        <View className="flex-row items-center gap-2">
                                                            {renderStars(Number(producto.ratingPromedio) || 0, 14)}
                                                            <Text className="text-sm text-muted-foreground">{(Number(producto.ratingPromedio) || 0).toFixed(1)} ({producto.totalCalificaciones || 0})</Text>
                                                        </View>
                                                        <Text className="text-sm text-blue-600">Ver opiniones</Text>
                                                    </View>
                                                    {((producto.calificaciones && producto.calificaciones.length > 0) || (comentariosCargados[producto.id] && comentariosCargados[producto.id].length > 0)) && (
                                                        <View className="mt-2">
                                                            {/* Mostrar comentario más reciente (del doc o cache fallback) */}
                                                            {(() => {
                                                                const sourceComments = (producto.calificaciones && producto.calificaciones.length > 0)
                                                                    ? producto.calificaciones
                                                                    : (comentariosCargados[producto.id] || []);
                                                                const sorted = [...sourceComments].sort((a: any, b: any) => {
                                                                    const da = a.fecha ? new Date(a.fecha) : new Date();
                                                                    const db = b.fecha ? new Date(b.fecha) : new Date();
                                                                    return db.getTime() - da.getTime();
                                                                });
                                                                const latest = sorted[0];
                                                                return latest ? (
                                                                    <View>
                                                                        <Text className="text-sm text-foreground font-semibold">{latest.userName || 'Usuario'}</Text>
                                                                        <Text className="text-sm text-muted-foreground">{latest.comment || ''}</Text>
                                                                    </View>
                                                                ) : null;
                                                            })()}
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            )}

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
                                            <View className='flex-col gap-2'>
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

            {/* Modal de comentarios */}
            <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeCommentsModal}>
                <Pressable onPress={closeCommentsModal} className="flex-1 justify-end bg-black/50">
                    <Pressable className="bg-background rounded-t-2xl max-h-[80%]">
                        <View className="p-4 border-b border-border">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-xl font-bold text-foreground">Opiniones</Text>
                                <TouchableOpacity onPress={closeCommentsModal} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"><X size={20} className="text-foreground" /></TouchableOpacity>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-lg font-bold text-amber-500">{selectedProductForModal?.ratingPromedio ? Number(selectedProductForModal.ratingPromedio).toFixed(1) : '-'}</Text>
                                {selectedProductForModal?.ratingPromedio ? renderStars(Number(selectedProductForModal.ratingPromedio), 18) : null}
                                <Text className="text-muted-foreground text-sm">({selectedProductForModal?.totalCalificaciones || 0} opiniones)</Text>
                            </View>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
                            {/* Mostrar la reseña del usuario autenticado en la parte superior del modal */}
                            {user && selectedProductForModal?.calificaciones && Array.isArray(selectedProductForModal.calificaciones) && (() => {
                                const my = selectedProductForModal.calificaciones.find((c: any) => c.userId === user.uid || c.userEmail === user.email);
                                if (my) {
                                    return (
                                        <View className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center"><Text className="text-white font-bold text-sm">{(my.userName || 'T').charAt(0).toUpperCase()}</Text></View>
                                                    <View>
                                                        <Text className="font-semibold text-foreground">{my.userName || 'Tú'}</Text>
                                                        <Text className="text-xs text-muted-foreground">{my.fecha ? new Date(my.fecha).toLocaleDateString() : ''}</Text>
                                                    </View>
                                                </View>
                                                <View>{renderStars(Number(my.score) || 0, 14)}</View>
                                            </View>
                                            <Text className="text-foreground">{my.comment}</Text>
                                        </View>
                                    );
                                }
                                return null;
                            })()}

                            {selectedProductForModal?.calificaciones && selectedProductForModal.calificaciones.length > 0 ? (
                                selectedProductForModal.calificaciones
                                    .slice()
                                    .sort((a: any, b: any) => {
                                        const da = a.fecha ? new Date(a.fecha) : new Date();
                                        const db = b.fecha ? new Date(b.fecha) : new Date();
                                        return db.getTime() - da.getTime();
                                    })
                                    .map((comentario: any, index: number) => (
                                        <View key={index} className="border-b border-border pb-4 last:border-b-0">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center"><Text className="text-white font-bold text-sm">{comentario.userName?.charAt(0)?.toUpperCase() || 'U'}</Text></View>
                                                    <View>
                                                        <Text className="font-semibold text-foreground">{comentario.userName || 'Usuario'}</Text>
                                                        <Text className="text-xs text-muted-foreground">{comentario.fecha ? new Date(comentario.fecha).toLocaleDateString() : ''}</Text>
                                                    </View>
                                                </View>
                                                <View>{renderStars(Number(comentario.score) || 0, 14)}</View>
                                            </View>
                                            <Text className="text-foreground">{comentario.comment}</Text>
                                        </View>
                                    ))
                            ) : (
                                <View className="p-6"><Text className="text-muted-foreground">No hay opiniones aún</Text></View>
                            )}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}