import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { Link, Stack, router } from 'expo-router';
import {
  MoonStarIcon,
  StarIcon,
  SunIcon,
  Pizza,
  Flame,
  ChefHat,
  Clock,
  Heart,
  MapPin,
  LogIn,
  User,
  Home
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  Image,
  type ImageStyle,
  View,
  ScrollView,
  Dimensions,
  ImageBackground
} from 'react-native';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

const { width } = Dimensions.get('window');

const SCREEN_OPTIONS = {
  light: {
    title: 'Pizzeria Niko´s',
    headerTransparent: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerTintColor: THEME.light.foreground,
    headerRight: () => <ThemeToggle />,
  },
  dark: {
    title: 'Pizzeria Niko´s',
    headerTransparent: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerTintColor: THEME.dark.foreground,
    headerRight: () => <ThemeToggle />,
  },
};

const IMAGE_STYLE: ImageStyle = {
  height: 100,
  width: 150,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const { onAuthChange } = useFireAuthenticaiton();

  // Estado local para manejar el usuario y loading
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Usar el onAuthChange de tu hook para escuchar cambios
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    // Cleanup al desmontar el componente
    return unsubscribe;
  }, []);

  // Si está cargando, mostrar un indicador
  if (authLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-foreground">Cargando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS[colorScheme ?? 'light']} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View className="relative h-80 items-center justify-center bg-gradient-to-br from-pizza via-tomato to-cheese overflow-hidden">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View className="flex-row flex-wrap">
              {Array.from({ length: 60 }).map((_, i) => (
                <View key={i} className="w-8 h-8 m-2">
                  <Icon as={Pizza} className="text-black dark:text-white size-6" />
                </View>
              ))}
            </View>
          </View>

          {/* Hero Content */}
          <View className="items-center px-6 z-10">
            <Image source={require('@/assets/images/logo.png')} style={IMAGE_STYLE} />

            <Text className="text-blue-950 dark:text-green-200 text-lg text-center mb-6 font-medium">
              Sabores auténticos desde 2021
            </Text>

            <View className="flex-row items-center bg-orange-400 px-4 py-2 rounded-full backdrop-blur-sm">
              <Icon as={Flame} className="text-white size-4 mr-2" />
              <Text className="text-white font-medium">Horneado a la leña</Text>
            </View>
          </View>
        </View>

        {/* Welcome Message */}
        <View className="px-6 py-8">
          <Card className="bg-orange-200 dark:bg-black border-l-4 border-l-pizza">
            <CardHeader>
              <CardTitle className="dark:text-white text-2xl text-pizza flex-row items-center">
                <Icon as={ChefHat} className="dark:text-white text-pizza size-6 mr-2" />
                {user ? `¡Bienvenido de nuevo!` : `¡Bienvenido a Niko´s!`}
              </CardTitle>
              <CardDescription className="text-base">
                {user
                  ? `Hola ${user.email}, disfruta de nuestras deliciosas pizzas artesanales.`
                  : `Descubre nuestras deliciosas pizzas artesanales preparadas con ingredientes frescos y amor.`
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </View>

        {/* Quick Actions - Mostrar condicionalmente según autenticación */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold mb-4 text-foreground">
            {user ? 'Tu experiencia' : 'Comienza tu experiencia'}
          </Text>

          <View className="gap-4">
            {!user &&
              // Mostrar botones de login/registro si NO está autenticado
              <>
                <Link href="/login" asChild>
                  <Button variant="outline" className="bg-orange-200 dark:bg-black h-14 rounded-2xl border-2 border-pizza/20">
                    <View className="flex-row items-center">
                      <Icon as={LogIn} className="text-black dark:text-white size-5 mr-3" />
                      <Text className="dark:text-white text-pizza text-lg font-semibold">Iniciar Sesión</Text>
                    </View>
                  </Button>
                </Link>

                <Link href="/register" asChild>
                  <Button variant="outline" className="bg-orange-200 dark:bg-black h-14 rounded-2xl border-2 border-pizza/20">
                    <View className="flex-row items-center">
                      <Icon as={StarIcon} className="text-black dark:text-white size-5 mr-3" />
                      <Text className="dark:text-white text-lg font-semibold">Registrarse</Text>
                    </View>
                  </Button>
                </Link>
              </>
             
            }
          </View>
        </View>

        {/* Features Grid */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold mb-4 text-foreground">
            Por qué elegirnos
          </Text>

          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[160px]">
              <Card className="bg-orange-200 dark:bg-black h-32">
                <CardContent className="items-center justify-center flex-1 p-4">
                  <Icon as={Clock} className="text-black dark:text-white size-8 mb-2" />
                  <Text className="font-semibold text-center">Entrega Rápida</Text>
                  <Text className="text-sm text-muted-foreground text-center">30 min máximo</Text>
                </CardContent>
              </Card>
            </View>

            <View className="flex-1 min-w-[160px]">
              <Card className="bg-orange-200 dark:bg-black h-32">
                <CardContent className="items-center justify-center flex-1 p-4">
                  <Icon as={ChefHat} className="text-black dark:text-white size-8 mb-2" />
                  <Text className="font-semibold text-center">Ingredientes Frescos</Text>
                  <Text className="text-sm text-muted-foreground text-center">Calidad premium</Text>
                </CardContent>
              </Card>
            </View>
          </View>
        </View>

        {/* Location Info */}
        <View className="px-6 pb-32">
          <Card className="bg-orange-200 dark:bg-black from-cheese/10 to-pizza/10 border-cheese/30">
            <CardContent className="p-6">
              <View className="flex-row items-center mb-3">
                <Icon as={MapPin} className="text-black dark:text-white size-5 mr-2" />
                <Text className="font-semibold text-lg">Encuéntranos</Text>
              </View>
              <Text className="text-muted-foreground mb-2">
                Jr. Reyna Farge - 175
              </Text>
              <Text className="text-muted-foreground">
                Abierto todos los días de 17:30 PM - 10:40 PM
              </Text>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      className="rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}