import { useState, useEffect } from 'react';
import { X, Search, Loader2, Check, Calendar, Clock, User, MessageSquare } from 'lucide-react';
import { buscarTitulos } from '../services/tmdb';

export default function AddModal({ isOpen, onClose, onGuardar }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionada, setSeleccionada] = useState(null);

  // Campos del formulario
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('22:00');
  const [autor, setAutor] = useState(() => localStorage.getItem('cine_autor') || '');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Efecto debounce para buscar en TMDB al escribir
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

  if (!isOpen) return null;

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!seleccionada || !fecha || !hora || !autor.trim()) return;

    setGuardando(true);
    // Guardamos el nombre del usuario para futuras ocasiones
    localStorage.setItem('cine_autor', autor.trim());

    try {
      await onGuardar({
        tmdbId: seleccionada.tmdbId,
        titulo: seleccionada.titulo,
        tipo: seleccionada.tipo,
        anio: seleccionada.anio,
        poster: seleccionada.poster,
        fechaHora: `${fecha}T${hora}`,
        autor: autor.trim(),
        nota: nota.trim()
      });

      // Reseteamos y cerramos
      setBusqueda('');
      setResultados([]);
      setSeleccionada(null);
      setNota('');
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Hubo un error al guardar la película. Revisa la consola o tus claves de Firebase.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Programar peli o serie</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <form onSubmit={manejarEnvio} className="p-5 overflow-y-auto space-y-5">
          {/* Paso 1: Buscador de TMDB */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              1. Busca el título
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  if (seleccionada) setSeleccionada(null);
                }}
                placeholder="Ej: Cómo entrenar a tu dragón, Arcane..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
                autoFocus
              />
              {buscando && (
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Grid de resultados de TMDB */}
            {resultados.length > 0 && !seleccionada && (
              <div className="grid grid-cols-3 gap-2.5 mt-3">
                {resultados.map((item) => (
                  <button
                    type="button"
                    key={`${item.tipo}-${item.tmdbId}`}
                    onClick={() => setSeleccionada(item)}
                    className="group text-left bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-2 transition cursor-pointer flex flex-col"
                  >
                    <img
                      src={item.poster}
                      alt={item.titulo}
                      className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                    />
                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-amber-400">
                      {item.titulo}
                    </p>
                    <span className="text-[11px] text-zinc-500">
                      {item.tipo} · {item.anio}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Tarjeta de confirmación si ya eligió una */}
            {seleccionada && (
              <div className="mt-3 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                <img
                  src={seleccionada.poster}
                  alt={seleccionada.titulo}
                  className="w-12 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Seleccionada</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{seleccionada.titulo}</p>
                  <p className="text-xs text-zinc-400">
                    {seleccionada.tipo} ({seleccionada.anio})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSeleccionada(null)}
                  className="text-xs text-zinc-400 hover:text-white underline px-2 cursor-pointer"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Paso 2: Fecha, Hora y Autor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Día
              </label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                Hora aprox.
              </label>
              <input
                type="time"
                required
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <User className="w-3.5 h-3.5" />
                ¿Quién la propone?
              </label>
              <input
                type="text"
                required
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                placeholder="Tu nombre"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Nota (opcional)
              </label>
              <input
                type="text"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej: T1 Ep 4 / Discord"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          {/* Botón Guardar */}
          <button
            type="submit"
            disabled={!seleccionada || !fecha || !hora || !autor.trim() || guardando}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold py-3 rounded-xl transition cursor-pointer disabled:cursor-not-allowed"
          >
            {guardando ? 'Guardando en la cartelera...' : 'Añadir al calendario'}
          </button>
        </form>
      </div>
    </div>
  );
}