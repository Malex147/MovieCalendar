import { useCallback, useEffect, useState } from 'react';
import { suscribirAAuth } from '../services/auth';

/** Usuario conectado ({ uid, nombre } o null) y si aún se está comprobando la sesión. */
export function useAuth() {
  const [estado, setEstado] = useState({ usuario: null, comprobando: true });

  useEffect(
    () => suscribirAAuth((usuario) => setEstado({ usuario, comprobando: false })),
    []
  );

  // Firebase no avisa de cambios de perfil (p. ej. el nombre), así que se actualiza a mano
  const actualizarUsuario = useCallback(
    (usuario) => setEstado((actual) => ({ ...actual, usuario })),
    []
  );

  return { ...estado, actualizarUsuario };
}
