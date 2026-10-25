document.addEventListener("DOMContentLoaded", () => {
  const boton = document.querySelector("#abrirInvitacion");
  const portada = document.querySelector("#portada");
  const sobre = document.querySelector("#sobre");
  const plantilla = document.querySelector("#plantillaInvitacion");

  if (!boton || !portada || !sobre || !plantilla) {
    console.error("Faltan elementos de la invitación.");
    return;
  }

  let animando = false;
  let desplegada = false;

  const esperar = (ms) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));

  const siguienteFrame = () =>
    new Promise((resolve) => requestAnimationFrame(resolve));

  function obtenerDestino() {
    const viewport = window.visualViewport;
    const anchoPantalla = viewport
      ? viewport.width
      : document.documentElement.clientWidth;
    const altoPantalla = viewport
      ? viewport.height
      : window.innerHeight;

    const margenX = anchoPantalla <= 480 ? 12 : 32;
    const margenY = 16;

    const width = Math.max(
      1,
      Math.min(anchoPantalla - margenX * 2, 600)
    );

    const height = Math.max(
      1,
      Math.min(altoPantalla - margenY * 2, 850)
    );

    return {
      left: (anchoPantalla - width) / 2,
      top: (altoPantalla - height) / 2,
      width,
      height
    };
  }

  function agregarBotonVolver(tarjeta) {
  const botonVolver = document.createElement("button");

  botonVolver.type = "button";
  botonVolver.className = "contenido__volver";
  botonVolver.setAttribute("aria-label", "Volver al sobre");
  botonVolver.innerHTML = "←";

  Object.assign(botonVolver.style, {
    position: "absolute",
    top: "12px",
    left: "12px",
    zIndex: "20",
    width: "36px",
    height: "36px",
    border: "1px solid #b99a62",
    borderRadius: "50%",
    background: "#fffdf8",
    color: "#604b3c",
    fontSize: "24px",
    cursor: "pointer"
  });

  botonVolver.addEventListener("click", () => {
    const anillos = document.createElement("div");

    anillos.innerHTML = `
  <div style="
    position:fixed;
    inset:0;
    z-index:99999;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:18px;
    background:#fffdf8;
  ">
    <div style="
      position:relative;
      width:90px;
      height:90px;
    ">
      <span style="
        position:absolute;
        left:12px;
        top:25px;
        width:48px;
        height:48px;
        border:2px solid #b99a62;
        border-radius:50%;
        animation:anilloIzq 1s ease-in-out infinite alternate;
      "></span>

      <span style="
        position:absolute;
        right:12px;
        top:25px;
        width:48px;
        height:48px;
        border:2px solid #b99a62;
        border-radius:50%;
        animation:anilloDer 1s ease-in-out infinite alternate;
      "></span>
    </div>

    <p style="
      margin:0;
      color:#604b3c;
      font-family:Montserrat,sans-serif;
      font-size:11px;
      letter-spacing:2px;
      text-transform:uppercase;
    ">Tu Invitación · 2026</p>

    <style>
      @keyframes anilloIzq {
        to { transform:translateX(8px) rotate(-15deg); }
      }

      @keyframes anilloDer {
        to { transform:translateX(-8px) rotate(15deg); }
      }
    </style>
  </div>
`;
  

    document.body.appendChild(anillos);

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  });

  tarjeta.appendChild(botonVolver);
}
  boton.addEventListener("click", async () => {
    if (animando || desplegada) return;

    animando = true;
    boton.disabled = true;
    boton.setAttribute("aria-expanded", "true");

    let tarjeta;
    let movimiento;

    try {
      // 1. Crear la invitación desde la plantilla.
      tarjeta = plantilla.content.firstElementChild.cloneNode(true);
      tarjeta.id = "contenidoInvitacion";
      tarjeta.inert = false;
      tarjeta.setAttribute("aria-hidden", "false");

      document.body.appendChild(tarjeta);

      // 2. Medir el sobre como punto de partida.
      const inicio = sobre.getBoundingClientRect();

      if (!inicio.width || !inicio.height) {
        throw new Error("No se pudo medir el sobre.");
      }

      // 3. Calcular el destino de la invitación.
      const destino = obtenerDestino();

      // 4. Preparar la tarjeta en el tamaño final.
      Object.assign(tarjeta.style, {
        position: "fixed",
        left: `${destino.left}px`,
        top: `${destino.top}px`,
        width: `${destino.width}px`,
        height: `${destino.height}px`,
        margin: "0",
        zIndex: "1000",
        boxSizing: "border-box",
        transformOrigin: "top left",
        overflowY: "hidden",
        overflowX: "hidden",
        opacity: "0.90",
        visibility: "visible",
        pointerEvents: "painted"
      });

      tarjeta.classList.add("contenido--animando");

      // 5. Calcular el tamaño y la posición iniciales.
      const escalaX = inicio.width / destino.width;
      const escalaY = inicio.height / destino.height;
      const desplazamientoX = inicio.left - destino.left;
      const desplazamientoY = inicio.top - destino.top;

      const transformacionInicial =
        `translate(${desplazamientoX}px, ${desplazamientoY}px) ` +
        `scale(${escalaX}, ${escalaY})`;

      tarjeta.style.transform = transformacionInicial;

      tarjeta.getBoundingClientRect();
      await siguienteFrame();

      // 6. Ocultar el sobre.
      portada.classList.add("esta-abierta");
      portada.classList.add("invitacion-desplegada");

      // 7. Expandir la invitación suavemente.
      movimiento = tarjeta.animate(
        [
          { transform: transformacionInicial },
          { transform: "translate(0, 0) scale(1, 1)" }
        ],
        {
          duration: 1000,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          fill: "forwards"
        }
      );



      // 8. Fijar el estado final.
      Object.assign(tarjeta.style, {
        transform: "none",
        overflowX: "hidden",
        overflowY: "auto",
        pointerEvents: "auto"
      });

     
tarjeta.classList.remove("contenido--animando");
tarjeta.classList.add("contenido--final");

agregarBotonVolver(tarjeta);

desplegada = true;
      
    } catch (error) {
      console.error("Error al abrir la invitación:", error);

      if (movimiento) movimiento.cancel();

      if (tarjeta?.isConnected) {
        const destino = obtenerDestino();

        Object.assign(tarjeta.style, {
          position: "fixed",
          left: `${destino.left}px`,
          top: `${destino.top}px`,
          width: `${destino.width}px`,
          height: `${destino.height}px`,
          transform: "none",
          opacity: "1",
          visibility: "visible",
          overflowY: "auto",
          pointerEvents: "auto"
        });

        tarjeta.classList.remove("contenido--animando");
        tarjeta.classList.add("contenido--final");
        tarjeta.inert = false;
        tarjeta.setAttribute("aria-hidden", "false");

        portada.classList.add("invitacion-desplegada");
        desplegada = true;
      } else {
        boton.disabled = false;
        boton.setAttribute("aria-expanded", "false");
      }
    } finally {
      animando = false;
    }
  });
});
