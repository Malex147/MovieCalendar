import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';

/**
 * Armazón común de todos los popups: fondo oscuro, animación de entrada y cierre con Escape.
 * El contenido solo se monta mientras está abierto, así que su estado se reinicia en cada apertura.
 */
export default function Modal({
  abierto,
  onCerrar,
  children,
  className = 'max-w-sm p-6',
  cerrarAlPulsarFuera = true
}) {
  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsarTecla = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPulsarTecla);
    return () => window.removeEventListener('keydown', alPulsarTecla);
  }, [abierto, onCerrar]);

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cerrarAlPulsarFuera ? onCerrar : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-zinc-900 border border-white/15 w-full rounded-3xl shadow-2xl relative ${className}`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BotonCerrar({ onClick, className = 'absolute top-4 right-4' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cerrar"
      className={`p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer ${className}`}
    >
      <X weight="bold" className="w-3.5 h-3.5" />
    </button>
  );
}

/** Icono, título y subtítulo de la cabecera de los popups pequeños. */
export function CabeceraModal({ icono: Icono, colorIcono, titulo, subtitulo }) {
  return (
    <>
      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-4 ${colorIcono}`}>
        <Icono weight="duotone" className="w-6 h-6" />
      </div>
      <h3 className="font-editorial text-2xl text-white leading-tight">{titulo}</h3>
      {subtitulo && <p className="text-xs text-zinc-400 mt-1">{subtitulo}</p>}
    </>
  );
}
