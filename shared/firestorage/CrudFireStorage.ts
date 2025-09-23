import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  WithFieldValue,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore';
import { COLLECTIONS_DATABASE } from '../collection/colleciones';
import { app } from '@/config/conexion';

// Tipos para las respuestas del CRUD
export type DocumentWithId<T = DocumentData> = T & {
  id: string;
};

interface CrudResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CrudArrayResult<T = any> {
  success: boolean;
  data: T[];
  error?: string;
}

const db = getFirestore(app);

export function useCrudFireStorage() {
  const register = async <T extends WithFieldValue<DocumentData>>(
    coleccion: COLLECTIONS_DATABASE,
    data: T
  ): Promise<CrudResult<DocumentReference<DocumentData>>> => {
    try {
      const docRef = await addDoc(collection(db, coleccion), data);
      console.log('Documento creado con id: ', docRef.id);
      return {
        success: true,
        data: docRef,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const getAll = async <T = DocumentData>(
    coleccion: COLLECTIONS_DATABASE
  ): Promise<CrudArrayResult<T>> => {
    try {
      const querySnapshot = await getDocs(collection(db, coleccion));
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        const documentData = { id: doc.id, ...doc.data() } as T;
        documents.push(documentData);
        console.log(`Documento completo: ${JSON.stringify(documentData)}`);
        console.log(`ID: ${doc.id}`);
        console.log(`Datos: ${JSON.stringify(doc.data())}`);
      });
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const getById = async <T = DocumentData>(
    id: string,
    coleccion: COLLECTIONS_DATABASE
  ): Promise<CrudResult<T>> => {
    try {
      const docRef = doc(db, coleccion, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Documento encontrado:', docSnap.data());
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as T,
        };
      } else {
        console.log('No se encontró el documento');
        return {
          success: false,
          error: 'Documento no encontrado',
        };
      }
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const update = async <T extends { [x: string]: any }>(
    id: string,
    data: T,
    coleccion: COLLECTIONS_DATABASE
  ): Promise<CrudResult<T>> => {
    try {
      const docRef = doc(db, coleccion, id);
      await updateDoc(docRef, data);
      console.log('Documento actualizado con éxito');
      return {
        success: true,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const remove = async <T>(id: string, coleccion: COLLECTIONS_DATABASE): Promise<CrudResult<T>> => {
    try {
      const docRef = doc(db, coleccion, id);
      await deleteDoc(docRef);
      console.log('Documento eliminado con éxito');
      return {
        success: true,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const searchByField = async <T = DocumentData>(
    field: string,
    value: any,
    coleccion: COLLECTIONS_DATABASE
  ): Promise<CrudArrayResult<T>> => {
    try {
      const q = query(collection(db, coleccion), where(field, '==', value));
      const querySnapshot = await getDocs(q);
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
      });
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const searchByName = async <T = DocumentData>(
    name: string,
    coleccion: COLLECTIONS_DATABASE
  ): Promise<CrudArrayResult<T>> => {
    try {
      const q = query(collection(db, coleccion), where('name', '==', name));
      const querySnapshot = await getDocs(q);
      const documents: T[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() } as T);
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
      });
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.log(`error: ${error}`);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  return { register, getAll, getById, update, remove, searchByField, searchByName };
}
