document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("No has iniciado sesión");
        location.href = "../index.html"; // Redirigir a login si no hay usuario guardado
    }

    obtenerCompras();
    // Llamar a la función para cargar proveedores al inicio
    obtenerProveedoresConProductos();
});


function cerrarSesion() {
    localStorage.removeItem("token"); // Borra el token
    localStorage.removeItem("nombreUsuario"); // Borra el nombre del usuario
    location.href = "../index.html"; // Redirigir a login si no hay usuario guardado
}

function formatearFecha(fecha) {
    const fechaFormateada = fecha.split("T")[0]; // Formato: dd/mm/yyyy hh:mm:ss
    return fechaFormateada.split("-").reverse().join("/"); // Invertir el orden de las fechas
}


//FUNCION PARA OBTENER EN UNA ARRAY EL ID Y LOS DATOS DEL PRODUCTO
/*
function obtenerProductosSeleccionados() {
    let productos = [];
    document.querySelectorAll(".producto-item").forEach(productoItem => {
        productos.push({
            idProducto: productoItem.querySelector(".producto").value,
            cantidad: parseInt(productoItem.querySelector(".cantidad").value) || 0,
            precio: parseFloat(productoItem.querySelector(".precio").value) || 0.0
        });
    });
    return productos;
}*/

function registrarCompra() {
    const fechaInput = document.getElementById("fecha").value;
    const fechaHoraActual = new Date();

    // Definir fechaFinal antes de usarla
    let fechaFinal;
    if (fechaInput) {
        fechaFinal = `${fechaInput} ${fechaHoraActual.toLocaleTimeString("es-PE", {
            hour12: false, // Formato 24 horas
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })}`;
    } else {
        fechaFinal = fechaHoraActual.toISOString().slice(0, 19).replace("T", " ");
    }

    if (editando && compraEditandoId) {
        const data = {
            idCompra: compraEditandoId, // 🔹 Ahora coincide con el backend
            fecha: fechaFinal, // 🔹 Ahora está definida
            idProveedor: document.getElementById("proveedor").value,
            productos: [
                {
                    idProducto: document.getElementById("producto").value,
                    cantidad: document.getElementById("cantidad").value || 0,
                }
            ],
            monto: parseFloat(totalPagar.textContent) || 0.0,
            tipoPago: parseInt(document.getElementById("pago").value),
            observaciones: document.getElementById("observaciones").value.trim()
        };

        console.log(data); // Para verificar antes de enviar a la BD

        fetch(`/Backend/controllers/compraController.php?action=actualizarCompra`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Compra actualizada correctamente");
                    obtenerCompras(); // 🔹 Ahora solo se ejecuta si la actualización fue exitosa
                } else {
                    alert("Error al actualizar la compra: " + (data.message || "Inténtalo de nuevo"));
                }
            })
            .catch(error => console.error("Error al actualizar la compra:", error));

        modalCompra.classList.add("hidden"); // Cerrar el modal
        return;
    } else {
        const data = {
            idProveedor: document.getElementById("proveedor").value,
            monto: parseFloat(totalPagar.textContent) || 0.0,
            fecha: fechaFinal, // 🔹 Fecha en formato DATETIME
            tipoPago: parseInt(document.getElementById("pago").value),
            observaciones: document.getElementById("observaciones").value.trim(),
            productos: [
                {
                    idProducto: document.getElementById("producto").value,
                    cantidad: parseInt(document.getElementById("cantidad").value) || 0,
                }
            ]
        };

        fetch(`/Backend/controllers/compraController.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Datos de la compra enviados:", data);

                if (data.success) {
                    alert(data.message); // Compra registrada correctamente
                    obtenerCompras(); // 🔹 Solo se ejecuta si el registro es exitoso
                } else {
                    alert("Error: " + (data.message || "No se pudo registrar la compra"));
                }
            })
            .catch((error) => console.error("Error al registrar la compra:", error));

        modalCompra.classList.add("hidden");

        console.log("Datos enviados:", data); // Para verificar antes de enviar a la BD
    }
}

// Datos de ejemplo (simulando una base de datos)
let compras = [];

function obtenerCompras() {
    fetch(`/Backend/controllers/compraController.php`)
        .then((res) => res.json())
        .then((data) => {
            // Formatear los datos para que coincidan con la estructura deseada
            compras = data.map((compra) => ({
                id: compra.idCompra, // Mantener el ID sin cambios
                proveedor: compra.proveedor || "Desconocido", // Evitar undefined
                producto: compra.producto || "Producto no especificado",
                cantidad: parseInt(compra.cantidad) || 0, // Asegurar número válido
                precio: isNaN(parseFloat(compra.precio_unitario))
                    ? 0.0
                    : parseFloat(compra.precio_unitario),
                total: isNaN(parseFloat(compra.total)) ? 0.0 : parseFloat(compra.total),
                fecha: compra.fecha || "Fecha no disponible", // Asegurar formato de fecha válido
                pago: compra.tipoPago || "Método no especificado", // Asegurar consistencia en el campo de pago
                observaciones: compra.observaciones
                    ? compra.observaciones.replace(/\r?\n/g, "\n")
                    : "Sin observaciones",
            }));

            console.log("Compras con detalles:", compras); // Verificar en consola

            // Llamar a renderizarCompras después de obtener los datos
            renderizarCompras();
        })
        .catch((error) => console.error("Error al obtener las compras:", error));
}
let proveedores = [];

function obtenerProveedoresConProductos() {
    fetch(`/Backend/controllers/proveedorController.php`)
        .then((res) => res.json())
        .then((data) => {
            // Formatear los datos y asegurarse de que los productos sean arrays
            proveedores = data.map((proveedor) => ({
                id: proveedor.idProveedor,
                nombre: proveedor.nombreProveedor || "Desconocido",
                ruc: proveedor.ruc || "",
                telefono: proveedor.telefono || "",
                representante: proveedor.representante || "",
                productos: Array.isArray(proveedor.productos)
                    ? proveedor.productos.map((producto) => ({
                        idProducto: producto.idProducto,
                        nombreProducto: producto.nombreProducto,
                        precioUnitario: producto.precioUnitario, // ✅ Agregamos el precio
                    }))
                    : [],
            }));

            console.log("Proveedores con detalles:", proveedores); // Debug en consola
            llenarSelectProveedores(); // Llamamos la función para poblar el select
        })
        .catch((error) => console.error("Error al obtener los proveedores:", error));
}
// Llenar el select de proveedores
function llenarSelectProveedores() {
    const selectProveedor = document.getElementById("proveedor");

    // Limpiar select antes de agregar nuevos datos
    selectProveedor.innerHTML = '<option value="">Seleccionar</option>';

    // Agregar cada proveedor al select
    proveedores.forEach((proveedor) => {
        const option = document.createElement("option");
        option.value = proveedor.id; // ID como valor
        option.textContent = proveedor.nombre; // Nombre visible
        selectProveedor.appendChild(option);
    });
}

document.getElementById("proveedor").addEventListener("change", function () {
    const proveedorId = this.value; // Obtener ID del proveedor seleccionado
    const selectProducto = document.getElementById("producto");

    // Limpiar select de productos
    selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';

    // Buscar el proveedor en el array
    const proveedorSeleccionado = proveedores.find((p) => p.id == proveedorId);

    // Si existe el proveedor, cargar sus productos
    if (proveedorSeleccionado) {
        proveedorSeleccionado.productos.forEach((producto) => {
            const option = document.createElement("option");
            option.value = producto.idProducto;
            option.textContent = producto.nombreProducto;
            option.dataset.precio = producto.precioUnitario; // ✅ Guardar el precio en data-precio
            selectProducto.appendChild(option);
        });

        // Agregar evento para actualizar el precio al seleccionar un producto
        selectProducto.addEventListener("change", mostrarPrecioProducto);
    }
});
function mostrarPrecioProducto() {
    const selectProducto = document.getElementById("producto");
    const precioUnitario = document.getElementById("precio");

    const productoSeleccionado = selectProducto.options[selectProducto.selectedIndex];

    if (productoSeleccionado.value) {
        precioUnitario.value = productoSeleccionado.dataset.precio || "0.00";
    } else {
        precioUnitario.value = ""; // Resetear si no hay producto seleccionado
    }
}

// Variables globales
let editando = false;
let compraEditandoId = null;

// DOM Elements
const tablaComprasBody = document.getElementById("tabla-compras-body");
const modalCompra = document.getElementById("modal-compra");
const modalObservaciones = document.getElementById("modal-observaciones");
const textoObservaciones = document.getElementById("texto-observaciones");
const formCompra = document.getElementById("form-compra");
const btnAgregarCompra = document.getElementById("btn-agregar-compra");
const btnRegresar = document.getElementById("btn-regresar");
const btnCerrarModal = document.getElementById("cerrar-modal");
const btnCerrarModalObs = document.getElementById("cerrar-modal-observaciones");
const btnCerrarObs = document.getElementById("cerrar-observaciones");
const btnCancelar = document.getElementById("cancelar-compra");
const inputPrecio = document.getElementById("precio");
const inputCantidad = document.getElementById("cantidad");
const totalPagar = document.getElementById("total-pagar");
const buscadorCompras = document.getElementById("buscador-compras");

// Funciones de utilidad
const formatCurrency = (value) => `S/ ${value.toFixed(2)}`;
const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("es-PE");

// Mostrar compras en la tabla
function renderizarCompras(comprasMostrar = compras) {
    tablaComprasBody.innerHTML = "";

    if (comprasMostrar.length === 0) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        No se encontraron compras
                    </td>
                `;
        tablaComprasBody.appendChild(fila);
        return;
    }

    comprasMostrar.forEach((compra) => {
        const fila = document.createElement("tr");
        fila.className = "table-row-hover";
        fila.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${compra.proveedor
            }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${compra.producto
            }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${compra.cantidad
            }</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(
                compra.precio
            )}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-semibold">${formatCurrency(
                compra.total
            )}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${formatDate(
                compra.fecha
            )}</td>
                    <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button onclick="verObservaciones(${compra.id
            })" class="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100" title="Ver observaciones">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button onclick="editarCompra(${compra.id
            })" class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button onclick="eliminarCompra(${compra.id
            })" class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </td>
                `;
        tablaComprasBody.appendChild(fila);
        
    });
    window.actualizarTodasLasTarjetas();
}

// Función para buscar compras
function buscarCompras(termino) {
    termino = termino.toLowerCase();
    const comprasFiltradas = compras.filter((compra) => {
        return (
            compra.proveedor.toLowerCase().includes(termino) ||
            compra.producto.toLowerCase().includes(termino) ||
            compra.pago.toLowerCase().includes(termino) ||
            compra.fecha.toLowerCase().includes(termino) ||
            compra.total.toString().includes(termino)
        );
    });
    renderizarCompras(comprasFiltradas);
}

// Ver observaciones
window.verObservaciones = function (id) {
    const compra = compras.find((c) => c.id === id);
    if (compra) {
        textoObservaciones.textContent =
            compra.observaciones || "No hay observaciones registradas";
        modalObservaciones.classList.remove("hidden");
    }
};

// Calcular total automáticamente
function calcularTotal() {
    const cantidad = parseFloat(inputCantidad.value) || 0;
    const precio = parseFloat(inputPrecio.value) || 0;
    const total = cantidad * precio;
    totalPagar.textContent = total.toFixed(2);
}

// Abrir modal para nueva compra
function abrirModalNuevaCompra() {
    editando = false;
    compraEditandoId = null;
    formCompra.reset();
    totalPagar.textContent = "0.00";
    document.getElementById("fecha").valueAsDate = new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
    );
    document.getElementById("titulo-modal-compra").textContent =
        "Registrar Nueva Compra";
    modalCompra.classList.remove("hidden");
}



// Editar compra
window.editarCompra = function (id) {
    fetch(`/Backend/controllers/compraController.php?action=obtenerCompraConId&id=${id}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert("Error al obtener la compra");
                return;
            }

            const compra = data.compra; // Asignamos los datos recibidos

            editando = true;
            compraEditandoId = id;

            // Asignar el proveedor y forzar el evento "change"
            const proveedorSelect = document.getElementById("proveedor");
            proveedorSelect.value = compra.idProveedor || "";
            proveedorSelect.dispatchEvent(new Event("change")); // Simular cambio

            // Habilitar el select de producto si es necesario
            const productoSelect = document.getElementById("producto");
            productoSelect.disabled = false;
            productoSelect.value = compra.detalles[0]?.idProducto || "";

            // Extraer solo la fecha en formato YYYY-MM-DD
            const fechaDB = compra.fecha.split(" ")[0];
            document.getElementById("fecha").value = fechaDB;

            // Llenar el resto de los campos
            document.getElementById("cantidad").value = compra.detalles[0]?.cantidad || "";
            document.getElementById("precio").value = compra.detalles[0]?.precio || "";
            document.getElementById("pago").value = compra.idTipoPago;
            document.getElementById("observaciones").value = compra.observaciones || "";
            totalPagar.textContent = parseFloat(compra.monto).toFixed(2);

            // Mostrar el modal de edición
            document.getElementById("titulo-modal-compra").textContent = "Editar Compra";
            modalCompra.classList.remove("hidden");
        })
        .catch(error => console.error("Error:", error));
};



