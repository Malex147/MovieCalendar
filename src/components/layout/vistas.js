import { Ticket, CalendarBlank, BookmarkSimple, FilmReel } from '@phosphor-icons/react';

// Vistas de la cartelera. Para añadir una nueva basta con añadirla aquí
// (y su contenido en pages/Cartelera.jsx). `ancha` usa todo el ancho de la página.
export const VISTAS = [
  {
    id: 'lista',
    etiqueta: 'Tickets',
    etiquetaLarga: 'Tickets (Lista)',
    titulo: 'Próximas funciones',
    Icono: Ticket,
    ancha: false
  },
  {
    id: 'calendario',
    etiqueta: 'Semana',
    etiquetaLarga: 'Parrilla Semanal',
    titulo: 'Parrilla de la semana',
    Icono: CalendarBlank,
    ancha: true
  },
  {
    id: 'porVer',
    etiqueta: 'Por ver',
    etiquetaLarga: 'Por ver (sin fecha)',
    titulo: 'Por ver',
    Icono: BookmarkSimple,
    ancha: true
  },
  {
    id: 'vistas',
    etiqueta: 'Vistas',
    etiquetaLarga: 'Ya vistas',
    titulo: 'Ya vistas',
    Icono: FilmReel,
    ancha: true
  }
];

export const buscarVista = (id) => VISTAS.find((v) => v.id === id) ?? VISTAS[0];
