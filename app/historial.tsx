import React from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import HistorialCompleto from '@/components/HistorialCompleto';
import { Text } from '@/components/ui/text';

export default function HistorialScreen() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Historial de Pedidos',
                    headerStyle: { backgroundColor: '#D49744' },
                    headerTintColor: 'white',
                    headerTitleStyle: { fontWeight: 'bold' }
                }}
            />
            <ScrollView className="flex-1 bg-background">
                <View className="p-6 gap-4">
                    <View>
                        <Text className="text-2xl font-bold text-foreground">Historial de Compras</Text>
                        <Text className="text-muted-foreground">Aquí puedes ver todos tus pedidos completados y cancelados.</Text>
                    </View>
                    <HistorialCompleto />
                </View>
            </ScrollView>
        </>
    );
}
