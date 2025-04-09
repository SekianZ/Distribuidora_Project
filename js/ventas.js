document.addEventListener("DOMContentLoaded", function () {
    const token = 123;
    if (!token) {
        alert("No has iniciado sesión");
        location.href = "../index.html"; // Redirigir a login si no hay usuario guardado
    }

    obtenerVentas();

    // Cargar datos al inicio
    obtenerDatosFormulario();
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

let categorias = []; 
let clientes = []; 
let productos = []; 
let manejoPorCategoria = {};
let tiposPago = {}; 

// Obtener datos desde el backend
async function obtenerDatosFormulario() {
    try {
        //Obtener clientes
        const resClientes = await fetch(`../Backend/controllers/clienteController.php`);
        const dataClientes = await resClientes.json();
        clientes = dataClientes || [];
        console.log(clientes);

        // Obtener tipos de pago
        const resTiposPago = await fetch(`../Backend/controllers/tipoPagoController.php`);
        const dataTiposPago = await resTiposPago.json();
        tiposPago = dataTiposPago || [];
        llenarTiposPago();

        // Obtener categorías
        const resCategorias = await fetch(`../Backend/controllers/categoriaController.php`);
        const dataCategorias = await resCategorias.json();
        categorias = dataCategorias || [];

        // Obtener productos
        const resProductos = await fetch(`../Backend/controllers/productoController.php`);
        const dataProductos = await resProductos.json();
        productos = dataProductos || [];

        // Obtener manejo de productos
        const resManejo = await fetch(`../Backend/controllers/manejoCategoriaController.php`);
        const dataManejo = await resManejo.json();
        manejoPorCategoria = agruparManejoPorCategoria(dataManejo || []);

        // Llenar categorías solo después de tener los datos de productos
        llenarCategorias();

        console.log("Datos cargados:", { categorias, productos, manejoPorCategoria });

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function llenarClientes() {
    console.log(clientes,);
    const selectCliente = document.getElementById("select-cliente-frecuente");
    selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.idCliente;
        option.textContent = cliente.nombreCliente;
        selectCliente.appendChild(option);
    });
}

function llenarTiposPago() {
    const selectTipoPago = document.getElementById("pago");
    selectTipoPago.innerHTML = '<option value="">Seleccione un tipo de pago</option>';

    tiposPago.forEach((tipoPago) => {
        const option = document.createElement("option");
        option.value = tipoPago.idTipoPago;
        option.textContent = tipoPago.metodoPago;
        selectTipoPago.appendChild(option);
    });
}

// Llenar el select de categorías
function llenarCategorias() {
    const selectCategoria = document.getElementById("tipo-producto");
    selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';

    categorias.forEach((categoria) => {
        const option = document.createElement("option");
        option.value = categoria.idCategoria;
        option.textContent = categoria.nombreCategoria;
        selectCategoria.appendChild(option);
    });

    // Agregar evento de cambio de categoría
    selectCategoria.addEventListener("change", llenarProductos);
    
    // Llamar a llenarProductos() al cargar las categorías para verificar si ya hay una seleccionada
    llenarProductos();
}

// Llenar el select de productos según la categoría seleccionada
function llenarProductos() {
    const selectProducto = document.getElementById("producto");
    const categoriaSeleccionada = document.getElementById("tipo-producto").value;

    // Reiniciar el select de productos
    selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';

    // Desactivar el select de productos si no hay una categoría seleccionada
    if (!categoriaSeleccionada) {
        selectProducto.disabled = true;  // Desactiva el select de productos
    } else {
        selectProducto.disabled = false; // Habilita el select de productos si hay una categoría seleccionada

        // Convertimos categoriaSeleccionada a número para comparación correcta
        const categoriaID = parseInt(categoriaSeleccionada, 10);

        // Filtrar los productos según la categoría seleccionada
        const productosFiltrados = productos.filter(producto => parseInt(producto.idCategoria, 10) === categoriaID);

        productosFiltrados.forEach((producto) => {
            const option = document.createElement("option");
            option.value = producto.idProducto;
            option.textContent = producto.nombreProducto;
            option.dataset.idCategoria = producto.idCategoria;
            option.dataset.precio = producto.precio; 
            selectProducto.appendChild(option);
        });

        document.getElementById("manejoProducto").style.display = "none";
    }
}


// Agrupar los manejos por categoría
function agruparManejoPorCategoria(manejoProductos) {
    let agrupado = {};

    manejoProductos.forEach((manejo) => {
        const idCategoria = manejo.idCategoria;

        if (!agrupado[idCategoria]) {
            agrupado[idCategoria] = [];
        }

        agrupado[idCategoria].push({
            idManejo: manejo.idManejo,
            descripcion: manejo.descripcion,
        });
    });

    return agrupado;
}

// Inicializamos Select2
$(document).ready(function() {
    $('#select-cliente-frecuente').select2({
        width: '100%' // Se ajusta al 100% del contenedor
    });
    $('#producto').select2({
        width: '100%' // Se ajusta al 100% del contenedor
    });

    // Ahora escuchamos el evento 'change' sobre el select con Select2
    $('#producto').on('change', function () {
        const productoSeleccionado = this.options[this.selectedIndex];
        const contenedorManejo = document.getElementById("manejoProducto");
        const opcionesManejo = document.getElementById("opcionesManejo");
        const precioElemento = document.getElementById("precio");

        // Limpiar contenido previo en manejo
        opcionesManejo.innerHTML = "";

        if (productoSeleccionado.value === "") {
            // Si el valor del producto es el predeterminado, ocultamos el manejo y el precio
            contenedorManejo.style.display = "none";
            precioElemento.value = 0; // O puedes poner un valor predeterminado como "Seleccionar un producto"
        } else {
            const idCategoria = productoSeleccionado.dataset.idCategoria;
            const precio = productoSeleccionado.dataset.precio;

            if (manejoPorCategoria[idCategoria] && manejoPorCategoria[idCategoria].length > 0) {
                manejoPorCategoria[idCategoria].forEach((manejo) => {
                    const label = document.createElement("label");
                    label.className = "flex items-center gap-2 cursor-pointer";

                    const input = document.createElement("input");
                    input.type = "radio";
                    input.name = "manejoProducto"; // Todos deben compartir el mismo "name" para que solo se pueda seleccionar uno
                    input.value = manejo.idManejo;
                    input.className = "cursor-pointer"; // Para mejorar la experiencia visual

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(manejo.descripcion));

                    opcionesManejo.appendChild(label);
                });

                contenedorManejo.style.display = "block"; // Muestra el contenedor de manejo
            } else {
                contenedorManejo.style.display = "none"; // Si no hay manejos, ocultamos el contenedor
            }

            // Mostrar el precio del producto
            mostrarPrecioProducto(precio);
        }
    });
});


// Ejecutar la carga de datos al iniciar la página
obtenerDatosFormulario();


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

// Datos de ejemplo (simulando una base de datos)
let ventas = [];

function obtenerVentas() {
    fetch(`/Backend/controllers/ventaController.php`)
        .then((res) => res.json())
        .then((data) => {
            // Formatear los datos para que coincidan con la estructura deseada
            ventas = data.map((ventas) => ({
                idVenta: ventas.idVenta, // Mantener el ID sin cambios
                cliente: ventas.cliente || "Desconocido", // Evitar undefined
                producto: ventas.producto || "Producto no especificado",
                cantidad: parseInt(ventas.cantidad) || 0, // Asegurar número válido
                manejoProducto: ventas.manejo || "Sin manejo", // Asegurar consistencia en el campo de manejo
                precio: isNaN(parseFloat(ventas.precio_unitario))
                    ? 0.0
                    : parseFloat(ventas.precio_unitario),
                total: isNaN(parseFloat(ventas.monto)) ? 0.0 : parseFloat(ventas.monto),
                fecha: ventas.fecha || "Fecha no disponible", // Asegurar formato de fecha válido   
                pago: ventas.tipoPago || "Método no especificado", // Asegurar consistencia en el campo de pago
                observaciones: ventas.observaciones
                    ? ventas.observaciones.replace(/\r?\n/g, "\n")
                    : "Sin observaciones",
            }));



            // Llamar a renderizarventas después de obtener los datos
            renderizarVentas();
        })
        .catch((error) => console.error("Error al obtener las ventas:", error));
}



// Variables globales
let editando = false;
let ventaEditandoId = null;

// DOM Elements
const tablaVentasBody = document.getElementById('tabla-ventas-body');
const modalVenta = document.getElementById('modal-venta');
const modalObservaciones = document.getElementById('modal-observaciones');
const textoObservaciones = document.getElementById('texto-observaciones');
const formVenta = document.getElementById('form-venta');
const btnAgregarVenta = document.getElementById('btn-agregar-venta');
const btnRegresar = document.getElementById('btn-regresar');
const btnCerrarModal = document.getElementById('cerrar-modal');
const btnCerrarModalObs = document.getElementById('cerrar-modal-observaciones');
const btnCerrarObs = document.getElementById('cerrar-observaciones');
const btnCancelar = document.getElementById('cancelar-venta');
const inputPrecio = document.getElementById('precio');
const inputCantidad = document.getElementById('cantidad');
const totalVenta = document.getElementById('total-venta');
const buscadorVentas = document.getElementById('buscador-ventas');

// Funciones de utilidad
const formatCurrency = (value) => `S/ ${value.toFixed(2)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-PE');

// Mostrar ventas en la tabla
function renderizarVentas(ventasMostrar = ventas) {
    tablaVentasBody.innerHTML = '';

    if (ventasMostrar.length === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                No se encontraron ventas
            </td>
        `;
        tablaVentasBody.appendChild(fila);
        return;
    }

    ventasMostrar.forEach(venta => {
        const fila = document.createElement('tr');
        fila.className = 'table-row-hover';
        fila.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${venta.cliente}</td>
            <td class="px-6 py-4 whitespace-nowrap">${venta.producto}</td>
            <td class="px-6 py-4 whitespace-nowrap">${venta.cantidad}</td>
            <td class="px-6 py-4 whitespace-nowrap">${venta.manejoProducto}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatCurrency(venta.precio)}</td>
            <td class="px-6 py-4 whitespace-nowrap font-semibold">${formatCurrency(venta.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${formatDate(venta.fecha)}</td>
            <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                <button onclick="verObservaciones(${venta.idVenta})" class="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100" title="Ver observaciones">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                </button>
                <button onclick="editarVenta(${venta.idVenta})" class="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50" title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button onclick="eliminarVenta(${venta.idVenta})" class="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50" title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </td>
        `;
        tablaVentasBody.appendChild(fila);
        window.actualizarTodasLasTarjetas();
    });
}

// Función para buscar ventas
function buscarVentas(termino) {
    termino = termino.toLowerCase();
    const ventasFiltradas = ventas.filter(venta => {
        return (
            venta.cliente.toLowerCase().includes(termino) ||
            venta.producto.toLowerCase().includes(termino) ||
            venta.pago.toLowerCase().includes(termino) ||
            venta.fecha.toLowerCase().includes(termino) ||
            venta.total.toString().includes(termino)
        );
    });
    renderizarVentas(ventasFiltradas);
}

// Ver observaciones
window.verObservaciones = function (id) {
    const venta = ventas.find(v => v.idVenta === id);
    if (venta) {
        textoObservaciones.textContent = venta.observaciones || "No hay observaciones registradas";
        modalObservaciones.classList.remove('hidden');
    }else{
        console.log("No se encontró la venta con el id: "+id);
    }
}

// Calcular total automáticamente
function calcularTotal() {
    const cantidad = parseFloat(inputCantidad.value) || 0;
    const precio = parseFloat(inputPrecio.value) || 0;
    const total = cantidad * precio;
    totalVenta.textContent = total.toFixed(2);
}

// Abrir modal para nueva venta
function abrirModalNuevaVenta() {
    editando = false;
    ventaEditandoId = null;
    formVenta.reset();
    totalVenta.textContent = '0.00';
    document.getElementById('fecha').valueAsDate = new Date();
    document.getElementById('titulo-modal-venta').textContent = 'Registrar Nueva Venta';
    modalVenta.classList.remove('hidden');
}

async function obtenerDatosVenta(idVenta) {
    try {
        const res = await fetch(`/Backend/controllers/ventaController.php?idVenta=${idVenta}`);
        const data = await res.json();
        console.log("Datos de la venta enviados:", data);
        if (data.success) {
            return data.ventas; // Retornar la venta obtenida
        } else {
            alert("Error: " + (data.message || "No se pudo obtener la venta"));
            return null; // Indicar que hubo un error
        }
    } catch (error) {
        console.error("Error al obtener la venta:", error);
        return null; // Indicar que hubo un error
    }
}

// Editar venta
window.editarVenta = async function (id) {
    const venta = await obtenerDatosVenta(id);

    console.log("venta", venta);
    editando = true;
    ventaEditandoId = id;

    document.getElementById("cliente-nuevo").checked = false;
    document.getElementById("cliente-nuevo").disabled = true;

    var checkbox = document.getElementById("cliente-frecuente");
    checkbox.checked = true;
    var event = new Event('change');
    checkbox.dispatchEvent(event);

    const clienteSelect = document.getElementById("select-cliente-frecuente");
    clienteSelect.value = venta[0]?.Cliente || "";

    // Selecciona el elemento
    // Selecciona el <select> con el ID "tipo-producto"
    const productoTipoSelect = document.getElementById("tipo-producto");
    console.log("Venta: ",venta);
    productoTipoSelect.value = venta[0]?.TipoProducto || "";
    console.log("Valor del producto tipo: ", productoTipoSelect.value);


    // Dispara el evento "change"
    var event = new Event('change');
    productoTipoSelect.dispatchEvent(event);


    // Habilitar el select de producto si es necesario
    const productoSelect = document.getElementById("producto");
    productoSelect.disabled = false;
    productoSelect.value = venta[0]?.Producto || "";
    productoSelect.dispatchEvent(new Event("change")); // Simular cambio

    // Extraer solo la fecha en formato YYYY-MM-DD
    const fechaDB = venta[0]?.Fecha?.split(" ")[0] || "";
    document.getElementById("fecha").value = fechaDB;

    // Llenar el resto de los campos
    document.getElementById("cantidad").value = venta[0]?.Cantidad || "";
    document.getElementById("precio").value = venta[0]?.Precio_Unitario || "";
    document.getElementById("pago").value = venta[0]?.Tipo_Pago || "";
    document.getElementById("observaciones").value = venta[0]?.Observaciones || "";
    document.getElementById("total-venta").textContent = 
        parseFloat(venta[0]?.Cantidad * venta[0]?.Precio_Unitario || 0).toFixed(2);

    // Seleccionar el radio button correspondiente en opcionesManejo
    const valorManejo = venta[0]?.Manejo || "";
    if (valorManejo) {
        const radioSeleccionado = document.querySelector(`input[name="manejoProducto"][value="${valorManejo}"]`);
        if (radioSeleccionado) {
            radioSeleccionado.checked = true; // Marcar el radio button
        }
    }

    // Mostrar el modal de edición
    document.getElementById("titulo-modal-venta").textContent = "Editar venta";
    modalVenta.classList.remove("hidden");
};

function eliminarventayStock(id) {
    fetch(`/Backend/controllers/ventaController.php?action=eliminarConStock&id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion("Stock actualizado correctamente y venta eliminada", "success");
                obtenerVentas();
                renderizarVentas();
            } else {
                mostrarNotificacion("Error al actualizar el stock, venta no eliminada", "error");
            }
        })
        .catch(error => console.error("Error:", error));
}

