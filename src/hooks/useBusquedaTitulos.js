import { useEffect, useState } from 'react';
import { buscarTitulos, LONGITUD_MIN_BUSQUEDA } from '../services/tmdb';

const RETARDO_MS = 450;

/** Búsqueda en TMDB con retardo (debounce) y cancelación de peticiones antiguas. */
export function useBusquedaTitulos(consulta) {
  const [estado, setEstado] = useState({ resultados: [], error: '', buscando: false });

  const termino = consulta.trim();
  const esValida = termino.length >= LONGITUD_MIN_BUSQUEDA;

  useEffect(() => {
    if (!esValida) return undefined;

    const controlador = new AbortController();
    const temporizador = setTimeout(async () => {
      setEstado((actual) => ({ ...actual, buscando: true }));
      try {
        const resultados = await buscarTitulos(termino, { signal: controlador.signal });
        setEstado({ resultados, error: '', buscando: false });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error buscando en TMDB:', err);
        setEstado({ resultados: [], error: 'No se pudo buscar en TMDB. Inténtalo de nuevo.', buscando: false });
      }
    }, RETARDO_MS);

    return () => {
      clearTimeout(temporizador);
      controlador.abort();
    };
  }, [termino, esValida]);

  return esValida ? estado : { resultados: [], error: '', buscando: false };
}
