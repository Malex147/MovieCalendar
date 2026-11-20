import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, UserCircle } from '@phosphor-icons/react';

export default function JoinModal({ sesion, onCerrar, onConfirmarNombre }) {
  const [nombre, setNombre] = useState('');

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onConfirmarNombre(sesion, nombre.trim());
    setNombre('');
  };

  return (
    <AnimatePresence>
      {sesion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCerrar}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-white/15 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative"
          >
            <button
              onClick={onCerrar}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Ticket weight="duotone" className="w-6 h-6" />
            </div>

            <h3 className="font-editorial text-2xl text-white leading-tight">
              Reservar butaca
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Indica tu nombre para apuntarte a <strong className="text-zinc-200">{sesion.titulo}</strong>.
            </p>

            <form onSubmit={manejarSubmit} className="mt-5 space-y-4">
              <div className="relative">
                <UserCircle
                  weight="duotone"
                  className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  required
                  autoFocus
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre..."
                  className="w-full bg-zinc-950 border border-white/10 focus:border-emerald-400 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!nombre.trim()}
                className="w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-30 text-zinc-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Confirmar asistencia
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}