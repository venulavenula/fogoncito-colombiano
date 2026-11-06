import { useEffect, useState } from "react";
import { api } from "./api";
import { ESTADOS } from "./calculos";
import EditarPedido from "./EditarPedido";
import TarjetaPedido from "./TarjetaPedido";

function Pedidos({ menu, domicilios }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [editando, setEditando] = useState(null);

  // al abrir la página se piden los pedidos a la API
  useEffect(() => {
    api
      .pedidos()
      .then(setPedidos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  async function eliminarPedido(pedido) {
    const confirmar = window.confirm(
      "¿Eliminar el pedido de " + pedido.cliente + "? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      await api.eliminarPedido(pedido.id);
      // se quita el pedido de la pantalla sin volver a pedir todo
      setPedidos(pedidos.filter((p) => p.id !== pedido.id));
      setError("");
      setAviso("");
    } catch (err) {
      setError(err.message);
    }
  }

  // Si falla, el error vuelve a la ventana de edición (que lo muestra)
  async function guardarPedido(datos) {
    const actualizado = await api.actualizarPedido(editando.id, datos);
    setPedidos(pedidos.map((p) => (p.id === actualizado.id ? actualizado : p)));
    setAviso("Pedido " + actualizado.id + " actualizado (" + actualizado.estado + ").");
    setError("");
    setEditando(null);
  }

  const visibles = filtro === "Todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);
  const contar = (estado) => pedidos.filter((p) => p.estado === estado).length;

  return (
    <section>
      <h1>Pedidos</h1>
      <p>Consulta los pedidos del restaurante, edítalos y cambia su estado.</p>

      {error && <p className="error" role="alert">{error}</p>}
      {aviso && <p className="exito" role="status">{aviso}</p>}
      {cargando && <p>Cargando pedidos...</p>}

      {!cargando && !error && pedidos.length === 0 && (
        <p>No hay pedidos. Ejecuta npm run restaurar en la carpeta servidor para recuperar los pedidos de ejemplo.</p>
      )}

      {pedidos.length > 0 && (
        <div className="filtros" role="group" aria-label="Filtrar por estado">
          {["Todos", ...ESTADOS].map((nombre) => (
            <button
              key={nombre}
              type="button"
              className={"filtro " + (filtro === nombre ? "activo" : "")}
              aria-pressed={filtro === nombre}
              onClick={() => setFiltro(nombre)}
            >
              {nombre} ({nombre === "Todos" ? pedidos.length : contar(nombre)})
            </button>
          ))}
        </div>
      )}

      {pedidos.length > 0 && visibles.length === 0 && <p>No hay pedidos con estado «{filtro}».</p>}

      <div className="rejilla">
        {visibles.map((pedido) => (
          <TarjetaPedido
            key={pedido.id}
            pedido={pedido}
            onEditar={() => setEditando(pedido)}
            onEliminar={() => eliminarPedido(pedido)}
          />
        ))}
      </div>

      {editando && (
        <EditarPedido
          key={editando.id}
          pedido={editando}
          menu={menu}
          domicilios={domicilios}
          onGuardar={guardarPedido}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}

export default Pedidos;
