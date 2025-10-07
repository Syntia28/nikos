import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Button } from '@/components/ui/button';
import { DatosEntrega } from '@/interfaces/historial';
import { UserProfile } from '@/app/perfil';
import DateTimePicker from "@react-native-community/datetimepicker";

interface ModalConfirmarCompraProps {
    visible: boolean;
    total: number;
    userProfile: UserProfile | null;
    onConfirm: (datosEntrega: DatosEntrega) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function ModalConfirmarCompra({
    visible,
    total,
    userProfile,
    onConfirm,
    onCancel,
    loading = false,
}: ModalConfirmarCompraProps) {
    const [tipoEntrega, setTipoEntrega] = React.useState<'delivery' | 'recojo'>('delivery');
    const [metodoPago, setMetodoPago] = React.useState<'efectivo' | 'yape' | 'plin'>('efectivo');
    const [direccion, setDireccion] = React.useState(userProfile?.direccion || '');
    const [telefono, setTelefono] = React.useState(userProfile?.telefono || '');
    const [referencia, setReferencia] = React.useState('');

    // Actualizar datos cuando cambie el perfil
    React.useEffect(() => {
        if (userProfile) {
            setDireccion(userProfile.direccion);
            setTelefono(userProfile.telefono);
        }
    }, [userProfile]);

    const handleConfirm = () => {
        // Validaciones
        if (tipoEntrega === 'delivery' && !direccion.trim()) {
            Alert.alert('Error', 'La dirección es requerida para delivery');
            return;
        }

        if (!telefono.trim()) {
            Alert.alert('Error', 'El teléfono es requerido');
            return;
        }
        if (tipoEntrega === 'recojo' && date && date < new Date()) {
            Alert.alert('Warning', 'la fecha u hora debe ser actual o futura');
            return;
        }


        const datosEntrega: DatosEntrega = {
            tipoEntrega,
            tipoPago: 'contra-entrega',
            metodoPago,
            direccion: tipoEntrega === 'delivery' ? direccion : 'Recojo en tienda',
            telefono,
            fechaRecojo: tipoEntrega === 'recojo' ? date.toString() : "",
            referencia,
        };
        console.log('datos enviados a firebase', datosEntrega);
        onConfirm(datosEntrega);

    };

    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState<"date" | "time">("date");
    const [show, setShow] = useState(false);

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(false);
        if (selectedDate) setDate(selectedDate);
    };

