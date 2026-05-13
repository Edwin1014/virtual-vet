async function verificarSesion() {

    try {

        const respuesta = await fetch("/usuario");
        const datos = await respuesta.json();

        const nav = document.querySelector("nav");

        if (datos.logueado) {

            nav.innerHTML = `
                <a href="index.html">Inicio</a>
                <a href="servicios.html">Servicios</a>
                <a href="agendar.html">Agendar</a>
                <span class="usuario-nav">
                    Hola, ${datos.usuario.nombre}
                </span>
                <a href="/logout">Cerrar sesión</a>
            `;

        } else {

            nav.innerHTML = `
                <a href="index.html">Inicio</a>
                <a href="servicios.html">Servicios</a>
                <a href="agendar.html">Agendar</a>
                <a href="login.html">Login</a>
            `;
        }

    } catch (error) {
        console.log(error);
    }
}

verificarSesion();