import { useEffect, useState } from 'react';
import { suscribirACartelera } from '../services/sesiones';

/** Sesiones de la cartelera en tiempo real. Usar solo con un usuario conectado. */
export function useCartelera() {
  const [estado, setEstado] = useState({ sesiones: [], cargando: true, error: null });

  useEffect(
    () =>
      suscribirACartelera(
        (sesiones) => setEstado({ sesiones, cargando: false, error: null }),
        (error) => setEstado((actual) => ({ ...actual, cargando: false, error: error.message }))
      ),
    []
  );

  return estado;
}
