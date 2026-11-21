import { useState } from 'react';
import { GearSix, User, Check, SpinnerGap } from '@phosphor-icons/react';
import Modal, { BotonCerrar, CabeceraModal } from '../ui/Modal';
import MensajeError from '../ui/MensajeError';
import { BOTON_SECUNDARIO, CAMPO_TEXTO, ETIQUETA_CAMPO } from '../ui/estilos';
import NotificacionesAjuste from './NotificacionesAjuste';

/** Ajustes de perfil: cambiar el nombre único y activar las notificaciones. */
export default function SettingsModal({ abierto, onCerrar, usuario, onGuardarNombre }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar}>
      <BotonCerrar onClick={onCerrar} />
      <CabeceraModal
        icono={GearSix}
        colorIcono="bg-amber-400/15 border-amber-400/30 text-amber-300"
        titulo="Ajustes de perfil"
        subtitulo="Cambia tu nombre único. Se actualizará también en las sesiones a las que estés apuntado."
      />
      <FormularioNombre nombreActual={usuario.nombre} onGuardar={onGuardarNombre} onCerrar={onCerrar} />
      <NotificacionesAjuste />
    </Modal>
  );
}

// Se monta al abrir el popup, así que siempre empieza con el nombre actual
function FormularioNombre({ nombreActual, onGuardar, onCerrar }) {
  const [nombre, setNombre] = useState(nombreActual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const sinCambios = !nombre.trim() || nombre.trim() === nombreActual;

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await onGuardar(nombre);
      onCerrar();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el nombre.');
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="mt-5 space-y-4">
      <label className="block">
        <span className={ETIQUETA_CAMPO}>Nombre de usuario</span>
        <span className="relative block">
          <User weight="duotone" className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nuevo nombre"
            className={`${CAMPO_TEXTO} focus:border-amber-400 pl-10 pr-4`}
          />
        </span>
      </label>

      <MensajeError>{error}</MensajeError>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button type="button" onClick={onCerrar} disabled={guardando} className={BOTON_SECUNDARIO}>
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando || sinCambios}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-35 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20"
        >
          {guardando ? <SpinnerGap className="w-3.5 h-3.5 animate-spin" /> : <Check weight="bold" className="w-3.5 h-3.5" />}
          <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>
    </form>
  );
}
