import { motion, AnimatePresence } from 'framer-motion';

/** Botón que muestra un valor y abre/cierra un panel (calendario, reloj...). */
export function BotonDesplegable({ activo, onClick, icono: Icono, etiqueta, colores, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={activo}
      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition cursor-pointer ${
        activo ? colores.activo : 'bg-zinc-950 border-white/10 hover:border-white/25 text-zinc-200'
      }`}
    >
      <Icono weight="duotone" className={`w-5 h-5 shrink-0 ${colores.icono}`} />
      <div className="min-w-0">
        <span className="block font-mono-ticket text-[10px] uppercase text-zinc-500">{etiqueta}</span>
        {children}
      </div>
    </button>
  );
}

/** Panel que se despliega con animación de altura. */
export function PanelDesplegable({ abierto, children }) {
  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
