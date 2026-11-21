// Búsqueda de películas y series en TMDB.
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const POSTER_VACIO = 'https://placehold.co/342x513/18181b/a1a1aa?text=Sin+Poster';

export const LONGITUD_MIN_BUSQUEDA = 2;
const MAX_RESULTADOS = 6;

const aTitulo = (item) => {
  const esPelicula = item.media_type === 'movie';
  const fecha = esPelicula ? item.release_date : item.first_air_date;

  return {
    tmdbId: item.id,
    titulo: esPelicula ? item.title : item.name,
    tipo: esPelicula ? 'Película' : 'Serie',
    anio: fecha ? fecha.split('-')[0] : 'Sin año',
    poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : POSTER_VACIO
  };
};

/**
 * Busca películas y series por título (en español). Devuelve como máximo 6 resultados.
 * Lanza un Error si TMDB no responde, para que la interfaz pueda mostrarlo.
 */
export const buscarTitulos = async (consulta, { signal } = {}) => {
  if (!consulta || consulta.trim().length < LONGITUD_MIN_BUSQUEDA) return [];

  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'es-ES',
    query: consulta.trim(),
    include_adult: 'false'
  });

  const respuesta = await fetch(`${BASE_URL}/search/multi?${params}`, { signal });
  if (!respuesta.ok) throw new Error(`TMDB respondió con un error (${respuesta.status}).`);

  const { results = [] } = await respuesta.json();
  return results
    .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
    .slice(0, MAX_RESULTADOS)
    .map(aTitulo);
};
