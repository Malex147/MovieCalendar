import { SpinnerGap } from '@phosphor-icons/react';

/** Spinner con mensaje. `pantallaCompleta` lo centra en toda la ventana. */
export default function Cargando({ mensaje, pantallaCompleta = false }) {
  return (
    <div
      className={
        pantallaCompleta
          ? 'min-h-screen film-grain text-zinc-100 flex flex-col items-center justify-center'
          : 'flex flex-col items-center justify-center py-24 text-zinc-400'
      }
    >
      <SpinnerGap className="w-8 h-8 animate-spin text-rose-400 mb-3" />
      <p
        className={`font-mono-ticket text-xs uppercase tracking-widest ${
          pantallaCompleta ? 'text-zinc-400' : ''
        }`}
      >
        {mensaje}
      </p>
    </div>
  );
}
