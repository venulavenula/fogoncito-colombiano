// Reglas del pedido: 15% de descuento si el pedido tiene más de 4 productos (unidades).
export const DESCUENTO = 0.15;
export const PRODUCTOS_PARA_DESCUENTO = 4;
export const ESTADOS = ["Pendiente", "En camino", "Entregado"];

// Convierte un pedido guardado en la base de datos (solo ids) en un pedido
// con toda la información lista para mostrar: nombres, precios y totales.
export function armarPedido(pedido, db) {
  const productos = [];

  for (const item of pedido.productos) {
    const plato = db.menu.find((m) => m.id === item.platoId);
    if (plato) {
      productos.push({
        id: plato.id,
        nombre: plato.nombre,
        precio: plato.precio,
        cantidad: item.cantidad,
        total: plato.precio * item.cantidad
      });
    }
  }

  const subtotal = productos.reduce((suma, p) => suma + p.total, 0);
  const cantidadProductos = productos.reduce((suma, p) => suma + p.cantidad, 0);
  const descuentoAplicado =
    cantidadProductos > PRODUCTOS_PARA_DESCUENTO ? Math.round(subtotal * DESCUENTO) : 0;

  const domicilio = db.domicilios.find((d) => d.id === pedido.domicilioId);
  const costoDomicilio = domicilio ? domicilio.costo : 0;

  return {
    id: pedido.id,
    cliente: pedido.cliente,
    telefono: pedido.telefono || "",
    direccion: pedido.direccion || "",
    estado: pedido.estado || "Pendiente",
    fecha: pedido.fecha || null,
    productos,
    cantidadProductos,
    subtotal,
    descuentoAplicado,
    domicilio: {
      id: pedido.domicilioId,
      zona: domicilio ? domicilio.zona : "Sin zona",
      costo: costoDomicilio
    },
    total: subtotal - descuentoAplicado + costoDomicilio
  };
}

// Revisa los datos que llegan del formulario o de la ventana de edición.
// Devuelve { error } o { datos } ya limpios.
export function validarPedido(body, db) {
  const cliente = String(body?.cliente ?? "").trim();
  const telefono = String(body?.telefono ?? "").trim();
  const direccion = String(body?.direccion ?? "").trim();

  if (!cliente || cliente.length > 80) {
    return { error: "Escribe el nombre del cliente (máximo 80 caracteres)." };
  }
  if (telefono.replace(/\D/g, "").length < 7 || telefono.length > 20) {
    return { error: "Escribe un teléfono válido (mínimo 7 dígitos)." };
  }
  if (!direccion || direccion.length > 200) {
    return { error: "Escribe la dirección de entrega (máximo 200 caracteres)." };
  }

  const domicilioId = Number(body?.domicilioId);
  if (!db.domicilios.some((d) => d.id === domicilioId)) {
    return { error: "Selecciona una zona de domicilio válida." };
  }

  // Se suman las cantidades si un plato llega repetido
  const cantidades = new Map();
  const items = Array.isArray(body?.productos) ? body.productos : [];
  for (const item of items) {
    const platoId = Number(item?.platoId);
    const cantidad = Number(item?.cantidad);

    if (!db.menu.some((m) => m.id === platoId)) {
      return { error: "Hay un plato que no existe en el menú." };
    }
    if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > 99) {
      return { error: "Las cantidades deben ser números enteros entre 0 y 99." };
    }
    if (cantidad > 0) {
      cantidades.set(platoId, (cantidades.get(platoId) || 0) + cantidad);
    }
  }
  if (cantidades.size === 0) {
    return { error: "Elige al menos un plato." };
  }

  if (body?.estado !== undefined && !ESTADOS.includes(body.estado)) {
    return { error: "El estado debe ser Pendiente, En camino o Entregado." };
  }

  return {
    datos: {
      cliente,
      telefono,
      direccion,
      domicilioId,
      productos: [...cantidades].map(([platoId, cantidad]) => ({ platoId, cantidad })),
      estado: body?.estado
    }
  };
}
