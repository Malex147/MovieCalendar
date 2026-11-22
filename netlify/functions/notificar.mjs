// Netlify Function: envía notificaciones push cuando cambia la cartelera.
//
// POST /.netlify/functions/notificar   (Authorization: Bearer <ID token de Firebase>)
//   { tipo: 'nueva', sesionId }                       → avisa a todos menos a quien la crea
//   { tipo: 'cambio', sesionId, cambios: string[] }   → avisa a los apuntados menos a quien edita
//   { tipo: 'eliminada', sesion: { titulo, fechaHora, asistentes } } → avisa a los apuntados
//
// Variables de entorno (Netlify → Environment variables):
//   VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, FIREBASE_SERVICE_ACCOUNT (JSON de la cuenta de servicio)
//   VAPID_SUBJECT (opcional; por defecto la URL del sitio)

// Nota: NO se usa 'firebase-admin/auth'. Carga una librería (jose) que el runtime de
// Netlify Functions no puede cargar y tumbaba la función entera. El token se verifica
// con la API REST de Firebase Auth (ver verificarUsuario).
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as webpush from 'web-push';
import { COLECCIONES } from '../../src/lib/colecciones.js';
import { normalizarNombre } from '../../src/lib/nombres.js';
import { formatearDia, formatearHora } from '../../src/lib/fechas.js';

const VARIABLES_NECESARIAS = [
  'FIREBASE_SERVICE_ACCOUNT',
  'VAPID_PRIVATE_KEY',
  'VITE_VAPID_PUBLIC_KEY',
  'VITE_FIREBASE_API_KEY'
];
const URL_VERIFICAR_TOKEN = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup';
const MAX_CAMBIOS = 4;
const TTL_SEGUNDOS = 60 * 60 * 24;
const TODOS = null; // destinatarios: todos los usuarios suscritos

class ErrorHttp extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

const respuesta = (status, cuerpo) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

const cuando = (fechaHora) =>
  `${formatearDia(fechaHora, { weekday: 'long', day: 'numeric', month: 'short' })} a las ${formatearHora(fechaHora)}`;

// --- Configuración ---

