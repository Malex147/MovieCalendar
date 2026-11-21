import { separarFechaHora, formatearDiaYHora, formatearHora } from './fechas.js';

/**
 * Frases cortas con lo que ha cambiado en una sesión, para la notificación a los apuntados.
 * Devuelve [] si no hay cambios relevantes.
 */
export const describirCambios = (anterior, nueva) => {
  if (!anterior) return [];
  const cambios = [];

  if (anterior.tmdbId !== nueva.tmdbId || anterior.titulo !== nueva.titulo) {
    cambios.push(`ahora es ${nueva.titulo}`);
  }

  const antes = separarFechaHora(anterior.fechaHora);
  const despues = separarFechaHora(nueva.fechaHora);
  if (antes.dia !== despues.dia) {
    cambios.push(`nueva fecha: ${formatearDiaYHora(nueva.fechaHora)}`);
  } else if (antes.hora !== despues.hora || antes.minuto !== despues.minuto) {
    cambios.push(`nueva hora: ${formatearHora(nueva.fechaHora)}`);
  }

  if ((anterior.nota || '') !== (nueva.nota || '')) {
    cambios.push(nueva.nota ? `nota: ${nueva.nota}` : 'nota eliminada');
  }

  return cambios;
};
