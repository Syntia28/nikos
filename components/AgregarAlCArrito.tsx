import { useCarrito } from "@/hooks/carrito.hook";
import { ProductoWithId } from "@/interfaces/producto";
import { useFireAuthenticaiton } from "@/shared/auth/firebaseAuth";
import { router } from "expo-router";
import { User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import { Button } from "./ui/button";
interface Props {
    producto: ProductoWithId;
    cantidad: number;
    funciónGetAll?: () => Promise<void>;
    className?: string;
}
export function AgregarAlCarrito({ producto, cantidad, funciónGetAll, className }: Props) {
    const [user, setUser] = useState<User | null>(null); //define constastes en array 
    const { onAuthChange } = useFireAuthenticaiton();

    // Escuchar cambios en el estado de autenticación
    useEffect(() => {
        const unsubscribe = onAuthChange((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const { addToCarrito } = useCarrito(user);
    const handAddToCarrito = async () => {
        if (!user) {

            Alert.alert(
                'Inicia sesión',
                '¿Deseas iniciar sesión para agregar productos al carrito?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Iniciar sesión', onPress: () => router.push('/login') },
                ]
            );
            return;
        }
        await addToCarrito(producto, cantidad);
        if (funciónGetAll) { await funciónGetAll(); }

    }
    return (
        <Button onPress={() => handAddToCarrito()} className={`bg-orange-300 p-2 rounded-lg border-white  ${className}`} disabled={producto.stock <= 0}>
            <Text className="text-black font-semibold">Agregar al carrito 🛒</Text>
        </Button>
    )
}