const iniciarServicios = () => {
  const faltan = VARIABLES_NECESARIAS.filter((nombre) => !process.env[nombre]);
  if (faltan.length > 0) {
    console.error('Faltan variables de entorno:', faltan.join(', '));
    throw new ErrorHttp(500, 'Notificaciones no configuradas');
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || process.env.URL || 'https://moviecalendar.netlify.app',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  return getFirestore();
};

/**
 * Solo usuarios con sesión iniciada pueden disparar avisos.
 * Firebase Auth valida el ID token y devuelve el usuario; si el token es falso o ha caducado, falla.
 * Devuelve { uid, name }.
 */
const verificarUsuario = async (req) => {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) throw new ErrorHttp(401, 'No autorizado');

  const respuestaAuth = await fetch(`${URL_VERIFICAR_TOKEN}?key=${process.env.VITE_FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Por si la clave de API está restringida a la web de la app
      Referer: process.env.URL || 'https://moviecalendar.netlify.app'
    },
    body: JSON.stringify({ idToken: token })
  });

  if (!respuestaAuth.ok) {
    const detalle = await respuestaAuth.text().catch(() => '');
    console.warn('Token rechazado por Firebase Auth:', respuestaAuth.status, detalle.slice(0, 200));
    throw new ErrorHttp(401, 'No autorizado');
  }

  const { users = [] } = await respuestaAuth.json();
  if (!users[0]) throw new ErrorHttp(401, 'No autorizado');
  return { uid: users[0].localId, name: users[0].displayName };
};

const leerEvento = async (req) => {
  try {
    return await req.json();
  } catch {
    throw new ErrorHttp(400, 'JSON no válido');
  }
};

// --- Destinatarios ---

/** Pasa los nombres de los asistentes a UIDs usando usuarios/{slug}. */
const uidsDeAsistentes = async (db, asistentes = []) => {
  const slugs = [...new Set(asistentes.map(normalizarNombre).filter(Boolean))];
  if (slugs.length === 0) return new Set();

  const docs = await db.getAll(...slugs.map((slug) => db.collection(COLECCIONES.USUARIOS).doc(slug)));
  return new Set(docs.filter((d) => d.exists).map((d) => d.get('uid')));
};

const leerSesion = async (db, sesionId) => {
  const snap = await db.collection(COLECCIONES.SESIONES).doc(String(sesionId || '')).get();
  if (!snap.exists) throw new ErrorHttp(404, 'Sesión no encontrada');
  return { id: snap.id, ...snap.data() };
};

// --- Construcción del aviso según el tipo de evento ---
// Cada constructor devuelve { mensaje, destinatarios } o null si no hay nada que avisar.

const CONSTRUCTORES = {
  nueva: async (db, evento, autor) => {
    const sesion = await leerSesion(db, evento.sesionId);
    return {
      mensaje: {
        title: `🎬 Nueva sesión: ${sesion.titulo}`,
        body: `${sesion.autor || autor} propone verla el ${cuando(sesion.fechaHora)}. ¿Te apuntas?`,
        icon: sesion.poster,
        tag: `sesion-${sesion.id}`
      },
      destinatarios: TODOS
    };
  },

  cambio: async (db, evento, autor) => {
    const cambios = Array.isArray(evento.cambios) ? evento.cambios.slice(0, MAX_CAMBIOS).map(String) : [];
    if (cambios.length === 0) return null;

    const sesion = await leerSesion(db, evento.sesionId);
    return {
      mensaje: {
        title: `✏️ Cambios en ${sesion.titulo}`,
        body: `${autor} ha modificado la sesión: ${cambios.join(' · ')}`,
        icon: sesion.poster,
        tag: `sesion-${sesion.id}`
      },
      destinatarios: await uidsDeAsistentes(db, sesion.asistentes)
    };
  },

  eliminada: async (db, evento, autor) => {
    if (!evento.sesion) throw new ErrorHttp(400, 'Falta la sesión anulada');
    const { titulo = 'una sesión', fechaHora = '', asistentes = [] } = evento.sesion;
    return {
      mensaje: {
        title: `🚫 Sesión anulada: ${titulo}`,
        body: `${autor} ha anulado la sesión del ${cuando(fechaHora)}.`
      },
      destinatarios: await uidsDeAsistentes(db, asistentes)
    };
  }
};

// --- Envío ---

/** Envía el aviso a cada dispositivo suscrito (nunca a quien hizo el cambio) y limpia los caducados. */
const enviar = async (db, { mensaje, destinatarios }, uidAutor) => {
  const suscripciones = await db.collection(COLECCIONES.SUSCRIPCIONES_PUSH).get();
  const objetivo = suscripciones.docs.filter((d) => {
    const uid = d.get('uid');
    return uid !== uidAutor && (destinatarios === TODOS || destinatarios.has(uid));
  });

  const payload = JSON.stringify({ ...mensaje, url: '/' });
  const resultados = await Promise.allSettled(
    objetivo.map((d) => webpush.sendNotification(d.get('suscripcion'), payload, { TTL: TTL_SEGUNDOS }))
  );

  // 404/410: el dispositivo desinstaló la app o retiró el permiso
  const borrados = [];
  resultados.forEach((r, i) => {
    if (r.status === 'fulfilled') return;
    const codigo = r.reason?.statusCode;
    if (codigo === 404 || codigo === 410) borrados.push(objetivo[i].ref.delete());
    else console.warn('Fallo enviando push:', codigo, r.reason?.body || r.reason?.message);
  });
  await Promise.all(borrados);

  return {
    enviadas: resultados.filter((r) => r.status === 'fulfilled').length,
    caducadas: borrados.length
  };
};

export default async (req) => {
  if (req.method !== 'POST') return respuesta(405, { error: 'Método no permitido' });

  try {
    const db = iniciarServicios();
    const usuario = await verificarUsuario(req);
    const evento = await leerEvento(req);

    const construir = CONSTRUCTORES[evento?.tipo];
    if (!construir) throw new ErrorHttp(400, 'Evento no válido');

    const aviso = await construir(db, evento, usuario.name || 'Alguien');
    if (!aviso) return respuesta(200, { enviadas: 0 });

    return respuesta(200, await enviar(db, aviso, usuario.uid));
  } catch (err) {
    if (err instanceof ErrorHttp) return respuesta(err.status, { error: err.message });
    console.error('Error inesperado en notificar:', err);
    return respuesta(500, { error: 'Error interno' });
  }
};
