import { useState } from 'react';
import { MagnifyingGlass, SpinnerGap, CheckCircle } from '@phosphor-icons/react';
import MensajeError from '../ui/MensajeError';
import { useBusquedaTitulos } from '../../hooks/useBusquedaTitulos';

/** Buscador de TMDB. Muestra la búsqueda o, si ya hay uno elegido, el título seleccionado. */
export default function BuscadorTitulos({ seleccionado, onSeleccionar, autoFocus }) {
  if (seleccionado) {
    return <TituloSeleccionado titulo={seleccionado} onCambiar={() => onSeleccionar(null)} />;
  }
  return <Busqueda onSeleccionar={onSeleccionar} autoFocus={autoFocus} />;
}

function Busqueda({ onSeleccionar, autoFocus }) {
  const [consulta, setConsulta] = useState('');
  const { resultados, buscando, error } = useBusquedaTitulos(consulta);

  return (
    <>
      <div className="relative">
        <MagnifyingGlass className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
          placeholder="Buscar título en TMDB..."
          aria-label="Buscar película o serie"
          className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none transition"
          autoFocus={autoFocus}
        />
        {buscando && (
          <SpinnerGap className="w-4 h-4 text-rose-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
        )}
      </div>

      <MensajeError className="mt-3">{error}</MensajeError>

      {resultados.length > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mt-3">
          {resultados.map((item) => (
            <button
              type="button"
              key={`${item.tipo}-${item.tmdbId}`}
              onClick={() => onSeleccionar(item)}
              className="group text-left bg-zinc-950 hover:bg-zinc-800/80 border border-white/10 hover:border-rose-500/50 rounded-2xl p-2 transition cursor-pointer flex flex-col"
            >
              <img src={item.poster} alt={item.titulo} className="w-full aspect-[2/3] object-cover rounded-xl mb-2" />
              <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-rose-400">{item.titulo}</p>
              <span className="font-mono-ticket text-[10px] text-zinc-500">
                {item.tipo} · {item.anio}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function TituloSeleccionado({ titulo, onCambiar }) {
  return (
    <div className="flex items-center gap-3.5 bg-gradient-to-r from-rose-500/15 to-amber-500/10 border border-rose-500/30 p-3 rounded-2xl">
      <img src={titulo.poster} alt={titulo.titulo} className="w-12 h-16 object-cover rounded-xl shadow-md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-rose-400 font-mono-ticket text-[10px] uppercase font-bold">
          <CheckCircle weight="fill" className="w-3.5 h-3.5" />
          <span>Seleccionada</span>
        </div>
        <p className="font-editorial text-xl text-white truncate">{titulo.titulo}</p>
        <p className="font-mono-ticket text-[11px] text-zinc-400">
          {titulo.tipo} ({titulo.anio})
        </p>
      </div>
      <button
        type="button"
        onClick={onCambiar}
        className="font-mono-ticket text-[11px] text-zinc-300 hover:text-white bg-white/10 px-3 py-1.5 rounded-full cursor-pointer"
      >
        Cambiar
      </button>
    </div>
  );
}
