// Notificaciones push: suscripción de este dispositivo y aviso al servidor.
//
// Cada dispositivo guarda su suscripción en `suscripcionesPush/{hash del endpoint}` con el uid
// del usuario conectado. La preferencia de este dispositivo (activados / desactivados) se
// recuerda en localStorage para no volver a preguntar y para respetar si el usuario los quitó.
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { COLECCIONES } from '../lib/colecciones';
import { db, auth } from './firebase';

const SUSCRIPCIONES = COLECCIONES.SUSCRIPCIONES_PUSH;
const VAPID_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const URL_FUNCION = '/.netlify/functions/notificar';

// --- Preferencia de este dispositivo ---

const CLAVE_PREFERENCIA = 'salaPrivada.avisos';
const PREFERENCIA = Object.freeze({ ACTIVADOS: 'activados', DESACTIVADOS: 'desactivados' });

const leerPreferencia = () => {
  try {
    return localStorage.getItem(CLAVE_PREFERENCIA);
  } catch {
    return null; // navegación privada o almacenamiento bloqueado
  }
};

const guardarPreferencia = (valor) => {
  try {
    localStorage.setItem(CLAVE_PREFERENCIA, valor);
  } catch {
    // sin almacenamiento: se volverá a preguntar, no es grave
  }
};

// --- Detección de capacidades ---

export const pushSoportado = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const estaInstalada = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

// En iPhone/iPad las notificaciones web solo funcionan con la app añadida a la pantalla de inicio
const necesitaInstalarEnIOS = () => esIOS() && !estaInstalada();

// --- Service worker ---

export const registrarServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('No se pudo registrar el service worker:', err);
    });
  });
};

/** Registro con el service worker ya ACTIVO (subscribe() falla si aún se está instalando). */
const registroActivo = async () => {
  if (!(await navigator.serviceWorker.getRegistration())) {
    await navigator.serviceWorker.register('/sw.js');
  }
  return navigator.serviceWorker.ready;
};

const suscripcionActual = async () => {
  const registro = await navigator.serviceWorker.getRegistration();
  return registro?.pushManager.getSubscription() ?? null;
};

// --- Utilidades de la suscripción ---

const base64UrlABytes = (base64Url) => {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

const mismosBytes = (a, b) => a.length === b.length && a.every((byte, i) => byte === b[i]);

// Id estable por dispositivo: hash del endpoint de la suscripción
const idDeSuscripcion = async (endpoint) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
};

/** Suscribe el navegador (reutilizando la suscripción si es de la clave actual) y la guarda para este usuario. */
const suscribirYGuardar = async () => {
  if (!VAPID_PUBLICA) throw new Error('Falta configurar VITE_VAPID_PUBLIC_KEY.');
  const user = auth.currentUser;
  if (!user) throw new Error('No hay ninguna sesión activa.');

  const clave = base64UrlABytes(VAPID_PUBLICA);
  const registro = await registroActivo();
  let suscripcion = await registro.pushManager.getSubscription();

  // Si la suscripción existente se creó con otra clave VAPID, no sirve: se rehace
  const claveExistente = suscripcion?.options?.applicationServerKey;
  if (suscripcion && claveExistente && !mismosBytes(new Uint8Array(claveExistente), clave)) {
    await suscripcion.unsubscribe();
    suscripcion = null;
  }

  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: clave });
  }

  const datos = suscripcion.toJSON();
  await setDoc(doc(db, SUSCRIPCIONES, await idDeSuscripcion(datos.endpoint)), {
    uid: user.uid,
    suscripcion: datos,
    dispositivo: navigator.userAgent.slice(0, 200),
    actualizadoEn: serverTimestamp()
  });
};

// --- API pública ---

/**
 * Estado de los avisos en este dispositivo:
 * 'no-soportado' | 'instalar-ios' | 'bloqueado' | 'activado' | 'desactivado' | 'sin-decidir'
 */
