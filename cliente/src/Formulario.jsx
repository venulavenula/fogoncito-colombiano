import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import { aLista, dinero, resumir } from "./calculos";
import { CamposCliente, ResumenPedido, SelectorPlatos } from "./PiezasPedido";

const VACIO = { cliente: "", telefono: "", direccion: "", domicilioId: "" };

// El carrito (cantidades) vive en App para que los botones "Agregar" de la página principal lleguen aquí
function Formulario({ menu, domicilios, cantidades, onCantidad, onVaciar }) {
  const [datos, setDatos] = useState(VACIO);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmado, setConfirmado] = useState(null);

  const resumen = resumir(menu, domicilios, cantidades, datos.domicilioId);

  async function enviar(evento) {
    evento.preventDefault();
    if (resumen.unidades === 0) {
      setError("Elige al menos un plato.");
      return;
    }

    setEnviando(true);
    setError("");
    try {
      const pedido = await api.crearPedido({
        ...datos,
        domicilioId: Number(datos.domicilioId),
        productos: aLista(cantidades)
      });
      onVaciar();
      setDatos(VACIO);
      setConfirmado(pedido);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (confirmado) {
    return (
      <section className="panel confirmacion" aria-live="polite">
        <img className="mascota-confirmacion" src="/imagenes/arepa.png" alt="" />
        <h1>¡Gracias por tu pedido, {confirmado.cliente}!</h1>
        <p>
          Tu pedido <strong>#{confirmado.id}</strong> quedó registrado. El total a pagar es{" "}
          <strong>{dinero(confirmado.total)}</strong>.
        </p>
        <div className="acciones centro">
          <button className="boton" onClick={() => setConfirmado(null)}>Hacer otro pedido</button>
          <Link className="boton secundario" to="/">Volver al inicio</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="panel" onSubmit={enviar}>
      <h1>Realiza tu pedido</h1>
      <p className="descripcion">Disfruta nuestros sabores colombianos. Haz tu pedido aquí.</p>

      <fieldset className="seccion">
        <legend>Datos del cliente</legend>
        <CamposCliente
          datos={datos}
          onCambiar={(nombre, valor) => setDatos({ ...datos, [nombre]: valor })}
          domicilios={domicilios}
          prefijo="pedido"
        />
      </fieldset>

      <fieldset className="seccion">
        <legend>Selecciona tus platos</legend>
        <SelectorPlatos menu={menu} cantidades={cantidades} onCambiar={onCantidad} />
      </fieldset>

      <ResumenPedido resumen={resumen} />

      {error && <p className="error" role="alert">{error}</p>}

      <div className="acciones centro">
        <button className="boton" type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Confirmar pedido"}
        </button>
      </div>
    </form>
  );
}

export default Formulario;
