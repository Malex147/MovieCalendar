import { useAuth } from './hooks/useAuth';
import AuthScreen from './components/auth/AuthScreen';
import Cargando from './components/ui/Cargando';
import Cartelera from './pages/Cartelera';

/** Punto de entrada: decide entre comprobar la sesión, pedir acceso o mostrar la cartelera. */
export default function App() {
  const { usuario, comprobando, actualizarUsuario } = useAuth();

  if (comprobando) return <Cargando mensaje="Comprobando pase..." pantallaCompleta />;
  if (!usuario) return <AuthScreen />;

  return <Cartelera usuario={usuario} onUsuarioActualizado={actualizarUsuario} />;
}
