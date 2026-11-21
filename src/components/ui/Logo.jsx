import { FilmStrip } from '@phosphor-icons/react';

const TAMANOS = {
  normal: 'w-9 h-9 sm:w-10 sm:h-10 shadow-rose-500/20',
  grande: 'w-12 h-12 shadow-rose-500/25'
};

/** Icono de la marca: tira de película sobre el degradado rosa-ámbar. */
export default function Logo({ tamano = 'normal', className = '' }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-zinc-950 shadow-lg shrink-0 ${TAMANOS[tamano]} ${className}`}
    >
      <FilmStrip weight="fill" className={tamano === 'grande' ? 'w-6 h-6' : 'w-5 h-5'} />
    </div>
  );
}
