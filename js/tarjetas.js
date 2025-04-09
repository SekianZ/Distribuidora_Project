function stocksParaTarjetas() {
    const stockPaceña = document.getElementById("stock-paceña");
    const stockHuari = document.getElementById("stock-huari");
    const stockGas = document.getElementById("stock-gas");

    // Verificar si los elementos existen antes de hacer la petición
    if (!stockPaceña || !stockHuari || !stockGas) return;

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

    if (!clientesTotales || !clientesActivos) return;

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
    // Verificar en qué página estamos para ejecutar las funciones correspondientes
    const path = window.location.pathname;
    
    if (path.includes('Ventas.html') || path.includes('Compras.html')) {
        stocksParaTarjetas();
    } else if (path.includes('clientes.html') || path.includes('proovedor.html')) {
        actualizarTarjetasClientes();
    } else {
        // Si no es ninguna de las páginas específicas, ejecutar ambas
        stocksParaTarjetas();
        actualizarTarjetasClientes();
    }
}


// Llamada inicial al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar en qué página estamos para ejecutar las funciones correspondientes
    const path = window.location.pathname;
    
    if (path.includes('Ventas.html') || path.includes('Compras.html')) {
        stocksParaTarjetas();
    } else if (path.includes('clientes.html') || path.includes('proovedor.html')) {
        actualizarTarjetasClientes();
    } else {
        // Si no es ninguna de las páginas específicas, ejecutar ambas
        stocksParaTarjetas();
        actualizarTarjetasClientes();
    }
});