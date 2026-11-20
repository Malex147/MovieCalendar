const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';

/**
 * Busca películas y series por título en español
 * Devuelve un máximo de 6 resultados formateados
 */
export const buscarTitulos = async (query) => {
  if (!query || query.trim().length < 2) return [];

  const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&include_adult=false`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error en TMDB: ${response.status}`);
    }

    const data = await response.json();

    return data.results
      // Nos quedamos solo con películas ('movie') y series ('tv'), descartando personas ('person')
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .slice(0, 6)
      .map((item) => {
        const esPelicula = item.media_type === 'movie';
        const fecha = esPelicula ? item.release_date : item.first_air_date;

        return {
          tmdbId: item.id,
          titulo: esPelicula ? item.title : item.name,
          tipo: esPelicula ? 'Película' : 'Serie',
          anio: fecha ? fecha.split('-')[0] : 'Sin año',
          sinopsis: item.overview || 'Sin descripción disponible.',
          poster: item.poster_path
            ? `${IMAGE_BASE_URL}${item.poster_path}`
            : 'https://placehold.co/342x513/18181b/a1a1aa?text=Sin+Poster'
        };
      });
  } catch (error) {
    console.error('Error buscando en TMDB:', error);
    return [];
  }
};