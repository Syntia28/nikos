import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Home, ShoppingBag, User } from 'lucide-react-native';
import { router } from 'expo-router';
import * as React from 'react';

type TabItem = {
    name: string;
    icon: typeof Home;
    href: string;
    label: string;
};

const tabs: TabItem[] = [
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
        name: 'orders',
        icon: ShoppingBag,
        href: '/orders',
        label: 'Pedidos',
    },
    {
        name: 'profile',
        icon: User,
        href: '/perfil',
        label: 'Perfil',
    },
];

export function BottomNavigation() {
    const [activeTab, setActiveTab] = React.useState('/');

    const handleTabPress = (href: string) => {
        setActiveTab(href);
        router.push(href as any);
    };

    return (
        <View className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border/50">
            <View className="h-1 bg-gradient-to-r from-pizza via-tomato to-cheese" />
            
            <View className="flex-row items-center justify-around px-4 py-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.href;

                    return (
                        <TouchableOpacity
                            key={tab.name}
                            onPress={() => handleTabPress(tab.href)}
                            className={cn(
                                "flex-1 items-center justify-center py-2 px-3 rounded-2xl",
                                isActive && "bg-pizza/10"
                            )}
                            activeOpacity={0.7}
                        >
                            {/* Icon container with pizza-themed styling */}
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
                                    isActive ? "text-white" : "text-muted-foreground"
                                )}>
                                    <Icon
                                        as={tab.icon}
                                        size={20}
                                        color={isActive ? "#ffffff" : "#6b7280"}
                                    />
                                </View>
                            </View>

                            {/* Label */}
                            <Text className={cn(
                                "text-xs font-medium",
                                isActive
                                    ? "text-pizza font-semibold"
                                    : "text-muted-foreground"
                            )}>
                                {tab.label}
                            </Text>

                            {/* Active indicator dot */}
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