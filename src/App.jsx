import { useState, useEffect } from 'react';
import { Popcorn, Loader2 } from 'lucide-react';
import Navbar from './components/navbar';
import SessionCard from './components/SessionCard';
import AddModal from './components/AddModal';
import { suscribirACartelera, agregarSesion, eliminarSesion } from './services/firebase';

export default function App() {
  const [sesiones, setSesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const desuscribir = suscribirACartelera((datos) => {
      setSesiones(datos);
      setCargando(false);
    });

    return () => desuscribir();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar onAbrirModal={() => setModalAbierto(true)} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />
            <p className="text-sm">Cargando cartelera...</p>
          </div>
        ) : sesiones.length === 0 ? (
          <div className="text-center py-20 px-4 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
            <div className="bg-zinc-900 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-800">
              <Popcorn className="w-7 h-7 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              Aún no hay nada programado
            </h2>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6">
              Añade la primera película o serie para que todo el grupo vea cuándo toca sesión de cine.
            </p>
            <button
              onClick={() => setModalAbierto(true)}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition cursor-pointer"
            >
              Programar la primera
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sesiones.map((sesion) => (
              <SessionCard
                key={sesion.id}
                sesion={sesion}
                onEliminar={eliminarSesion}
              />
            ))}
          </div>
        )}
      </main>

      <AddModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onGuardar={agregarSesion}
      />
    </div>
  );
}