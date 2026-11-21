// Utilidades puras de nombres de usuario.
// Se comparten entre el frontend y la Netlify Function: sin dependencias de navegador ni de Vite.

/**
 * Identificador único de un nombre: minúsculas, sin tildes ni símbolos.
 * "Álex G." → "alexg". Es el id de `usuarios/{slug}` y la base del email interno.
 */
export const normalizarNombre = (nombre = '') =>
  nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

export const mismoNombre = (a, b) => {
  const slug = normalizarNombre(a);
  return slug !== '' && slug === normalizarNombre(b);
};

/** Entradas de la lista de asistentes que corresponden a este usuario (con cualquier grafía). */
export const entradasDeUsuario = (asistentes = [], nombre = '') =>
  asistentes.filter((persona) => mismoNombre(persona, nombre));

export const estaApuntado = (asistentes, nombre) =>
  entradasDeUsuario(asistentes, nombre).length > 0;
