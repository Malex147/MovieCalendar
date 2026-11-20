import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MagnifyingGlass,
  SpinnerGap,
  CheckCircle,
  CalendarBlank,
  Clock,
  UserCircle,
  Sparkle,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';
import { buscarTitulos } from '../services/tmdb';

function formatearISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

const HORAS_DIA = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS_DIA = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const DIAS_SEMANA_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function RuedaDeslizable({ items, valorActual, onChange }) {
  const contenedorRef = useRef(null);
  const arrastrandoRef = useRef(false);
  const inicioYRef = useRef(0);
  const scrollInicialRef = useRef(0);
  const ALTURA_ITEM = 38;

  useEffect(() => {
    const idx = items.indexOf(valorActual);
    if (contenedorRef.current && idx !== -1 && !arrastrandoRef.current) {
      contenedorRef.current.scrollTo({
        top: idx * ALTURA_ITEM,
        behavior: 'smooth'
      });
    }
  }, [valorActual, items]);

  const manejarScroll = () => {
    if (!contenedorRef.current) return;
    const idx = Math.round(contenedorRef.current.scrollTop / ALTURA_ITEM);
    const item = items[Math.max(0, Math.min(items.length - 1, idx))];
    if (item && item !== valorActual) {
      onChange(item);
    }
  };

  const alPresionarRaton = (e) => {
    arrastrandoRef.current = true;
    inicioYRef.current = e.pageY;
    scrollInicialRef.current = contenedorRef.current.scrollTop;
  };

  const alMoverRaton = (e) => {
    if (!arrastrandoRef.current || !contenedorRef.current) return;
    e.preventDefault();
    const desplazamiento = e.pageY - inicioYRef.current;
    contenedorRef.current.scrollTop = scrollInicialRef.current - desplazamiento;
  };

  const alSoltarRaton = () => {
    arrastrandoRef.current = false;
  };

  return (
    <div className="relative h-[152px] w-20 overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 h-[38px] rounded-xl bg-amber-400/15 border border-amber-400/40 z-0" />

      <div
        ref={contenedorRef}
        onScroll={manejarScroll}
        onMouseDown={alPresionarRaton}
        onMouseMove={alMoverRaton}
        onMouseUp={alSoltarRaton}
        onMouseLeave={alSoltarRaton}
        className="h-full overflow-y-scroll snap-y snap-proximity py-[57px] cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, idx) => {
          const activo = item === valorActual;
          return (
            <button
              type="button"
              key={item}
              onClick={() => {
                onChange(item);
                contenedorRef.current?.scrollTo({ top: idx * ALTURA_ITEM, behavior: 'smooth' });
              }}
              className={`h-[38px] w-full flex items-center justify-center snap-center font-mono-ticket transition-all cursor-pointer ${
                activo
                  ? 'text-xl font-bold text-amber-300 scale-110'
                  : 'text-sm text-zinc-500 hover:text-zinc-300'
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

export default function AddModal({ isOpen, onClose, onGuardar, onActualizar, sesionAEditar }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  const [fecha, setFecha] = useState(() => formatearISO(new Date()));
  const [horaSeleccionada, setHoraSeleccionada] = useState('22');
  const [minutoSeleccionado, setMinutoSeleccionado] = useState('00');

  const [panelAbierto, setPanelAbierto] = useState(null);
  const [mesCalendario, setMesCalendario] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const [autor, setAutor] = useState(() => localStorage.getItem('cine_autor') || '');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esEdicion = Boolean(sesionAEditar);
  const horaCompleta = `${horaSeleccionada}:${minutoSeleccionado}`;

  // Rellenar o limpiar el formulario al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    setPanelAbierto(null);
    setResultados([]);
    setBusqueda('');

    if (sesionAEditar) {
      setSeleccionada({
        tmdbId: sesionAEditar.tmdbId,
        titulo: sesionAEditar.titulo,
        tipo: sesionAEditar.tipo,
        anio: sesionAEditar.anio,
        poster: sesionAEditar.poster
      });

      const [fParte, hParte = '22:00'] = sesionAEditar.fechaHora.split('T');
      const [h, m] = hParte.split(':');
      setFecha(fParte);
      setHoraSeleccionada(h || '22');
      setMinutoSeleccionado(m || '00');

      const [anioF, mesF] = fParte.split('-').map(Number);
      if (anioF && mesF) {
        setMesCalendario(new Date(anioF, mesF - 1, 1));
      }

      setAutor(sesionAEditar.autor || '');
      setNota(sesionAEditar.nota || '');
    } else {
      setSeleccionada(null);
      const hoy = new Date();
      setFecha(formatearISO(hoy));
      setMesCalendario(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      setHoraSeleccionada('22');
      setMinutoSeleccionado('00');
      setAutor(localStorage.getItem('cine_autor') || '');
      setNota('');
    }
  }, [isOpen, sesionAEditar]);

  useEffect(() => {
    if (!busqueda.trim() || busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      const items = await buscarTitulos(busqueda);
      setResultados(items);
      setBuscando(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [busqueda]);

  const generarDiasMes = () => {
    const anio = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();
    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);

    let offsetInicio = primerDiaMes.getDay() - 1;
    if (offsetInicio < 0) offsetInicio = 6;

    const celdas = [];
    for (let i = 0; i < offsetInicio; i++) celdas.push(null);
    for (let d = 1; d <= ultimoDiaMes.getDate(); d++) {
      celdas.push(new Date(anio, mes, d));
    }
    return celdas;
  };

  const cambiarMes = (delta) => {
    setMesCalendario(
      new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + delta, 1)
    );
  };

  const fechaBonita = new Date(`${fecha}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!seleccionada || !fecha) return;

    setGuardando(true);
    localStorage.setItem('cine_autor', autor.trim());

    const payload = {
      tmdbId: seleccionada.tmdbId,
      titulo: seleccionada.titulo,
      tipo: seleccionada.tipo,
      anio: seleccionada.anio,
      poster: seleccionada.poster,
      fechaHora: `${fecha}T${horaCompleta}`,
      autor: autor.trim(),
      nota: nota.trim(),
      asistentes: autor.trim() ? [autor.trim()] : []
    };

    try {
      if (esEdicion) {
        await onActualizar(sesionAEditar.id, payload);
      } else {
        await onGuardar(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudieron guardar los cambios en Firestore.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="bg-zinc-900 border border-white/15 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Cabecera */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/50">
              <div>
                <p className="font-mono-ticket text-[10px] uppercase tracking-widest text-rose-400">
                  {esEdicion ? 'Modificar Pase' : 'Taquilla'}
                </p>
                <h2 className="font-editorial text-2xl text-white leading-none">
                  {esEdicion ? 'Editar sesión' : 'Programar nueva sesión'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <X weight="bold" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={manejarEnvio} className="p-6 overflow-y-auto space-y-5">
              {/* 1. Película o Serie */}
              <div>
                <label className="block font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-2">
                  01. Película o Serie
                </label>

                {!seleccionada && (
                  <>
                    <div className="relative">
                      <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar título en TMDB..."
                        className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none transition"
                        autoFocus={!esEdicion}
                      />
                      {buscando && (
                        <SpinnerGap className="w-4 h-4 text-rose-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    {resultados.length > 0 && (
                      <div className="grid grid-cols-3 gap-2.5 mt-3">
                        {resultados.map((item) => (
                          <button
                            type="button"
                            key={`${item.tipo}-${item.tmdbId}`}
                            onClick={() => setSeleccionada(item)}
                            className="group text-left bg-zinc-950 hover:bg-zinc-800/80 border border-white/10 hover:border-rose-500/50 rounded-2xl p-2 transition cursor-pointer flex flex-col"
                          >
                            <img
                              src={item.poster}
                              alt={item.titulo}
                              className="w-full aspect-[2/3] object-cover rounded-xl mb-2"
                            />
                            <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-rose-400">
                              {item.titulo}
                            </p>
                            <span className="font-mono-ticket text-[10px] text-zinc-500">
                              {item.tipo} · {item.anio}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {seleccionada && (
                  <div className="flex items-center gap-3.5 bg-gradient-to-r from-rose-500/15 to-amber-500/10 border border-rose-500/30 p-3 rounded-2xl">
                    <img
                      src={seleccionada.poster}
                      alt={seleccionada.titulo}
                      className="w-12 h-16 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-rose-400 font-mono-ticket text-[10px] uppercase font-bold">
                        <CheckCircle weight="fill" className="w-3.5 h-3.5" />
                        <span>Seleccionada</span>
                      </div>
                      <p className="font-editorial text-xl text-white truncate">
                        {seleccionada.titulo}
                      </p>
                      <p className="font-mono-ticket text-[11px] text-zinc-400">
                        {seleccionada.tipo} ({seleccionada.anio})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSeleccionada(null)}
                      className="font-mono-ticket text-[11px] text-zinc-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-full cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Fecha y Hora */}
              <div>
                <label className="block font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-2">
                  02. Fecha y Hora de inicio
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPanelAbierto(panelAbierto === 'calendario' ? null : 'calendario')
                    }
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      panelAbierto === 'calendario'
                        ? 'bg-rose-500/15 border-rose-500 text-white'
                        : 'bg-zinc-950 border-white/10 hover:border-white/25 text-zinc-200'
                    }`}
                  >
                    <CalendarBlank weight="duotone" className="w-5 h-5 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <span className="block font-mono-ticket text-[10px] uppercase text-zinc-500">
                        Día
                      </span>
                      <span className="block text-xs sm:text-sm font-semibold capitalize truncate">
                        {fechaBonita}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPanelAbierto(panelAbierto === 'reloj' ? null : 'reloj')
                    }
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
                      panelAbierto === 'reloj'
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-zinc-950 border-white/10 hover:border-white/25 text-zinc-200'
                    }`}
                  >
                    <Clock weight="duotone" className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="block font-mono-ticket text-[10px] uppercase text-zinc-500">
                        Hora
                      </span>
                      <span className="block font-mono-ticket text-sm sm:text-base font-bold text-amber-300">
                        {horaCompleta}
                      </span>
                    </div>
                  </button>
                </div>

                <AnimatePresence>
                  {panelAbierto === 'calendario' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-white/15">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            type="button"
                            onClick={() => cambiarMes(-1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
                          >
                            <CaretLeft weight="bold" className="w-4 h-4" />
                          </button>
                          <span className="font-editorial text-xl text-white capitalize">
                            {mesCalendario.toLocaleDateString('es-ES', {
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => cambiarMes(1)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
                          >
                            <CaretRight weight="bold" className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                          {DIAS_SEMANA_CORTOS.map((d) => (
                            <span
                              key={d}
                              className="font-mono-ticket text-[10px] text-zinc-500 font-bold"
                            >
                              {d}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {generarDiasMes().map((celda, i) => {
                            if (!celda) return <div key={`vacio-${i}`} />;
                            const iso = formatearISO(celda);
                            const esSeleccionado = iso === fecha;
                            const esHoy = iso === formatearISO(new Date());

                            return (
                              <button
                                type="button"
                                key={iso}
                                onClick={() => {
                                  setFecha(iso);
                                  setPanelAbierto('reloj');
                                }}
                                className={`h-9 rounded-xl font-mono-ticket text-xs font-semibold transition cursor-pointer ${
                                  esSeleccionado
                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                                    : esHoy
                                    ? 'bg-white/10 text-amber-300 border border-amber-400/40'
                                    : 'text-zinc-300 hover:bg-white/10'
                                }`}
                              >
                                {celda.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {panelAbierto === 'reloj' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-white/15 flex flex-col items-center">
                        <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
                          Atajos o desliza la rueda
                        </span>

                        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                          {['18:00', '20:30', '21:30', '22:00', '22:30'].map((preset) => {
                            const [h, m] = preset.split(':');
                            const esActual = horaSeleccionada === h && minutoSeleccionado === m;
                            return (
                              <button
                                type="button"
                                key={preset}
                                onClick={() => {
                                  setHoraSeleccionada(h);
                                  setMinutoSeleccionado(m);
                                }}
                                className={`font-mono-ticket text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                                  esActual
                                    ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                                    : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
                                }`}
                              >
                                {preset}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-center gap-3">
                          <RuedaDeslizable
                            items={HORAS_DIA}
                            valorActual={horaSeleccionada}
                            onChange={setHoraSeleccionada}
                          />
                          <span className="font-mono-ticket text-2xl font-bold text-amber-400 pb-1">
                            :
                          </span>
                          <RuedaDeslizable
                            items={MINUTOS_DIA}
                            valorActual={minutoSeleccionado}
                            onChange={setMinutoSeleccionado}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setPanelAbierto(null)}
                          className="mt-3 font-mono-ticket text-[11px] uppercase tracking-wider bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-full transition cursor-pointer"
                        >
                          Listo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Anfitrión y Nota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="flex items-center gap-1.5 font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    <UserCircle weight="duotone" className="w-4 h-4 text-rose-400" />
                    Anfitrión
                  </label>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    placeholder="Tu nombre (Opcional)"
                    className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 font-mono-ticket text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    <Sparkle weight="duotone" className="w-4 h-4 text-amber-400" />
                    Nota / Plataforma
                  </label>
                  <input
                    type="text"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej: T1 Ep 4 / Discord"
                    className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none"
                  />
                </div>
              </div>

              {/* Botón de confirmar */}
              <button
                type="submit"
                disabled={!seleccionada || !fecha || guardando}
                className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-30 text-zinc-950 font-bold text-sm py-3.5 rounded-2xl transition cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
              >
                {guardando
                  ? 'Guardando...'
                  : esEdicion
                  ? `Guardar cambios · ${horaCompleta}`
                  : `Confirmar pase · ${horaCompleta}`}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}