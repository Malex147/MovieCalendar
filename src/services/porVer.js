// Lista "Por ver": títulos que el grupo quiere ver pero aún sin fecha.
// Cada documento: { tmdbId, titulo, tipo, anio, poster, nota, propuestoPor, interesados[], creadoEn }
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { COLECCIONES } from '../lib/colecciones';

const coleccionPorVer = () => collection(db, COLECCIONES.POR_VER);
const refPendiente = (id) => doc(db, COLECCIONES.POR_VER, id);

/** Id estable por título, para que no se pueda añadir dos veces el mismo ("pelicula-603"). */
const idDeTitulo = ({ tipo, tmdbId }) => `${tipo === 'Serie' ? 'serie' : 'pelicula'}-${tmdbId}`;

/** Escucha la lista en tiempo real. Devuelve la función para dejar de escuchar. */
export const suscribirAPorVer = (onDatos, onError) =>
  onSnapshot(
    coleccionPorVer(),
    (snapshot) => onDatos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => onError?.(error)
  );

/** Añade un título. Quien lo propone queda marcado como interesado. */
export const agregarAPorVer = async ({ tmdbId, titulo, tipo, anio, poster }, nota, nombre) => {
  const ref = refPendiente(idDeTitulo({ tipo, tmdbId }));
  if ((await getDoc(ref)).exists()) {
    throw new Error(`«${titulo}» ya está en la lista.`);
  }
  await setDoc(ref, {
    tmdbId,
    titulo,
    tipo,
    anio,
    poster,
    nota,
    propuestoPor: nombre,
    interesados: [nombre],
    creadoEn: serverTimestamp()
  });
};

export const quitarDePorVer = (id) => deleteDoc(refPendiente(id));

export const marcarInteres = (id, nombre) =>
  updateDoc(refPendiente(id), { interesados: arrayUnion(nombre) });

/** Quita todas las grafías del nombre del usuario ("alex", "Álex"...). */
export const quitarInteres = (id, entradas) =>
  updateDoc(refPendiente(id), { interesados: arrayRemove(...entradas) });

/** Añade a un batch los cambios para renombrar a un usuario en la lista. */
export const renombrarEnPorVer = async (batch, nombreAnterior, nombreNuevo) => {
  const snapshot = await getDocs(coleccionPorVer());

  snapshot.forEach((docPendiente) => {
    const pendiente = docPendiente.data();
    const cambios = {};

    if (Array.isArray(pendiente.interesados) && pendiente.interesados.includes(nombreAnterior)) {
      cambios.interesados = [
        ...new Set(pendiente.interesados.map((p) => (p === nombreAnterior ? nombreNuevo : p)))
      ];
    }
    if (pendiente.propuestoPor === nombreAnterior) cambios.propuestoPor = nombreNuevo;

    if (Object.keys(cambios).length > 0) batch.update(docPendiente.ref, cambios);
  });
};
