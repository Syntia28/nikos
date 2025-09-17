import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
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
    Gift
} from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Mi Perfil',
                    headerStyle: { backgroundColor: 'hsl(14 88% 55%)' },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />

            <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

                {/* Header del perfil */}
                <View className="bg-pizza px-6 py-8">
                    <View className="items-center">
                        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
                            <Icon as={User} className="text-white size-12" />
                        </View>

                        <Text className="text-white text-2xl font-bold mb-1">
                            Usuario Nikos
                        </Text>

                        <Text className="text-white/80 mb-4">
                            Miembro desde Enero 2024
                        </Text>

                        <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full">
                            <Icon as={Star} className="text-yellow-300 size-4 mr-2" />
                            <Text className="text-white font-medium">Cliente VIP</Text>
                        </View>
                    </View>
                </View>

                <View className="px-6 py-6 gap-6">

                    {/* Estadísticas rápidas */}
                    <View className="flex-row gap-4">
                        <Card className="flex-1">
                            <CardContent className="items-center p-4">
                                <Text className="text-2xl font-bold text-pizza mb-1">23</Text>
                                <Text className="text-sm text-muted-foreground text-center">Pedidos realizados</Text>
                            </CardContent>
                        </Card>

                        <Card className="flex-1">
                            <CardContent className="items-center p-4">
                                <Text className="text-2xl font-bold text-pizza mb-1">4.9</Text>
                                <Text className="text-sm text-muted-foreground text-center">Rating promedio</Text>
                            </CardContent>
                        </Card>
                    </View>

                    {/* Información personal */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex-row items-center">
                                <Icon as={User} className="text-pizza size-5 mr-2" />
                                Información Personal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="gap-4">
                            <View className="flex-row items-center">
                                <Icon as={Mail} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">usuario@nikos.com</Text>
                            </View>

                            <View className="flex-row items-center">
                                <Icon as={Phone} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">+1 (555) 123-4567</Text>
                            </View>

                            <View className="flex-row items-center">
                                <Icon as={MapPin} className="text-muted-foreground size-5 mr-3" />
                                <Text className="text-muted-foreground">Av. Principal 456, Ciudad</Text>
                            </View>
                        </CardContent>
                    </Card>

                    {/* Pizza favorita */}
                    <Card className="border-l-4 border-l-pizza">
                        <CardContent className="p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <Text className="text-3xl mr-3">🍕</Text>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-foreground">Tu pizza favorita</Text>
                                        <Text className="text-muted-foreground">Margherita Clásica</Text>
                                    </View>
                                </View>
                                <Icon as={Heart} className="text-red-500 size-6" />
                            </View>
                        </CardContent>
                    </Card>

                    {/* Acciones del menú */}
                    <View className="gap-3">
                        <Text className="text-lg font-bold text-foreground">Configuración</Text>

                        <Card>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={CreditCard} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Métodos de Pago</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Clock} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Historial de Pedidos</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Gift} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Programa de Lealtad</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-0">
                                <Button variant="ghost" className="w-full justify-start p-4 h-auto">
                                    <View className="flex-row items-center flex-1">
                                        <Icon as={Settings} className="text-muted-foreground size-5 mr-3" />
                                        <Text className="text-foreground">Configuración</Text>
                                    </View>
                                </Button>
                            </CardContent>
                        </Card>
                    </View>

                    {/* Botón de logout */}
                    <Card className="mt-4 mb-32">
                        <CardContent className="p-0">
                            <Button variant="ghost" className="w-full justify-start p-4 h-auto">
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