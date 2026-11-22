import { useState } from 'react';
import { BellRinging, SpinnerGap } from '@phosphor-icons/react';
import Modal, { CabeceraModal } from '../ui/Modal';
import MensajeError from '../ui/MensajeError';
import InstruccionesIOS from './InstruccionesIOS';
import { BOTON_PRINCIPAL, BOTON_SECUNDARIO } from '../ui/estilos';
import {
  avisoInicialPendiente,
  activarNotificaciones,
  rechazarAvisoInicial
} from '../../services/notificaciones';

/**
 * La primera vez que se entra desde un dispositivo, ofrece activar los avisos.
 * Se usa un popup propio con botón (y no el permiso del navegador directamente) porque
 * iPhone y Chrome solo permiten pedir permiso tras un clic del usuario.
 */
export default function AvisoNotificaciones() {
  const [modo] = useState(avisoInicialPendiente); // 'pedir' | 'instalar-ios' | null
  const [abierto, setAbierto] = useState(modo !== null);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState('');

  const cerrar = () => setAbierto(false);

  const rechazar = () => {
    rechazarAvisoInicial();
    cerrar();
  };

  const activar = async () => {
    setError('');
    setActivando(true);
    try {
      await activarNotificaciones();
      cerrar();
    } catch (err) {
      setError(err.message || 'No se pudieron activar los avisos.');
      setActivando(false);
    }
  };

  return (
    <Modal abierto={abierto} onCerrar={rechazar}>
      <CabeceraModal
        icono={BellRinging}
        colorIcono="bg-emerald-500/15 border-emerald-400/30 text-emerald-300"
        titulo="¿Te avisamos?"
        subtitulo="Recibe un aviso cuando alguien proponga una sesión nueva o cambie una a la que te has apuntado. Puedes quitarlo cuando quieras desde Ajustes de perfil."
      />

      {modo === 'instalar-ios' ? (
        <>
          <div className="mt-5">
            <InstruccionesIOS />
          </div>
          <button type="button" onClick={rechazar} className={`w-full mt-4 ${BOTON_SECUNDARIO}`}>
            Entendido
          </button>
        </>
      ) : (
        <>
          <MensajeError className="mt-4">{error}</MensajeError>
          <div className="grid grid-cols-2 gap-2.5 mt-5">
            <button type="button" onClick={rechazar} disabled={activando} className={BOTON_SECUNDARIO}>
              Ahora no
            </button>
            <button
              type="button"
              onClick={activar}
              disabled={activando}
              className={`text-xs py-2.5 px-4 rounded-xl disabled:opacity-50 ${BOTON_PRINCIPAL}`}
            >
              {activando && <SpinnerGap className="w-3.5 h-3.5 animate-spin" />}
              <span>Activar avisos</span>
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
