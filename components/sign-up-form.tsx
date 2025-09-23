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
import { Icon } from '@/components/ui/icon';
import { Usuario } from '@/interfaces/usuario';
import { Link, router } from 'expo-router';
import { User, Mail, Lock, Phone, MapPin, UserCheck, ChefHat, PizzaIcon, Flame, Pizza } from 'lucide-react-native';
import { Pressable, TextInput, View, ScrollView, Image, ImageStyle, Alert } from 'react-native';
import { useState } from 'react';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { useCrudFireStorage } from '@/shared/firestorage/CrudFireStorage';

// Interfaz para los datos del formulario
interface RegisterFormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  direccion: string;
}

// Interfaz para el perfil de usuario en Firestore
interface UserProfile {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
  emailVerified: boolean;
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useFireAuthenticaiton();
  const { register: saveToFirestore } = useCrudFireStorage();

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validar campos requeridos
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!formData.apellido.trim()) {
      Alert.alert('Error', 'El apellido es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'La contraseña es requerida');
      return false;
    }
    if (!formData.confirmPassword.trim()) {
      Alert.alert('Error', 'Confirmar contraseña es requerido');
      return false;
    }
    if (!formData.telefono.trim()) {
      Alert.alert('Error', 'El teléfono es requerido');
      return false;
    }
    if (!formData.direccion.trim()) {
      Alert.alert('Error', 'La dirección es requerida');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return false;
    }

    // Validar contraseña
    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    // Validar teléfono (básico)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Por favor ingresa un número de teléfono válido');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Registrar usuario en Firebase Auth
      const user = await register(formData.email, formData.password);

      // 2. Crear perfil de usuario en Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono,
        direccion: formData.direccion,
        fechaRegistro: new Date().toISOString(),
        emailVerified: user.emailVerified,
      };

      // 3. Guardar en la colección 'usuarios' con el UID como ID del documento
      const result = await saveToFirestore('usuarios', userProfile);

      if (result.success) {
        console.log('✅ Perfil de usuario guardado exitosamente');
        Alert.alert(
          'Registro exitoso',
          `¡Bienvenido ${formData.nombre} ${formData.apellido}!\n\n` +
          `Tu perfil ha sido creado correctamente.\n` +
          `Se ha enviado un correo de verificación a ${user.email}`
        );
        router.replace('/login');
      } else {
        console.error('❌ Error al guardar perfil:', result.error);
        Alert.alert(
          'Advertencia',
          'Usuario creado pero hubo un problema al guardar el perfil completo. ' +
          'Puedes completar tu perfil más tarde.'
        );
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ScrollView className="bg-[#FFFFFF] dark:bg-[#1E1E1E]  flex-1" showsVerticalScrollIndicator={false}>
      <View className=" ap-6 p-6">
        <Card className="  bg-orange-100 dark:bg-[#292727]  shadow-lg shadow-pizza/10">
          <View className="absolute inset-0 opacity-10">
            <View className="flex-row flex-wrap">
              {Array.from({ length: 154 }).map((_, i) => (
                <View key={i} className="w-8 h-8 m-2">
                  <Icon as={Pizza} className="text-black dark:text-white size-6" />
                </View>
              ))}
            </View>
          </View>

          <CardHeader className="bg-gradient-to-r from-pizza/5 to-cheese/5 rounded-t-xl">
            <View className="items-center gap-2 justify-center mb-2">
              <Image source={require('@/assets/images/logo.png')} style={{ width: 150, height: 100 }} resizeMode="cover" />
            </View>
            <CardTitle className=" text-black dark:text-white text-center gap-2 justify-center text-2xl">
              ¡Únete a Nikos!
            </CardTitle>
            <CardDescription className="text-center gap-2 justify-center text-base">
              Crea tu cuenta y disfruta de nuestras deliciosas pizzas con beneficios exclusivos
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-6 pt-6">
            {/* Nombre y Apellido */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Label htmlFor="nombre" className="flex-row items-center gap-2 justify-center">
                  <Icon as={User} className="text-black dark:text-white size-4 mr-4" />
                  {" Nombre"}  
                </Label>
                <TextInput
                  className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                  placeholder="Nombre *"
                  value={formData.nombre}
                  onChangeText={(text) => handleInputChange('nombre', text)}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>

              <View className="flex-1 gap-2">
                <Label htmlFor="apellido" className="flex-row items-center gap-2 justify-center">
                  <Icon as={User} className="text-black dark:text-white size-4 mr-2" />
                  {" Apellido"}
                </Label>
                <TextInput
                  className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                  placeholder="Apellido *"
                  value={formData.apellido}
                  onChangeText={(text) => handleInputChange('apellido', text)}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email */}
            <View className="gap-2">
              <Label htmlFor="email" className="flex-row items-center gap-2 justify-center">
                <Icon as={Mail} className="text-black dark:text-white size-4 mr-2" />
                {" Correo Electrónico"}
              </Label>
              <TextInput 
                className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                placeholder="Correo electrónico *"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text.toLowerCase())}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

            </View>

            {/* Contraseña */}
            <View className="gap-2">
              <Label htmlFor="password" className="flex-row items-center gap-2 justify-center">
                <Icon as={Lock} className="text-black dark:text-white size-4 mr-2" />
                {" Contraseña"}
              </Label>
              <TextInput
                className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                placeholder="Contraseña * (mínimo 6 caracteres)"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Confirmar Contraseña */}
            <View className="gap-2">
              <Label htmlFor="confirmPassword" className="flex-row items-center gap-2 justify-center">
                <Icon as={Lock} className="text-black dark:text-white size-4 mr-2" />
                {" Confirmar Contraseña"}
              </Label>
              <TextInput
                className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                placeholder="Confirmar contraseña *"
                secureTextEntry
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                editable={!loading}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Teléfono */}
            <View className="gap-2">
              <Label htmlFor="telefono" className="flex-row items-center gap-2 justify-center">
                <Icon as={Phone} className="text-black dark:text-white size-4 mr-2" />
                {" Teléfono"}
              </Label>
              <TextInput
                className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                placeholder="Teléfono * (ej: +1234567890)"
                value={formData.telefono}
                onChangeText={(text) => handleInputChange('telefono', text)}
                editable={!loading}
                keyboardType="phone-pad"
              />
            </View>

            {/* Dirección */}
            <View className="gap-2">
              <Label htmlFor="direccion" className="flex-row items-center gap-2 justify-center">
                <Icon as={MapPin} className="text-black dark:text-white size-4 mr-2" />
                {" Dirección de Entrega"}
              </Label>
              <TextInput
                className='dark:bg-[#000000] bg-[#F9E4C6] rounded p-2  placeholder:text-black dark:placeholder:text-white'
                placeholder="Dirección completa *"
                value={formData.direccion}
                onChangeText={(text) => handleInputChange('direccion', text)}
                editable={!loading}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Botón de registro */}
            <Button
              className="bg-orange-200 dark:bg-black w-full h-12 rounded-xl shadow-lg shadow-pizza/25"
              onPress={handleRegister}
              disabled={loading}
            >
              <View className=" flex-row  items-center gap-2 justify-center">
                <Icon as={UserCheck} className="text-black dark:text-white size-5 mr-2" />
                <Text className="text-black dark:text-white font-semibold text-lg">
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </Text>
              </View>
            </Button>

            {/* Link a login */}
            <Text className="text-center gap-2 justify-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href={'/login'}>
                <Text className="text-black dark:text-white font-medium underline underline-offset-4">
                  Iniciar Sesión
                </Text>
              </Link>
            </Text>

            {/* Información adicional */}
            <View className="bg-cheese/10 p-4 rounded-xl border border-cheese/20 mt-4">
              <Text className="text-center gap-2 justify-center text-sm text-muted-foreground">
                Al registrarte aceptas nuestros{' '}
                <Text className="text-black dark:text-white underline">Términos y Condiciones</Text>
                {' '}y{' '}
                <Text className="text-black dark:text-white underline">Política de Privacidad</Text>
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
