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
                case "gas generico":
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

// Llamada a la función al cargar la página
document.addEventListener('DOMContentLoaded', stocksParaTarjetas);
