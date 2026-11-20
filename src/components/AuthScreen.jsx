import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FilmStrip,
  User,
  LockKey,
  Eye,
  EyeSlash,
  WarningCircle,
  SpinnerGap
} from '@phosphor-icons/react';
import { iniciarSesionUsuario, registrarUsuario } from '../services/firebase';

export default function AuthScreen() {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      if (modo === 'login') {
        await iniciarSesionUsuario(nombre, password);
      } else {
        await registrarUsuario(nombre, password);
      }
    } catch (err) {
      setError(err.message || 'Ha ocurrido un error al acceder.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen film-grain text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/15 blur-[130px] pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm bg-zinc-900/85 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Cabecera */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-rose-500/25 mb-3">
            <FilmStrip weight="fill" className="w-6 h-6" />
          </div>
          <p className="font-mono-ticket text-[10px] uppercase tracking-[0.2em] text-rose-400">
            Acceso Privado
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-white mt-0.5">
            Sala Privada
          </h1>
        </div>

        {/* Selector Entrar / Crear cuenta */}
        <div className="grid grid-cols-2 bg-zinc-950 border border-white/10 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setModo('login');
              setError('');
            }}
            className={`font-mono-ticket text-xs py-2 rounded-xl transition cursor-pointer ${
              modo === 'login'
                ? 'bg-white text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setModo('registro');
              setError('');
            }}
            className={`font-mono-ticket text-xs py-2 rounded-xl transition cursor-pointer ${
              modo === 'registro'
                ? 'bg-white text-zinc-950 font-bold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Nombre único
            </label>
            <div className="relative">
              <User
                weight="duotone"
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                required
                autoFocus
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carlos"
                className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono-ticket text-[10px] uppercase tracking-wider text-zinc-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <LockKey
                weight="duotone"
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
              />
              <input
                type={mostrarPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
                className="w-full bg-zinc-950 border border-white/10 focus:border-rose-500 rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {mostrarPass ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs">
              <WarningCircle weight="fill" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando || !nombre.trim() || !password}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 disabled:opacity-35 text-zinc-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition cursor-pointer shadow-lg shadow-rose-500/20 mt-2"
          >
            {cargando && <SpinnerGap className="w-4 h-4 animate-spin" />}
            <span>{modo === 'login' ? 'Entrar a la sala' : 'Registrar mi nombre'}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}