export const obtenerEstadoNotificaciones = async () => {
  if (necesitaInstalarEnIOS()) return 'instalar-ios';
  if (!pushSoportado()) return 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueado';

  const preferencia = leerPreferencia();
  if (Notification.permission === 'default' && !preferencia) return 'sin-decidir';
  if (preferencia === PREFERENCIA.DESACTIVADOS) return 'desactivado';
  return Notification.permission === 'granted' && (await suscripcionActual()) ? 'activado' : 'desactivado';
};

/**
 * Qué mostrar al entrar por primera vez en este dispositivo:
 * 'pedir' (ofrecer activar avisos), 'instalar-ios' (explicar cómo instalar) o null (nada).
 */
export const avisoInicialPendiente = () => {
  if (leerPreferencia()) return null;
  if (necesitaInstalarEnIOS()) return 'instalar-ios';
  if (!pushSoportado() || Notification.permission !== 'default') return null;
  return 'pedir';
};

/** Pide permiso y activa los avisos. Debe llamarse desde un clic (iOS y Chrome lo exigen). */
export const activarNotificaciones = async () => {
  if (!pushSoportado()) throw new Error('Este navegador no admite notificaciones.');

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    guardarPreferencia(PREFERENCIA.DESACTIVADOS);
    throw new Error('Has denegado el permiso de notificaciones. Puedes activarlo en los ajustes del navegador.');
  }

  await suscribirYGuardar();
  guardarPreferencia(PREFERENCIA.ACTIVADOS);
};

/** Quita los avisos de este dispositivo y recuerda la decisión. */
export const desactivarNotificaciones = async () => {
  guardarPreferencia(PREFERENCIA.DESACTIVADOS);
  const suscripcion = await suscripcionActual();
  if (!suscripcion) return;

  const id = await idDeSuscripcion(suscripcion.endpoint);
  await suscripcion.unsubscribe();
  await deleteDoc(doc(db, SUSCRIPCIONES, id)).catch(() => {});
};

/** "Ahora no" en el aviso inicial: no se vuelve a preguntar (se puede activar desde el perfil). */
export const rechazarAvisoInicial = () => guardarPreferencia(PREFERENCIA.DESACTIVADOS);

/**
 * Al entrar: si este dispositivo ya tenía permiso y no se desactivaron, asegura que la
 * suscripción existe y pertenece al usuario conectado (p. ej. tras cambiar de cuenta). Silencioso.
 */
export const sincronizarNotificaciones = async () => {
  if (!pushSoportado() || Notification.permission !== 'granted') return;
  if (leerPreferencia() === PREFERENCIA.DESACTIVADOS) return;
  try {
    await suscribirYGuardar();
  } catch (err) {
    console.warn('No se pudo sincronizar la suscripción push:', err);
  }
};

/** Al cerrar sesión: este dispositivo deja de recibir los avisos de esta cuenta. */
export const olvidarEsteDispositivo = async () => {
  if (!pushSoportado()) return;
  try {
    const suscripcion = await suscripcionActual();
    if (suscripcion) await deleteDoc(doc(db, SUSCRIPCIONES, await idDeSuscripcion(suscripcion.endpoint)));
  } catch (err) {
    console.warn('No se pudo desvincular el dispositivo:', err);
  }
};

// --- Avisar al servidor para que envíe las notificaciones ---

/** evento: { tipo: 'nueva' | 'cambio' | 'eliminada', sesionId?, cambios?, sesion? } */
export const avisarCambioCartelera = async (evento) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;

    const respuesta = await fetch(URL_FUNCION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(evento)
    });

    // Visible en la consola del navegador para poder diagnosticar
    const resultado = await respuesta.json().catch(() => ({}));
    if (respuesta.ok) console.info('Avisos enviados:', resultado);
    else console.warn(`El servidor de avisos respondió ${respuesta.status}:`, resultado);
  } catch (err) {
    // Las notificaciones nunca deben romper la acción principal
    console.warn('No se pudo enviar el aviso:', err);
  }
};
