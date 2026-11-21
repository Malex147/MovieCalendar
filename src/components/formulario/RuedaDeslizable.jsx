import { useEffect, useRef } from 'react';

const ALTURA_ITEM = 38;
// El valor se confirma cuando el scroll se detiene, no en cada posición intermedia
const ESPERA_FIN_SCROLL_MS = 120;

/** Rueda vertical para elegir un valor (horas, minutos...). Admite scroll, toque, clic y arrastre con ratón. */
export default function RuedaDeslizable({ items, valorActual, onChange, etiqueta }) {
  const contenedorRef = useRef(null);
  const arrastreRef = useRef({ activo: false, inicioY: 0, scrollInicial: 0 });
  const montadaRef = useRef(false);
  const finScrollRef = useRef(null);

  const desplazarA = (indice, behavior = 'smooth') =>
    contenedorRef.current?.scrollTo({ top: indice * ALTURA_ITEM, behavior });

  // Centrar el valor elegido: al abrir, de golpe; después (p. ej. un atajo de hora), con animación
  useEffect(() => {
    const indice = items.indexOf(valorActual);
    if (indice !== -1 && !arrastreRef.current.activo) {
      desplazarA(indice, montadaRef.current ? 'smooth' : 'instant');
      montadaRef.current = true;
    }
  }, [valorActual, items]);

  useEffect(() => () => clearTimeout(finScrollRef.current), []);

  const alHacerScroll = () => {
    clearTimeout(finScrollRef.current);
    finScrollRef.current = setTimeout(() => {
      const contenedor = contenedorRef.current;
      if (!contenedor) return;
      const indice = Math.round(contenedor.scrollTop / ALTURA_ITEM);
      const item = items[Math.max(0, Math.min(items.length - 1, indice))];
      if (item && item !== valorActual) onChange(item);
    }, ESPERA_FIN_SCROLL_MS);
  };

  const alPresionar = (e) => {
    arrastreRef.current = { activo: true, inicioY: e.pageY, scrollInicial: contenedorRef.current.scrollTop };
  };

  const alMover = (e) => {
    const arrastre = arrastreRef.current;
    if (!arrastre.activo || !contenedorRef.current) return;
    e.preventDefault();
    contenedorRef.current.scrollTop = arrastre.scrollInicial - (e.pageY - arrastre.inicioY);
  };

  const alSoltar = () => {
    arrastreRef.current.activo = false;
  };

  return (
    <div className="relative h-[152px] w-20 overflow-hidden select-none" role="listbox" aria-label={etiqueta}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[38px] rounded-xl bg-amber-400/15 border border-amber-400/40 z-0" />

      <div
        ref={contenedorRef}
        onScroll={alHacerScroll}
        onMouseDown={alPresionar}
        onMouseMove={alMover}
        onMouseUp={alSoltar}
        onMouseLeave={alSoltar}
        className="h-full overflow-y-scroll snap-y snap-proximity py-[57px] cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, indice) => {
          const activo = item === valorActual;
          return (
            <button
              type="button"
              key={item}
              role="option"
              aria-selected={activo}
              onClick={() => {
                onChange(item);
                desplazarA(indice);
              }}
              className={`h-[38px] w-full flex items-center justify-center snap-center font-mono-ticket transition-all cursor-pointer ${
                activo ? 'text-xl font-bold text-amber-300 scale-110' : 'text-sm text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
