import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
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
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  onAuthStateChanged
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const COLLECTION_NAME = 'sesiones';
const USERS_COLLECTION = 'usuarios';

// Convierte "Álex G." en "alex-g@salaprivada.local" para Firebase Auth
function normalizarUsuarioAEmail(nombre) {
  const slug = nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
  return { slug, email: `${slug}@salaprivada.local` };
}

// Registrar usuario nuevo comprobando que el nombre sea único
export const registrarUsuario = async (nombreVisible, password) => {
  const nombreLimpio = nombreVisible.trim();
  if (nombreLimpio.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres.');
  }
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  const { slug, email } = normalizarUsuarioAEmail(nombreLimpio);
  if (!slug) {
    throw new Error('Usa letras o números válidos para tu nombre.');
  }

  // Comprobamos en Firestore si ese nombre ya existe
  const userDocRef = doc(db, USERS_COLLECTION, slug);
  const existente = await getDoc(userDocRef);
  if (existente.exists()) {
    throw new Error('Ese nombre ya está pillado por otra persona.');
  }

  // Creamos la cuenta en Firebase Auth
  const credencial = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credencial.user, { displayName: nombreLimpio });

  // Reservamos el nombre único en Firestore
  await setDoc(userDocRef, {
    uid: credencial.user.uid,
    nombre: nombreLimpio,
    slug,
    creadoEn: serverTimestamp()
  });

  return { uid: credencial.user.uid, nombre: nombreLimpio };
};

// Iniciar sesión con nombre y contraseña
export const iniciarSesionUsuario = async (nombreVisible, password) => {
  const { slug, email } = normalizarUsuarioAEmail(nombreVisible);
  if (!slug) {
    throw new Error('Introduce tu nombre de usuario.');
  }

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, password);
    return {
      uid: credencial.user.uid,
      nombre: credencial.user.displayName || nombreVisible.trim()
    };
  } catch (err) {
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/wrong-password' ||
      err.code === 'auth/invalid-credential'
    ) {
      throw new Error('Nombre o contraseña incorrectos.');
    }
    throw err;
  }
};

export const cerrarSesionUsuario = async () => {
  await signOut(auth);
};

export const suscribirAAuth = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        nombre: user.displayName || user.email.split('@')[0]
      });
    } else {
      callback(null);
    }
  });
};

// --- CRUD de Cartelera ---

export const suscribirACartelera = (onData, onError) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('fechaHora', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const lista = snapshot.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));
      onData(lista);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
};

export const agregarSesion = async (nuevaSesion) => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...nuevaSesion,
    asistentes: nuevaSesion.asistentes || [],
    creadoEn: serverTimestamp()
  });
};

export const actualizarSesion = async (id, datosActualizados) => {
  const sesionRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(sesionRef, datosActualizados);
};

export const eliminarSesion = async (id) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const alternarAsistencia = async (sesionId, nombre, yaEstabaApuntado) => {
  const sesionRef = doc(db, COLLECTION_NAME, sesionId);
  await updateDoc(sesionRef, {
    asistentes: yaEstabaApuntado ? arrayRemove(nombre) : arrayUnion(nombre)
  });
};

// Cambiar nombre de usuario manteniendo unicidad, login y listas de asistencia
export const cambiarNombreUsuario = async (nuevoNombreVisible) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay ninguna sesión activa.');

  const nombreLimpio = nuevoNombreVisible.trim();
  if (nombreLimpio.length < 2) {
    throw new Error('El nombre debe tener al menos 2 caracteres.');
  }

  const nombreAnterior = user.displayName || '';
  if (nombreLimpio === nombreAnterior) {
    return { uid: user.uid, nombre: nombreLimpio };
  }

  const { slug: nuevoSlug, email: nuevoEmail } = normalizarUsuarioAEmail(nombreLimpio);
  const { slug: antiguoSlug } = normalizarUsuarioAEmail(nombreAnterior);

  if (!nuevoSlug) {
    throw new Error('Usa letras o números válidos para tu nombre.');
  }

  // 1. Si cambia el identificador base, comprobar que no esté pillado por otro usuario
  const nuevoDocRef = doc(db, USERS_COLLECTION, nuevoSlug);
  if (nuevoSlug !== antiguoSlug) {
    const existente = await getDoc(nuevoDocRef);
    if (existente.exists()) {
      throw new Error('Ese nombre ya está pillado por otra persona.');
    }

    // Actualizamos el email interno para que pueda seguir entrando con su nuevo nombre
    try {
      await updateEmail(user, nuevoEmail);
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('Por seguridad, cierra sesión y vuelve a entrar antes de cambiar tu nombre.');
      }
      throw err;
    }
  }

  // 2. Actualizar el nombre visible en Firebase Auth
  await updateProfile(user, { displayName: nombreLimpio });

  // 3. Actualizar reserva de nombre único y sesiones donde estaba apuntado
  const batch = writeBatch(db);

  if (nuevoSlug !== antiguoSlug && antiguoSlug) {
    batch.delete(doc(db, USERS_COLLECTION, antiguoSlug));
  }

  batch.set(nuevoDocRef, {
    uid: user.uid,
    nombre: nombreLimpio,
    slug: nuevoSlug,
    actualizadoEn: serverTimestamp()
  });

  // Reemplazar su nombre antiguo en las listas de asistentes
  if (nombreAnterior) {
    const sesionesSnap = await getDocs(collection(db, COLLECTION_NAME));
    sesionesSnap.forEach((docSesion) => {
      const data = docSesion.data();
      if (Array.isArray(data.asistentes) && data.asistentes.includes(nombreAnterior)) {
        const nuevosAsistentes = data.asistentes.map((p) =>
          p === nombreAnterior ? nombreLimpio : p
        );
        batch.update(docSesion.ref, { asistentes: nuevosAsistentes });
      }
    });
  }

  await batch.commit();
  localStorage.setItem('cine_autor', nombreLimpio);

  return { uid: user.uid, nombre: nombreLimpio };
};