import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Loader, Pizza, Truck, Package, LucideIcon } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { HistorialCompraWithId } from '@/interfaces/historial';

export default function OrderStatusTracker({ order }: { order: HistorialCompraWithId | null }) {
    if (!order) return null;

    // Determinar flujo según tipo de entrega: 'delivery' 
    const tipoEntrega = (order as any)?.datosEntrega?.tipoEntrega;

    const deliveryFlow = ['pendiente', 'preparando', 'en camino', 'listo para recojo', 'entregado'];
    const pickupFlow = ['pendiente', 'preparando', 'listo para recojo', 'entregado'];

    const statusFlow = tipoEntrega === 'recojo' || tipoEntrega === 'pickup' ? pickupFlow : deliveryFlow;

    const statusIcons: { [key: string]: React.ElementType } = {
        pendiente: Loader,
        preparando: Pizza,
        'en camino': Truck,
        'listo para recojo': Package,
        entregado: CheckCircle,
    };

    const currentStatusIndex = statusFlow.indexOf(order.estado as string);

    return (
        <View className="w-full">
            <View className="flex-row items-center justify-between">
                {statusFlow.map((status, index) => {
                    const isActive = index === currentStatusIndex;
                    const isCompleted = index < currentStatusIndex;
                    const IconComponent = statusIcons[status] || Loader;

                    return (
                        <React.Fragment key={status}>
                            <View className="items-center">
                                <View
                                    className={`w-12 h-12 rounded-full items-center justify-center border-2 ${isActive ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : isCompleted ? 'bg-green-100 dark:bg-green-900 border-green-500' : 'bg-muted border-border'
                                        }`}
                                >
                                    <Icon as={IconComponent as LucideIcon} className={`${isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`} size={24} />
                                </View>
                                <Text className={`text-xs font-semibold mt-2 text-center ${isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                            </View>
                            {index < statusFlow.length - 1 && (
                                <View className={`flex-1 h-1 mx-1 ${isCompleted ? 'bg-green-500' : 'bg-border'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
}
