import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { CarritoModal } from '@/components/ui/carrito-modal';
import { router } from 'expo-router';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useFireAuthenticaiton } from '@/shared/auth/firebaseAuth';
import { User as FirebaseUser } from 'firebase/auth';

type TabItem = {
    name: string;
    icon: typeof Home;
    href: string;
    label: string;
    requiresAuth?: boolean; // Nueva propiedad para tabs que requieren autenticación
};

// Tabs base que siempre se muestran
const baseTabs: TabItem[] = [
    {
        name: 'home',
        icon: Home,
        href: '/',
        label: 'Inicio',
    },
    {
        name: 'menu',
        icon: ShoppingBag,
        href: '/carta',
        label: 'Menú',
    },
    {
        name: 'pedidos',
        icon: ShoppingBag,
        href: '/pedidos',
        label: 'Pedidos',
    },
    {
        name: 'carrito',
        icon: ShoppingBag,
        href: '/carrito',
        label: 'Carrito',
    },
];

// Tab de perfil que requiere autenticación
const profileTab: TabItem = {
    name: 'profile',
    icon: User,
    href: '/perfil',
    label: 'Perfil',
    requiresAuth: true, // Esta pestaña solo se muestra si está autenticado
};

export function BottomNavigation() {
    const [activeTab, setActiveTab] = React.useState('/');
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const { onAuthChange } = useFireAuthenticaiton();

    // Escuchar cambios de autenticación
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return unsubscribe;
    }, []);

    // Determinar qué tabs mostrar basado en autenticación
    const getTabsToShow = (): TabItem[] => {
        // Si está autenticado, mostrar todas las tabs incluyendo perfil
        if (user) {
            return [...baseTabs, profileTab];
        }
        // Si no está autenticado, solo mostrar las tabs base
        return baseTabs;
    };

    const handleTabPress = (href: string, requiresAuth?: boolean) => {
        // Si la tab requiere autenticación y el usuario no está autenticado
        if (requiresAuth && !user) {
            // Redirigir al login en lugar de al perfil
            router.push('/login' as any);
            return;
        }

        setActiveTab(href);
        router.push(href as any);
    };

    // Si está cargando, puedes mostrar un skeleton o nada
    if (authLoading) {
        return (
            <View className="bg-[#daa95c] dark:bg-[#8C5411]">
                <View className="h-1 bg-gradient-to-r from-pizza via-tomato to-cheese" />
                <View className="flex-row items-center justify-around px-4 py-2">
                    {/* Mostrar tabs base mientras carga */}
                    {baseTabs.map((tab) => (
                        <View key={tab.name} className="flex-1 items-center justify-center py-2 px-3">
                            <View className="w-8 h-8 rounded-full bg-gray-300 mb-1" />
                            <Text className="text-xs text-gray-400">{tab.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    const tabsToShow = getTabsToShow();

    return (
        <View className="bg-[#daa95c] dark:bg-[#8C5411]">
            <View className="h-1 bg-gradient-to-r from-pizza via-tomato to-cheese" />

            <View className="flex-row items-center justify-around px-4 py-2">
                {tabsToShow.map((tab) => {
                    const isActive = activeTab === tab.href;
                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={() => handleTabPress(tab.href, tab.requiresAuth)}
                            className={cn(
                                "flex-1 items-center justify-center py-2 px-3 rounded-2xl",
                                isActive && "bg-pizza/10"
                            )}
                            activeOpacity={0.7}
                        >
                            <View
                                className={cn(
                                    "items-center justify-center w-8 h-8 rounded-full mb-1",
                                    isActive ? "bg-pizza" : "bg-transparent"
                                )}
                                style={isActive ? {
                                    shadowColor: '#f97316',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 8,
                                    elevation: 5
                                } : undefined}
                            >
                                <View className={cn(
                                    isActive ? "text-white" : "text-black"
                                )}>
                                    <Icon
                                        as={tab.icon}
                                        size={20}
                                        color={isActive ? "#ffffff" : "#000000"}
                                    />
                                </View>
                            </View>
                            <Text className={cn(
                                "text-xs font-medium",
                                isActive
                                    ? "text-[#ffffff] font-semibold"
                                    : "text-[#000000]"
                            )}>
                                {tab.label}
                            </Text>
                            {isActive && (
                                <View className="w-1 h-1 bg-pizza rounded-full mt-1" />
                            )}
                        </TouchableOpacity>
                    );
                })}
                
            </View>
        </View>
    );
}