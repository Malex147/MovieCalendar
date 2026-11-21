// Acceso a la colección de sesiones (la cartelera).
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { COLECCIONES } from '../lib/colecciones';

const coleccionSesiones = () => collection(db, COLECCIONES.SESIONES);
const refSesion = (id) => doc(db, COLECCIONES.SESIONES, id);

/** Escucha la cartelera en tiempo real, ordenada por fecha. Devuelve la función para dejar de escuchar. */
export const suscribirACartelera = (onDatos, onError) =>
  onSnapshot(
    query(coleccionSesiones(), orderBy('fechaHora', 'asc')),
    (snapshot) => onDatos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => onError?.(error)
  );

/** Crea una sesión y devuelve su id. */
export const agregarSesion = async (nuevaSesion) => {
  const ref = await addDoc(coleccionSesiones(), {
    ...nuevaSesion,
    asistentes: nuevaSesion.asistentes || [],
    creadoEn: serverTimestamp()
  });
  return ref.id;
};

export const actualizarSesion = (id, datosActualizados) =>
  updateDoc(refSesion(id), datosActualizados);

export const eliminarSesion = (id) => deleteDoc(refSesion(id));

export const apuntarse = (sesionId, nombre) =>
  updateDoc(refSesion(sesionId), { asistentes: arrayUnion(nombre) });

/** Quita todas las grafías del nombre del usuario ("alex", "Álex"...) de la lista. */
export const desapuntarse = (sesionId, entradas) =>
  updateDoc(refSesion(sesionId), { asistentes: arrayRemove(...entradas) });

/**
 * Añade a un batch los cambios para renombrar a un usuario en todas las sesiones
 * (asistentes, anfitrión y creador).
 */
export const renombrarEnSesiones = async (batch, nombreAnterior, nombreNuevo) => {
  const snapshot = await getDocs(coleccionSesiones());

  snapshot.forEach((docSesion) => {
    const sesion = docSesion.data();
    const cambios = {};

    if (Array.isArray(sesion.asistentes) && sesion.asistentes.includes(nombreAnterior)) {
      cambios.asistentes = [
        ...new Set(sesion.asistentes.map((p) => (p === nombreAnterior ? nombreNuevo : p)))
      ];
    }
    if (sesion.autor === nombreAnterior) cambios.autor = nombreNuevo;
    if (sesion.creadoPor === nombreAnterior) cambios.creadoPor = nombreNuevo;

    if (Object.keys(cambios).length > 0) batch.update(docSesion.ref, cambios);
  });
};
