import { Eye, PencilSimple, Trash } from '@phosphor-icons/react';

// Tamaño y fondo según dónde se pinten los botones
const VARIANTES = {
  ticket: { boton: 'p-2 bg-white/5 text-zinc-400', icono: 'w-3.5 h-3.5', hueco: 'gap-1.5' },
  compacto: { boton: 'p-1.5 bg-white/5 text-zinc-400', icono: 'w-3.5 h-3.5', hueco: 'gap-1' },
  // Sobre el póster: fondo oscuro para que se lea encima de la imagen
  superpuesto: { boton: 'p-1.5 bg-black/75 text-zinc-300', icono: 'w-3 h-3', hueco: 'gap-1' }
};

// Acciones disponibles, en el orden en que se muestran. Solo aparecen las que reciben callback.
const ACCIONES = [
  { prop: 'onMarcarVista', Icono: Eye, texto: 'Marcar como vista', hover: 'hover:text-emerald-300 hover:bg-emerald-400/10' },
  { prop: 'onEditar', Icono: PencilSimple, texto: 'Editar pase', hover: 'hover:text-amber-300 hover:bg-amber-400/10' },
  { prop: 'onEliminar', Icono: Trash, texto: 'Anular pase', hover: 'hover:text-rose-400 hover:bg-rose-500/10' }
];

/** Botones de acción de una sesión: marcar como vista, editar y anular. */
export default function AccionesSesion({ sesion, variante = 'ticket', className = '', ...callbacks }) {
  const estilo = VARIANTES[variante];

  return (
    <div className={`flex items-center ${estilo.hueco} ${className}`}>
      {ACCIONES.filter(({ prop }) => callbacks[prop]).map(({ prop, Icono, texto, hover }) => (
        <button
          key={prop}
          type="button"
          onClick={() => callbacks[prop](sesion)}
          title={texto}
          aria-label={`${texto}: ${sesion.titulo}`}
          className={`rounded-full transition cursor-pointer ${estilo.boton} ${hover}`}
        >
          <Icono weight="bold" className={estilo.icono} />
        </button>
      ))}
    </div>
  );
}
