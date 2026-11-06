# El Fogoncito Colombiano

Sitio completo del restaurante, con tres páginas dentro de una sola app React y una API que guarda todo en la base de datos (`servidor/db.json`).

| Página              | Ruta       | Qué hace                                                                                  |
| ------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Inicio              | `/`        | Ventana de bienvenida, banner y menú con fotos. "Agregar al pedido" suma el plato al pedido. |
| Hacer pedido        | `/pedido`  | Formulario del cliente. Al confirmar, el pedido se guarda en la base de datos (Pendiente). |
| Visor de pedidos    | `/pedidos` | Lista los pedidos, filtra por estado, permite **editar** (todos los campos y el estado) y eliminar. |

El menú (nombre, descripción, precio e imagen) y las zonas de domicilio salen de la base de datos: las tres páginas leen los mismos datos.

## Cómo ejecutarlo

Abre **dos terminales**.

**Terminal 1: API**

```
cd servidor
npm install
npm start
```

La API queda en http://localhost:3001

**Terminal 2: React**

```
cd cliente
npm install
npm run dev
```

Abre la dirección que muestre Vite (normalmente http://localhost:5173).

### Todo en un solo puerto (opcional)

```
cd cliente
npm run build
cd ../servidor
npm start
```

Con la carpeta `cliente/dist` creada, la API también sirve el sitio en http://localhost:3001.

## Rutas de la API

| Método | Ruta               | Qué hace                                                               |
| ------ | ------------------ | ---------------------------------------------------------------------- |
| GET    | `/api/menu`        | Lista los platos del menú                                              |
| GET    | `/api/domicilios`  | Lista las zonas de domicilio y su costo                                |
| GET    | `/api/pedidos`     | Lista los pedidos con subtotal, descuento y total                      |
| GET    | `/api/pedidos/:id` | Devuelve un pedido                                                     |
| POST   | `/api/pedidos`     | Crea un pedido (siempre empieza en `Pendiente`)                        |
| PUT    | `/api/pedidos/:id` | Actualiza cliente, teléfono, dirección, zona, platos y estado          |
| DELETE | `/api/pedidos/:id` | Elimina un pedido de `db.json`                                         |

Estados posibles: `Pendiente`, `En camino`, `Entregado`.

## Restaurar los pedidos de ejemplo

Si borras o cambias pedidos y quieres volver al inicio:

```
cd servidor
npm run restaurar
```

Recarga la página después.

## Reglas del pedido

- Subtotal = suma de (precio × cantidad) de cada plato.
- Descuento del 15% si el pedido tiene más de 4 productos (se cuentan las unidades).
- Total = subtotal − descuento + costo del domicilio.
- El servidor valida todo al guardar (nombre, teléfono, dirección, zona, platos y cantidades).

## Cambiar precios, platos o zonas

Edita `servidor/db.json` (y `db.original.json` si quieres que `restaurar` también los use). Las imágenes van en `cliente/public/imagenes/`.