function eliminarventaSinStock(id) {
    fetch(`/Backend/controllers/ventaController.php?action=eliminarSoloventa&id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarNotificacion("venta eliminada correctamente sin afectar el stock", "success");
                renderizarVentas();
            } else {
                mostrarNotificacion("Error al eliminar la venta", "error");
            }
        })
        .catch(error => console.error("Error:", error));
}

// Eliminar venta con confirmaciones
window.eliminarVenta = function (id) {
    Swal.fire({
        title: "¿Estás seguro de eliminar esta venta?",
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
                eliminarventayStock(id);
            } else if (result.isDenied) {  // ✅ Aquí corregimos la condición
                eliminarventaSinStock(id);
            }
        });
    });
};

function verificarDatosIngresados() {
    if (document.getElementById("fecha").value === "") {
        alert("Por favor, ingresa una fecha");
        return false;
    }
    if (document.getElementById("cantidad").value === "") {
        alert("Por favor, ingresa una cantidad");
        return false;
    }
    if (document.getElementById("precio").value === "") {
        alert("Por favor, ingresa un precio");
        return false;
    }
    if (document.getElementById("pago").value === "") {
        alert("Por favor, selecciona un tipo de pago");
        return false;
    }
    if (document.getElementById("producto").value === "") {
        alert("Por favor, selecciona un producto");
        return false;
    }

    if(document.getElementById("cliente-frecuente").checked === true){
        if (document.getElementById("select-cliente-frecuente").value === "") {
            alert("Por favor, selecciona un cliente");
            return false;
        }
    }else if(document.getElementById("cliente-nuevo").checked === true){
        if (document.getElementById("nombre-cliente").value === "") {
            alert("Por favor, ingresa un nombre de cliente");
            return false;
        }
        if (document.getElementById("telefono-cliente").value === "") {
            alert("Por favor, ingresa un teléfono");
            return false;
        }
    }

    return true;
}

function agregarCliente() {
    const nombreCliente = document.getElementById("nombre-cliente");
    const telefono = document.getElementById("telefono-cliente");

    if (!nombreCliente.value.trim()) {
        alert("Por favor, ingresa un nombre de cliente");
        return;
    }

    const data2 = {
        nombreCliente: nombreCliente.value.trim(),
        telefono: telefono.value.trim()
    };

    return fetch(`/Backend/controllers/clienteController.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data2)
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.estado) {
            alert("Cliente agregado correctamente");
            return data.idCliente; // Retorna el ID del cliente
        } else {
            alert("Error: " + (data.mensaje || "No se pudo registrar el cliente"));
            return null;
        }
    })
    .catch((error) => {
        console.error("Error al registrar el cliente:", error);
        return null;
    });
}   

