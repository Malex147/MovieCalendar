import { motion } from 'framer-motion';
import {
  Trash,
  PencilSimple,
  Television,
  FilmSlate,
  UserCircle,
  Sparkle,
  UsersThree,
  Check,
  HandWaving
} from '@phosphor-icons/react';

export default function SessionCard({
  sesion,
  usuarioActual,
  onToggleAsistencia,
  onEliminar,
  onEditar,
  index = 0
}) {
  const fechaObj = new Date(sesion.fechaHora);

  const diaSemana = fechaObj.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase();
  const diaNumero = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
  const horaTexto = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const esSerie = sesion.tipo === 'Serie';
  const asistentes = sesion.asistentes || [];
  const estoyApuntado = Boolean(usuarioActual && asistentes.includes(usuarioActual));

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative flex flex-col sm:flex-row rounded-3xl overflow-hidden bg-zinc-900/80 border border-white/10 hover:border-white/25 transition-colors shadow-2xl"
    >
      <img
        src={sesion.poster}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-15 blur-2xl scale-125 pointer-events-none group-hover:opacity-25 transition-opacity"
      />

      {/* Parte principal izquierda */}
      <div className="relative flex-1 flex gap-3.5 sm:gap-5 p-3.5 sm:p-5">
        <div className="relative shrink-0 self-start">
          <img
            src={sesion.poster}
            alt={sesion.titulo}
            className="w-20 sm:w-28 h-30 sm:h-40 object-cover rounded-2xl shadow-xl ring-1 ring-white/15 group-hover:scale-[1.03] transition-transform duration-300"
          />
          <span
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 font-mono-ticket text-[9px] sm:text-[10px] font-semibold uppercase px-2 sm:px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md ${
              esSerie
                ? 'bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-400/30'
                : 'bg-amber-950/90 text-amber-300 border border-amber-400/30'
            }`}
          >
            {esSerie ? <Television weight="fill" className="w-3 h-3" /> : <FilmSlate weight="fill" className="w-3 h-3" />}
            {sesion.tipo}
          </span>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2 font-mono-ticket text-[10px] sm:text-[11px] text-zinc-400 mb-1">
              <span></span>
              <span>•</span>
              <span>{sesion.anio || 'ESTRENO'}</span>
            </div>

            <h2 className="font-editorial text-xl sm:text-3xl text-white leading-tight line-clamp-2">
              {sesion.titulo}
            </h2>

            {sesion.nota && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-200/90 bg-amber-400/10 border border-amber-400/20 px-2.5 sm:px-3 py-1 rounded-full max-w-full">
                <Sparkle weight="fill" className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{sesion.nota}</span>
              </div>
            )}

            {sesion.autor && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] sm:text-xs text-zinc-400">
                <UserCircle weight="duotone" className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="truncate">
                  Propone: <strong className="text-zinc-200 font-semibold">{sesion.autor}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Bloque de Asistentes y Botón Me Apunto */}
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center gap-1 font-mono-ticket text-[10px] uppercase text-zinc-400 mr-0.5">
                <UsersThree weight="duotone" className="w-3.5 h-3.5 text-emerald-400" />
                {asistentes.length}
              </span>

              {asistentes.length === 0 ? (
                <span className="text-[11px] text-zinc-500 italic">
                  Nadie aún
                </span>
              ) : (
                asistentes.map((persona) => (
                  <span
                    key={persona}
                    className={`font-mono-ticket text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full border ${
                      persona === usuarioActual
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 font-semibold'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    {persona}
                  </span>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleAsistencia(sesion)}
              className={`shrink-0 inline-flex items-center gap-1.5 font-mono-ticket text-[11px] font-bold px-3 py-1.5 rounded-full transition cursor-pointer ${
                estoyApuntado
                  ? 'bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              {estoyApuntado ? (
                <>
                  <Check weight="bold" className="w-3.5 h-3.5" />
                  <span>Voy</span>
                </>
              ) : (
                <>
                  <HandWaving weight="duotone" className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Me apunto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Línea perforada divisoria */}
      <div className="relative flex sm:flex-col items-center justify-between px-4 sm:px-0 sm:py-4">
        <div className="w-5 h-5 rounded-full bg-[#08080a] -ml-6 sm:ml-0 sm:-mt-6 border border-white/10" />
        <div className="flex-1 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-white/15 w-full sm:w-0" />
        <div className="w-5 h-5 rounded-full bg-[#08080a] -mr-6 sm:mr-0 sm:-mb-6 border border-white/10" />
      </div>

      {/* Talón derecho / inferior en móvil */}
      <div className="relative sm:w-36 bg-black/30 px-4 py-3 sm:p-5 flex sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center">
        <div className="flex sm:block items-baseline gap-2.5">
          <span className="font-mono-ticket text-[11px] tracking-widest text-rose-400 font-semibold block">
            {diaSemana}
          </span>
          <span className="font-mono-ticket text-xs text-zinc-300 block sm:mt-0.5">
            {diaNumero}
          </span>
          <span className="font-mono-ticket text-xl sm:text-3xl font-bold text-white tracking-tight block sm:mt-1">
            {horaTexto}
          </span>
        </div>

        <div className="sm:mt-4 flex items-center gap-1.5">
          <button
            onClick={() => onEditar?.(sesion)}
            title="Editar pase"
            className="text-zinc-400 hover:text-amber-300 bg-white/5 hover:bg-amber-400/10 p-2 rounded-full transition cursor-pointer"
          >
            <PencilSimple weight="bold" className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onEliminar(sesion)}
            title="Eliminar pase"
            className="text-zinc-500 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 p-2 rounded-full transition cursor-pointer"
          >
            <Trash weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}