function eliminarComprayStock(id) {
    fetch(`/Backend/controllers/compraController.php?action=eliminarConStock&id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion("Stock actualizado correctamente y compra eliminada", "success");
            } else {
                mostrarNotificacion("Error al actualizar el stock, compra no eliminada", "error");
            }
        })
        .catch(error => console.error("Error:", error));
}

function eliminarCompraSinStock(id) {
    fetch(`/Backend/controllers/compraController.php?action=eliminarSoloCompra&id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion("Compra eliminada correctamente sin afectar el stock", "success");
                renderizarVentas();
            } else {
                mostrarNotificacion("Error al eliminar la compra", "error");
            }
        })
        .catch(error => console.error("Error:", error));
}

// Eliminar compra con confirmaciones
window.eliminarCompra = function (id) {
    Swal.fire({
        title: "¿Estás seguro de eliminar esta compra?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (!result.isConfirmed) return;

        Swal.fire({
            title: "¿Quieres alterar el stock?",
            icon: "question",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Sí, ajustar stock",
            denyButtonText: "No, solo eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarComprayStock(id);
            } else if (result.isDenied) {  // ✅ Aquí corregimos la condición
                eliminarCompraSinStock(id);
            }
        });
    });
};

// Guardar compra (nueva o edición)
function guardarCompra(e) {
    e.preventDefault();

    const nuevaCompra = {
        id: editando ? compraEditandoId : null, // Solo enviamos el ID si estamos editando
        idProveedor: document.getElementById("proveedor").value,
        idProducto: document.getElementById("producto").value,
        cantidad: parseInt(document.getElementById("cantidad").value),
        monto: parseFloat(document.getElementById("precio").value),
        total: parseFloat(totalPagar.textContent),
        fecha: document.getElementById("fecha").value, // Se mantiene en formato YYYY-MM-DD
        idTipoPago: document.getElementById("pago").value,
        observaciones: document.getElementById("observaciones").value,
    };

    // Definir si es una edición o una nueva compra
    const url = editando
        ? "/Backend/controllers/compraController.php?action=actualizarCompra"
        : "/Backend/controllers/compraController.php?action=guardarCompra";

    fetch(url, {
        method: "POST", // Usamos POST para ambas operaciones
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaCompra), // Convertimos el objeto a JSON para enviarlo
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion(editando ? "Compra actualizada correctamente" : "Compra registrada correctamente", "success");

                // Recargar la lista de compras después de la operación
                obtenerTodasLasCompras();

                // Cerrar el modal
                modalCompra.classList.add("hidden");

                // Resetear estado de edición
                editando = false;
                compraEditandoId = null;

            } else {
                mostrarNotificacion("Error al guardar la compra", "error");
            }
        })
        .catch(error => {
            console.error("Error al guardar compra:", error);
            mostrarNotificacion("Ocurrió un error al guardar", "error");
        });
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = "info") {
    const tipos = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    const notificacion = document.createElement("div");
    notificacion.className = `fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg ${tipos[tipo] || tipos.info
        } animate-modal z-50`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.classList.add(
            "opacity-0",
            "transition-opacity",
            "duration-300"
        );
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Control del sidebar
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggle-sidebar");
const mainContent = document.getElementById("main-content");
const logoText = document.getElementById("logo-text");
let isMinimized = false;



// Event Listeners
btnAgregarCompra.addEventListener("click", abrirModalNuevaCompra);
btnRegresar.addEventListener(
    "click",
    () => (window.location.href = "inicio.html")
);
btnCerrarModal.addEventListener("click", () =>
    modalCompra.classList.add("hidden")
);
btnCerrarModalObs.addEventListener("click", () =>
    modalObservaciones.classList.add("hidden")
);
btnCerrarObs.addEventListener("click", () =>
    modalObservaciones.classList.add("hidden")
);
btnCancelar.addEventListener("click", () =>
    modalCompra.classList.add("hidden")
);
formCompra.addEventListener("submit", guardarCompra);
inputPrecio.addEventListener("input", calcularTotal);
inputCantidad.addEventListener("input", calcularTotal);

// Evento para el buscador
buscadorCompras.addEventListener("input", (e) => buscarCompras(e.target.value));

// Inicializar
document.getElementById("fecha").valueAsDate = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
);

