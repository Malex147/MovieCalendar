import RuedaDeslizable from './RuedaDeslizable';

const dosCifras = (n) => String(n).padStart(2, '0');
const HORAS = Array.from({ length: 24 }, (_, i) => dosCifras(i));
const MINUTOS = Array.from({ length: 60 }, (_, i) => dosCifras(i));
const ATAJOS = ['18:00', '20:30', '21:30', '22:00', '22:30'];

/**
 * Selector de hora con atajos rápidos y dos ruedas (horas y minutos).
 * `onCambiar` recibe solo los campos que cambian ({ hora }, { minuto } o ambos).
 */
export default function SelectorHora({ hora, minuto, onCambiar, onListo }) {
  return (
    <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-white/15 flex flex-col items-center">
      <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
        Atajos o desliza la rueda
      </span>

      <div className="flex flex-wrap justify-center gap-1.5 mb-3">
        {ATAJOS.map((atajo) => {
          const [h, m] = atajo.split(':');
          const esActual = hora === h && minuto === m;
          return (
            <button
              type="button"
              key={atajo}
              onClick={() => onCambiar({ hora: h, minuto: m })}
              className={`font-mono-ticket text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                esActual
                  ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              {atajo}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3">
        <RuedaDeslizable
          etiqueta="Hora"
          items={HORAS}
          valorActual={hora}
          onChange={(h) => onCambiar({ hora: h })}
        />
        <span className="font-mono-ticket text-2xl font-bold text-amber-400 pb-1">:</span>
        <RuedaDeslizable
          etiqueta="Minutos"
          items={MINUTOS}
          valorActual={minuto}
          onChange={(m) => onCambiar({ minuto: m })}
        />
      </div>

      <button
        type="button"
        onClick={onListo}
        className="mt-3 font-mono-ticket text-[11px] uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-full transition cursor-pointer"
      >
        Listo
      </button>
    </div>
  );
}
