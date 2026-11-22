import { useEffect, useState } from 'react';
import { BellRinging, BellSlash, SpinnerGap } from '@phosphor-icons/react';
import MensajeError from '../ui/MensajeError';
import InstruccionesIOS from './InstruccionesIOS';
import {
  obtenerEstadoNotificaciones,
  activarNotificaciones,
  desactivarNotificaciones
} from '../../services/notificaciones';

/** Interruptor de avisos de este dispositivo, dentro de Ajustes de perfil. */
export default function NotificacionesAjuste() {
  // cargando | activado | desactivado | sin-decidir | bloqueado | no-soportado | instalar-ios
  const [estado, setEstado] = useState('cargando');
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    obtenerEstadoNotificaciones().then((nuevo) => {
      if (!cancelado) setEstado(nuevo);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  const alternar = async () => {
    setError('');
    setTrabajando(true);
    try {
      if (estado === 'activado') {
        await desactivarNotificaciones();
        setEstado('desactivado');
      } else {
        await activarNotificaciones();
        setEstado('activado');
      }
    } catch (err) {
      setError(err.message || 'No se pudo cambiar el ajuste.');
      setEstado(await obtenerEstadoNotificaciones());
    } finally {
      setTrabajando(false);
    }
  };

  const activado = estado === 'activado';
  const puedeAlternar = ['activado', 'desactivado', 'sin-decidir'].includes(estado);

  return (
    <div className="mt-6 pt-5 border-t border-white/10">
      <p className="font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-400 mb-2">
        Notificaciones en este dispositivo
      </p>

      {estado === 'instalar-ios' ? (
        <InstruccionesIOS />
      ) : estado === 'no-soportado' ? (
        <p className="text-xs text-zinc-500">Este navegador no admite notificaciones.</p>
      ) : estado === 'bloqueado' ? (
        <p className="text-xs text-zinc-400">
          Has bloqueado las notificaciones para esta web. Permítelas desde los ajustes del navegador y vuelve aquí.
        </p>
      ) : (
        <button
          type="button"
          onClick={alternar}
          disabled={trabajando || !puedeAlternar}
          className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition cursor-pointer disabled:opacity-60 ${
            activado
              ? 'bg-emerald-500/10 border-emerald-400/30'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <span className="flex items-center gap-2.5 text-left">
            {activado ? (
              <BellRinging weight="duotone" className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <BellSlash weight="duotone" className="w-5 h-5 text-zinc-400 shrink-0" />
            )}
            <span>
              <span className="block text-sm text-white font-semibold">
                {activado ? 'Avisos activados' : 'Activar avisos'}
              </span>
              <span className="block text-[11px] text-zinc-400">
                Nuevas sesiones y cambios en las que te apuntes
              </span>
            </span>
          </span>

          {trabajando || estado === 'cargando' ? (
            <SpinnerGap className="w-4 h-4 animate-spin text-zinc-400 shrink-0" />
          ) : (
            <span
              className={`relative w-10 h-6 rounded-full shrink-0 transition-colors ${
                activado ? 'bg-emerald-400' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  activado ? 'left-5' : 'left-1'
                }`}
              />
            </span>
          )}
        </button>
      )}

      <MensajeError className="mt-2">{error}</MensajeError>
    </div>
  );
}
