export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <p className="font-editorial text-lg text-zinc-300">
            Sala Privada · Cine Club
          </p>
          <p className="font-mono-ticket text-[11px] text-zinc-500 mt-0.5">
            Este producto utiliza la API de TMDB, pero no está avalado ni certificado por TMDB.
          </p>
        </div>

        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          title="The Movie Database (TMDB)"
          className="opacity-70 hover:opacity-100 transition-opacity shrink-0"
        >
          <img
            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
            alt="Logo de TMDB"
            className="h-4"
          />
        </a>
      </div>
    </footer>
  );
}