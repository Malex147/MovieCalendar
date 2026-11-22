import { Check, HandWaving } from '@phosphor-icons/react';

// Cada variante define su tamaño, sus colores y el texto cuando aún no estás apuntado
const VARIANTES = {
  ticket: {
    base: 'shrink-0 inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5',
    apuntado: 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-300',
    libre: 'bg-white/10 hover:bg-white/20 text-white border border-white/15',
    icono: 'w-3.5 h-3.5',
    textoLibre: (
      <>
        <HandWaving weight="duotone" className="w-3.5 h-3.5 text-emerald-300" />
        <span>Me apunto</span>
      </>
    )
  },
  compacto: {
    base: 'text-[10px] px-2.5 py-1',
    apuntado: 'bg-emerald-400 text-zinc-950',
    libre: 'bg-white/10 hover:bg-white/20 text-white border border-white/10',
    icono: 'w-3 h-3',
    textoLibre: '+ Me apunto'
  },
  mini: {
    base: 'text-[10px] px-2 py-0.5',
    apuntado: 'bg-emerald-400 text-zinc-950',
    libre: 'bg-white/15 hover:bg-white/25 text-white',
    icono: 'w-2.5 h-2.5',
    textoLibre: '+ Ir'
  },
  // Lista "Por ver": interés en un título, no compromiso de asistir
  interes: {
    base: 'shrink-0 text-[11px] px-3 py-1.5',
    apuntado: 'bg-amber-400 text-zinc-950 hover:bg-amber-300',
    libre: 'bg-white/10 hover:bg-white/20 text-white border border-white/15',
    icono: 'w-3.5 h-3.5',
    textoLibre: '+ Me interesa',
    textoApuntado: 'Me interesa'
  }
};

/** Botón de apuntarse ("Me apunto" / "Voy") o de interés ("Me interesa"), según la variante. */
export default function BotonAsistencia({ apuntado, onClick, variante = 'ticket' }) {
  const estilo = VARIANTES[variante];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={apuntado}
      className={`font-mono-ticket font-bold rounded-full transition cursor-pointer ${estilo.base} ${
        apuntado ? estilo.apuntado : estilo.libre
      }`}
    >
      {apuntado ? (
        <span className="inline-flex items-center gap-1">
          <Check weight="bold" className={estilo.icono} />
          <span>{estilo.textoApuntado ?? 'Voy'}</span>
        </span>
      ) : (
        estilo.textoLibre
      )}
    </button>
  );
}
