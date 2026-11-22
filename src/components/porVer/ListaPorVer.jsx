import { AnimatePresence } from 'framer-motion';
import { BookmarkSimple, Plus } from '@phosphor-icons/react';
import TarjetaPorVer from './TarjetaPorVer';
import EstadoVacio from '../ui/EstadoVacio';

const marcaDeTiempo = (pendiente) => pendiente.creadoEn?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;

/** Primero lo que más gente quiere ver; a igualdad, lo más antiguo. */
const ordenarPorInteres = (pendientes) =>
  [...pendientes].sort(
    (a, b) =>
      (b.interesados?.length || 0) - (a.interesados?.length || 0) || marcaDeTiempo(a) - marcaDeTiempo(b)
  );

/** Vista "Por ver": títulos que el grupo quiere ver sin fecha decidida. */
export default function ListaPorVer({ pendientes, onAnadir, ...propsTarjeta }) {
  if (pendientes.length === 0) {
    return (
      <EstadoVacio
        icono={BookmarkSimple}
        titulo="Nada pendiente"
        texto="Apunta aquí las pelis y series que os apetece ver. Cuando sepáis el día, la programáis en un clic."
        textoBoton="Añadir la primera"
        onAccion={onAnadir}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">
          {pendientes.length} {pendientes.length === 1 ? 'título' : 'títulos'} · ordenados por interés
        </p>
        <button
          type="button"
          onClick={onAnadir}
          className="inline-flex items-center gap-1.5 font-mono-ticket text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-full transition cursor-pointer"
        >
          <Plus weight="bold" className="w-3.5 h-3.5" />
          Añadir
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {ordenarPorInteres(pendientes).map((pendiente) => (
            <TarjetaPorVer key={pendiente.id} pendiente={pendiente} {...propsTarjeta} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
