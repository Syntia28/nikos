export interface Usuario {
    id: string;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
    confirmado: boolean;
    email: string;
    password: string;
    createdAt: Date;
}