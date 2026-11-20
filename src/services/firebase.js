import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Nombre de la colección en la base de datos
const COLLECTION_NAME = 'cartelera';

/**
 * Escucha cambios en tiempo real ordenados por fecha y hora
 */
export const suscribirACartelera = (callback, onError) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('fechaHora', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const sesiones = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));
      callback(sesiones);
    },
    (error) => {
      console.error('Error al escuchar Firestore:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Añade una nueva película o serie al calendario
 */
export const agregarSesion = async (datosSesion) => {
  return await addDoc(collection(db, COLLECTION_NAME), {
    ...datosSesion,
    creadoEn: new Date().toISOString()
  });   
};

/**
 * Elimina una sesión por su ID
 */
export const eliminarSesion = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};

export const actualizarSesion = async (id, datosActualizados) => {
  const sesionRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(sesionRef, datosActualizados);
};

export const alternarAsistencia = async (sesionId, nombre, yaEstabaApuntado) => {
  const sesionRef = doc(db, COLLECTION_NAME, sesionId);
  await updateDoc(sesionRef, {
    asistentes: yaEstabaApuntado ? arrayRemove(nombre) : arrayUnion(nombre)
  });
};