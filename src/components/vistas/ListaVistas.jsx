import { AnimatePresence } from 'framer-motion';
import { FilmReel } from '@phosphor-icons/react';
import TarjetaVista from './TarjetaVista';
import EstadoVacio from '../ui/EstadoVacio';
import { formatearMes } from '../../lib/fechas';

/** Agrupa las sesiones vistas por mes, de la más reciente a la más antigua. */
const agruparPorMes = (sesiones) => {
  const grupos = new Map();
  [...sesiones]
    .sort((a, b) => b.fechaHora.localeCompare(a.fechaHora))
    .forEach((sesion) => {
      const clave = sesion.fechaHora.slice(0, 7); // "YYYY-MM"
      if (!grupos.has(clave)) grupos.set(clave, []);
      grupos.get(clave).push(sesion);
    });
  return [...grupos.entries()];
};

/** Historial de lo que ya habéis visto. */
export default function ListaVistas({ sesiones, ...propsTarjeta }) {
  if (sesiones.length === 0) {
    return (
      <EstadoVacio
        icono={FilmReel}
        titulo="Aún no hay nada visto"
        texto="Cuando terminéis una peli o serie, márcala como vista (el icono del ojo) y aparecerá aquí."
      />
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-xs text-zinc-400">
        {sesiones.length} {sesiones.length === 1 ? 'título visto' : 'títulos vistos'}
      </p>

      {agruparPorMes(sesiones).map(([mes, delMes]) => (
        <section key={mes}>
          <h2 className="font-editorial text-2xl text-white first-letter:uppercase mb-3">
            {formatearMes(`${mes}-01`)}
            <span className="font-mono-ticket text-xs text-zinc-500 ml-2">{delMes.length}</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {delMes.map((sesion) => (
                <TarjetaVista key={sesion.id} sesion={sesion} {...propsTarjeta} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      ))}
    </div>
  );
}
