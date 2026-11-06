import { dinero, DESCUENTO, PRODUCTOS_PARA_DESCUENTO } from "./calculos";

// Nombre, teléfono, dirección y zona: los usa el formulario y la ventana de edición
export function CamposCliente({ datos, onCambiar, domicilios, prefijo }) {
  const campo = (nombre) => ({
    id: prefijo + "-" + nombre,
    value: datos[nombre],
    onChange: (e) => onCambiar(nombre, e.target.value),
    required: true
  });

  return (
    <>
      <label htmlFor={prefijo + "-cliente"}>Nombre completo</label>
      <input type="text" maxLength={80} autoComplete="name" placeholder="Ingresa tu nombre" {...campo("cliente")} />

      <label htmlFor={prefijo + "-telefono"}>Número de teléfono</label>
      <input type="tel" maxLength={20} autoComplete="tel" placeholder="Ingresa tu teléfono" {...campo("telefono")} />

      <label htmlFor={prefijo + "-direccion"}>Dirección de entrega</label>
      <input type="text" maxLength={200} autoComplete="street-address" placeholder="Ingresa tu dirección" {...campo("direccion")} />

      <label htmlFor={prefijo + "-domicilioId"}>Zona de domicilio</label>
      <select {...campo("domicilioId")}>
        <option value="">Seleccionar zona</option>
        {domicilios.map((d) => (
          <option key={d.id} value={d.id}>
            {d.zona} ({dinero(d.costo)})
          </option>
        ))}
      </select>
    </>
  );
}

// Lista de platos con botones para subir o bajar la cantidad
export function SelectorPlatos({ menu, cantidades, onCambiar }) {
  return (
    <ul className="selector">
      {menu.map((plato) => {
        const cantidad = cantidades[plato.id] || 0;
        return (
          <li key={plato.id} className={cantidad > 0 ? "elegido" : ""}>
            <img src={plato.imagen} alt="" />
            <div className="selector-info">
              <strong>{plato.nombre}</strong>
              <span>{dinero(plato.precio)}</span>
            </div>
            <div className="cantidad">
              <button
                type="button"
                className="boton-redondo"
                aria-label={"Quitar uno de " + plato.nombre}
                disabled={cantidad === 0}
                onClick={() => onCambiar(plato.id, cantidad - 1)}
              >
                −
              </button>
              <output aria-label={"Cantidad de " + plato.nombre}>{cantidad}</output>
              <button
                type="button"
                className="boton-redondo"
                aria-label={"Agregar uno de " + plato.nombre}
                disabled={cantidad >= 99}
                onClick={() => onCambiar(plato.id, cantidad + 1)}
              >
                +
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ResumenPedido({ resumen }) {
  const porcentaje = Math.round(DESCUENTO * 100);
  return (
    <div className="resumen">
      <h3>Resumen del pedido</h3>
      <dl className="cuenta">
        <div>
          <dt>Subtotal</dt>
          <dd>{dinero(resumen.subtotal)}</dd>
        </div>
        <div className={resumen.descuento > 0 ? "descuento" : ""}>
          <dt>Descuento</dt>
          <dd>{resumen.descuento > 0 ? "-" + dinero(resumen.descuento) : "$0"}</dd>
        </div>
        <div>
          <dt>Domicilio</dt>
          <dd>{dinero(resumen.domicilio)}</dd>
        </div>
        <div className="total">
          <dt>Total a pagar</dt>
          <dd>{dinero(resumen.total)}</dd>
        </div>
      </dl>
      <p className="pista" aria-live="polite">
        {resumen.unidades > PRODUCTOS_PARA_DESCUENTO
          ? "¡Felicidades! Obtienes un descuento del " + porcentaje + "%."
          : "Pide más de " + PRODUCTOS_PARA_DESCUENTO + " platos y recibe un " + porcentaje + "% de descuento."}
      </p>
    </div>
  );
}
