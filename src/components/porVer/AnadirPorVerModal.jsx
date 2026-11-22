import { useState } from 'react';
import { Sparkle } from '@phosphor-icons/react';
import Modal, { BotonCerrar } from '../ui/Modal';
import MensajeError from '../ui/MensajeError';
import { BOTON_PRINCIPAL } from '../ui/estilos';
import BuscadorTitulos from '../formulario/BuscadorTitulos';

/** Popup para añadir un título a la lista "Por ver". */
export default function AnadirPorVerModal({ abierto, onCerrar, onAnadir }) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      cerrarAlPulsarFuera={false}
      className="max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
    >
      <Formulario onCerrar={onCerrar} onAnadir={onAnadir} />
    </Modal>
  );
}

// Se monta al abrir el popup, así que siempre empieza vacío
function Formulario({ onCerrar, onAnadir }) {
  const [titulo, setTitulo] = useState(null);
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const anadir = async (e) => {
    e.preventDefault();
    if (!titulo) return;
    setGuardando(true);
    setError('');
    try {
      await onAnadir(titulo, nota);
      onCerrar();
    } catch (err) {
      setError(err.message || 'No se pudo añadir. Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/50">
        <div>
          <p className="font-mono-ticket text-[10px] uppercase tracking-widest text-amber-400">Sin fecha todavía</p>
          <h2 className="font-editorial text-2xl text-white leading-none">Añadir a Por ver</h2>
        </div>
        <BotonCerrar onClick={onCerrar} className="" />
      </div>

      <form onSubmit={anadir} className="p-6 overflow-y-auto space-y-5">
        <BuscadorTitulos
          seleccionado={titulo}
          onSeleccionar={(nuevo) => {
            setTitulo(nuevo);
            setError('');
          }}
          autoFocus
        />

        <label className="block">
          <span className="flex items-center gap-1.5 font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
            <Sparkle weight="duotone" className="w-4 h-4 text-amber-400" />
            Nota (opcional)
          </span>
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: en Prime Video / para un viernes"
            className="w-full bg-zinc-950 border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none"
          />
        </label>

        <MensajeError>{error}</MensajeError>

        <button
          type="submit"
          disabled={!titulo || guardando}
          className={`w-full text-sm py-3.5 disabled:opacity-30 ${BOTON_PRINCIPAL}`}
        >
          {guardando ? 'Añadiendo...' : 'Añadir a la lista'}
        </button>
      </form>
    </>
  );
}
