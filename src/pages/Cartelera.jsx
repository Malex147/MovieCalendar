import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Popcorn } from '@phosphor-icons/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SessionCard from '../components/sesiones/SessionCard';
import WeeklyCalendar from '../components/sesiones/WeeklyCalendar';
import ConfirmDeleteModal from '../components/sesiones/ConfirmDeleteModal';
import AddModal from '../components/formulario/AddModal';
import SettingsModal from '../components/ajustes/SettingsModal';
import Cargando from '../components/ui/Cargando';
import MensajeError from '../components/ui/MensajeError';
import { VISTAS } from '../components/layout/vistas';
import { useCartelera } from '../hooks/useCartelera';
import { useAccionesCartelera } from '../hooks/useAccionesCartelera';
import { useUltimoValor } from '../hooks/useUltimoValor';
import { cerrarSesionUsuario, cambiarNombreUsuario } from '../services/auth';

/** Pantalla principal para un usuario conectado. */
export default function Cartelera({ usuario, onUsuarioActualizado }) {
  const { sesiones, cargando, error } = useCartelera();
  const acciones = useAccionesCartelera(usuario, sesiones);

  const [vista, setVista] = useState(VISTAS[0].id);
  // Formulario: cerrado (null), creando ({}) o editando ({ sesion })
  const [formulario, setFormulario] = useState(null);
  const formularioVisible = useUltimoValor(formulario); // conserva el contenido al cerrar
  const sesionEditada = formularioVisible?.sesion;
  const [sesionAEliminar, setSesionAEliminar] = useState(null);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);

  const abrirParaCrear = () => setFormulario({});
  const abrirParaEditar = (sesion) => setFormulario({ sesion });

  const cambiarNombre = async (nuevoNombre) => {
    onUsuarioActualizado(await cambiarNombreUsuario(nuevoNombre));
  };

  const propsSesion = {
    usuarioActual: usuario.nombre,
    onToggleAsistencia: acciones.alternarAsistencia,
    onEditar: abrirParaEditar,
    onEliminar: setSesionAEliminar
  };

  const esCalendario = vista === 'calendario';

  const renderizarContenido = () => {
    if (cargando) return <Cargando mensaje="Abriendo taquilla..." />;
    if (error) return <MensajeError>Error de conexión con Firestore: {error}</MensajeError>;
    if (esCalendario) return <WeeklyCalendar sesiones={sesiones} {...propsSesion} />;
    if (sesiones.length === 0) return <SalaVacia onCrear={abrirParaCrear} />;

    return (
      <div className="space-y-5">
        <AnimatePresence mode="popLayout">
          {sesiones.map((sesion, idx) => (
            <SessionCard key={sesion.id} sesion={sesion} index={idx} {...propsSesion} />
          ))}
        </AnimatePresence>
      </div>
    );
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
        onAbrirAjustes={() => setAjustesAbierto(true)}
      />

      <main
        className={`flex-1 w-full ${esCalendario ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 pt-8 sm:pt-10 transition-all duration-300`}
      >
        <div className="mb-8 text-center sm:text-left">
          <p className="font-mono-ticket text-xs uppercase tracking-[0.2em] text-rose-400 mb-1">
            Programación Oficial
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-white">
            {esCalendario ? 'Parrilla de la semana' : 'Próximas funciones'}
          </h1>
        </div>

        {renderizarContenido()}
      </main>

      <AddModal
        abierto={formulario !== null}
        sesionAEditar={sesionEditada}
        anfitrion={sesionEditada ? sesionEditada.autor || sesionEditada.creadoPor : usuario.nombre}
        onCerrar={() => setFormulario(null)}
        onCrear={acciones.crear}
        onActualizar={acciones.actualizar}
      />

      <ConfirmDeleteModal
        sesion={sesionAEliminar}
        onCerrar={() => setSesionAEliminar(null)}
        onConfirmar={acciones.eliminar}
      />

      <SettingsModal
        abierto={ajustesAbierto}
        onCerrar={() => setAjustesAbierto(false)}
        usuario={usuario}
        onGuardarNombre={cambiarNombre}
      />

      <Footer />
    </div>
  );
}

function SalaVacia({ onCrear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 px-6 bg-zinc-900/40 border border-dashed border-white/15 rounded-3xl"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Popcorn weight="duotone" className="w-8 h-8 text-amber-400" />
      </div>
      <h2 className="font-editorial text-3xl text-white mb-2">La sala está vacía</h2>
      <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
        Saca la primera entrada y elige qué película o serie vais a ver juntos este fin de semana.
      </p>
      <button
        type="button"
        onClick={onCrear}
        className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition cursor-pointer"
      >
        Sacar primer ticket
      </button>
    </motion.div>
  );
}
