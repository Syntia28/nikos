import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Lock, LogIn, Mail, Pizza } from 'lucide-react-native';
import * as React from 'react';
import { Alert, Image, ImageStyle, Pressable, type TextInput, View } from 'react-native';
import { Icon } from './ui/icon';
import { Link, router } from 'expo-router';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';

export function SignInForm() {
  const passwordInputRef = React.useRef<TextInput>(null);

  const IMAGE_STYLE: ImageStyle = {
    height: 100,
    width: 150,
  };


  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const { login } = useFireAuthenticaiton();

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      Alert.alert('Sesión iniciada', `Bienvenido ${user.email}`);
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (

    <Card className="bg-orange-100 dark:bg-[#292727] shadow-lg shadow-pizza/10">
      <View className="absolute inset-0 opacity-10">
        <View className="flex-row flex-wrap">
          {Array.from({ length: 63 }).map((_, i) => (
            <View key={i} className="w-8 h-8 m-2">
              <Icon as={Pizza} className="text-black dark:text-white size-6" />
            </View>
          ))}
        </View>
      </View>
      <View className="items-center justify-center">
        <Image source={require('@/assets/images/logo.png')} style={IMAGE_STYLE} />
      </View>
      <CardHeader>

        <CardTitle className="text-center text-xl sm:text-left">Inicia sesión en tu aplicación</CardTitle>
        <CardDescription className="text-center sm:text-left">
          ¡Bienvenido de nuevo! Por favor inicia sesión para continuar
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-6">
        <View className="gap-6">
          <View className=" gap-1.5">
            <Label htmlFor="email">
              <Icon as={Mail} className="text-black dark:text-white size-4 mr-2" />
              {" Email"}
            </Label>
            <Input className='dark:bg-[#1F2020] bg-[#F9E4C6]'
              id="email"
              placeholder="m@example.com"
              value={email}
              onChangeText={setEmail}
              autoComplete="email"
            />
          </View>
          <View className="gap-1.5">
            <View className="flex-row items-center">
              <Label htmlFor="password" className="flex-row items-center gap-2 justify-center">
                <Icon as={Lock} className="text-black dark:text-white size-4 mr-2" />
                {" Contraseña"}
              </Label>

              <Button
                variant="link"
                size="sm"
                className="web:h-fit ml-auto h-4 px-1 py-0 sm:h-4"
                onPress={() => {
                  // TODO: Navigate to forgot password screen
                }}>
                <Text className="font-normal leading-4">¿Olvidaste tu contraseña?</Text>
              </Button>
            </View>
            <Input className='dark:bg-[#1F2020] bg-[#F9E4C6]'
              id="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <Button
            className="bg-orange-200 dark:bg-orange-500 w-full h-12 rounded-xl shadow-lg shadow-pizza/25"
            onPress={handleLogin}
          >
            <View className=" flex-row  items-center">
              <Icon as={LogIn} className="text-black dark:text-white size-5 mr-2" />
              <Text className="text-black dark:text-white font-semibold text-lg">Iniciar Sesión</Text>
            </View>
          </Button>

        </View>
        <Text className="text-center text-sm">
          ¿No tienes una cuenta?{' '}
          <Link href="/register">
            <Text className="text-sm underline underline-offset-4">Regístrate</Text>
          </Link>
        </Text>
        <View className="flex-row items-center">
          <Separator className="flex-1" />
        </View>
      </CardContent>
    </Card>
  );
}