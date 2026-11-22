import { useState } from 'react';
import { Trash, Warning } from '@phosphor-icons/react';
import Modal, { BotonCerrar, CabeceraModal } from './Modal';
import MensajeError from './MensajeError';
import { BOTON_SECUNDARIO } from './estilos';
import { useUltimoValor } from '../../hooks/useUltimoValor';

/**
 * Confirmación propia (en lugar de window.confirm) para acciones destructivas.
 * Se abre cuando `elemento` no es null y muestra su póster y título como vista previa.
 */
export default function ModalConfirmacion({ elemento, onCerrar, onConfirmar, textos, detalle }) {
  const visible = useUltimoValor(elemento); // conserva el contenido durante la animación de cierre

  return (
    <Modal abierto={Boolean(elemento)} onCerrar={onCerrar}>
      {visible && (
        <Contenido
          elemento={visible}
          detalle={detalle?.(visible)}
          textos={textos}
          onCerrar={onCerrar}
          onConfirmar={onConfirmar}
        />
      )}
    </Modal>
  );
}

function Contenido({ elemento, detalle, textos, onCerrar, onConfirmar }) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const confirmar = async () => {
    setProcesando(true);
    setError('');
    try {
      await onConfirmar(elemento.id);
      onCerrar();
    } catch (err) {
      console.error(err);
      setError(textos.error);
      setProcesando(false);
    }
  };

  return (
    <>
      <BotonCerrar onClick={onCerrar} />
      <CabeceraModal
        icono={Warning}
        colorIcono="bg-rose-500/15 border-rose-500/30 text-rose-400"
        titulo={textos.titulo}
        subtitulo={textos.subtitulo}
      />

      <div className="flex items-center gap-3 bg-zinc-950/90 border border-white/10 p-2.5 rounded-2xl my-5">
        <img src={elemento.poster} alt={elemento.titulo} className="w-10 h-14 object-cover rounded-xl shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{elemento.titulo}</p>
          {detalle && <p className="font-mono-ticket text-[11px] text-zinc-400 mt-0.5">{detalle}</p>}
        </div>
      </div>

      <MensajeError className="mb-3">{error}</MensajeError>

      <div className="grid grid-cols-2 gap-2.5">
        <button type="button" onClick={onCerrar} disabled={procesando} className={BOTON_SECUNDARIO}>
          {textos.cancelar}
        </button>
        <button
          type="button"
          onClick={confirmar}
          disabled={procesando}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
        >
          <Trash weight="bold" className="w-3.5 h-3.5" />
          <span>{procesando ? textos.procesando : textos.confirmar}</span>
        </button>
      </div>
    </>
  );
}
