# Sala Privada · Cartelera

Cartelera privada para quedar con los amigos a ver películas y series: programar sesiones,
apuntarse con un clic y recibir avisos en el móvil cuando algo cambia.

**Stack:** React + Vite + Tailwind · Firebase (Auth + Firestore) · TMDB · Netlify (hosting + Functions) · Web Push.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y rellena los valores
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (las notificaciones no se envían en local) |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run lint` | ESLint |

Las variables de entorno están documentadas en [`.env.example`](.env.example). En Netlify hacen falta
las mismas, y `VITE_*` debe ir en `SECRETS_SCAN_OMIT_KEYS`.

## Estructura

```
src/
├── App.jsx              Elige pantalla: comprobando sesión / acceso / cartelera
├── pages/Cartelera.jsx  Pantalla principal del usuario conectado
├── hooks/               Estado y reglas de negocio (useAuth, useColeccionEnVivo, useAccionesCartelera…)
├── services/            Acceso a datos externos, sin React
│   ├── firebase.js        Inicialización
│   ├── auth.js            Registro, acceso y cambio de nombre
│   ├── sesiones.js        CRUD de la cartelera y asistencia
│   ├── porVer.js          Lista "Por ver" (títulos sin fecha) e interés
│   ├── notificaciones.js  Suscripción push y aviso al servidor
│   └── tmdb.js            Búsqueda de títulos
├── lib/                 Funciones puras compartidas con la Netlify Function
│   └── nombres.js · fechas.js · cambios.js · colecciones.js
└── components/
    ├── ui/              Piezas genéricas (Modal, MensajeError, Cargando, Logo, estilos)
    ├── layout/          Navbar, menú móvil, footer
    ├── auth/            Pantalla de acceso
    ├── sesiones/        Ticket, parrilla semanal, botones de asistencia y acciones
    ├── porVer/          Lista "Por ver": tarjetas y popup para añadir
    ├── formulario/      Popup de sesión: buscador, calendario, selector de hora
    └── ajustes/         Perfil y notificaciones

netlify/functions/notificar.mjs   Envía las notificaciones push
public/sw.js                      Service worker (instalación PWA + push)
```

### Reglas que sigue el código

- **Componentes solo pintan**; la lógica vive en `hooks/` y el acceso a datos en `services/`.
- **Nada duplicado:** normalización de nombres y formato de fechas están solo en `lib/` y los usa
  también el servidor.
- **Sin diálogos nativos** (`alert`, `confirm`, `<input type="date">`): todo con componentes propios.
- Las fechas de sesión se guardan como hora local sin zona (`"YYYY-MM-DDTHH:mm"`); usa siempre
  `lib/fechas.js` para leerlas o formatearlas.

## Datos (Firestore)

- `usuarios/{slug}` — reserva del nombre único: `uid`, `nombre`, `slug`.
- `sesiones/{id}` — `tmdbId`, `titulo`, `tipo`, `anio`, `poster`, `fechaHora`, `autor`, `nota`,
  `asistentes[]`, `creadoPor`, `editadoPor`, `creadoEn`.
- `porVer/{pelicula|serie}-{tmdbId}` — títulos pendientes sin fecha: `tmdbId`, `titulo`, `tipo`,
  `anio`, `poster`, `nota`, `propuestoPor`, `interesados[]`, `creadoEn`. El id evita duplicados;
  al programarlo como sesión se borra de la lista.
- `suscripcionesPush/{hash}` — un documento por dispositivo con avisos activados: `uid`, `suscripcion`.
