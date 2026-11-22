import { motion } from 'framer-motion';
import { CalendarPlus, Sparkle, Trash, UserCircle } from '@phosphor-icons/react';
import BotonAsistencia from '../sesiones/BotonAsistencia';
import { estaApuntado, mismoNombre } from '../../lib/nombres';

/** Título de la lista "Por ver": póster, quién lo propone, quién tiene interés y acciones. */
export default function TarjetaPorVer({ pendiente, usuarioActual, onAlternarInteres, onProgramar, onQuitar }) {
  const interesados = pendiente.interesados || [];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex sm:flex-col gap-3.5 sm:gap-0 p-3 sm:p-0 rounded-3xl overflow-hidden bg-zinc-900/80 border border-white/10 hover:border-white/25 transition-colors shadow-xl"
    >
      {/* Póster: pequeño a la izquierda en móvil, arriba en PC */}
      <div className="relative shrink-0 w-20 sm:w-full aspect-[2/3] sm:aspect-[16/10] overflow-hidden rounded-2xl sm:rounded-none">
        <img
          src={pendiente.poster}
          alt={pendiente.titulo}
          className="w-full h-full object-cover sm:object-top group-hover:scale-105 transition-transform duration-300"
        />
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />
        <button
          type="button"
          onClick={() => onQuitar(pendiente)}
          title="Quitar de la lista"
          aria-label={`Quitar ${pendiente.titulo} de la lista`}
          className="hidden sm:flex absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-zinc-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
        >
          <Trash weight="bold" className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:p-4 sm:pt-1">
        <p className="font-mono-ticket text-[10px] uppercase text-zinc-400">
          {pendiente.tipo} · {pendiente.anio}
        </p>
        <h3 className="font-editorial text-xl text-white leading-tight line-clamp-2 mt-0.5">{pendiente.titulo}</h3>

        {pendiente.nota && (
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-amber-200/90 max-w-full">
            <Sparkle weight="fill" className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{pendiente.nota}</span>
          </p>
        )}

        <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-zinc-400 min-w-0">
          <UserCircle weight="duotone" className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">
            Propone: <strong className="text-zinc-200 font-semibold">{pendiente.propuestoPor}</strong>
          </span>
        </p>

        {/* Interesados */}
        <div className="flex flex-wrap gap-1 mt-2.5">
          {interesados.map((persona) => (
            <span
              key={persona}
              className={`font-mono-ticket text-[10px] px-2 py-0.5 rounded-full border ${
                mismoNombre(persona, usuarioActual)
                  ? 'bg-amber-400/20 border-amber-400/40 text-amber-200 font-semibold'
                  : 'bg-white/5 border-white/10 text-zinc-300'
              }`}
            >
              {persona}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-auto pt-3">
          <BotonAsistencia
            variante="interes"
            apuntado={estaApuntado(interesados, usuarioActual)}
            onClick={() => onAlternarInteres(pendiente)}
          />
          <button
            type="button"
            onClick={() => onProgramar(pendiente)}
            className="inline-flex items-center gap-1.5 font-mono-ticket text-[11px] font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 hover:opacity-95 transition cursor-pointer"
          >
            <CalendarPlus weight="bold" className="w-3.5 h-3.5" />
            Programar
          </button>
          <button
            type="button"
            onClick={() => onQuitar(pendiente)}
            aria-label={`Quitar ${pendiente.titulo} de la lista`}
            className="sm:hidden ml-auto p-2 rounded-full bg-white/5 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
          >
            <Trash weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
