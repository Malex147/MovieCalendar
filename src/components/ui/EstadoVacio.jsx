import { motion } from 'framer-motion';

/** Mensaje para una lista vacía, con icono y (opcionalmente) un botón de acción. */
export default function EstadoVacio({ icono: Icono, titulo, texto, textoBoton, onAccion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 px-6 bg-zinc-900/40 border border-dashed border-white/15 rounded-3xl"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icono weight="duotone" className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="font-editorial text-3xl text-white mb-2">{titulo}</h2>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto">{texto}</p>
      {onAccion && (
        <button
          type="button"
          onClick={onAccion}
          className="mt-6 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition cursor-pointer"
        >
          {textoBoton}
        </button>
      )}
    </motion.div>
  );
}
