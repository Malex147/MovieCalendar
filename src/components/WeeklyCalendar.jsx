import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CaretLeft,
  CaretRight,
  Clock,
  Trash,
  PencilSimple,
  UsersThree,
  Check
} from '@phosphor-icons/react';

function obtenerLunesDeSemana(fechaBase) {
  const fecha = new Date(fechaBase);
  const diaSemana = fecha.getDay();
  const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
  fecha.setDate(fecha.getDate() + diferencia);
  fecha.setHours(0, 0, 0, 0);
  return fecha;
}

function formatearFechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export default function WeeklyCalendar({
  sesiones,
  usuarioActual,
  onToggleAsistencia,
  onEliminar,
  onEditar
}) {
  const [lunesActual, setLunesActual] = useState(() => obtenerLunesDeSemana(new Date()));

  const cambiarSemana = (dias) => {
    const nuevoLunes = new Date(lunesActual);
    nuevoLunes.setDate(nuevoLunes.getDate() + dias);
    setLunesActual(nuevoLunes);
  };

  const diasSemana = Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(lunesActual);
    dia.setDate(lunesActual.getDate() + i);
    return dia;
  });

  const hoyISO = formatearFechaISO(new Date());
  const domingoActual = diasSemana[6];

  const rangoTexto = `${lunesActual.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })} — ${domingoActual.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-zinc-900/60 border border-white/10 px-4 py-3 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => cambiarSemana(-7)}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition cursor-pointer"
          >
            <CaretLeft weight="bold" className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLunesActual(obtenerLunesDeSemana(new Date()))}
            className="font-mono-ticket text-xs px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-200 rounded-xl transition cursor-pointer"
          >
            HOY
          </button>
          <button
            onClick={() => cambiarSemana(7)}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition cursor-pointer"
          >
            <CaretRight weight="bold" className="w-4 h-4" />
          </button>
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl text-white capitalize">
          {rangoTexto}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {diasSemana.map((dia) => {
          const fechaISO = formatearFechaISO(dia);
          const esHoy = fechaISO === hoyISO;
          const sesionesDelDia = sesiones.filter((s) => s.fechaHora.startsWith(fechaISO));

          return (
            <div
              key={fechaISO}
              className={`rounded-3xl p-3 border transition flex flex-col min-h-[130px] md:min-h-[340px] ${
                esHoy
                  ? 'bg-gradient-to-b from-rose-500/15 to-zinc-900/60 border-rose-500/40'
                  : 'bg-zinc-900/40 border-white/10'
              }`}
            >
              <div className="flex md:flex-col items-center justify-between pb-2.5 mb-2.5 border-b border-white/10">
                <span className="font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400">
                  {dia.toLocaleDateString('es-ES', { weekday: 'short' })}
                </span>
                <span
                  className={`font-mono-ticket text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                    esHoy ? 'bg-rose-500 text-white' : 'text-zinc-200'
                  }`}
                >
                  {dia.getDate()}
                </span>
              </div>

              <div className="flex-1 space-y-2.5">
                {sesionesDelDia.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-4">
                    <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-700">
                      Sin pase
                    </span>
                  </div>
                ) : (
                  sesionesDelDia.map((sesion) => {
                    const hora = new Date(sesion.fechaHora).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    const asistentes = sesion.asistentes || [];
                    const estoyApuntado = Boolean(usuarioActual && asistentes.includes(usuarioActual));

                    return (
                      <motion.div
                        layout
                        key={sesion.id}
                        className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-lg"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden">
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

                          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onEditar?.(sesion)}
                              title="Editar pase"
                              className="p-1.5 rounded-full bg-black/75 text-zinc-300 hover:text-amber-300 transition cursor-pointer"
                            >
                              <PencilSimple weight="bold" className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => onEliminar(sesion)}
                              title="Eliminar pase"
                              className="p-1.5 rounded-full bg-black/75 text-zinc-300 hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash weight="bold" className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="absolute bottom-2 left-2.5 right-2.5">
                            <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {sesion.titulo}
                            </p>

                            <div className="flex items-center justify-between gap-1 mt-1.5">
                              <span
                                className="inline-flex items-center gap-1 font-mono-ticket text-[10px] text-zinc-300"
                                title={asistentes.join(', ') || 'Nadie aún'}
                              >
                                <UsersThree weight="fill" className="w-3 h-3 text-emerald-400" />
                                {asistentes.length}
                              </span>

                              <button
                                type="button"
                                onClick={() => onToggleAsistencia(sesion)}
                                className={`font-mono-ticket text-[10px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                                  estoyApuntado
                                    ? 'bg-emerald-400 text-zinc-950'
                                    : 'bg-white/15 hover:bg-white/25 text-white'
                                }`}
                              >
                                {estoyApuntado ? (
                                  <span className="inline-flex items-center gap-0.5">
                                    <Check weight="bold" className="w-2.5 h-2.5" /> Voy
                                  </span>
                                ) : (
                                  '+ Ir'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}