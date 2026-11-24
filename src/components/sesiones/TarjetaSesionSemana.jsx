import { motion } from 'framer-motion';
import { Clock, UsersThree } from '@phosphor-icons/react';
import BotonAsistencia from './BotonAsistencia';
import AccionesSesion from './AccionesSesion';
import { estaApuntado } from '../../lib/nombres';
import { formatearHora } from '../../lib/fechas';

/** Sesión dentro de la parrilla semanal: tarjeta horizontal en móvil, póster vertical en PC. */
export default function TarjetaSesionSemana({
  sesion,
  usuarioActual,
  onToggleAsistencia,
  onEditar,
  onEliminar,
  onMarcarVista
}) {
  const hora = formatearHora(sesion.fechaHora);
  const asistentes = sesion.asistentes || [];
  const apuntado = estaApuntado(asistentes, usuarioActual);
  const alternar = () => onToggleAsistencia(sesion);

  return (
    <motion.div
      layout
      className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-lg"
    >
      {/* Móvil (< md) */}
      <div className="flex md:hidden items-center gap-3 p-2.5">
        <img
          src={sesion.poster}
          alt={sesion.titulo}
          className="w-14 h-20 object-cover rounded-xl shrink-0 ring-1 ring-white/10"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-mono-ticket text-[10px] font-bold bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/25">
              <Clock weight="fill" className="w-3 h-3" />
              {hora}
            </span>
            <AccionesSesion
              sesion={sesion}
              onMarcarVista={onMarcarVista}
              onEditar={onEditar}
              onEliminar={onEliminar}
              variante="compacto"
            />
          </div>

          <p className="text-sm font-bold text-white truncate mt-1.5">{sesion.titulo}</p>

          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="inline-flex items-center gap-1 font-mono-ticket text-[10px] text-zinc-400">
              <UsersThree weight="fill" className="w-3.5 h-3.5 text-emerald-400" />
              {asistentes.length} {asistentes.length === 1 ? 'persona' : 'personas'}
            </span>
            <BotonAsistencia apuntado={apuntado} onClick={alternar} variante="compacto" />
          </div>
        </div>
      </div>

      {/* PC (md+) */}
      <div className="hidden md:block relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={sesion.poster}
          alt={sesion.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />

        <span className="absolute top-2 left-2 inline-flex items-center gap-1 font-mono-ticket text-[10px] font-bold bg-black/75 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-full border border-white/10">
          <Clock weight="fill" className="w-3 h-3" />
          {hora}
        </span>

        <AccionesSesion
          sesion={sesion}
          onMarcarVista={onMarcarVista}
          onEditar={onEditar}
          onEliminar={onEliminar}
          variante="superpuesto"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition"
        />

        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{sesion.titulo}</p>

          <div className="flex items-center justify-between gap-1 mt-1.5">
            <span
              className="inline-flex items-center gap-1 font-mono-ticket text-[10px] text-zinc-300"
              title={asistentes.join(', ') || 'Nadie aún'}
            >
              <UsersThree weight="fill" className="w-3 h-3 text-emerald-400" />
              {asistentes.length}
            </span>
            <BotonAsistencia apuntado={apuntado} onClick={alternar} variante="mini" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
