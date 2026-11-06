import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { armarPedido, validarPedido } from "./calculos.js";

// Render define PORT; en tu computador se usa 3001
const PUERTO = process.env.PORT || 3001;
const carpeta = path.dirname(fileURLToPath(import.meta.url));
const rutaDB = path.join(carpeta, "db.json");
const rutaCliente = path.join(carpeta, "..", "cliente", "dist");

// La "base de datos" es el archivo db.json
function leerDB() {
  return JSON.parse(fs.readFileSync(rutaDB, "utf-8"));
}

// Se escribe primero en un archivo temporal para no dejar db.json a medias
function guardarDB(db) {
  const temporal = rutaDB + ".tmp";
  fs.writeFileSync(temporal, JSON.stringify(db, null, 2));
  fs.renameSync(temporal, rutaDB);
}

const app = express();
app.use(express.json());

// CORS: permite que la página de Vercel (otro dominio) llame a esta API.
// Para limitarlo, define CORS_ORIGIN=https://tu-pagina.vercel.app en Render.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ---------- Menú y domicilios ----------

// GET /api/menu -> platos con descripción, precio e imagen
app.get("/api/menu", (req, res) => {
  res.json(leerDB().menu);
});

// GET /api/domicilios -> zonas de entrega con su costo
app.get("/api/domicilios", (req, res) => {
  res.json(leerDB().domicilios);
});

// ---------- Pedidos ----------

// GET /api/pedidos -> todos los pedidos con subtotal, descuento y total
app.get("/api/pedidos", (req, res) => {
  const db = leerDB();
  res.json(db.pedidos.map((pedido) => armarPedido(pedido, db)));
});

// GET /api/pedidos/:id -> un solo pedido
app.get("/api/pedidos/:id", (req, res) => {
  const db = leerDB();
  const pedido = db.pedidos.find((p) => p.id === Number(req.params.id));

  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json(armarPedido(pedido, db));
});

// POST /api/pedidos -> crea un pedido nuevo (siempre empieza en "Pendiente")
app.post("/api/pedidos", (req, res) => {
  const db = leerDB();
  const { error, datos } = validarPedido({ ...req.body, estado: undefined }, db);

  if (error) {
    return res.status(400).json({ error });
  }

  const nuevo = {
    id: db.pedidos.reduce((mayor, p) => Math.max(mayor, p.id), 0) + 1,
    cliente: datos.cliente,
    telefono: datos.telefono,
    direccion: datos.direccion,
    domicilioId: datos.domicilioId,
    estado: "Pendiente",
    fecha: new Date().toISOString(),
    productos: datos.productos
  };

  db.pedidos.push(nuevo);
  guardarDB(db);
  res.status(201).json(armarPedido(nuevo, db));
});

// PUT /api/pedidos/:id -> actualiza todos los campos de un pedido, incluido el estado
app.put("/api/pedidos/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = leerDB();
  const indice = db.pedidos.findIndex((p) => p.id === id);

  if (indice === -1) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  const { error, datos } = validarPedido(req.body, db);
  if (error) {
    return res.status(400).json({ error });
  }

  const actual = db.pedidos[indice];
  db.pedidos[indice] = {
    ...actual,
    cliente: datos.cliente,
    telefono: datos.telefono,
    direccion: datos.direccion,
    domicilioId: datos.domicilioId,
    estado: datos.estado ?? actual.estado ?? "Pendiente",
    productos: datos.productos
  };

  guardarDB(db);
  res.json(armarPedido(db.pedidos[indice], db));
});

// DELETE /api/pedidos/:id -> elimina un pedido de db.json
app.delete("/api/pedidos/:id", (req, res) => {
  const id = Number(req.params.id);
  const db = leerDB();

  if (!db.pedidos.some((p) => p.id === id)) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  db.pedidos = db.pedidos.filter((p) => p.id !== id);
  guardarDB(db);
  res.json({ mensaje: "Pedido eliminado", id });
});

// Rutas /api que no existen
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Si ya hiciste "npm run build" en cliente, la API también sirve la página
if (fs.existsSync(rutaCliente)) {
  app.use(express.static(rutaCliente));
  app.use((req, res) => res.sendFile(path.join(rutaCliente, "index.html")));
}

// JSON mal formado u otros errores
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PUERTO, () => {
  console.log("API de El Fogoncito en http://localhost:" + PUERTO);
});
