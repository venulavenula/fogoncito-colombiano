import { useState } from "react";
import { aLista, ESTADOS, resumir } from "./calculos";
import Dialogo from "./Dialogo";
import { CamposCliente, ResumenPedido, SelectorPlatos } from "./PiezasPedido";

// Ventana para cambiar cualquier campo de un pedido y su estado
function EditarPedido({ pedido, menu, domicilios, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState({
    cliente: pedido.cliente,
    telefono: pedido.telefono,
    direccion: pedido.direccion,
    domicilioId: String(pedido.domicilio.id ?? "")
  });
  const [estado, setEstado] = useState(pedido.estado);
  const [cantidades, setCantidades] = useState(() =>
    Object.fromEntries(pedido.productos.map((p) => [p.id, p.cantidad]))
  );
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const resumen = resumir(menu, domicilios, cantidades, datos.domicilioId);

  async function guardar(evento) {
    evento.preventDefault();
    if (resumen.unidades === 0) {
      setError("El pedido debe tener al menos un plato.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      await onGuardar({
        ...datos,
        domicilioId: Number(datos.domicilioId),
        estado,
        productos: aLista(cantidades)
      });
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <Dialogo className="editor" onCerrar={onCerrar} aria-labelledby="titulo-editor">
      <form className="editor-cuerpo" onSubmit={guardar}>
        <h2 id="titulo-editor">Editar pedido {pedido.id}</h2>

        <fieldset className="seccion">
          <legend>Estado del pedido</legend>
          <div className="estados">
            {ESTADOS.map((nombre) => (
              <label key={nombre} className={"opcion-estado " + (estado === nombre ? "activa" : "")}>
                <input
                  type="radio"
                  name="estado"
                  value={nombre}
                  checked={estado === nombre}
                  onChange={() => setEstado(nombre)}
                />
                {nombre}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="seccion">
          <legend>Datos del cliente</legend>
          <CamposCliente
            datos={datos}
            onCambiar={(nombre, valor) => setDatos({ ...datos, [nombre]: valor })}
            domicilios={domicilios}
            prefijo="editar"
          />
        </fieldset>

        <fieldset className="seccion">
          <legend>Platos</legend>
          <SelectorPlatos
            menu={menu}
            cantidades={cantidades}
            onCambiar={(id, cantidad) => setCantidades({ ...cantidades, [id]: cantidad })}
          />
        </fieldset>

        <ResumenPedido resumen={resumen} />

        {error && <p className="error" role="alert">{error}</p>}

        <div className="acciones centro">
          <button className="boton" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <button className="boton secundario" type="button" onClick={onCerrar} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </Dialogo>
  );
}

export default EditarPedido;
