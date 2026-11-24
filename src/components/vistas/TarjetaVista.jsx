import { motion } from 'framer-motion';
import { ArrowCounterClockwise, Trash, UsersThree } from '@phosphor-icons/react';
import { mismoNombre } from '../../lib/nombres';
import { formatearDia } from '../../lib/fechas';

/** Título ya visto: póster, cuándo y con quién. Se puede devolver a la cartelera o borrar. */
export default function TarjetaVista({ sesion, usuarioActual, onDesmarcar, onBorrar }) {
  const asistentes = sesion.asistentes || [];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-lg"
    >
      <div className="relative aspect-[2/3]">
        <img
          src={sesion.poster}
          alt={sesion.titulo}
          className="w-full h-full object-cover saturate-[.85] group-hover:saturate-100 transition"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <span className="absolute top-2 left-2 font-mono-ticket text-[10px] font-bold bg-emerald-400 text-zinc-950 px-2 py-0.5 rounded-full">
          VISTA · {formatearDia(sesion.fechaHora).toUpperCase()}
        </span>

        <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
          <button
            type="button"
            onClick={() => onDesmarcar(sesion)}
            title="No la hemos visto: volver a la cartelera"
            aria-label={`Desmarcar ${sesion.titulo} como vista`}
            className="p-1.5 rounded-full bg-black/75 text-zinc-300 hover:text-amber-300 transition cursor-pointer"
          >
            <ArrowCounterClockwise weight="bold" className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onBorrar(sesion)}
            title="Borrar del historial"
            aria-label={`Borrar ${sesion.titulo} del historial`}
            className="p-1.5 rounded-full bg-black/75 text-zinc-300 hover:text-rose-400 transition cursor-pointer"
          >
            <Trash weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{sesion.titulo}</p>
          <p className="font-mono-ticket text-[10px] text-zinc-400 mt-0.5">
            {sesion.tipo} · {sesion.anio}
          </p>
          {asistentes.length > 0 && (
            <p className="flex items-start gap-1 mt-1.5 text-[10px] text-zinc-300" title={asistentes.join(', ')}>
              <UsersThree weight="fill" className="w-3 h-3 text-emerald-400 shrink-0 mt-px" />
              <span className="line-clamp-2">
                {asistentes.map((persona, i) => (
                  <span key={persona} className={mismoNombre(persona, usuarioActual) ? 'text-emerald-300 font-semibold' : ''}>
                    {i > 0 && ', '}
                    {persona}
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
