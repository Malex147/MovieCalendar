import { useState } from 'react';
import { Trash, Warning } from '@phosphor-icons/react';
import Modal, { BotonCerrar, CabeceraModal } from '../ui/Modal';
import MensajeError from '../ui/MensajeError';
import { BOTON_SECUNDARIO } from '../ui/estilos';
import { formatearDia, formatearHora } from '../../lib/fechas';
import { useUltimoValor } from '../../hooks/useUltimoValor';

/** Confirmación propia (en lugar de window.confirm) para anular una sesión. */
export default function ConfirmDeleteModal({ sesion, onCerrar, onConfirmar }) {
  const sesionVisible = useUltimoValor(sesion);

  return (
    <Modal abierto={Boolean(sesion)} onCerrar={onCerrar}>
      {sesionVisible && (
        <ContenidoConfirmacion sesion={sesionVisible} onCerrar={onCerrar} onConfirmar={onConfirmar} />
      )}
    </Modal>
  );
}

function ContenidoConfirmacion({ sesion, onCerrar, onConfirmar }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    setEliminando(true);
    setError('');
    try {
      await onConfirmar(sesion.id);
      onCerrar();
    } catch (err) {
      console.error('Error al anular la sesión:', err);
      setError('No se pudo anular la sesión. Inténtalo de nuevo.');
      setEliminando(false);
    }
  };

  return (
    <>
      <BotonCerrar onClick={onCerrar} />
      <CabeceraModal
        icono={Warning}
        colorIcono="bg-rose-500/15 border-rose-500/30 text-rose-400"
        titulo="¿Anular este pase?"
        subtitulo="Desaparecerá de la cartelera compartida de todo el grupo."
      />

      <div className="flex items-center gap-3 bg-zinc-950/90 border border-white/10 p-2.5 rounded-2xl my-5">
        <img src={sesion.poster} alt={sesion.titulo} className="w-10 h-14 object-cover rounded-xl shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{sesion.titulo}</p>
          <p className="font-mono-ticket text-[11px] text-zinc-400 mt-0.5">
            {formatearDia(sesion.fechaHora)} · {formatearHora(sesion.fechaHora)}
          </p>
        </div>
      </div>

      <MensajeError className="mb-3">{error}</MensajeError>

      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onCerrar} disabled={eliminando} className={BOTON_SECUNDARIO}>
          Mantener
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={eliminando}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
        >
          <Trash weight="bold" className="w-3.5 h-3.5" />
          <span>{eliminando ? 'Anulando...' : 'Sí, anular'}</span>
        </button>
      </div>
    </>
  );
}
