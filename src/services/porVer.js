// Lista "Por ver": títulos que el grupo quiere ver pero aún sin fecha.
// Cada documento: { tmdbId, titulo, tipo, anio, poster, nota, propuestoPor, interesados[], orden, creadoEn }
// `orden` es la posición elegida arrastrando (compartida por todo el grupo); menor = antes.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { COLECCIONES } from '../lib/colecciones';
import { ahoraFechaHora } from '../lib/fechas';

const PASO_ORDEN = 1000;

const coleccionPorVer = () => collection(db, COLECCIONES.POR_VER);
const refPendiente = (id) => doc(db, COLECCIONES.POR_VER, id);

/** Posición de un pendiente; los antiguos sin `orden` usan su fecha de creación. */
export const ordenDe = (pendiente) =>
  pendiente.orden ?? pendiente.creadoEn?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;

/** Id estable por título, para que no se pueda añadir dos veces el mismo ("pelicula-603"). */
const idDeTitulo = ({ tipo, tmdbId }) => `${tipo === 'Serie' ? 'serie' : 'pelicula'}-${tmdbId}`;

/** Escucha la lista en tiempo real. Devuelve la función para dejar de escuchar. */
export const suscribirAPorVer = (onDatos, onError) =>
  onSnapshot(
    coleccionPorVer(),
    (snapshot) => onDatos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (error) => onError?.(error)
  );

/** Añade un título al final de la lista. Quien lo propone queda marcado como interesado. */
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
    orden: Date.now(), // siempre mayor que los existentes → al final
    creadoEn: serverTimestamp()
  });
};

export const quitarDePorVer = (id) => deleteDoc(refPendiente(id));

/**
 * Guarda el orden elegido arrastrando. Recibe los pendientes ya en su nuevo orden
 * y solo escribe los que cambian de posición.
 */
export const reordenarPorVer = async (pendientesEnOrden) => {
  const batch = writeBatch(db);
  let cambios = 0;

  pendientesEnOrden.forEach((pendiente, indice) => {
    const orden = (indice + 1) * PASO_ORDEN;
    if (pendiente.orden !== orden) {
      batch.update(refPendiente(pendiente.id), { orden });
      cambios++;
    }
  });

  if (cambios > 0) await batch.commit();
};

/**
 * "Ya la vimos" sin haberla programado: pasa directamente al historial de vistas
 * (como sesión vista de hoy, con los interesados como asistentes) y sale de la lista.
 */
export const marcarPendienteComoVisto = async (pendiente, nombre) => {
  const { tmdbId, titulo, tipo, anio, poster, nota = '', propuestoPor, interesados = [] } = pendiente;
  const batch = writeBatch(db);

  batch.set(doc(collection(db, COLECCIONES.SESIONES)), {
    tmdbId,
    titulo,
    tipo,
    anio,
    poster,
    nota,
    fechaHora: ahoraFechaHora(),
    autor: propuestoPor || nombre,
    asistentes: interesados,
    creadoPor: nombre,
    creadoEn: serverTimestamp(),
    vista: true,
    vistaEn: serverTimestamp(),
    marcadaVistaPor: nombre
  });
  batch.delete(refPendiente(pendiente.id));

  await batch.commit();
};

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