// Guardar venta (nueva o edición)
async function guardarVenta(e) {
    e.preventDefault();

    if (!verificarDatosIngresados()) {
        alert("Por favor, completa todos los campos");
        return;
    }

    let idClienteRepase;

    if (document.getElementById("cliente-nuevo").checked === true) {
        idClienteRepase = await agregarCliente();  // ✅ Esperamos la respuesta
        console.log("idClienteRepase", idClienteRepase);
    } else if (document.getElementById("cliente-frecuente").checked === true) {
        idClienteRepase = document.getElementById("select-cliente-frecuente").value;
    }

    const nuevaVenta = {
        idVenta: ventaEditandoId,
        fecha: document.getElementById("fecha").value,
        idCliente: idClienteRepase,
        productos: [
            {
                idProducto: document.getElementById("producto").value,
                cantidad: document.getElementById("cantidad").value || 0,
            }
        ],
        montoVenta: parseFloat(totalVenta.textContent) || 0.0,
        IdtipoPago: parseInt(document.getElementById("pago").value),
        idManejoProducto: document.querySelector('input[name="manejoProducto"]:checked')?.value || null,
        observacionesVenta: document.getElementById("observaciones").value.trim()
    };

    if (editando) {
        actualizarVenta(nuevaVenta);
        mostrarNotificacion('Venta actualizada correctamente', 'success');
    } else {
        agregarVenta(nuevaVenta);
        mostrarNotificacion('Venta registrada correctamente', 'success');
    }

    renderizarVentas();
    modalVenta.classList.add('hidden');
}




