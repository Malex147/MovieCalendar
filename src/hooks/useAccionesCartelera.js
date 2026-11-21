import {
  agregarSesion,
  actualizarSesion,
  eliminarSesion,
  apuntarse,
  desapuntarse
} from '../services/sesiones';
import { avisarCambioCartelera } from '../services/notificaciones';
import { describirCambios } from '../lib/cambios';
import { entradasDeUsuario } from '../lib/nombres';

/**
 * Acciones sobre la cartelera con sus reglas de negocio:
 * quién figura como anfitrión, quién queda apuntado y a quién se notifica.
 */
export function useAccionesCartelera(usuario, sesiones) {
  const buscarSesion = (id) => sesiones.find((s) => s.id === id);

  /** `datos`: lo que rellena el formulario (título, fecha, nota...). */
  const crear = async (datos) => {
    const sesionId = await agregarSesion({
      ...datos,
      autor: usuario.nombre, // quien propone es el anfitrión...
      asistentes: [usuario.nombre], // ...y queda apuntado automáticamente
      creadoPor: usuario.nombre
    });
    avisarCambioCartelera({ tipo: 'nueva', sesionId });
  };

  // Al editar no se tocan anfitrión ni asistentes, para no perder a nadie
  const actualizar = async (id, datos) => {
    const anterior = buscarSesion(id);
    await actualizarSesion(id, { ...datos, editadoPor: usuario.nombre });

    const cambios = describirCambios(anterior, datos);
    if (cambios.length > 0) avisarCambioCartelera({ tipo: 'cambio', sesionId: id, cambios });
  };

  const eliminar = async (id) => {
    const sesion = buscarSesion(id);
    await eliminarSesion(id);

    if (sesion) {
      const { titulo, fechaHora, asistentes = [] } = sesion;
      avisarCambioCartelera({ tipo: 'eliminada', sesion: { titulo, fechaHora, asistentes } });
    }
  };

  const alternarAsistencia = (sesion) => {
    const misEntradas = entradasDeUsuario(sesion.asistentes, usuario.nombre);
    return misEntradas.length > 0
      ? desapuntarse(sesion.id, misEntradas)
      : apuntarse(sesion.id, usuario.nombre);
  };

  return { crear, actualizar, eliminar, alternarAsistencia };
}
