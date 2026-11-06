// Mismas reglas que el servidor (el servidor es quien manda al guardar)
export const DESCUENTO = 0.15;
export const PRODUCTOS_PARA_DESCUENTO = 4;
export const ESTADOS = ["Pendiente", "En camino", "Entregado"];

// da formato de dinero: 30000 -> $30.000
export function dinero(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

export function formatoFecha(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

// cantidades = { [platoId]: cantidad }
export function resumir(menu, domicilios, cantidades, domicilioId) {
  let subtotal = 0;
  let unidades = 0;
  for (const plato of menu) {
    const cantidad = cantidades[plato.id] || 0;
    subtotal += plato.precio * cantidad;
    unidades += cantidad;
  }

  const descuento = unidades > PRODUCTOS_PARA_DESCUENTO ? Math.round(subtotal * DESCUENTO) : 0;
  const zona = domicilios.find((d) => d.id === Number(domicilioId));
  const domicilio = unidades > 0 && zona ? zona.costo : 0;

  return { subtotal, unidades, descuento, domicilio, total: subtotal - descuento + domicilio };
}

// [{platoId, cantidad}] que espera la API
export function aLista(cantidades) {
  return Object.entries(cantidades)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([platoId, cantidad]) => ({ platoId: Number(platoId), cantidad }));
}
