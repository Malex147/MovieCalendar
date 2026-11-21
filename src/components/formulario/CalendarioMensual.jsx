import { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { aDiaISO, celdasDelMes, hoyISO, primeroDeMes } from '../../lib/fechas';

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const BOTON_MES = 'p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer';

/** Calendario mensual propio (sin el selector nativo). `valor` y `onElegir` usan "YYYY-MM-DD". */
export default function CalendarioMensual({ valor, onElegir }) {
  const [mes, setMes] = useState(() => primeroDeMes(valor ? new Date(`${valor}T12:00`) : new Date()));
  const hoy = hoyISO();

  const cambiarMes = (delta) => setMes(new Date(mes.getFullYear(), mes.getMonth() + delta, 1));

  return (
    <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-white/15">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior" className={BOTON_MES}>
          <CaretLeft weight="bold" className="w-4 h-4" />
        </button>
        <span className="font-editorial text-xl text-white capitalize">
          {mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente" className={BOTON_MES}>
          <CaretRight weight="bold" className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="font-mono-ticket text-[10px] text-zinc-500 font-bold">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {celdasDelMes(mes).map((celda, i) => {
          if (!celda) return <div key={`hueco-${i}`} />;
          const iso = aDiaISO(celda);
          const seleccionado = iso === valor;

          return (
            <button
              type="button"
              key={iso}
              onClick={() => onElegir(iso)}
              aria-pressed={seleccionado}
              className={`h-9 rounded-xl font-mono-ticket text-xs font-semibold transition cursor-pointer ${
                seleccionado
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : iso === hoy
                    ? 'bg-white/10 text-amber-300 border border-amber-400/40'
                    : 'text-zinc-300 hover:bg-white/10'
              }`}
            >
              {celda.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
