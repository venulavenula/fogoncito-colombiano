import { useState } from "react";
import { dinero } from "./calculos";
import Dialogo from "./Dialogo";

function leerVisto() {
  try {
    return sessionStorage.getItem("bienvenida-vista") === "si";
  } catch {
    return false;
  }
}

function Inicio({ menu, cargando, error, onComprar }) {
  // la ventana de bienvenida sale una vez por visita
  const [bienvenida, setBienvenida] = useState(() => !leerVisto());

  function cerrarBienvenida() {
    try {
      sessionStorage.setItem("bienvenida-vista", "si");
    } catch {
      // si el navegador no permite guardar, simplemente volverá a salir
    }
    setBienvenida(false);
  }

  function verMenu() {
    cerrarBienvenida();
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {bienvenida && (
        <Dialogo className="bienvenida" onCerrar={cerrarBienvenida} cerrarAlHacerClicFuera aria-labelledby="titulo-bienvenida">
          <div className="bienvenida-cuerpo">
            <img className="mascota" src="/imagenes/arepa.png" alt="" />
            <button className="cerrar" type="button" aria-label="Cerrar" onClick={cerrarBienvenida}>×</button>
            <h2 id="titulo-bienvenida">¡Bienvenido a El Fogoncito!</h2>
            <p>¡Tenemos sabores deliciosos esperándote! Descubre nuestro menú y disfruta de nuestros platos.</p>
            <button className="boton" type="button" onClick={verMenu}>Ver nuestro menú</button>
          </div>
        </Dialogo>
      )}

      <img className="banner" src="/imagenes/promo.png" alt="Promociones de El Fogoncito Colombiano" />

      <div className="presentacion">
        <h1>El Fogoncito Colombiano</h1>
        <p>El sabor de nuestra tierra</p>
      </div>

      <section id="menu" aria-labelledby="titulo-menu">
        <h2 id="titulo-menu" className="centro">Nuestro menú</h2>

        {error && <p className="error" role="alert">{error}</p>}
        {cargando && <p className="centro">Cargando el menú...</p>}

        <div className="menu">
          {menu.map((plato) => (
            <article className="plato" key={plato.id}>
              <img src={plato.imagen} alt={plato.nombre} loading="lazy" />
              <h3>{plato.nombre}</h3>
              <p>{plato.descripcion}</p>
              <p className="precio">Precio: {dinero(plato.precio)}</p>
              <button className="boton amarillo" onClick={() => onComprar(plato)}>
                Agregar al pedido
              </button>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export default Inicio;
