import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder } from 'framer-motion';
import { BookmarkSimple, Plus } from '@phosphor-icons/react';
import TarjetaPorVer from './TarjetaPorVer';
import EstadoVacio from '../ui/EstadoVacio';
import MensajeError from '../ui/MensajeError';
import { ordenDe } from '../../services/porVer';

// Con teclado cada flecha reordena: se guarda cuando se deja de mover un momento
const ESPERA_GUARDADO_MS = 700;

/** Mantiene el orden local, quitando lo que ya no existe y añadiendo al final lo nuevo. */
const reconciliar = (idsLocal, ordenados) => {
  const existentes = new Set(ordenados.map((p) => p.id));
  const local = idsLocal.filter((id) => existentes.has(id));
  const nuevos = ordenados.map((p) => p.id).filter((id) => !local.includes(id));
  return [...local, ...nuevos];
};

/**
 * Vista "Por ver": títulos sin fecha, en el orden que elija el grupo arrastrándolos.
 * Mientras se arrastra se usa un orden local; al soltar se guarda en Firestore para todos.
 */
export default function ListaPorVer({ pendientes, onAnadir, onReordenar, ...propsTarjeta }) {
  const ordenados = useMemo(() => [...pendientes].sort((a, b) => ordenDe(a) - ordenDe(b)), [pendientes]);
  const porId = useMemo(() => new Map(pendientes.map((p) => [p.id, p])), [pendientes]);

  const [idsLocal, setIdsLocal] = useState(null);
  const [error, setError] = useState('');
  const ids = idsLocal ? reconciliar(idsLocal, ordenados) : ordenados.map((p) => p.id);

  // Estado del guardado que no afecta al pintado
  const guardadoRef = useRef({ arrastrando: false, temporizador: null, idsPendientes: null, porId });
  useEffect(() => {
    guardadoRef.current.porId = porId;
  }, [porId]);

  const guardar = async () => {
    const estado = guardadoRef.current;
    clearTimeout(estado.temporizador);
    if (estado.arrastrando || !estado.idsPendientes) return;

    const enOrden = estado.idsPendientes.map((id) => estado.porId.get(id)).filter(Boolean);
    estado.idsPendientes = null;
    try {
      await onReordenar(enOrden);
      setError('');
    } catch (err) {
      console.error('Error guardando el orden:', err);
      setError('No se pudo guardar el nuevo orden. Inténtalo de nuevo.');
    } finally {
      // Si mientras tanto se ha vuelto a mover, se conserva ese orden local
      if (!guardadoRef.current.idsPendientes) setIdsLocal(null);
    }
  };

  // Al salir de la vista, guardar lo que quede pendiente
  useEffect(() => () => guardar(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const alReordenar = (nuevosIds) => {
    const estado = guardadoRef.current;
    setIdsLocal(nuevosIds);
    estado.idsPendientes = nuevosIds;
    clearTimeout(estado.temporizador);
    estado.temporizador = setTimeout(guardar, ESPERA_GUARDADO_MS);
  };

  const alEmpezarArrastre = () => {
    guardadoRef.current.arrastrando = true;
  };

  const alSoltar = () => {
    guardadoRef.current.arrastrando = false;
    guardar();
  };

  if (pendientes.length === 0) {
    return (
      <EstadoVacio
        icono={BookmarkSimple}
        titulo="Nada pendiente"
        texto="Apunta aquí las pelis y series que os apetece ver. Cuando sepáis el día, la programáis en un clic."
        textoBoton="Añadir la primera"
        onAccion={onAnadir}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-400">
          {pendientes.length} {pendientes.length === 1 ? 'título' : 'títulos'} · arrastra{' '}
          <span className="hidden sm:inline">por el asa </span>para ordenarlos
        </p>
        <button
          type="button"
          onClick={onAnadir}
          className="inline-flex items-center gap-1.5 font-mono-ticket text-xs font-bold bg-white hover:bg-zinc-200 text-zinc-950 px-4 py-2 rounded-full transition cursor-pointer shrink-0"
        >
          <Plus weight="bold" className="w-3.5 h-3.5" />
          Añadir
        </button>
      </div>

      <MensajeError>{error}</MensajeError>

      <Reorder.Group
        as="ol"
        values={ids}
        onReorder={alReordenar}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none p-0"
      >
        {ids.map((id, indice) => (
          <TarjetaPorVer
            key={id}
            pendiente={porId.get(id)}
            posicion={indice + 1}
            onEmpezarArrastre={alEmpezarArrastre}
            onSoltar={alSoltar}
            {...propsTarjeta}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
