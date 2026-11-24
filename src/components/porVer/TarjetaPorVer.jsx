import { Reorder, useDragControls } from 'framer-motion';
import { CalendarPlus, DotsSixVertical, Eye, Sparkle, Trash, UserCircle } from '@phosphor-icons/react';
import BotonAsistencia from '../sesiones/BotonAsistencia';
import { estaApuntado, mismoNombre } from '../../lib/nombres';

const BOTON_ICONO = 'p-1.5 rounded-full bg-black/75 text-zinc-300 transition cursor-pointer';

/**
 * Título de la lista "Por ver". Se arrastra solo desde el asa (para no impedir el scroll
 * en el móvil); con teclado: enfocar la tarjeta, Espacio para cogerla, flechas y Espacio para soltar.
 */
export default function TarjetaPorVer({
  pendiente,
  posicion,
  usuarioActual,
  onAlternarInteres,
  onProgramar,
  onQuitar,
  onMarcarVisto,
  onEmpezarArrastre,
  onSoltar
}) {
  const controles = useDragControls();
  const interesados = pendiente.interesados || [];

  return (
    <Reorder.Item
      value={pendiente.id}
      dragListener={false}
      dragControls={controles}
      onDragStart={onEmpezarArrastre}
      onDragEnd={onSoltar}
      whileDrag={{ scale: 1.03, boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.35)' }}
      aria-roledescription="título reordenable"
      aria-label={`Número ${posicion}: ${pendiente.titulo}. Pulsa Espacio para moverlo.`}
      className="group relative flex sm:flex-col gap-3.5 sm:gap-0 p-3 sm:p-0 rounded-3xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-white/25 focus-visible:outline-2 focus-visible:outline-rose-400 transition-colors shadow-xl"
    >
      {/* Póster: pequeño a la izquierda en móvil, arriba en PC */}
      <div className="relative shrink-0 w-20 sm:w-full aspect-[2/3] sm:aspect-[16/10] overflow-hidden rounded-2xl sm:rounded-none">
        <img
          src={pendiente.poster}
          alt=""
          draggable={false}
          className="w-full h-full object-cover sm:object-top pointer-events-none"
        />
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 font-mono-ticket text-[11px] font-bold min-w-6 h-6 px-1.5 flex items-center justify-center rounded-full bg-rose-500 text-white shadow">
          {posicion}
        </span>

        <div className="hidden sm:flex absolute top-2 right-2 gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition">
          <button
            type="button"
            onClick={() => onMarcarVisto(pendiente)}
            title="Ya la vimos"
            aria-label={`Marcar ${pendiente.titulo} como vista`}
            className={`${BOTON_ICONO} hover:text-emerald-300`}
          >
            <Eye weight="bold" className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onQuitar(pendiente)}
            title="Quitar de la lista"
            aria-label={`Quitar ${pendiente.titulo} de la lista`}
            className={`${BOTON_ICONO} hover:text-rose-400`}
          >
            <Trash weight="bold" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:p-4 sm:pt-1">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-mono-ticket text-[10px] uppercase text-zinc-400">
              {pendiente.tipo} · {pendiente.anio}
            </p>
            <h3 className="font-editorial text-xl text-white leading-tight line-clamp-2 mt-0.5">{pendiente.titulo}</h3>
          </div>

          {/* Asa de arrastre */}
          <div
            onPointerDown={(e) => controles.start(e)}
            title="Arrastra para reordenar"
            aria-hidden="true"
            className="shrink-0 -mr-1 p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none select-none"
          >
            <DotsSixVertical weight="bold" className="w-5 h-5" />
          </div>
        </div>

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

          {/* Móvil: acciones secundarias siempre visibles */}
          <div className="sm:hidden ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => onMarcarVisto(pendiente)}
              aria-label={`Marcar ${pendiente.titulo} como vista`}
              className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <Eye weight="bold" className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onQuitar(pendiente)}
              aria-label={`Quitar ${pendiente.titulo} de la lista`}
              className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
            >
              <Trash weight="bold" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
