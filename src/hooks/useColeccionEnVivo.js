import { useEffect, useState } from 'react';

/**
 * Datos en tiempo real de una colección. `suscribir(onDatos, onError)` debe devolver
 * la función para dejar de escuchar (como suscribirACartelera o suscribirAPorVer).
 * Usar solo con un usuario conectado.
 */
export function useColeccionEnVivo(suscribir) {
  const [estado, setEstado] = useState({ datos: [], cargando: true, error: null });

  useEffect(
    () =>
      suscribir(
        (datos) => setEstado({ datos, cargando: false, error: null }),
        (error) => setEstado((actual) => ({ ...actual, cargando: false, error: error.message }))
      ),
    [suscribir]
  );

  return estado;
}
