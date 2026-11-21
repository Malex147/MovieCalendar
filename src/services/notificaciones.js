import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { COLECCIONES } from '../lib/colecciones';
import { db, auth } from './firebase';

const SUSCRIPCIONES = COLECCIONES.SUSCRIPCIONES_PUSH;
const VAPID_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// --- Detección de capacidades ---

export const pushSoportado = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const esIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const estaInstalada = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

// En iPhone/iPad las notificaciones web solo funcionan con la app añadida a la pantalla de inicio
export const necesitaInstalarEnIOS = () => esIOS() && !estaInstalada();

// --- Service worker ---

export const registrarServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('No se pudo registrar el service worker:', err);
    });
  });
};

const obtenerRegistro = async () => {
  const existente = await navigator.serviceWorker.getRegistration();
  if (existente) return existente;
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
};

// --- Suscripción del dispositivo ---

const base64UrlABytes = (base64Url) => {
  const relleno = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const binario = atob(base64);
  return Uint8Array.from(binario, (c) => c.charCodeAt(0));
};

// Id estable por dispositivo: hash del endpoint de la suscripción
const idDeSuscripcion = async (endpoint) => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
};

export const obtenerEstadoNotificaciones = async () => {
  if (!pushSoportado()) return 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueado';
  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();
  return suscripcion && Notification.permission === 'granted' ? 'activado' : 'desactivado';
};

export const activarNotificaciones = async () => {
  if (!pushSoportado()) {
    throw new Error('Este navegador no admite notificaciones.');
  }
  if (!VAPID_PUBLICA) {
    throw new Error('Falta configurar VITE_VAPID_PUBLIC_KEY.');
  }
  const user = auth.currentUser;
  if (!user) throw new Error('No hay ninguna sesión activa.');

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    throw new Error('Has denegado el permiso de notificaciones. Actívalo en los ajustes del navegador.');
  }

  const registro = await obtenerRegistro();
  let suscripcion = await registro.pushManager.getSubscription();
  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlABytes(VAPID_PUBLICA)
    });
  }

  const datos = suscripcion.toJSON();
  await setDoc(doc(db, SUSCRIPCIONES, await idDeSuscripcion(datos.endpoint)), {
    uid: user.uid,
    suscripcion: datos,
    dispositivo: navigator.userAgent.slice(0, 200),
    actualizadoEn: serverTimestamp()
  });
};

export const desactivarNotificaciones = async () => {
  const registro = await navigator.serviceWorker.getRegistration();
  const suscripcion = await registro?.pushManager.getSubscription();
  if (!suscripcion) return;

  const id = await idDeSuscripcion(suscripcion.endpoint);
  await suscripcion.unsubscribe();
  await deleteDoc(doc(db, SUSCRIPCIONES, id)).catch(() => {});
};

// --- Avisar al servidor para que envíe las notificaciones ---
// evento: { tipo: 'nueva' | 'cambio' | 'eliminada', sesionId?, cambios?, sesion? }
export const avisarCambioCartelera = async (evento) => {
  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return;
    await fetch('/.netlify/functions/notificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(evento)
    });
  } catch (err) {
    // Las notificaciones nunca deben romper la acción principal
    console.warn('No se pudo enviar el aviso:', err);
  }
};
