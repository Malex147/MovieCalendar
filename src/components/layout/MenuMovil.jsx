import { motion, AnimatePresence } from 'framer-motion';
import { Plus, SignOut, GearSix } from '@phosphor-icons/react';
import { BotonCerrar } from '../ui/Modal';
import { VISTAS } from './vistas';

/** Menú lateral desplegable (solo móvil). */
export default function MenuMovil({
  abierto,
  onCerrar,
  usuario,
  vista,
  setVista,
  onAbrirModal,
  onAbrirAjustes,
  onCerrarSesion
}) {
  // Cada opción del menú hace su acción y cierra el menú
  const alPulsar = (accion) => () => {
    onCerrar();
    accion();
  };

  return (
    <AnimatePresence>
      {abierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCerrar}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
          />

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
                    Conectado como
                  </p>
                  <span className="font-editorial text-2xl text-white">{usuario.nombre}</span>
                </div>
                <BotonCerrar onClick={onCerrar} className="" />
              </div>

              <div className="mt-6 space-y-2">
                <p className="font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-500 px-1">
                  Vista de cartelera
                </p>
                {VISTAS.map(({ id, etiquetaLarga, Icono }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={alPulsar(() => setVista(id))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-mono-ticket text-xs transition cursor-pointer ${
                      vista === id
                        ? 'bg-white text-zinc-950 font-bold shadow'
                        : 'bg-zinc-900/70 text-zinc-300 hover:bg-zinc-900 border border-white/5'
                    }`}
                  >
                    <Icono weight="bold" className="w-4 h-4" />
                    <span>{etiquetaLarga}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-white/10 space-y-2.5">
              <button
                type="button"
                onClick={alPulsar(onAbrirModal)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                <Plus weight="bold" className="w-4 h-4" />
                <span>Nueva sesión</span>
              </button>

              <button
                type="button"
                onClick={alPulsar(onAbrirAjustes)}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-zinc-200 font-mono-ticket text-xs py-3 rounded-2xl border border-white/10 transition cursor-pointer"
              >
                <GearSix weight="bold" className="w-4 h-4 text-amber-400" />
                <span>Ajustes de perfil</span>
              </button>

              <button
                type="button"
                onClick={alPulsar(onCerrarSesion)}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/15 text-zinc-300 hover:text-rose-300 font-mono-ticket text-xs py-3 rounded-2xl transition cursor-pointer"
              >
                <SignOut weight="bold" className="w-4 h-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
