import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { Link, Stack } from 'expo-router';
import {
  MoonStarIcon,
  StarIcon,
  SunIcon,
  Pizza,
  Flame,
  ChefHat,
  Clock,
  Heart,
  MapPin
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

const { width } = Dimensions.get('window');

const SCREEN_OPTIONS = {
  light: {
    title: 'Nikos Pizzería',
    headerTransparent: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerTintColor: THEME.light.foreground,
    headerRight: () => <ThemeToggle />,
  },
  dark: {
    title: 'Nikos Pizzería',
    headerTransparent: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: 'transparent' },
    headerTintColor: THEME.dark.foreground,
    headerRight: () => <ThemeToggle />,
  },
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS[colorScheme ?? 'light']} />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View className="relative h-80 items-center justify-center bg-gradient-to-br from-pizza via-tomato to-cheese overflow-hidden">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-10">
            <View className="flex-row flex-wrap">
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} className="w-8 h-8 m-2">
                  <Icon as={Pizza} className="text-white size-6" />
                </View>
              ))}
            </View>
          </View>

          {/* Hero Content */}
          <View className="items-center px-6 z-10">
            <View className="items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Icon as={Pizza} className="text-white size-12" />
            </View>

            <Text className="text-white text-4xl font-bold text-center mb-2">
              Nikos Pizzería
            </Text>

            <Text className="text-white/90 text-lg text-center mb-6 font-medium">
              Sabores auténticos desde 2021
            </Text>

            <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Icon as={Flame} className="text-white size-4 mr-2" />
              <Text className="text-white font-medium">Horneado a la leña</Text>
            </View>
          </View>
        </View>

        {/* Welcome Message */}
        <View className="px-6 py-8">
          <Card className="border-l-4 border-l-pizza">
            <CardHeader>
              <CardTitle className="text-2xl text-pizza flex-row items-center">
                <Icon as={ChefHat} className="text-pizza size-6 mr-2" />
                ¡Bienvenido a Nikos!
              </CardTitle>
              <CardDescription className="text-base">
                Descubre nuestras deliciosas pizzas artesanales preparadas con ingredientes frescos y amor.
              </CardDescription>
            </CardHeader>
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold mb-4 text-foreground">
            Comienza tu experiencia
          </Text>

          <View className="gap-4">
            <Link href="/login" asChild>
              <Button className="bg-pizza hover:bg-pizza/90 h-14 rounded-2xl shadow-lg shadow-pizza/25">
                <View className="flex-row items-center">
                  <Icon as={Heart} className="text-white size-5 mr-3" />
                  <Text className="text-white text-lg font-semibold">Iniciar Sesión</Text>
                </View>
              </Button>
            </Link>

            <Link href="/register" asChild>
              <Button variant="outline" className="h-14 rounded-2xl border-2 border-pizza/20">
                <View className="flex-row items-center">
                  <Icon as={StarIcon} className="text-pizza size-5 mr-3" />
                  <Text className="text-pizza text-lg font-semibold">Registrarse</Text>
                </View>
              </Button>
            </Link>
          </View>
        </View>

        {/* Features Grid */}
        <View className="px-6 pb-8">
          <Text className="text-xl font-bold mb-4 text-foreground">
            Por qué elegirnos
          </Text>

          <View className="flex-row flex-wrap gap-4">
            <View className="flex-1 min-w-[160px]">
              <Card className="h-32">
                <CardContent className="items-center justify-center flex-1 p-4">
                  <Icon as={Clock} className="text-pizza size-8 mb-2" />
                  <Text className="font-semibold text-center">Entrega Rápida</Text>
                  <Text className="text-sm text-muted-foreground text-center">30 min máximo</Text>
                </CardContent>
              </Card>
            </View>

            <View className="flex-1 min-w-[160px]">
              <Card className="h-32">
                <CardContent className="items-center justify-center flex-1 p-4">
                  <Icon as={ChefHat} className="text-pizza size-8 mb-2" />
                  <Text className="font-semibold text-center">Ingredientes Frescos</Text>
                  <Text className="text-sm text-muted-foreground text-center">Calidad premium</Text>
                </CardContent>
              </Card>
            </View>
          </View>
        </View>

        {/* Location Info */}
        <View className="px-6 pb-32">
          <Card className="bg-gradient-to-r from-cheese/10 to-pizza/10 border-cheese/30">
            <CardContent className="p-6">
              <View className="flex-row items-center mb-3">
                <Icon as={MapPin} className="text-pizza size-5 mr-2" />
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
