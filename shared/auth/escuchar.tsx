// AuthListener.tsx - Componente para escuchar cambios de autenticación
import { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { User } from 'firebase/auth';
import { useFireAuthenticaiton } from './firebaseAuth';

interface AuthListenerProps {
    children?: React.ReactNode;
    onUserChange?: (user: User | null) => void;
}

export default function AuthListener({ children, onUserChange }: AuthListenerProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { onAuthChange, logout } = useFireAuthenticaiton();

    useEffect(() => {
        // La función onAuthChange devuelve una función para cancelar la suscripción
        const unsubscribe = onAuthChange((currentUser) => {
            console.log('🔄 Estado de autenticación cambió:', currentUser ? 'Usuario conectado' : 'Usuario desconectado');
            setUser(currentUser);
            setIsLoading(false);

            // Llamar callback si se proporciona
            if (onUserChange) {
                onUserChange(currentUser);
            }
        });

        // Esta función se ejecuta cuando el componente se desmonta
        // Es MUY IMPORTANTE limpiar la suscripción para evitar memory leaks
        return unsubscribe;
    }, [onUserChange]);

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Éxito', 'Has cerrado sesión correctamente');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar la sesión');
        }
    };

    // Mostrar loading mientras se verifica el estado de autenticación
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Text>🔄 Verificando estado de autenticación...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {/* Información del estado actual */}
            <View style={{
                backgroundColor: user ? '#e8f5e8' : '#ffeaa7',
                padding: 15,
                borderRadius: 8,
                marginBottom: 20
            }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
                    📡 Estado del Listener de Autenticación:
                </Text>

                {user ? (
                    <>
                        <Text style={{ color: '#27ae60' }}>
                            ✅ Usuario Autenticado: {user.email}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                            UID: {user.uid}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                            Email verificado: {user.emailVerified ? 'Sí' : 'No'}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>
                            Última conexión: {user.metadata.lastSignInTime
                                ? new Date(user.metadata.lastSignInTime).toLocaleString('es-ES')
                                : 'No disponible'
                            }
                        </Text>
                    </>
                ) : (
                    <Text style={{ color: '#e17055' }}>
                        ❌ No hay sesión activa
                    </Text>
                )}
            </View>

            {/* Información educativa sobre persistencia */}
            <View style={{
                backgroundColor: '#e8f4fd',
                padding: 15,
                borderRadius: 8,
                marginBottom: 20
            }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#2d3436' }}>
                    💾 ¿Cómo funciona la persistencia?
                </Text>
                <Text style={{ fontSize: 14, color: '#636e72', lineHeight: 20 }}>
                    • <Text style={{ fontWeight: 'bold' }}>AsyncStorage:</Text> Guarda el token de autenticación localmente{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>onAuthChange:</Text> Escucha cambios en tiempo real{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Automático:</Text> Al abrir la app, Firebase restaura la sesión{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Seguro:</Text> Los tokens expiran automáticamente
                </Text>
            </View>

            {/* Acciones disponibles */}
            {user ? (
                <View style={{ gap: 10 }}>
                    <Button
                        title="🚪 Cerrar Sesión"
                        onPress={handleLogout}
                        color="#e74c3c"
                    />
                    <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 10 }}>
                        Al cerrar sesión, onAuthChange detectará el cambio automáticamente
                    </Text>
                </View>
            ) : (
                <View>
                    <Text style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
                        Inicia sesión desde otra pantalla para ver cómo onAuthChange
                        detecta el cambio automáticamente
                    </Text>
                </View>
            )}

            {/* Renderizar contenido hijo si se proporciona */}
            {children}

            {/* Información técnica adicional */}
            <View style={{
                backgroundColor: '#f8f9fa',
                padding: 15,
                borderRadius: 8,
                marginTop: 20
            }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 10, color: '#2d3436' }}>
                    🔧 Detalles Técnicos del Listener:
                </Text>
                <Text style={{ fontSize: 12, color: '#636e72', lineHeight: 18 }}>
                    • <Text style={{ fontWeight: 'bold' }}>Tipo:</Text> onAuthStateChanged de Firebase Auth{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Frecuencia:</Text> Se dispara en cada cambio de estado{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Cleanup:</Text> Se limpia automáticamente al desmontar{'\n'}
                    • <Text style={{ fontWeight: 'bold' }}>Performance:</Text> Optimizado por Firebase para React Native
                </Text>
            </View>
        </View>
    );
}