    const showMode = (currentMode: "date" | "time") => {
        setMode(currentMode);
        setShow(true);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-background rounded-t-3xl max-h-[90%]">
                    <ScrollView className="p-6">
                        {/* Header */}
                        <View className="mb-6">
                            <Text className="text-2xl font-bold text-foreground mb-2">
                                Confirmar Compra
                            </Text>
                            <Text className="text-3xl font-bold text-green-600">
                                Total: ${total.toFixed(2)}
                            </Text>
                        </View>

                        {/* Tipo de Entrega */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-foreground mb-3">
                                Tipo de Entrega
                            </Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setTipoEntrega('delivery')}
                                    className={`flex-1 p-4 rounded-lg border-2 ${tipoEntrega === 'delivery'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-border bg-card'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${tipoEntrega === 'delivery' ? 'text-blue-600' : 'text-foreground'
                                            }`}
                                    >
                                        🚚 Delivery
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => setTipoEntrega('recojo')}
                                    className={`flex-1 p-4 rounded-lg border-2 ${tipoEntrega === 'recojo'
                                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-border bg-card'
                                        }`}
                                >
                                    <Text
                                        className={`text-center font-semibold ${tipoEntrega === 'recojo' ? 'text-blue-600' : 'text-foreground'
                                            }`}
                                    >
                                        🏪 Recojo
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Campos específicos según tipo de entrega */}
                        {tipoEntrega === 'recojo' ? (
                            <View className="mb-6 space-y-4">
                                {/* Fecha de Recojo */}
                                <View>
                                    <Text className="text-lg font-semibold text-foreground mb-3">
                                        Fecha de Recojo
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => showMode("date")}
                                        className="p-4 border-2 border-border rounded-lg bg-card"
                                    >
                                        <Text className={`text-foreground ${date ? 'font-medium' : 'opacity-70'}`}>
                                            {date.toDateString() || 'Seleccionar fecha'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Hora de Recojo */}
                                <View>
                                    <Text className="text-lg font-semibold text-foreground mb-3">
                                        Hora de Recojo
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => showMode("time")}
                                        className="p-4 border-2 border-border rounded-lg bg-card"
                                    >
                                        <Text className={`text-foreground ${date ? 'font-medium' : 'opacity-70'}`}>
                                            {date.toTimeString() || 'Seleccionar hora'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {show && (
                                    <DateTimePicker
                                        value={date}
                                        mode={mode}
                                        is24Hour={true}
                                        display={Platform.OS === "ios" ? "spinner" : "default"}
                                        onChange={onChange}
                                    />
                                )}
                            </View>
                        ) : (
                            /* Dirección (solo si es delivery) */
                            <View className="mb-6">
                                <Text className="text-lg font-semibold text-foreground mb-3">
                                    Dirección de Entrega
                                </Text>
                                <TextInput
                                    value={direccion}
                                    onChangeText={setDireccion}
                                    placeholder="Ingrese su dirección"
                                    className="bg-card border border-border p-4 rounded-lg text-foreground"
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>
                        )}

                        {/* Método de Pago */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-foreground mb-3">
                                Método de Pago (Contra Entrega)
                            </Text>
                            <View className="gap-3">
                                {(['efectivo', 'yape', 'plin'] as const).map((metodo) => (
                                    <TouchableOpacity
                                        key={metodo}
                                        onPress={() => setMetodoPago(metodo)}
                                        className={`p-4 rounded-lg border-2 ${metodoPago === metodo
                                            ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                            : 'border-border bg-card'
                                            }`}
                                    >
                                        <Text
                                            className={`text-center font-semibold capitalize ${metodoPago === metodo ? 'text-green-600' : 'text-foreground'
                                                }`}
                                        >
                                            {metodo === 'efectivo' && '💵 '}
                                            {metodo === 'yape' && '📱 '}
                                            {metodo === 'plin' && '📱 '}
                                            {metodo.charAt(0).toUpperCase() + metodo.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Teléfono */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-foreground mb-3">
                                Teléfono de Contacto
                            </Text>
                            <TextInput
                                value={telefono}
                                onChangeText={setTelefono}
                                placeholder="Ingrese su teléfono"
                                keyboardType="phone-pad"
                                className="bg-card border border-border p-4 rounded-lg text-foreground"
                            />
                        </View>

                        {/* Referencia - Solo para delivery */}
                        {tipoEntrega === 'delivery' && (
                            <View className="mb-6">
                                <Text className="text-lg font-semibold text-foreground mb-3">
                                    Referencia (Opcional)
                                </Text>
                                <TextInput
                                    value={referencia}
                                    onChangeText={setReferencia}
                                    placeholder="Ej: Casa de dos pisos, portón verde"
                                    className="bg-card border border-border p-4 rounded-lg text-foreground"
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>
                        )}

                        {/* Información del Usuario */}
                        {userProfile && (
                            <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Text className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                                    Datos del Cliente
                                </Text>
                                <Text className="text-blue-700 dark:text-blue-300">
                                    {userProfile.nombre} {userProfile.apellido}
                                </Text>
                                <Text className="text-blue-700 dark:text-blue-300">{userProfile.email}</Text>
                            </View>
                        )}

                        {/* Botones */}
                        <View className="gap-3 mb-4">
                            <Button
                                onPress={handleConfirm}
                                disabled={loading}
                                className="bg-green-600"
                            >
                                <Text className="text-white font-semibold text-lg">
                                    {loading ? 'Procesando...' : '✅ Confirmar Compra'}
                                </Text>
                            </Button>

                            <Button
                                onPress={onCancel}
                                disabled={loading}
                                className="bg-gray-600"
                            >
                                <Text className="text-white font-semibold">Cancelar</Text>
                            </Button>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}