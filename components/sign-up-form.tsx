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
import { Link } from 'expo-router';
import { User, Mail, Lock, Phone, MapPin, UserCheck } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, TextInput, View, ScrollView } from 'react-native';

export function SignUpForm() {
  const [formData, setFormData] = React.useState<Partial<Usuario>>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    confirmado: false
  });

  const [confirmPassword, setConfirmPassword] = React.useState('');

  // Referencias para navegación entre campos
  const apellidoInputRef = React.useRef<TextInput>(null);
  const emailInputRef = React.useRef<TextInput>(null);
  const passwordInputRef = React.useRef<TextInput>(null);
  const confirmPasswordInputRef = React.useRef<TextInput>(null);
  const telefonoInputRef = React.useRef<TextInput>(null);
  const direccionInputRef = React.useRef<TextInput>(null);

  // Funciones de navegación entre campos
  function onNombreSubmitEditing() {
    apellidoInputRef.current?.focus();
  }

  function onApellidoSubmitEditing() {
    emailInputRef.current?.focus();
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  function onPasswordSubmitEditing() {
    confirmPasswordInputRef.current?.focus();
  }

  function onConfirmPasswordSubmitEditing() {
    telefonoInputRef.current?.focus();
  }

  function onTelefonoSubmitEditing() {
    direccionInputRef.current?.focus();
  }

  function onSubmit() {
    // Validar que las contraseñas coincidan
    if (formData.password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // TODO: Validar datos y crear usuario
    console.log('Datos del formulario:', formData);
  }

  function updateFormData(field: keyof Usuario, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="gap-6 p-6">
        <Card className="border-pizza/20 shadow-lg shadow-pizza/10">
          <CardHeader className="bg-gradient-to-r from-pizza/5 to-cheese/5 rounded-t-xl">
            <View className="items-center mb-2">
              <View className="w-16 h-16 bg-pizza/10 rounded-full items-center justify-center mb-3">
                <Icon as={UserCheck} className="text-pizza size-8" />
              </View>
            </View>
            <CardTitle className="text-center text-2xl text-pizza">
              ¡Únete a Nikos!
            </CardTitle>
            <CardDescription className="text-center text-base">
              Crea tu cuenta y disfruta de nuestras deliciosas pizzas con beneficios exclusivos
            </CardDescription>
          </CardHeader>

          <CardContent className="gap-6 pt-6">
            {/* Nombre y Apellido */}
            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Label htmlFor="nombre" className="flex-row items-center">
                  <Icon as={User} className="text-pizza size-4 mr-2" />
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChangeText={(text) => updateFormData('nombre', text)}
                  autoComplete="given-name"
                  autoCapitalize="words"
                  onSubmitEditing={onNombreSubmitEditing}
                  returnKeyType="next"
                  className="border-pizza/20 focus:border-pizza"
                />
              </View>

              <View className="flex-1 gap-2">
                <Label htmlFor="apellido" className="flex-row items-center">
                  <Icon as={User} className="text-pizza size-4 mr-2" />
                  Apellido
                </Label>
                <Input
                  ref={apellidoInputRef}
                  id="apellido"
                  placeholder="Tu apellido"
                  value={formData.apellido}
                  onChangeText={(text) => updateFormData('apellido', text)}
                  autoComplete="family-name"
                  autoCapitalize="words"
                  onSubmitEditing={onApellidoSubmitEditing}
                  returnKeyType="next"
                  className="border-pizza/20 focus:border-pizza"
                />
              </View>
            </View>

            {/* Email */}
            <View className="gap-2">
              <Label htmlFor="email" className="flex-row items-center">
                <Icon as={Mail} className="text-pizza size-4 mr-2" />
                Correo Electrónico
              </Label>
              <Input
                ref={emailInputRef}
                id="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
                className="border-pizza/20 focus:border-pizza"
              />
            </View>

            {/* Contraseña */}
            <View className="gap-2">
              <Label htmlFor="password" className="flex-row items-center">
                <Icon as={Lock} className="text-pizza size-4 mr-2" />
                Contraseña
              </Label>
              <Input
                ref={passwordInputRef}
                id="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry
                onSubmitEditing={onPasswordSubmitEditing}
                returnKeyType="next"
                className="border-pizza/20 focus:border-pizza"
              />
            </View>

            {/* Confirmar Contraseña */}
            <View className="gap-2">
              <Label htmlFor="confirmPassword" className="flex-row items-center">
                <Icon as={Lock} className="text-pizza size-4 mr-2" />
                Confirmar Contraseña
              </Label>
              <Input
                ref={confirmPasswordInputRef}
                id="confirmPassword"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onSubmitEditing={onConfirmPasswordSubmitEditing}
                returnKeyType="next"
                className={`border-pizza/20 focus:border-pizza ${confirmPassword && formData.password !== confirmPassword
                    ? 'border-red-500'
                    : confirmPassword && formData.password === confirmPassword
                      ? 'border-green-500'
                      : ''
                  }`}
              />
              {confirmPassword && formData.password !== confirmPassword && (
                <Text className="text-red-500 text-sm">Las contraseñas no coinciden</Text>
              )}
              {confirmPassword && formData.password === confirmPassword && (
                <Text className="text-green-500 text-sm">✓ Las contraseñas coinciden</Text>
              )}
            </View>

            {/* Teléfono */}
            <View className="gap-2">
              <Label htmlFor="telefono" className="flex-row items-center">
                <Icon as={Phone} className="text-pizza size-4 mr-2" />
                Teléfono
              </Label>
              <Input
                ref={telefonoInputRef}
                id="telefono"
                placeholder="+1 (555) 123-4567"
                value={formData.telefono}
                onChangeText={(text) => updateFormData('telefono', text)}
                keyboardType="phone-pad"
                autoComplete="tel"
                onSubmitEditing={onTelefonoSubmitEditing}
                returnKeyType="next"
                className="border-pizza/20 focus:border-pizza"
              />
            </View>

            {/* Dirección */}
            <View className="gap-2">
              <Label htmlFor="direccion" className="flex-row items-center">
                <Icon as={MapPin} className="text-pizza size-4 mr-2" />
                Dirección de Entrega
              </Label>
              <Input
                ref={direccionInputRef}
                id="direccion"
                placeholder="Calle, número, colonia, ciudad"
                value={formData.direccion}
                onChangeText={(text) => updateFormData('direccion', text)}
                autoComplete="street-address"
                autoCapitalize="words"
                onSubmitEditing={onSubmit}
                returnKeyType="done"
                className="border-pizza/20 focus:border-pizza"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Botón de registro */}
            <Button
              className="w-full bg-pizza hover:bg-pizza/90 h-12 rounded-xl shadow-lg shadow-pizza/25"
              onPress={onSubmit}
            >
              <View className="flex-row items-center">
                <Icon as={UserCheck} className="text-white size-5 mr-2" />
                <Text className="text-white font-semibold text-lg">Crear Mi Cuenta</Text>
              </View>
            </Button>

            {/* Link a login */}
            <Text className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link href={'/login'}>
                <Text className="text-pizza font-medium underline underline-offset-4">
                  Iniciar Sesión
                </Text>
              </Link>
            </Text>

            {/* Información adicional */}
            <View className="bg-cheese/10 p-4 rounded-xl border border-cheese/20 mt-4">
              <Text className="text-center text-sm text-muted-foreground">
                Al registrarte aceptas nuestros{' '}
                <Text className="text-pizza underline">Términos y Condiciones</Text>
                {' '}y{' '}
                <Text className="text-pizza underline">Política de Privacidad</Text>
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
