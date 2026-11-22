import { DeviceMobile } from '@phosphor-icons/react';

/** Cómo instalar la app en iPhone/iPad, requisito para recibir notificaciones allí. */
export default function InstruccionesIOS() {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300">
      <DeviceMobile weight="duotone" className="w-5 h-5 text-amber-400 shrink-0" />
      <span>
        En iPhone primero añade la app a la pantalla de inicio: botón <strong>Compartir</strong> →{' '}
        <strong>Añadir a pantalla de inicio</strong>. Ábrela desde ese icono y activa los avisos.
      </span>
    </div>
  );
}
