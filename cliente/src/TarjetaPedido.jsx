import { dinero, formatoFecha } from "./calculos";

function TarjetaPedido({ pedido, onEditar, onEliminar }) {
  const claseEstado = pedido.estado.toLowerCase().replace(" ", "-");

  return (
    <article className="tarjeta">
      <div className="tarjeta-cinta">
        <span>Pedido {pedido.id}</span>
        <span className={"estado " + claseEstado}>{pedido.estado}</span>
      </div>

      <div className="tarjeta-cuerpo">
        <h3>{pedido.cliente}</h3>

        <p className="contacto">
          {pedido.telefono && <span>📞 {pedido.telefono}</span>}
          {pedido.direccion && <span>📍 {pedido.direccion}</span>}
          {pedido.fecha && <small>{formatoFecha(pedido.fecha)}</small>}
        </p>

        <ul className="platos">
          {pedido.productos.map((p) => (
            <li key={p.id}>
              <span>
                {p.cantidad} × {p.nombre}
                <small>{dinero(p.precio)} c/u</small>
              </span>
              <span className="relleno" aria-hidden="true"></span>
              <span>{dinero(p.total)}</span>
            </li>
          ))}
        </ul>

        <dl className="cuenta">
          <div>
            <dt>Subtotal</dt>
            <dd>{dinero(pedido.subtotal)}</dd>
          </div>

          {pedido.descuentoAplicado > 0 ? (
            <div className="descuento">
              <dt>Descuento del 15%</dt>
              <dd>-{dinero(pedido.descuentoAplicado)}</dd>
            </div>
          ) : (
            <div>
              <dt>Descuento</dt>
              <dd>No aplica</dd>
            </div>
          )}

          <div>
            <dt>Domicilio ({pedido.domicilio.zona})</dt>
            <dd>{dinero(pedido.domicilio.costo)}</dd>
          </div>

          <div className="total">
            <dt>Total a pagar</dt>
            <dd>{dinero(pedido.total)}</dd>
          </div>
        </dl>

        <div className="acciones">
          <button className="boton" onClick={onEditar}>Editar pedido</button>
          <button className="boton secundario" onClick={onEliminar}>Eliminar</button>
        </div>
      </div>
    </article>
  );
}

export default TarjetaPedido;