function actualizarVenta(newVenta) {
    fetch(`/Backend/controllers/ventaController.php`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVenta)
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Datos de la venta enviados:", data);
            if (data.success) {
                modalVenta.classList.add("hidden");
                obtenerVentas();
                renderizarVentas();
            } else {
                alert("Error: " + (data.message || "No se pudo actualizar la venta"));
            }
        })
        .catch((error) => console.error("Error al actualizar la venta:", error));
    return;
}

function agregarVenta(newVenta) {
    console.log("entro");
    fetch(`/Backend/controllers/ventaController.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVenta)
    })
        .then((res) => res.json())
        .then((data) => {
            console.log("Datos de la venta enviados:", data);
            if (data.success) {
                modalVenta.classList.add("hidden");
                obtenerVentas();
                renderizarVentas();
            } else {
                alert("Error: " + (data.message || "No se pudo registrar la venta"));
            }
        })
        .catch((error) => console.error("Error al registrar la venta:", error));
    return;
}



// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'info') {
    const tipos = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg ${tipos[tipo] || tipos.info} animate-modal z-50`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Control del sidebar

// Event Listeners
btnAgregarVenta.addEventListener('click', abrirModalNuevaVenta);
btnRegresar.addEventListener('click', () => window.location.href = 'inicio.html');
btnCerrarModal.addEventListener('click', () => modalVenta.classList.add('hidden'));
btnCerrarModalObs.addEventListener('click', () => modalObservaciones.classList.add('hidden'));
btnCerrarObs.addEventListener('click', () => modalObservaciones.classList.add('hidden'));
btnCancelar.addEventListener('click', () => modalVenta.classList.add('hidden'));
formVenta.addEventListener('submit', guardarVenta);
inputPrecio.addEventListener('input', calcularTotal);
inputCantidad.addEventListener('input', calcularTotal);

// Evento para el buscador
buscadorVentas.addEventListener('input', (e) => buscarVentas(e.target.value));

// Inicializar
document.getElementById('fecha').valueAsDate = new Date();
renderizarVentas();



function sistemaBotonCliente() {
    const nombreCliente = document.getElementById("nombre-cliente");
    const telefono = document.getElementById("telefono-cliente");
    const checkboxClientes = document.getElementById("cliente-nuevo");
    const btnCliente = document.getElementById("guardar-cliente");

    if (nombreCliente.value.trim() === "") {
        alert("Por favor, ingresa un nombre de cliente");
        return;
    }
    if (telefono.value.trim() === "") {
        alert("Por favor, ingresa un teléfono");
        return;
    }

    // Deshabilitar campos
    nombreCliente.disabled = true;
    telefono.disabled = true;
    checkboxClientes.disabled = true;
    btnCliente.textContent = "Guardado";
    btnCliente.className = "px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
    btnCliente.disabled = true;
    // Crear botón de cancelar
    const button = document.createElement("button");
    button.textContent = "Cancelar";
    button.id = "Cancelar-cliente";
    button.className = "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
    
    button.onclick = function() {
        habilitarCampos();
    };

    // Agregar el botón de cancelar al DOM
    btnCliente.parentNode.appendChild(button);
}

// Función para volver a habilitar los campos
function habilitarCampos() {
    document.getElementById("nombre-cliente").disabled = false;
    document.getElementById("telefono-cliente").disabled = false;
    document.getElementById("cliente-nuevo").disabled = false;
    
    const btnCliente = document.getElementById("guardar-cliente");
    btnCliente.textContent = "Guardar";
    btnCliente.className = "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
    btnCliente.disabled = false;

    // Eliminar el botón de cancelar
    const cancelarBtn = document.getElementById("Cancelar-cliente");
    if (cancelarBtn) {
        cancelarBtn.remove();
    }
}

function desabilitarCliente(nombreCliente, telefono) {
    nombreCliente.classList.remove("disabled");
    telefono.classList.remove("disabled");
    document.getElementById("cliente-nuevo").checked = disabled;
}




// Mostrar u ocultar el formulario de cliente nuevo
document.getElementById('cliente-nuevo').addEventListener('change', function () {
    const clienteNuevoForm = document.getElementById('cliente-nuevo-form');
    const botonGuardar = document.getElementById('guardar-cliente');
    const clienteExistente = document.getElementById('cliente-frecuente'); // Asegúrate de tener este checkbox en tu HTML

    if (this.checked) {
        clienteNuevoForm.classList.remove('hidden'); // Mostrar los campos adicionales
        botonGuardar.classList.remove('hidden'); // Mostrar el botón Guardar
        clienteExistente.disabled = true; // Deshabilitar la otra opción
    } else {
        clienteNuevoForm.classList.add('hidden'); // Ocultar los campos adicionales
        botonGuardar.classList.add('hidden'); // Ocultar el botón Guardar
        clienteExistente.disabled = false; // Habilitar la otra opción
    }
});

document.getElementById('cliente-frecuente').addEventListener('change', function () {
    const clienteNuevo = document.getElementById('cliente-nuevo');

    if (this.checked) {
        clienteNuevo.disabled = true; // Deshabilitar la opción de cliente nuevo
    } else {
        clienteNuevo.disabled = false; // Habilitar la opción de cliente nuevo
    }
});




// Mostrar u ocultar el formulario de cliente frecuente
document.getElementById('cliente-frecuente').addEventListener('change', function () {
    const clienteFrecuenteForm = document.getElementById('cliente-frecuente-form');
    const selectClienteFrecuente = document.getElementById('select-cliente-frecuente');

    if (this.checked) {
        clienteFrecuenteForm.classList.remove('hidden'); // Mostrar el SelectBox
        cargarClientesFrecuentes(selectClienteFrecuente); // Cargar opciones dinámicamente
    } else {
        clienteFrecuenteForm.classList.add('hidden'); // Ocultar el SelectBox
        selectClienteFrecuente.innerHTML = '<option value="">Seleccione un cliente</option>'; // Limpiar opciones
    }
});

// Función para cargar clientes frecuentes en el SelectBox
function cargarClientesFrecuentes() {
    console.log(clientes,);
    const selectElement = document.getElementById("select-cliente-frecuente");
    selectElement.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.idCliente;
        option.textContent = cliente.nombreCliente;
        selectElement.appendChild(option);
    });
}
