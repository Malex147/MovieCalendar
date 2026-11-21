// Clases de Tailwind reutilizadas en varios componentes, para mantener un único estilo.

export const ETIQUETA_CAMPO =
  'block font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5';

export const CAMPO_TEXTO =
  'w-full bg-zinc-950 border border-white/10 rounded-2xl py-3 text-sm text-white placeholder-zinc-500 outline-none transition';

export const BOTON_PRINCIPAL =
  'flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-zinc-950 font-bold rounded-2xl transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:cursor-not-allowed';

export const BOTON_SECUNDARIO =
  'py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs transition cursor-pointer';

/** Botón de un selector segmentado (Tickets/Semana, Entrar/Crear cuenta...). */
export const opcionSegmentada = (activa) =>
  `font-mono-ticket text-xs transition cursor-pointer ${
    activa ? 'bg-white text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'
  }`;
