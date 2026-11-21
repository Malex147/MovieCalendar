import { WarningCircle } from '@phosphor-icons/react';

/** Aviso de error en línea. No pinta nada si no hay mensaje. */
export default function MensajeError({ children, className = '' }) {
  if (!children) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs ${className}`}
    >
      <WarningCircle weight="fill" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
