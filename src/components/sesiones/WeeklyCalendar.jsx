import { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import TarjetaSesionSemana from './TarjetaSesionSemana';
import { aDiaISO, hoyISO, lunesDeSemana, sumarDias } from '../../lib/fechas';

const DIAS_POR_SEMANA = 7;
const BOTON_NAVEGACION = 'bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer';

/** Parrilla semanal: 7 columnas en PC, lista de días en móvil. */
export default function WeeklyCalendar({ sesiones, ...propsTarjeta }) {
  const [lunes, setLunes] = useState(() => lunesDeSemana(new Date()));

  const dias = Array.from({ length: DIAS_POR_SEMANA }, (_, i) => sumarDias(lunes, i));
  const hoy = hoyISO();
  const formatoRango = { day: 'numeric', month: 'short' };
  const rango = `${lunes.toLocaleDateString('es-ES', formatoRango)} — ${dias[6].toLocaleDateString('es-ES', formatoRango)}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-zinc-900/60 border border-white/10 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLunes(sumarDias(lunes, -DIAS_POR_SEMANA))}
            aria-label="Semana anterior"
            className={`p-2 text-white ${BOTON_NAVEGACION}`}
          >
            <CaretLeft weight="bold" className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setLunes(lunesDeSemana(new Date()))}
            className={`font-mono-ticket text-xs px-3 py-2 text-zinc-200 ${BOTON_NAVEGACION}`}
          >
            HOY
          </button>
          <button
            type="button"
            onClick={() => setLunes(sumarDias(lunes, DIAS_POR_SEMANA))}
            aria-label="Semana siguiente"
            className={`p-2 text-white ${BOTON_NAVEGACION}`}
          >
            <CaretRight weight="bold" className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-editorial text-xl sm:text-3xl text-white capitalize">{rango}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {dias.map((dia) => {
          const diaISO = aDiaISO(dia);
          return (
            <ColumnaDia
              key={diaISO}
              dia={dia}
              esHoy={diaISO === hoy}
              sesiones={sesiones.filter((s) => s.fechaHora.startsWith(diaISO))}
              propsTarjeta={propsTarjeta}
            />
          );
        })}
      </div>
    </div>
  );
}

function ColumnaDia({ dia, esHoy, sesiones, propsTarjeta }) {
  return (
    <div
      className={`rounded-3xl p-3 border transition flex flex-col min-h-[100px] md:min-h-[340px] ${
        esHoy
          ? 'bg-gradient-to-b from-rose-500/15 to-zinc-900/60 border-rose-500/40'
          : 'bg-zinc-900/40 border-white/10'
      }`}
    >
      <div className="flex md:flex-col items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
        <span className="font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400">
          {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
        </span>
        <span
          className={`font-mono-ticket text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center md:mt-0.5 ${
            esHoy ? 'bg-rose-500 text-white' : 'text-zinc-200'
          }`}
        >
          {dia.getDate()}
        </span>
      </div>

      <div className="flex-1 space-y-2.5">
        {sesiones.length === 0 ? (
          <div className="h-full flex items-center justify-center py-3 md:py-4">
            <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-700">
              Sin pase
            </span>
          </div>
        ) : (
          sesiones.map((sesion) => <TarjetaSesionSemana key={sesion.id} sesion={sesion} {...propsTarjeta} />)
        )}
      </div>
    </div>
  );
}
