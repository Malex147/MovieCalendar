import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, LockKey, Eye, EyeSlash, SpinnerGap } from '@phosphor-icons/react';
import Logo from '../ui/Logo';
import MensajeError from '../ui/MensajeError';
import { BOTON_PRINCIPAL, CAMPO_TEXTO, ETIQUETA_CAMPO, opcionSegmentada } from '../ui/estilos';
import { iniciarSesionUsuario, registrarUsuario } from '../../services/auth';

const MODOS = {
  login: {
    pestana: 'Entrar',
    boton: 'Entrar a la sala',
    placeholderPassword: '••••••••',
    accion: iniciarSesionUsuario
  },
  registro: {
    pestana: 'Crear cuenta',
    boton: 'Registrar mi nombre',
    placeholderPassword: 'Mínimo 6 caracteres',
    accion: registrarUsuario
  }
};

const ICONO_CAMPO = 'w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2';

/** Pantalla de acceso: entrar o crear cuenta con nombre único + contraseña. */
export default function AuthScreen() {
  const [modo, setModo] = useState('login');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const config = MODOS[modo];

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError('');
  };

  // Si todo va bien, useAuth detecta la sesión y App cambia de pantalla sola
  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await config.accion(nombre, password);
    } catch (err) {
      setError(err.message || 'Ha ocurrido un error al acceder.');
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
        <div className="flex flex-col items-center text-center mb-6">
          <Logo tamano="grande" className="mb-3" />
          <p className="font-mono-ticket text-[10px] uppercase tracking-[0.2em] text-rose-400">Acceso Privado</p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-white mt-0.5">Sala Privada</h1>
        </div>

        <div className="grid grid-cols-2 bg-zinc-950 border border-white/10 p-1 rounded-2xl mb-6" role="tablist">
          {Object.entries(MODOS).map(([id, { pestana }]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={modo === id}
              onClick={() => cambiarModo(id)}
              className={`py-2 rounded-xl ${opcionSegmentada(modo === id)}`}
            >
              {pestana}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <label className="block">
            <span className={ETIQUETA_CAMPO}>Nombre único</span>
            <span className="relative block">
              <User weight="duotone" className={ICONO_CAMPO} />
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carlos"
                className={`${CAMPO_TEXTO} focus:border-rose-500 pl-10 pr-4`}
              />
            </span>
          </label>

          <label className="block">
            <span className={ETIQUETA_CAMPO}>Contraseña</span>
            <span className="relative block">
              <LockKey weight="duotone" className={ICONO_CAMPO} />
              <input
                type={mostrarPassword ? 'text' : 'password'}
                required
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={config.placeholderPassword}
                className={`${CAMPO_TEXTO} focus:border-rose-500 pl-10 pr-10`}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
              >
                {mostrarPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </span>
          </label>

          <MensajeError>{error}</MensajeError>

          <button
            type="submit"
            disabled={cargando || !nombre.trim() || !password}
            className={`w-full text-xs uppercase tracking-wider py-3.5 mt-2 disabled:opacity-35 ${BOTON_PRINCIPAL}`}
          >
            {cargando && <SpinnerGap className="w-4 h-4 animate-spin" />}
            <span>{config.boton}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
