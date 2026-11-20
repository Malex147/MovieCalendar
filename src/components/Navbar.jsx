import { Film, Plus } from 'lucide-react';

export default function Navbar({ onAbrirModal }) {
  return (
    <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
            <Film className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">
              Cartelera del Grupo
            </h1>
            <p className="text-xs text-zinc-400">
              Próximas pelis y series juntos
            </p>
          </div>
        </div>

        <button
          onClick={onAbrirModal}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-semibold text-sm px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Añadir</span>
        </button>
      </div>
    </header>
  );
}