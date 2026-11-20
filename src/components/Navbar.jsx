import { motion } from 'framer-motion';
import { FilmStrip, Ticket, CalendarBlank, Plus } from '@phosphor-icons/react';

export default function Navbar({ vista, setVista, onAbrirModal, totalSesiones }) {
  return (
    <header className="sticky top-4 z-30 px-4">
      <div className="max-w-5xl mx-auto bg-zinc-900/75 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl shadow-black/60">
        {/* Identidad del Cine Club */}
        <div className="flex items-center gap-3 pl-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-zinc-950 shadow-md shadow-rose-500/20">
            <FilmStrip weight="fill" className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-2xl tracking-wide text-white leading-none">
                Sala Privada
              </span>
              <span className="font-mono-ticket text-[10px] uppercase tracking-widest bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
                {totalSesiones} {totalSesiones === 1 ? 'pase' : 'pases'}
              </span>
            </div>
          </div>
        </div>

        {/* Controles centrales y botón */}
        <div className="flex items-center gap-2">
          <nav className="relative flex items-center bg-black/50 p-1 rounded-full border border-white/5">
            {[
              { id: 'lista', label: 'Tickets', icon: Ticket },
              { id: 'calendario', label: 'Semana', icon: CalendarBlank }
            ].map((tab) => {
              const Icono = tab.icon;
              const activo = vista === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setVista(tab.id)}
                  className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    activo ? 'text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {activo && (
                    <motion.span
                      layoutId="pill-vista"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-full -z-10"
                    />
                  )}
                  <Icono weight={activo ? 'fill' : 'regular'} className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAbrirModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer shadow-lg shadow-rose-500/20"
          >
            <Plus weight="bold" className="w-3.5 h-3.5" />
            <span>Programar</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}