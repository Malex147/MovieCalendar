import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Popcorn } from '@phosphor-icons/react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SessionCard from '../components/sesiones/SessionCard';
import WeeklyCalendar from '../components/sesiones/WeeklyCalendar';
import ConfirmDeleteModal from '../components/sesiones/ConfirmDeleteModal';
import ListaPorVer from '../components/porVer/ListaPorVer';
import AnadirPorVerModal from '../components/porVer/AnadirPorVerModal';
import AddModal from '../components/formulario/AddModal';
import SettingsModal from '../components/ajustes/SettingsModal';
import AvisoNotificaciones from '../components/ajustes/AvisoNotificaciones';
import ModalConfirmacion from '../components/ui/ModalConfirmacion';
import EstadoVacio from '../components/ui/EstadoVacio';
import Cargando from '../components/ui/Cargando';
import MensajeError from '../components/ui/MensajeError';
import { VISTAS, buscarVista } from '../components/layout/vistas';
import { useColeccionEnVivo } from '../hooks/useColeccionEnVivo';
import { useAccionesCartelera } from '../hooks/useAccionesCartelera';
import { useAccionesPorVer } from '../hooks/useAccionesPorVer';
import { useUltimoValor } from '../hooks/useUltimoValor';
import { suscribirACartelera } from '../services/sesiones';
import { suscribirAPorVer } from '../services/porVer';
import { cerrarSesionUsuario, cambiarNombreUsuario } from '../services/auth';
import { sincronizarNotificaciones, olvidarEsteDispositivo } from '../services/notificaciones';

const TEXTOS_QUITAR_POR_VER = {
  titulo: '¿Quitar de Por ver?',
  subtitulo: 'Desaparecerá de la lista compartida de todo el grupo.',
  cancelar: 'Mantener',
  confirmar: 'Sí, quitar',
  procesando: 'Quitando...',
  error: 'No se pudo quitar de la lista. Inténtalo de nuevo.'
};

