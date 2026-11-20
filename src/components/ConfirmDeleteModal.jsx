import { motion, AnimatePresence } from 'framer-motion';
import { Trash, X, Warning } from '@phosphor-icons/react';

export default function ConfirmDeleteModal({ sesion, onCancelar, onConfirmar, eliminando }) {
  return (
    <AnimatePresence>
      {sesion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancelar}
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
              onClick={onCancelar}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Warning weight="duotone" className="w-6 h-6" />
            </div>

            <h3 className="font-editorial text-2xl text-white leading-tight">
              ¿Anular este pase?
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Desaparecerá de la cartelera compartida de todo el grupo.
            </p>

            {/* Vista previa de la entrada a borrar */}
            <div className="flex items-center gap-3 bg-zinc-950/90 border border-white/10 p-2.5 rounded-2xl my-5">
              <img
                src={sesion.poster}
                alt={sesion.titulo}
                className="w-10 h-14 object-cover rounded-xl shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{sesion.titulo}</p>
                <p className="font-mono-ticket text-[11px] text-zinc-400 mt-0.5">
                  {new Date(sesion.fechaHora).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}{' '}
                  ·{' '}
                  {new Date(sesion.fechaHora).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onCancelar}
                disabled={eliminando}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Mantener
              </button>

              <button
                type="button"
                onClick={() => onConfirmar(sesion.id)}
                disabled={eliminando}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                <Trash weight="bold" className="w-3.5 h-3.5" />
                <span>{eliminando ? 'Anulando...' : 'Sí, anular'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}