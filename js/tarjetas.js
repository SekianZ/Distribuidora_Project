function stocksParaTarjetas() {
    const stockPaceña = document.getElementById("stock-paceña");
    const stockHuari = document.getElementById("stock-huari");
    const stockGas = document.getElementById("stock-gas");

    fetch("/Backend/controllers/TarjetasController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "obtenerStock" }) // Enviar acción correcta
    })
    .then(res => res.json())
    .then(data => {
        console.log("Datos obtenidos:", data);
        if (data.error) {
            console.error("Error al obtener los stocks:", data.error);
            return;
        }

        // Recorremos los productos y actualizamos las tarjetas con el stock
        data.forEach(producto => {
            switch (producto.nombreProducto.toLowerCase()) {
                case "cerveza paceña":
                    stockPaceña.textContent = producto.stock;
                    break;
                case "cerveza huari":
                    stockHuari.textContent = producto.stock;
                    break;
                case "gas":
                    stockGas.textContent = producto.stock;
                    break;
                default:
                    console.error("Producto desconocido:", producto.nombreProducto);
                    break;
            }
        });
    })
    .catch(error => console.error("Error al obtener los stocks:", error));
}

function actualizarTarjetasClientes() {
    const clientesTotales = document.getElementById("clientes-totales");
    const clientesActivos = document.getElementById("clientes-activos");

    fetch("/Backend/controllers/TarjetasController.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "obtenerEstadisticasClientes" })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Datos de clientes obtenidos:", data);
        if (data.error) {
            console.error("Error al obtener los clientes:", data.error);
            return;
        }

        // Actualizar las tarjetas con los datos recibidos
        clientesTotales.textContent = data.totalClientes;
        clientesActivos.textContent = data.clientesActivos;
    })
    .catch(error => console.error("Error al obtener los clientes:", error));
}

window.actualizarTodasLasTarjetas = function() {
    stocksParaTarjetas();
    actualizarTarjetasClientes();
    // Agrega aquí otras funciones de actualización si las hay
}


// Llamada a ambas funciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    stocksParaTarjetas();
    actualizarTarjetasClientes();
});