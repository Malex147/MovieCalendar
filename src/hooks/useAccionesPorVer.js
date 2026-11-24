import {
  agregarAPorVer,
  quitarDePorVer,
  marcarInteres,
  quitarInteres,
  reordenarPorVer,
  marcarPendienteComoVisto
} from '../services/porVer';
import { entradasDeUsuario } from '../lib/nombres';

/** Acciones sobre la lista "Por ver" en nombre del usuario conectado. */
export function useAccionesPorVer(usuario) {
  const agregar = (titulo, nota = '') => agregarAPorVer(titulo, nota.trim(), usuario.nombre);

  const quitar = (id) => quitarDePorVer(id);

  const alternarInteres = (pendiente) => {
    const misEntradas = entradasDeUsuario(pendiente.interesados, usuario.nombre);
    return misEntradas.length > 0
      ? quitarInteres(pendiente.id, misEntradas)
      : marcarInteres(pendiente.id, usuario.nombre);
  };

  const reordenar = (pendientesEnOrden) => reordenarPorVer(pendientesEnOrden);

  const marcarVisto = (pendiente) => marcarPendienteComoVisto(pendiente, usuario.nombre);

  return { agregar, quitar, alternarInteres, reordenar, marcarVisto };
}
