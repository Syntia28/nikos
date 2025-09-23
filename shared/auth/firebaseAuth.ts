import { app } from '@/config/conexion';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

// Initialize Firebase Auth - en React Native, getAuth maneja persistencia automáticamente
const auth = getAuth(app);

export function useFireAuthenticaiton() {
  // Registrar un nuevo usuario
  async function register(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error registrando usuario:', error.message);
      throw error;
    }
  }

  // Iniciar sesión
  async function login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error iniciando sesión:', error.message);
      throw error;
    }
  }

  // Cerrar sesión
  async function logout() {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error cerrando sesión:', error.message);
      throw error;
    }
  }

  function onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  return { register, login, logout, onAuthChange };
}
