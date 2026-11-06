// Dirección de la API. En local queda vacía (Vite usa el proxy de vite.config.js).
// En Vercel se define VITE_API_URL = https://tu-api.onrender.com (sin / al final y sin /api)
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Todas las peticiones a la API pasan por aquí
async function pedir(url, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(BASE + url, {
      headers: { "Content-Type": "application/json" },
      ...opciones
    });
  } catch {
    throw new Error(
      "No se pudo conectar con la API. Revisa que el servidor esté encendido (npm start en la carpeta servidor)."
    );
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new Error(datos?.error || "Algo salió mal. Inténtalo de nuevo.");
  }
  return datos;
}

export const api = {
  menu: () => pedir("/api/menu"),
  domicilios: () => pedir("/api/domicilios"),
  pedidos: () => pedir("/api/pedidos"),
  crearPedido: (datos) => pedir("/api/pedidos", { method: "POST", body: JSON.stringify(datos) }),
  actualizarPedido: (id, datos) =>
    pedir("/api/pedidos/" + id, { method: "PUT", body: JSON.stringify(datos) }),
  eliminarPedido: (id) => pedir("/api/pedidos/" + id, { method: "DELETE" })
};
