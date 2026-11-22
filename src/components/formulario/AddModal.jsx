import { useState } from 'react';
import { CalendarBlank, Clock, UserCircle, Sparkle } from '@phosphor-icons/react';
import Modal, { BotonCerrar } from '../ui/Modal';
import MensajeError from '../ui/MensajeError';
import { BOTON_PRINCIPAL } from '../ui/estilos';
import BuscadorTitulos from './BuscadorTitulos';
import CalendarioMensual from './CalendarioMensual';
import SelectorHora from './SelectorHora';
import { BotonDesplegable, PanelDesplegable } from './CampoDesplegable';
import { formatearDia, hoyISO, separarFechaHora, unirFechaHora } from '../../lib/fechas';

const HORA_POR_DEFECTO = { hora: '22', minuto: '00' };
const ETIQUETA_SECCION = 'block font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-2';
const ETIQUETA_CON_ICONO =
  'flex items-center gap-1.5 font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5';

/**
 * Popup para crear o editar una sesión.
 * `plantilla` ({ titulo, nota }) rellena una sesión nueva, p. ej. al programar desde "Por ver".
 */
export default function AddModal({ abierto, onCerrar, onCrear, onActualizar, sesionAEditar, plantilla, anfitrion }) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      cerrarAlPulsarFuera={false}
      className="max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
    >
      <FormularioSesion
        sesionAEditar={sesionAEditar}
        plantilla={plantilla}
        anfitrion={anfitrion}
        onCerrar={onCerrar}
        onCrear={onCrear}
        onActualizar={onActualizar}
      />
    </Modal>
  );
}

/** Estado inicial: la sesión que se edita, o una nueva (vacía o a partir de una plantilla). */
const estadoInicial = (sesion, plantilla) => {
  if (!sesion) {
    return {
      titulo: plantilla?.titulo ?? null,
      dia: hoyISO(),
      ...HORA_POR_DEFECTO,
      nota: plantilla?.nota ?? ''
    };
  }

  const { dia, hora, minuto } = separarFechaHora(sesion.fechaHora);
  const { tmdbId, titulo, tipo, anio, poster } = sesion;
  return {
    titulo: { tmdbId, titulo, tipo, anio, poster },
    dia,
    hora: hora || HORA_POR_DEFECTO.hora,
    minuto: minuto || HORA_POR_DEFECTO.minuto,
    nota: sesion.nota || ''
  };
};

