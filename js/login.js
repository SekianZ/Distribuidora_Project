const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
    // Cambiar el tipo de input entre 'password' y 'text'
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Cambiar el icono del ojo
    togglePassword.classList.toggle('bxs-low-vision');
    togglePassword.classList.toggle('bxs-show');
});

function validarLogin() {
    const usuario = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!usuario || !password) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    fetch(`Backend/controllers/usuarioController.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreUsuario: usuario, contrasena: password, action: 'login' })
    })
    .then(res => res.json().catch(() => { throw new Error("Respuesta no válida del servidor"); }))
    .then(data => {
        if (data.usuario) {
            localStorage.setItem("token", data.usuario.idUsuario); // Guardar ID (Mejor usar JWT)
            localStorage.setItem("nombreUsuario", data.usuario.nombreUsuario); // Guardar nombre de usuario
            location.href = '/Pages/inicio.html';
        } else {
            alert("Credenciales incorrectas");
        }
    })
    .catch(error => {
        console.error("Error en login:", error);
        alert("Error al conectar con el servidor");
    });
}
