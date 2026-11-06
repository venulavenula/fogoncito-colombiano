import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { api } from "./api";
import Formulario from "./Formulario";
import Inicio from "./Inicio";
import Pedidos from "./Pedidos";

function App() {
  const [menu, setMenu] = useState([]);
  const [domicilios, setDomicilios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cantidades, setCantidades] = useState({}); // carrito: { platoId: cantidad }
  const [aviso, setAviso] = useState("");
  const { pathname, hash } = useLocation();

  // el menú y las zonas de domicilio vienen de la base de datos
  useEffect(() => {
    Promise.all([api.menu(), api.domicilios()])
      .then(([platos, zonas]) => {
        setMenu(platos);
        setDomicilios(zonas);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // al cambiar de página se vuelve arriba; si el enlace trae #menu o #contactenos se baja hasta allí
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  useEffect(() => {
    if (hash && !cargando) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    }
  }, [pathname, hash, cargando]);

  useEffect(() => {
    if (!aviso) return;
    const temporizador = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(temporizador);
  }, [aviso]);

  function cambiarCantidad(platoId, cantidad) {
    setCantidades((actuales) => ({ ...actuales, [platoId]: Math.min(99, Math.max(0, cantidad)) }));
  }

  function agregar(plato) {
    cambiarCantidad(plato.id, (cantidades[plato.id] || 0) + 1);
    setAviso(plato.nombre + " agregado a tu pedido.");
  }

  const totalPlatos = Object.values(cantidades).reduce((suma, c) => suma + c, 0);

  return (
    <>
      <header className="cabecera">
        <Link to="/" className="logo" aria-label="El Fogoncito Colombiano, inicio">
          <img src="/imagenes/logo.png" alt="" />
        </Link>
        <nav aria-label="Principal">
          <ul>
            <li><NavLink to="/" end>Inicio</NavLink></li>
            <li><Link to="/#menu">Menú</Link></li>
            <li>
              <NavLink to="/pedido">
                Hacer pedido
                {totalPlatos > 0 && <span className="insignia" aria-label={totalPlatos + " platos"}>{totalPlatos}</span>}
              </NavLink>
            </li>
            <li><NavLink to="/pedidos">Pedidos</NavLink></li>
            <li><Link to="/#contactenos">Contáctenos</Link></li>
          </ul>
        </nav>
      </header>

      <main className="pagina">
        <Routes>
          <Route
            path="/"
            element={<Inicio menu={menu} cargando={cargando} error={error} onComprar={agregar} />}
          />
          <Route
            path="/pedido"
            element={
              error ? (
                <p className="error" role="alert">{error}</p>
              ) : cargando ? (
                <p>Cargando el menú...</p>
              ) : (
                <Formulario
                  menu={menu}
                  domicilios={domicilios}
                  cantidades={cantidades}
                  onCantidad={cambiarCantidad}
                  onVaciar={() => setCantidades({})}
                />
              )
            }
          />
          <Route path="/pedidos" element={<Pedidos menu={menu} domicilios={domicilios} />} />
          <Route
            path="*"
            element={
              <section className="centro">
                <h1>Página no encontrada</h1>
                <Link className="boton" to="/">Volver al inicio</Link>
              </section>
            }
          />
        </Routes>
      </main>

      <footer id="contactenos" className="pie">
        <img src="/imagenes/arepa.png" alt="" />
        <p>Muchas gracias por visitar nuestra página</p>
      </footer>

      {aviso && (
        <div className="aviso" role="status">
          {aviso} <Link to="/pedido">Ver pedido</Link>
        </div>
      )}
    </>
  );
}

export default App;
