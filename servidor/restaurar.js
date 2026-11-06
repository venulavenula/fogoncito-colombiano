// Devuelve db.json a los pedidos originales (por si borraste todos).
import fs from "node:fs";

fs.copyFileSync("db.original.json", "db.json");
console.log("Pedidos restaurados.");
