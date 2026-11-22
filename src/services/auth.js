// Cuentas de usuario: registro, acceso y cambio de nombre.
//
// Para no pedir correos reales, cada nombre se convierte en un email interno
// `${slug}@salaprivada.local`, y el nombre se reserva en `usuarios/{slug}` para que sea único.
import { doc, getDoc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase';
import { renombrarEnSesiones } from './sesiones';
import { renombrarEnPorVer } from './porVer';
import { COLECCIONES } from '../lib/colecciones';
import { normalizarNombre } from '../lib/nombres';

const DOMINIO_INTERNO = 'salaprivada.local';
const LONGITUD_MIN_NOMBRE = 2;
const LONGITUD_MIN_PASSWORD = 6;

const ERRORES_CREDENCIALES = new Set([
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/invalid-credential'
]);

const refUsuario = (slug) => doc(db, COLECCIONES.USUARIOS, slug);
const emailInterno = (slug) => `${slug}@${DOMINIO_INTERNO}`;
const aUsuario = (user, nombre) => ({ uid: user.uid, nombre: nombre ?? user.displayName ?? '' });

/** Valida el nombre y devuelve { nombre (limpio), slug }. Lanza un Error legible si no es válido. */
const validarNombre = (nombreVisible = '') => {
  const nombre = nombreVisible.trim();
  if (nombre.length < LONGITUD_MIN_NOMBRE) {
    throw new Error(`El nombre debe tener al menos ${LONGITUD_MIN_NOMBRE} caracteres.`);
  }
  const slug = normalizarNombre(nombre);
  if (!slug) throw new Error('Usa letras o números válidos para tu nombre.');
  return { nombre, slug };
};

const comprobarNombreLibre = async (slug) => {
  const existente = await getDoc(refUsuario(slug));
  if (existente.exists()) throw new Error('Ese nombre ya está pillado por otra persona.');
};

export const registrarUsuario = async (nombreVisible, password) => {
  const { nombre, slug } = validarNombre(nombreVisible);
  if (password.length < LONGITUD_MIN_PASSWORD) {
    throw new Error(`La contraseña debe tener al menos ${LONGITUD_MIN_PASSWORD} caracteres.`);
  }

  await comprobarNombreLibre(slug);

  const { user } = await createUserWithEmailAndPassword(auth, emailInterno(slug), password);
  await updateProfile(user, { displayName: nombre });
  await setDoc(refUsuario(slug), { uid: user.uid, nombre, slug, creadoEn: serverTimestamp() });

  return aUsuario(user, nombre);
};

export const iniciarSesionUsuario = async (nombreVisible, password) => {
  const slug = normalizarNombre(nombreVisible);
  if (!slug) throw new Error('Introduce tu nombre de usuario.');

  try {
    const { user } = await signInWithEmailAndPassword(auth, emailInterno(slug), password);
    return aUsuario(user, user.displayName || nombreVisible.trim());
  } catch (err) {
    if (ERRORES_CREDENCIALES.has(err.code)) {
      throw new Error('Nombre o contraseña incorrectos.', { cause: err });
    }
    throw err;
  }
};

export const cerrarSesionUsuario = () => signOut(auth);

/** Notifica el usuario conectado ({ uid, nombre }) o null. Devuelve la función para dejar de escuchar. */
export const suscribirAAuth = (callback) =>
  onAuthStateChanged(auth, (user) =>
    callback(user ? aUsuario(user, user.displayName || user.email.split('@')[0]) : null)
  );

const actualizarEmailInterno = async (user, slug) => {
  try {
    await updateEmail(user, emailInterno(slug));
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      throw new Error('Por seguridad, cierra sesión y vuelve a entrar antes de cambiar tu nombre.', { cause: err });
    }
    if (err.code === 'auth/operation-not-allowed') {
      // Ocurre si la "protección contra la enumeración de correos" está activa en Firebase Auth
      throw new Error('El servidor no permite cambiar el nombre ahora mismo. Avisa al administrador de la sala.', { cause: err });
    }
    throw err;
  }
};

/**
 * Cambia el nombre del usuario conectado manteniendo la unicidad,
 * el acceso con el nuevo nombre y sus apariciones en la cartelera y en la lista "Por ver".
 */
export const cambiarNombreUsuario = async (nuevoNombreVisible) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay ninguna sesión activa.');

  const { nombre: nombreNuevo, slug: slugNuevo } = validarNombre(nuevoNombreVisible);
  const nombreAnterior = user.displayName || '';
  if (nombreNuevo === nombreAnterior) return aUsuario(user, nombreNuevo);

  const slugAnterior = normalizarNombre(nombreAnterior);
  const cambiaIdentificador = slugNuevo !== slugAnterior;

  // 1. Si cambia el identificador, reservarlo y mover el acceso al nuevo email interno
  if (cambiaIdentificador) {
    await comprobarNombreLibre(slugNuevo);
    await actualizarEmailInterno(user, slugNuevo);
  }

  // 2. Nombre visible en Firebase Auth
  await updateProfile(user, { displayName: nombreNuevo });

  // 3. Reserva del nombre y cartelera, en un único batch
  const batch = writeBatch(db);
  if (cambiaIdentificador && slugAnterior) batch.delete(refUsuario(slugAnterior));
  batch.set(
    refUsuario(slugNuevo),
    { uid: user.uid, nombre: nombreNuevo, slug: slugNuevo, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
  if (nombreAnterior) {
    await renombrarEnSesiones(batch, nombreAnterior, nombreNuevo);
    await renombrarEnPorVer(batch, nombreAnterior, nombreNuevo);
  }
  await batch.commit();

  return aUsuario(user, nombreNuevo);
};
