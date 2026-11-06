import { useEffect, useRef } from "react";

// Ventana emergente con el elemento <dialog> del navegador:
// bloquea el fondo, atrapa el foco y se cierra con la tecla Esc.
function Dialogo({ onCerrar, cerrarAlHacerClicFuera = false, className = "", children, ...resto }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
  }, []);

  function alHacerClic(evento) {
    if (cerrarAlHacerClicFuera && evento.target === ref.current) ref.current.close();
  }

  return (
    <dialog
      ref={ref}
      className={"dialogo " + className}
      onClose={onCerrar}
      onClick={alHacerClic}
      {...resto}
    >
      {children}
    </dialog>
  );
}

export default Dialogo;
