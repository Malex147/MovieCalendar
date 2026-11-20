import { Calendar, Clock, User, Trash2, Tv, Clapperboard, MessageSquare } from 'lucide-react';

export default function SessionCard({ sesion, onEliminar }) {
  const fechaObj = new Date(sesion.fechaHora);

  // Formateamos fecha (ej: "sábado, 21 nov") y hora (ej: "22:00")
  const fechaTexto = fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  const horaTexto = fechaObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const esSerie = sesion.tipo === 'Serie';

  const manejarBorrado = () => {
    if (window.confirm(`¿Quitar "${sesion.titulo}" de la cartelera?`)) {
      onEliminar(sesion.id);
    }
  };

  return (
    <article className="group relative flex gap-4 bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/90 hover:border-zinc-700 p-3.5 rounded-2xl transition shadow-sm">
      {/* Póster de la película/serie */}
      <img
        src={sesion.poster}
        alt={`Póster de ${sesion.titulo}`}
        className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-xl shrink-0 bg-zinc-800 shadow-md"
      />

      {/* Información de la sesión */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          {/* Fecha, hora e insignia de tipo */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold capitalize text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              <Calendar className="w-3 h-3" />
              {fechaTexto}
            </span>

            <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-zinc-400" />
              {horaTexto}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                esSerie
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                  : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
              }`}
            >
              {esSerie ? <Tv className="w-3 h-3" /> : <Clapperboard className="w-3 h-3" />}
              {sesion.tipo}
            </span>
          </div>

          {/* Título y año */}
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">
            {sesion.titulo}{' '}
            {sesion.anio && (
              <span className="text-sm font-normal text-zinc-500">({sesion.anio})</span>
            )}
          </h2>

          {/* Nota extra (ej: capítulo de serie, enlace, plataforma) */}
          {sesion.nota && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-300 bg-zinc-800/70 px-2.5 py-1 rounded-lg">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{sesion.nota}</span>
            </p>
          )}
        </div>

        {/* Pie de tarjeta: quién la propone */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <User className="w-3.5 h-3.5 text-zinc-500" />
            Propuesta por <strong className="text-zinc-200 font-medium">{sesion.autor}</strong>
          </span>
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={manejarBorrado}
        title="Eliminar de la cartelera"
        className="self-start p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </article>
  );
}