// Se monta cada vez que se abre el popup, así que su estado empieza siempre limpio
function FormularioSesion({ sesionAEditar, plantilla, anfitrion, onCerrar, onCrear, onActualizar }) {
  const esEdicion = Boolean(sesionAEditar);
  const [form, setForm] = useState(() => estadoInicial(sesionAEditar, plantilla));
  // Si el título ya viene elegido (desde "Por ver"), se abre directamente el calendario
  const [panelAbierto, setPanelAbierto] = useState(plantilla ? 'calendario' : null); // null | 'calendario' | 'reloj'
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const actualizar = (cambios) => setForm((actual) => ({ ...actual, ...cambios }));
  const alternarPanel = (panel) => setPanelAbierto((actual) => (actual === panel ? null : panel));

  const horaTexto = `${form.hora}:${form.minuto}`;
  const puedeGuardar = Boolean(form.titulo && form.dia) && !guardando;

  const guardar = async (e) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setGuardando(true);
    setError('');
    const { tmdbId, titulo, tipo, anio, poster } = form.titulo;
    const datos = {
      tmdbId,
      titulo,
      tipo,
      anio,
      poster,
      fechaHora: unirFechaHora(form.dia, form.hora, form.minuto),
      nota: form.nota.trim()
    };

    try {
      if (esEdicion) await onActualizar(sesionAEditar.id, datos);
      else await onCrear(datos);
      onCerrar();
    } catch (err) {
      console.error('Error al guardar la sesión:', err);
      setError('No se pudieron guardar los cambios. Revisa tu conexión e inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  const textoBoton = guardando
    ? 'Guardando...'
    : `${esEdicion ? 'Guardar cambios' : 'Confirmar pase'} · ${horaTexto}`;

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/50">
        <div>
          <p className="font-mono-ticket text-[10px] uppercase tracking-widest text-rose-400">
            {esEdicion ? 'Modificar Pase' : 'Taquilla'}
          </p>
          <h2 className="font-editorial text-2xl text-white leading-none">
            {esEdicion ? 'Editar sesión' : 'Programar nueva sesión'}
          </h2>
        </div>
        <BotonCerrar onClick={onCerrar} className="" />
      </div>

      <form onSubmit={guardar} className="p-6 overflow-y-auto space-y-5">
        {/* 1. Película o serie */}
        <div>
          <span className={ETIQUETA_SECCION}>01. Película o Serie</span>
          <BuscadorTitulos
            seleccionado={form.titulo}
            onSeleccionar={(titulo) => actualizar({ titulo })}
            autoFocus={!esEdicion}
          />
        </div>

        {/* 2. Fecha y hora */}
        <div>
          <span className={ETIQUETA_SECCION}>02. Fecha y Hora de inicio</span>

          <div className="grid grid-cols-2 gap-3">
            <BotonDesplegable
              activo={panelAbierto === 'calendario'}
              onClick={() => alternarPanel('calendario')}
              icono={CalendarBlank}
              etiqueta="Día"
              colores={{ activo: 'bg-rose-500/15 border-rose-500 text-white', icono: 'text-rose-400' }}
            >
              <span className="block text-xs sm:text-sm font-semibold capitalize truncate">
                {formatearDia(form.dia, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </BotonDesplegable>

            <BotonDesplegable
              activo={panelAbierto === 'reloj'}
              onClick={() => alternarPanel('reloj')}
              icono={Clock}
              etiqueta="Hora"
              colores={{ activo: 'bg-amber-500/15 border-amber-400 text-white', icono: 'text-amber-400' }}
            >
              <span className="block font-mono-ticket text-sm sm:text-base font-bold text-amber-300">
                {horaTexto}
              </span>
            </BotonDesplegable>
          </div>

          <PanelDesplegable abierto={panelAbierto === 'calendario'}>
            <CalendarioMensual
              valor={form.dia}
              onElegir={(dia) => {
                actualizar({ dia });
                setPanelAbierto('reloj');
              }}
            />
          </PanelDesplegable>

          <PanelDesplegable abierto={panelAbierto === 'reloj'}>
            <SelectorHora
              hora={form.hora}
              minuto={form.minuto}
              onCambiar={actualizar}
              onListo={() => setPanelAbierto(null)}
            />
          </PanelDesplegable>
        </div>

        {/* 3. Anfitrión y nota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <span className={ETIQUETA_CON_ICONO}>
              <UserCircle weight="duotone" className="w-4 h-4 text-rose-400" />
              Anfitrión
            </span>
            <p
              title="Se rellena automáticamente con quien propone la sesión"
              className="w-full bg-zinc-950/60 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-zinc-300 truncate"
            >
              {anfitrion || '—'}
            </p>
          </div>

          <label className="block">
            <span className={ETIQUETA_CON_ICONO}>
              <Sparkle weight="duotone" className="w-4 h-4 text-amber-400" />
              Nota / Plataforma
            </span>
            <input
              type="text"
              value={form.nota}
              onChange={(e) => actualizar({ nota: e.target.value })}
              placeholder="Ej: T1 Ep 4 / Discord"
              className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none"
            />
          </label>
        </div>

        <MensajeError>{error}</MensajeError>

        <button
          type="submit"
          disabled={!puedeGuardar}
          className={`w-full text-sm py-3.5 disabled:opacity-30 ${BOTON_PRINCIPAL}`}
        >
          {textoBoton}
        </button>
      </form>
    </>
  );
}
