document.addEventListener("DOMContentLoaded", function() {
    const nombreUsuario = localStorage.getItem("nombreUsuario");
    if (nombreUsuario) {
        document.getElementById("nombreUsuarioSpan").textContent = nombreUsuario;
    } else {
        alert("No has iniciado sesión");
        location.href = "../index.html"; // Redirigir a login si no hay usuario guardado
    }
});

function cerrarSesion() {
    localStorage.removeItem("token"); // Borra el token
    localStorage.removeItem("nombreUsuario"); // Borra el nombre del usuario
    location.href = "../index.html"; // Redirigir a login si no hay usuario guardado
}




// Navegación entre vistas
