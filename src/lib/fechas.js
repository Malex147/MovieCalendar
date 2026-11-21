// Utilidades puras de fechas. Se comparten con la Netlify Function.
//
// Las sesiones guardan `fechaHora` como hora local sin zona: "YYYY-MM-DDTHH:mm".
// Para formatearla igual en el navegador y en el servidor (que corre en UTC),
// se interpreta siempre como UTC y se formatea con timeZone: 'UTC'.

const LOCALE = 'es-ES';

const dosCifras = (n) => String(n).padStart(2, '0');

/** Date local → "YYYY-MM-DD" */
export const aDiaISO = (fecha) =>
  `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;

export const hoyISO = () => aDiaISO(new Date());

/** "YYYY-MM-DDTHH:mm" → { dia: "YYYY-MM-DD", hora: "HH", minuto: "mm" } */
export const separarFechaHora = (fechaHora = '') => {
  const [dia = '', horaMinuto = ''] = fechaHora.split('T');
  const [hora = '', minuto = ''] = horaMinuto.split(':');
  return { dia, hora, minuto };
};

export const unirFechaHora = (dia, hora, minuto) => `${dia}T${hora}:${minuto}`;

/** "YYYY-MM-DDTHH:mm" → "HH:mm" */
export const formatearHora = (fechaHora = '') => fechaHora.slice(11, 16);

/** Formatea el día de un "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm" con las opciones de Intl dadas. */
export const formatearDia = (fechaHora = '', opciones = { day: 'numeric', month: 'short' }) => {
  const fecha = new Date(`${fechaHora.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString(LOCALE, { ...opciones, timeZone: 'UTC' });
};

/** "dom, 22 nov, 21:30" */
export const formatearDiaYHora = (fechaHora) =>
  `${formatearDia(fechaHora, { weekday: 'short', day: 'numeric', month: 'short' })}, ${formatearHora(fechaHora)}`;

// --- Calendario (fechas locales) ---

export const sumarDias = (fecha, dias) => {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
};

export const lunesDeSemana = (fechaBase) => {
  const fecha = new Date(fechaBase);
  const diaSemana = fecha.getDay();
  fecha.setDate(fecha.getDate() + (diaSemana === 0 ? -6 : 1 - diaSemana));
  fecha.setHours(0, 0, 0, 0);
  return fecha;
};

export const primeroDeMes = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), 1);

/** Celdas de un mes empezando en lunes; `null` para los huecos iniciales. */
export const celdasDelMes = (mes) => {
  const anio = mes.getFullYear();
  const numMes = mes.getMonth();
  const huecos = (new Date(anio, numMes, 1).getDay() + 6) % 7;
  const diasEnMes = new Date(anio, numMes + 1, 0).getDate();

  return [
    ...Array.from({ length: huecos }, () => null),
    ...Array.from({ length: diasEnMes }, (_, i) => new Date(anio, numMes, i + 1))
  ];
};