/** Pantalla principal para un usuario conectado. */
export default function Cartelera({ usuario, onUsuarioActualizado }) {
  const cartelera = useColeccionEnVivo(suscribirACartelera);
  const porVer = useColeccionEnVivo(suscribirAPorVer);
  const sesiones = cartelera.datos;
  const accionesSesion = useAccionesCartelera(usuario, sesiones);
  const accionesPorVer = useAccionesPorVer(usuario);

  const [vistaId, setVistaId] = useState(VISTAS[0].id);
  const vista = buscarVista(vistaId);

  // Formulario de sesión: cerrado (null), nueva ({}), editar ({ sesion }) o programar desde Por ver ({ pendiente })
  const [formulario, setFormulario] = useState(null);
  const formularioVisible = useUltimoValor(formulario); // conserva el contenido al cerrar
  const [sesionAEliminar, setSesionAEliminar] = useState(null);
  const [anadiendoPorVer, setAnadiendoPorVer] = useState(false);
  const [pendienteAQuitar, setPendienteAQuitar] = useState(null);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);

  // Asegura que este dispositivo recibe los avisos de la cuenta conectada (si ya dio permiso)
  useEffect(() => {
    sincronizarNotificaciones();
  }, [usuario.uid]);

  const cerrarSesion = async () => {
    await olvidarEsteDispositivo(); // antes de salir: después ya no hay permisos para borrarla
    await cerrarSesionUsuario();
  };

  const cambiarNombre = async (nuevoNombre) => {
    onUsuarioActualizado(await cambiarNombreUsuario(nuevoNombre));
  };

  const abrirParaCrear = () => setFormulario({});
  const abrirParaEditar = (sesion) => setFormulario({ sesion });
  const abrirParaProgramar = (pendiente) => setFormulario({ pendiente });

  // Al programar un título de "Por ver", sale de la lista una vez creada la sesión
  const crearSesion = async (datos) => {
    await accionesSesion.crear(datos);
    const pendiente = formulario?.pendiente;
    if (pendiente) {
      await accionesPorVer.quitar(pendiente.id).catch((err) => {
        console.warn('Sesión creada, pero no se pudo quitar de Por ver:', err);
      });
    }
  };

  const sesionEditada = formularioVisible?.sesion;
  const pendienteAProgramar = formularioVisible?.pendiente;
  const plantilla = pendienteAProgramar && {
    titulo: {
      tmdbId: pendienteAProgramar.tmdbId,
      titulo: pendienteAProgramar.titulo,
      tipo: pendienteAProgramar.tipo,
      anio: pendienteAProgramar.anio,
      poster: pendienteAProgramar.poster
    },
    nota: pendienteAProgramar.nota
  };

  const propsSesion = {
    usuarioActual: usuario.nombre,
    onToggleAsistencia: accionesSesion.alternarAsistencia,
    onEditar: abrirParaEditar,
    onEliminar: setSesionAEliminar
  };

  // Qué datos necesita cada vista y cómo se pinta
  const CONTENIDO = {
    lista: {
      fuente: cartelera,
      cargando: 'Abriendo taquilla...',
      pintar: () =>
        sesiones.length === 0 ? (
          <EstadoVacio
            icono={Popcorn}
            titulo="La sala está vacía"
            texto="Saca la primera entrada y elige qué película o serie vais a ver juntos este fin de semana."
            textoBoton="Sacar primer ticket"
            onAccion={abrirParaCrear}
          />
        ) : (
          <div className="space-y-5">
            <AnimatePresence mode="popLayout">
              {sesiones.map((sesion, idx) => (
                <SessionCard key={sesion.id} sesion={sesion} index={idx} {...propsSesion} />
              ))}
            </AnimatePresence>
          </div>
        )
    },
    calendario: {
      fuente: cartelera,
      cargando: 'Abriendo taquilla...',
      pintar: () => <WeeklyCalendar sesiones={sesiones} {...propsSesion} />
    },
    porVer: {
      fuente: porVer,
      cargando: 'Buscando la lista...',
      pintar: () => (
        <ListaPorVer
          pendientes={porVer.datos}
          usuarioActual={usuario.nombre}
          onAnadir={() => setAnadiendoPorVer(true)}
          onAlternarInteres={accionesPorVer.alternarInteres}
          onProgramar={abrirParaProgramar}
          onQuitar={setPendienteAQuitar}
        />
      )
    }
  };

  const renderizarContenido = () => {
    const { fuente, cargando, pintar } = CONTENIDO[vista.id];
    if (fuente.cargando) return <Cargando mensaje={cargando} />;
    if (fuente.error) return <MensajeError>Error de conexión con Firestore: {fuente.error}</MensajeError>;
    return pintar();
  };

  return (
    <div className="min-h-screen film-grain text-zinc-100 flex flex-col">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-rose-500/10 blur-[120px] pointer-events-none -z-10" />

      <Navbar
        vista={vista.id}
        setVista={setVistaId}
        onAbrirModal={abrirParaCrear}
        totalSesiones={sesiones.length}
        usuario={usuario}
        onCerrarSesion={cerrarSesion}
        onAbrirAjustes={() => setAjustesAbierto(true)}
      />

      <main
        className={`flex-1 w-full ${vista.ancha ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-4 pt-8 sm:pt-10 transition-all duration-300`}
      >
        <div className="mb-8 text-center sm:text-left">
          <p className="font-mono-ticket text-xs uppercase tracking-[0.2em] text-rose-400 mb-1">
            {vista.id === 'porVer' ? 'Lista compartida' : 'Programación Oficial'}
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl text-white">{vista.titulo}</h1>
        </div>

        {renderizarContenido()}
      </main>

      <AddModal
        abierto={formulario !== null}
        sesionAEditar={sesionEditada}
        plantilla={plantilla}
        anfitrion={sesionEditada ? sesionEditada.autor || sesionEditada.creadoPor : usuario.nombre}
        onCerrar={() => setFormulario(null)}
        onCrear={crearSesion}
        onActualizar={accionesSesion.actualizar}
      />

      <ConfirmDeleteModal
        sesion={sesionAEliminar}
        onCerrar={() => setSesionAEliminar(null)}
        onConfirmar={accionesSesion.eliminar}
      />

      <AnadirPorVerModal
        abierto={anadiendoPorVer}
        onCerrar={() => setAnadiendoPorVer(false)}
        onAnadir={accionesPorVer.agregar}
      />

      <ModalConfirmacion
        elemento={pendienteAQuitar}
        onCerrar={() => setPendienteAQuitar(null)}
        onConfirmar={accionesPorVer.quitar}
        textos={TEXTOS_QUITAR_POR_VER}
        detalle={(p) => `${p.tipo} · ${p.anio}`}
      />

      <SettingsModal
        abierto={ajustesAbierto}
        onCerrar={() => setAjustesAbierto(false)}
        usuario={usuario}
        onGuardarNombre={cambiarNombre}
      />

      <AvisoNotificaciones />

      <Footer />
    </div>
  );
}
