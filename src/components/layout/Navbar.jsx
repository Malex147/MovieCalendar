import { useState } from 'react';
import { Plus, List, SignOut, UserCircle, GearSix } from '@phosphor-icons/react';
import Logo from '../ui/Logo';
import MenuMovil from './MenuMovil';
import { VISTAS } from './vistas';
import { opcionSegmentada } from '../ui/estilos';

export default function Navbar({
  vista,
  setVista,
  onAbrirModal,
  totalSesiones,
  usuario,
  onCerrarSesion,
  onAbrirAjustes
}) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08080a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Marca */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Logo />
            <div className="min-w-0">
              <span className="font-editorial text-xl sm:text-2xl text-white tracking-tight block leading-none truncate">
                Sala Privada
              </span>
              <span className="font-mono-ticket text-[10px] uppercase tracking-widest text-zinc-400 block mt-0.5">
                {totalSesiones} {totalSesiones === 1 ? 'pase activo' : 'pases activos'}
              </span>
            </div>
          </div>

          {/* Controles PC */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center bg-zinc-900/90 border border-white/10 p-1 rounded-full">
              {VISTAS.map(({ id, etiqueta, Icono }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVista(id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap ${opcionSegmentada(vista === id)}`}
                >
                  <Icono weight="bold" className="w-3.5 h-3.5" />
                  <span>{etiqueta}</span>
                </button>
              ))}
            </div>

            {/* En pantallas medianas solo el icono, para que quepan las tres vistas */}
            <button
              type="button"
              onClick={onAbrirModal}
              aria-label="Nueva sesión"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-zinc-950 font-bold text-xs uppercase tracking-wider p-2.5 lg:px-4 rounded-full whitespace-nowrap transition cursor-pointer shadow-lg shadow-rose-500/20"
            >
              <Plus weight="bold" className="w-4 h-4" />
              <span className="hidden lg:inline">Nueva sesión</span>
            </button>

            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <button
                type="button"
                onClick={onAbrirAjustes}
                title="Ajustes de perfil"
                aria-label="Ajustes de perfil"
                className="inline-flex items-center gap-1.5 font-mono-ticket text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap transition cursor-pointer"
              >
                <UserCircle weight="duotone" className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline max-w-32 truncate">{usuario.nombre}</span>
                <GearSix weight="bold" className="w-3.5 h-3.5 text-zinc-400 ml-0.5" />
              </button>
              <button
                type="button"
                onClick={onCerrarSesion}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="p-2 rounded-full bg-white/5 hover:bg-rose-500/15 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
              >
                <SignOut weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controles móvil: crear rápido + abrir menú */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAbrirModal}
              aria-label="Nueva sesión"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-zinc-950 shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              <Plus weight="bold" className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              aria-label="Abrir menú"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 transition cursor-pointer"
            >
              <List weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <MenuMovil
        abierto={menuMovilAbierto}
        onCerrar={() => setMenuMovilAbierto(false)}
        usuario={usuario}
        vista={vista}
        setVista={setVista}
        onAbrirModal={onAbrirModal}
        onAbrirAjustes={onAbrirAjustes}
        onCerrarSesion={onCerrarSesion}
      />
    </>
  );
}
