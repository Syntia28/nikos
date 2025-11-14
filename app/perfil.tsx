import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Stack, router } from 'expo-router';
import { User as FirebaseUser } from 'firebase/auth';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';
import {
    User,
    MapPin,
    Phone,
    Mail,
    Star,
    Heart,
    Settings,
    LogOut,
    CreditCard,
    Clock,
    Gift,
    Pizza
} from 'lucide-react-native';
import HistorialCompleto from '@/components/HistorialCompleto';

// Interfaz para el perfil completo del usuario
export interface UserProfile {
    uid: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    direccion: string;
    fechaRegistro: string;
    emailVerified: boolean;
}

export default function ProfileScreen() {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    const { onAuthChange, logout } = useFireAuthenticaiton();
    const { searchByField } = useCrudFireStorage();

    // Cargar datos del perfil desde Firestore
    const loadUserProfile = async (uid: string) => {
        setProfileLoading(true);
        try {
            const result = await searchByField<UserProfile>('uid', uid, 'usuarios');
            if (result.success && result.data.length > 0) {
                const profileData = result.data[0] as unknown as UserProfile;
                setUserProfile(profileData);
            } else {
                setUserProfile(null);
            }
        } catch (error) {
            console.error('Error al cargar perfil:', error);
            setUserProfile(null);
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (currentUser) {
                loadUserProfile(currentUser.uid);
            } else {
                setUserProfile(null);
            }
        });

        return unsubscribe;
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/');
                        } catch (error) {
                            console.error('Error al cerrar sesión:', error);
                            Alert.alert('Error', 'No se pudo cerrar la sesión. Inténtalo de nuevo.');
                        }
                    },
                },
            ]
        );
    };

    // Formatear la fecha
    const formatDate = (timestamp: string | null | undefined) => {
        if (!timestamp) return 'No disponible';
        return new Date(timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <>
                <Stack.Screen
                    options={{
                        title: 'Mi Perfil',
                        headerStyle: { backgroundColor: '#D49744' },
                        headerTintColor: 'white',
                        headerTitleStyle: { fontWeight: 'bold' }
                    }}
                />
                <View className="flex-1 justify-center items-center bg-background">
                    <Text className="text-foreground">Cargando perfil...</Text>
                </View>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Stack.Screen
                    options={{
                        title: 'Mi Perfil',
                        headerStyle: { backgroundColor: '#D49744' },
                        headerTintColor: 'white',
                        headerTitleStyle: { fontWeight: 'bold' }
                    }}      
                />
                <View className="flex-1 justify-center items-center bg-background p-6">
                    <Text className="text-foreground text-lg mb-4 text-center">
                        No has iniciado sesión
                    </Text>
                    <Button onPress={() => router.push('/login')} className="bg-pizza">
                        <Text className="text-white">Iniciar Sesión</Text>
                    </Button>
                </View>
            </>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Mi Perfil',
                    headerStyle: { backgroundColor: '#D49744' },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />

            <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
                {/* Header del perfil */}
                <View className="bg-pizza px-6 py-8">
                    <View className="items-center">
                        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                            <Icon as={User} className="text-black dark:text-white size-12" />
                        </View>

                        <Text className="text-black dark:text-white text-2xl font-bold mb-1">
                            {userProfile ? `${userProfile.nombre} ${userProfile.apellido}` : 'Usuario Nikos'}
                        </Text>

                        <Text className="text-black dark:text-white/80 mb-4">
                            {userProfile?.fechaRegistro
                                ? `Miembro desde ${formatDate(userProfile.fechaRegistro)}`
                                : `Miembro desde ${formatDate(user.metadata.creationTime)}`
                            }
                        </Text>

                        <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
                            <Icon as={Star} className="text-yellow-500 size-4 mr-2" />
                            <Text className="text-black dark:text-white font-medium">
                                {userProfile ? 'Cliente Registrado' : 'Cliente VIP'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="px-6 py-6 gap-6">
                    {/* Indicador de carga del perfil */}
                    {profileLoading && (
                        <Card className="bg-orange-100 dark:bg-black border-l-4 border-l-pizza">
                            <CardContent className="p-4">
                                <View className="flex-row items-center">
                                    <Text className="text-pizza">🔄</Text>
                                    <Text className="text-foreground ml-3">Cargando información del perfil...</Text>
                                </View>
                            </CardContent>
                        </Card>
                    )}

                    {/* Estadísticas rápidas */}
                    <View className="flex-row gap-4">
                        <Card className="bg-orange-100 dark:bg-gray-800 flex-1">
                            <CardContent className="items-center p-4">
                                <Text className="text-2xl font-bold text-pizza mb-1">
                                    {userProfile ? '12' : '0'}
                                </Text>
                                <Text className="text-sm text-muted-foreground text-center">Pedidos realizados</Text>
                            </CardContent>
                        </Card>

                        <Card className="bg-orange-100 dark:bg-gray-800 flex-1">
                            <CardContent className="items-center p-4">
                                <Text className="text-2xl font-bold text-pizza mb-1">4.9</Text>
                                <Text className="text-sm text-muted-foreground text-center">Rating promedio</Text>
                            </CardContent>
                        </Card>
                    </View>

                    {/* Información personal */}
                    <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                        <CardHeader>
                            <CardTitle className="flex-row items-center">
                                <Icon as={User} className="text-pizza size-5 mr-2" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            <View className="flex-row items-center">
                                <Icon as={Mail} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">{user?.email}</Text>
                            </View>

                            <View className="flex-row items-center">
                                <Icon as={Phone} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">
                                    {userProfile?.telefono || 'No especificado'}
                                </Text>
                            </View>

                            <View className="flex-row items-center">
                                <Icon as={MapPin} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">
                                    {userProfile?.direccion || 'No especificada'}
                                </Text>
                            </View>

                            {!userProfile && !profileLoading && (
                                <View className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-2">
                                    <Text className="text-yellow-800 dark:text-yellow-200 text-sm">
                                        ⚠️ Perfil incompleto. Contacta con soporte para completar tu información.
                                    </Text>
                                </View>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pizza favorita */}
                    <Card className="bg-orange-100 dark:bg-black border-l-4 border-l-pizza">
                        <CardContent className="p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-3xl mr-3">🍕</Text>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-foreground">Tu pizza favorita</Text>
                                        <Text className="text-muted-foreground">
                                            {userProfile ? 'Margherita Clásica' : 'Aún no has elegido favorita'}
                                        </Text>
                                    </View>
                                </View>
                                <Icon as={Heart} className="text-red-500 size-6" />
                            </View>
                        </CardContent>
                    </Card>

                    {/* Información de la cuenta */}
                    <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                        <CardHeader>
                            <CardTitle className="flex-row items-center">
                                <Icon as={Settings} className="text-pizza size-5 mr-2" />
                                Información de la Cuenta
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground">Email verificado</Text>
                                <Text className={user?.emailVerified ? "text-green-600" : "text-red-600"}>
                                    {user?.emailVerified ? '✅ Sí' : '❌ No'}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground">Último acceso</Text>
                                <Text className="text-foreground">
                                    {formatDate(user.metadata.lastSignInTime)}
                                </Text>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-muted-foreground">ID de usuario</Text>
                                <Text className="text-foreground text-xs font-mono">
                                    {user.uid.substring(0, 8)}...
                                </Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Acciones del menú */}
                    <View className="gap-3">
                        <Text className="text-lg font-bold text-foreground">Configuración</Text>

                        <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={CreditCard} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Métodos de Pago</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto" onPress={() => router.push('/historial')}>
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Clock} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Historial de Pedidos</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Gift} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Programa de Lealtad</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Settings} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Configuración</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className='bg-orange-100 dark:bg-black border-l-4 border-l-pizza'>
                            <CardContent className="p-0">
                                <Button onPress={() => router.push(`/cambiarContraseña/${user.id}`)} variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">

                                        <Icon as={Settings} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Cambiar contraseña</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>
                    </View>

                    {/* Botón de logout */}
                    <Card className="bg-orange-100 dark:bg-black mt-4 mb-32">
                        <CardContent className="p-0">
                            <Button
                                variant="ghost"
                                className="w-full justify-start p-4 h-auto"
                                onPress={handleLogout}
                            >
                                <View className="flex-row items-center flex-1">
                                    <Icon as={LogOut} className="text-destructive size-5 mr-3" />
                                    <Text className="text-destructive">Cerrar Sesión</Text>
                                </View>
                            </Button>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </>
    );
}