import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  CalendarBlank,
  Plus,
  FilmStrip,
  List,
  X
} from '@phosphor-icons/react';

export default function Navbar({ vista, setVista, onAbrirModal, totalSesiones }) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const cambiarVistaMovil = (nuevaVista) => {
    setVista(nuevaVista);
    setMenuMovilAbierto(false);
  };

  const abrirModalMovil = () => {
    setMenuMovilAbierto(false);
    onAbrirModal();
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Marca / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-rose-500/20 shrink-0">
              <FilmStrip weight="fill" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-editorial text-xl sm:text-2xl text-white tracking-tight block leading-none truncate">
                Sala Privada
              </span>
              <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-400 block mt-0.5">
                {totalSesiones} {totalSesiones === 1 ? 'pase activo' : 'pases activos'}
              </span>
            </div>
          </div>

          {/* Controles PC (exactamente igual que antes, ocultos en móvil) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center bg-zinc-900/90 border border-white/10 p-1 rounded-full">
              <button
                onClick={() => setVista('lista')}
                className={`flex items-center gap-1.5 font-mono-ticket text-xs px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                  vista === 'lista'
                    ? 'bg-white text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Ticket weight="bold" className="w-3.5 h-3.5" />
                <span>Tickets</span>
              </button>
              <button
                onClick={() => setVista('calendario')}
                className={`flex items-center gap-1.5 font-mono-ticket text-xs px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                  vista === 'calendario'
                    ? 'bg-white text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CalendarBlank weight="bold" className="w-3.5 h-3.5" />
                <span>Semana</span>
              </button>
            </div>

            <button
              onClick={onAbrirModal}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-zinc-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full transition cursor-pointer shadow-lg shadow-rose-500/20"
            >
              <Plus weight="bold" className="w-4 h-4" />
              <span>Nueva sesión</span>
            </button>
          </div>

          {/* Botón hamburguesa solo para móvil */}
          <button
            type="button"
            onClick={() => setMenuMovilAbierto(true)}
            aria-label="Abrir menú"
            className="md:hidden p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 transition cursor-pointer shrink-0"
          >
            <List weight="bold" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Menú lateral desplegable en móvil */}
      <AnimatePresence>
        {menuMovilAbierto && (
          <>
            {/* Fondo oscurecido */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuMovilAbierto(false)}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
            />

            {/* Panel lateral derecho */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[82vw] bg-zinc-950 border-l border-white/15 p-6 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div>
                    <p className="font-mono-ticket text-[10px] uppercase tracking-widest text-rose-400">
                      Navegación
                    </p>
                    <span className="font-editorial text-2xl text-white">
                      Sala Privada
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMenuMovilAbierto(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    <X weight="bold" className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-500 px-1">
                    Vista de cartelera
                  </p>

                  <button
                    type="button"
                    onClick={() => cambiarVistaMovil('lista')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-mono-ticket text-xs transition cursor-pointer ${
                      vista === 'lista'
                        ? 'bg-white text-zinc-950 font-bold shadow'
                        : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900 border border-white/5'
                    }`}
                  >
                    <Ticket weight="bold" className="w-4 h-4" />
                    <span>Tickets (Lista)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cambiarVistaMovil('calendario')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-mono-ticket text-xs transition cursor-pointer ${
                      vista === 'calendario'
                        ? 'bg-white text-zinc-950 font-bold shadow'
                        : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900 border border-white/5'
                    }`}
                  >
                    <CalendarBlank weight="bold" className="w-4 h-4" />
                    <span>Parrilla Semanal</span>
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-white/10 space-y-3">
                <button
                  type="button"
                  onClick={abrirModalMovil}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  <Plus weight="bold" className="w-4 h-4" />
                  <span>Nueva sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}