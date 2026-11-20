import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Popcorn, SpinnerGap, WarningCircle } from '@phosphor-icons/react';
import Navbar from './components/Navbar';
import SessionCard from './components/SessionCard';
import WeeklyCalendar from './components/WeeklyCalendar';
import AddModal from './components/AddModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import AuthScreen from './components/AuthScreen';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import {
  suscribirAAuth,
  cerrarSesionUsuario,
  suscribirACartelera,
  agregarSesion,
  eliminarSesion,
  actualizarSesion,
  alternarAsistencia
} from './services/firebase';

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [comprobandoAuth, setComprobandoAuth] = useState(true);

  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sesionAEditar, setSesionAEditar] = useState(null);
  const [vista, setVista] = useState('lista');

  const [sesionAEliminar, setSesionAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);

  // Escuchar sesión del usuario
  useEffect(() => {
    const desuscribirAuth = suscribirAAuth((user) => {
      setUsuario(user);
      setComprobandoAuth(false);
    });
    return () => desuscribirAuth();
  }, []);

  // Escuchar cartelera solo cuando hay usuario conectado
  useEffect(() => {
    if (!usuario) {
      setSesiones([]);
      return;
    }

    setCargando(true);
    const desuscribir = suscribirACartelera(
      (datos) => {
        setSesiones(datos);
        setErrorConexion(null);
        setCargando(false);
      },
      (err) => {
        setErrorConexion(err.message);
        setCargando(false);
      }
    );

    return () => desuscribir();
  }, [usuario]);

  if (comprobandoAuth) {
    return (
      <div className="min-h-screen film-grain text-zinc-100 flex flex-col items-center justify-center">
        <SpinnerGap className="w-8 h-8 animate-spin text-rose-400 mb-3" />
        <p className="font-mono-ticket text-xs uppercase tracking-widest text-zinc-400">
          Comprobando pase...
        </p>
      </div>
    );
  }

  if (!usuario) {
    return <AuthScreen />;
  }

  const manejarToggleAsistencia = async (sesion) => {
    const yaEstaba = (sesion.asistentes || []).includes(usuario.nombre);
    await alternarAsistencia(sesion.id, usuario.nombre, yaEstaba);
  };

  const manejarCrearSesion = async (datos) => {
    await agregarSesion({
      ...datos,
      creadoPor: usuario.nombre
    });
  };

  const manejarActualizarSesion = async (id, datos) => {
    await actualizarSesion(id, {
      ...datos,
      editadoPor: usuario.nombre
    });
  };

  const abrirParaCrear = () => {
    setSesionAEditar(null);
    setModalAbierto(true);
  };

  const abrirParaEditar = (sesion) => {
    setSesionAEditar(sesion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setSesionAEditar(null);
  };

  const confirmarEliminacion = async (id) => {
    setEliminando(true);
    try {
      await eliminarSesion(id);
      setSesionAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setEliminando(false);
    }
  };

  const manejarCambioNombre = async (nuevoNombre) => {
    const usuarioActualizado = await cambiarNombreUsuario(nuevoNombre);
    setUsuario(usuarioActualizado);
  };

  return (
    <div className="min-h-screen film-grain text-zinc-100 flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-rose-500/10 blur-[120px] pointer-events-none -z-10" />

      <Navbar
        vista={vista}
        setVista={setVista}
        onAbrirModal={abrirParaCrear}
        totalSesiones={sesiones.length}
        usuario={usuario}
        onCerrarSesion={cerrarSesionUsuario}
      />

      <main className={`flex-1 w-full ${vista === 'calendario' ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 pt-8 sm:pt-10 transition-all duration-300`}>
        <div className="mb-8 text-center sm:text-left">
          <p className="font-mono-ticket text-xs uppercase tracking-[0.2em] text-rose-400 mb-1">
            Programación Oficial
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-white">
            {vista === 'lista' ? 'Próximas funciones' : 'Parrilla de la semana'}
          </h1>
        </div>

        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <SpinnerGap className="w-8 h-8 animate-spin text-rose-400 mb-3" />
            <p className="font-mono-ticket text-xs uppercase tracking-widest">Abriendo taquilla...</p>
          </div>
        ) : errorConexion ? (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm">
            <WarningCircle weight="fill" className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Error de conexión con Firestore: {errorConexion}</span>
          </div>
        ) : vista === 'calendario' ? (
          <WeeklyCalendar
            sesiones={sesiones}
            usuarioActual={usuario.nombre}
            onToggleAsistencia={manejarToggleAsistencia}
            onEditar={abrirParaEditar}
            onEliminar={(sesion) => setSesionAEliminar(sesion)}
          />
        ) : sesiones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 px-6 bg-zinc-900/40 border border-dashed border-white/15 rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Popcorn weight="duotone" className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="font-editorial text-3xl text-white mb-2">
              La sala está vacía
            </h2>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
              Saca la primera entrada y elige qué película o serie vais a ver juntos este fin de semana.
            </p>
            <button
              onClick={abrirParaCrear}
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition cursor-pointer"
            >
              Sacar primer ticket
            </button>
          </motion.div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {sesiones.map((sesion, idx) => (
                <SessionCard
                  key={sesion.id}
                  sesion={sesion}
                  index={idx}
                  usuarioActual={usuario.nombre}
                  onToggleAsistencia={manejarToggleAsistencia}
                  onEditar={abrirParaEditar}
                  onEliminar={(s) => setSesionAEliminar(s)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AddModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onGuardar={manejarCrearSesion}
        onActualizar={manejarActualizarSesion}
        sesionAEditar={sesionAEditar}
      />

      <ConfirmDeleteModal
        sesion={sesionAEliminar}
        eliminando={eliminando}
        onCancelar={() => setSesionAEliminar(null)}
        onConfirmar={confirmarEliminacion}
      />

      <SettingsModal
        isOpen={ajustesAbierto}
        onClose={() => setAjustesAbierto(false)}
        usuario={usuario}
        onGuardarNombre={manejarCambioNombre}
      />

      <Footer />
    </div>
  );
}