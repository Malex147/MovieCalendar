import ModalConfirmacion from '../ui/ModalConfirmacion';
import { formatearDia, formatearHora } from '../../lib/fechas';

const TEXTOS = {
  titulo: '¿Anular este pase?',
  subtitulo: 'Desaparecerá de la cartelera compartida de todo el grupo.',
  cancelar: 'Mantener',
  confirmar: 'Sí, anular',
  procesando: 'Anulando...',
  error: 'No se pudo anular la sesión. Inténtalo de nuevo.'
};

const detalleSesion = (sesion) => `${formatearDia(sesion.fechaHora)} · ${formatearHora(sesion.fechaHora)}`;

/** Confirmación para anular una sesión de la cartelera. */
export default function ConfirmDeleteModal({ sesion, onCerrar, onConfirmar }) {
  return (
    <ModalConfirmacion
      elemento={sesion}
      onCerrar={onCerrar}
      onConfirmar={onConfirmar}
      textos={TEXTOS}
      detalle={detalleSesion}
    />
  );
}
