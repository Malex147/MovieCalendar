import { PencilSimple, Trash } from '@phosphor-icons/react';

const VARIANTES = {
  ticket: {
    boton: 'p-2 bg-white/5',
    editar: 'text-zinc-400 hover:text-amber-300 hover:bg-amber-400/10',
    eliminar: 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10',
    icono: 'w-3.5 h-3.5',
    hueco: 'gap-1.5'
  },
  compacto: {
    boton: 'p-1.5 bg-white/5',
    editar: 'text-zinc-400 hover:text-amber-300',
    eliminar: 'text-zinc-400 hover:text-rose-400',
    icono: 'w-3.5 h-3.5',
    hueco: 'gap-1'
  },
  // Sobre el póster: fondo oscuro para que se lea encima de la imagen
  superpuesto: {
    boton: 'p-1.5 bg-black/75',
    editar: 'text-zinc-300 hover:text-amber-300',
    eliminar: 'text-zinc-300 hover:text-rose-400',
    icono: 'w-3 h-3',
    hueco: 'gap-1'
  }
};

/** Botones de editar y anular una sesión. */
export default function AccionesSesion({ sesion, onEditar, onEliminar, variante = 'ticket', className = '' }) {
  const estilo = VARIANTES[variante];
  const claseBoton = `rounded-full transition cursor-pointer ${estilo.boton}`;

  return (
    <div className={`flex items-center ${estilo.hueco} ${className}`}>
      <button
        type="button"
        onClick={() => onEditar(sesion)}
        title="Editar pase"
        aria-label={`Editar ${sesion.titulo}`}
        className={`${claseBoton} ${estilo.editar}`}
      >
        <PencilSimple weight="bold" className={estilo.icono} />
      </button>
      <button
        type="button"
        onClick={() => onEliminar(sesion)}
        title="Anular pase"
        aria-label={`Anular ${sesion.titulo}`}
        className={`${claseBoton} ${estilo.eliminar}`}
      >
        <Trash weight="bold" className={estilo.icono} />
      </button>
    </div>
  );
}
