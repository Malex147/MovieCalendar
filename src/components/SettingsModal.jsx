import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GearSix,
  X,
  User,
  Check,
  WarningCircle,
  SpinnerGap
} from '@phosphor-icons/react';

export default function SettingsModal({ isOpen, onClose, usuario, onGuardarNombre }) {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && usuario) {
      setNuevoNombre(usuario.nombre || '');
      setError('');
    }
  }, [isOpen, usuario]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await onGuardarNombre(nuevoNombre);
      onClose();
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el nombre.');
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
          onClick={onClose}
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
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <X weight="bold" className="w-3.5 h-3.5" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4">
              <GearSix weight="duotone" className="w-6 h-6" />
            </div>

            <h3 className="font-editorial text-2xl text-white leading-tight">
              Ajustes de perfil
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Cambia tu nombre único. Se actualizará también en las sesiones a las que estés apuntado.
            </p>

            <form onSubmit={manejarSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <User
                    weight="duotone"
                    className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    placeholder="Tu nuevo nombre"
                    className="w-full bg-zinc-950 border border-white/10 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
                  <WarningCircle weight="fill" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={guardando}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando || !nuevoNombre.trim() || nuevoNombre.trim() === usuario?.nombre}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-35 text-zinc-950 font-bold text-xs transition cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  {guardando ? (
                    <SpinnerGap className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check weight="bold" className="w-3.5 h-3.5" />
                  )}
                  <span>{guardando ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}