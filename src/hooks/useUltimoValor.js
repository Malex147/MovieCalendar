import { useState } from 'react';

/**
 * Devuelve el último valor no nulo recibido. Sirve para que un popup siga mostrando
 * su contenido durante la animación de cierre, cuando el valor ya ha pasado a null.
 */
export function useUltimoValor(valor) {
  const [ultimo, setUltimo] = useState(valor);
  if (valor != null && valor !== ultimo) setUltimo(valor);
  return valor ?? ultimo;
}
