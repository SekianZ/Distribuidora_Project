document.addEventListener("DOMContentLoaded", function () {
    
    // Verificar autenticación
    const token = localStorage.getItem("token");
    if (!token) {
        Swal.fire({
            title: "Acceso no autorizado",
            text: "Debes iniciar sesión para acceder a esta página",
            icon: "warning"
        }).then(() => {
            window.location.href = "../index.html";
        });
        return;
    }

    // Inicializar componentes
    initSelect2();
    initEventListeners();
    obtenerDatosFormulario();
    obtenerVentas();
});

// Variables globales organizadas
const state = {
    ventas: [],
    categorias: [],
    clientes: [],
    productos: [],
    manejoPorCategoria: {},
    tiposPago: [],
    editando: false,
    ventaEditandoId: null
};

// Inicialización de Select2
function initSelect2() {
    $('#select-cliente-frecuente').select2({ width: '100%' });
    $('#producto').select2({ width: '100%' });
}

// Configuración de event listeners
function initEventListeners() {
    // Botones y modales
    document.getElementById('btn-agregar-venta').addEventListener('click', abrirModalNuevaVenta);
    document.getElementById('btn-regresar').addEventListener('click', () => window.location.href = 'inicio.html');
    document.getElementById('cerrar-modal').addEventListener('click', () => document.getElementById('modal-venta').classList.add('hidden'));
    document.getElementById('cerrar-modal-observaciones').addEventListener('click', () => document.getElementById('modal-observaciones').classList.add('hidden'));
    document.getElementById('cerrar-observaciones').addEventListener('click', () => document.getElementById('modal-observaciones').classList.add('hidden'));
    document.getElementById('cancelar-venta').addEventListener('click', () => document.getElementById('modal-venta').classList.add('hidden'));
    
    // Formulario
    document.getElementById('precio').addEventListener('input', calcularTotal);
    document.getElementById('cantidad').addEventListener('input', calcularTotal);
    document.getElementById('buscador-ventas').addEventListener('input', (e) => buscarVentas(e.target.value));
    // Radio buttons para tipo de cliente
    document.getElementById('cliente-nuevo').addEventListener('change', toggleClienteForms);
    document.getElementById('cliente-frecuente').addEventListener('change', toggleClienteForms);
    toggleClienteForms();
    // Selectores
    document.getElementById('tipo-producto').addEventListener('change', llenarProductos);
    $('#producto').on('change', manejarCambioProducto);
}

// Funciones de utilidad
const formatCurrency = (value) => `S/ ${parseFloat(value).toFixed(2)}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-PE');

// Manejo de datos del formulario
async function obtenerDatosFormulario() {
    try {
        const endpoints = [
            '../Backend/controllers/clienteController.php',
            '../Backend/controllers/tipoPagoController.php',
            '../Backend/controllers/categoriaController.php',
            '../Backend/controllers/productoController.php',
            '../Backend/controllers/manejoCategoriaController.php'
        ];

        const responses = await Promise.all(endpoints.map(url => fetch(url)));
        const data = await Promise.all(responses.map(res => res.json()));

        // Asignar datos al estado
        state.clientes = data[0] || [];
        state.tiposPago = data[1] || [];
        state.categorias = data[2] || [];
        state.productos = data[3] || [];
        state.manejoPorCategoria = agruparManejoPorCategoria(data[4] || []);

        // Llenar selects
        llenarTiposPago();
        llenarCategorias();
        llenarClientes();

    } catch (error) {
        console.error("Error al obtener datos:", error);
        mostrarNotificacion("Error al cargar datos del formulario", "error");
    }
}

function llenarClientes() {
    const selectCliente = document.getElementById("select-cliente-frecuente");
    selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';

    state.clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.idCliente;
        option.textContent = cliente.nombreCliente;
        selectCliente.appendChild(option);
    });
}

function llenarTiposPago() {
    const selectTipoPago = document.getElementById("pago");
    selectTipoPago.innerHTML = '<option value="">Seleccione un tipo de pago</option>';

    state.tiposPago.forEach(tipoPago => {
        const option = document.createElement("option");
        option.value = tipoPago.idTipoPago;
        option.textContent = tipoPago.metodoPago;
        selectTipoPago.appendChild(option);
    });
}

function llenarCategorias() {
    const selectCategoria = document.getElementById("tipo-producto");
    selectCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';

    state.categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.idCategoria;
        option.textContent = categoria.nombreCategoria;
        selectCategoria.appendChild(option);
    });
}

function llenarProductos() {
    const selectProducto = document.getElementById("producto");
    const categoriaSeleccionada = document.getElementById("tipo-producto").value;

    selectProducto.innerHTML = '<option value="">Seleccionar producto</option>';
    selectProducto.disabled = !categoriaSeleccionada;

    if (categoriaSeleccionada) {
        const productosFiltrados = state.productos.filter(
            producto => parseInt(producto.idCategoria, 10) === parseInt(categoriaSeleccionada, 10)
        );

        productosFiltrados.forEach(producto => {
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

function agruparManejoPorCategoria(manejoProductos) {
    return manejoProductos.reduce((agrupado, manejo) => {
        const idCategoria = manejo.idCategoria;
        if (!agrupado[idCategoria]) {
            agrupado[idCategoria] = [];
        }
        agrupado[idCategoria].push({
            idManejo: manejo.idManejo,
            descripcion: manejo.descripcion,
        });
        return agrupado;
    }, {});
}

function manejarCambioProducto() {
    const productoSeleccionado = this.options[this.selectedIndex];
    const contenedorManejo = document.getElementById("manejoProducto");
    const opcionesManejo = document.getElementById("opcionesManejo");
    const precioElemento = document.getElementById("precio");

    opcionesManejo.innerHTML = "";

    if (!productoSeleccionado.value) {
        contenedorManejo.style.display = "none";
        precioElemento.value = "";
        return;
    }

    const idCategoria = productoSeleccionado.dataset.idCategoria;
    const precio = productoSeleccionado.dataset.precio;

    if (state.manejoPorCategoria[idCategoria]?.length > 0) {
        state.manejoPorCategoria[idCategoria].forEach(manejo => {
            const label = document.createElement("label");
            label.className = "flex items-center gap-2 cursor-pointer";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "manejoProducto";
            input.value = manejo.idManejo;
            input.className = "cursor-pointer";

            label.appendChild(input);
            label.appendChild(document.createTextNode(manejo.descripcion));
            opcionesManejo.appendChild(label);
        });

        contenedorManejo.style.display = "block";
    } else {
        contenedorManejo.style.display = "none";
    }

    precioElemento.value = precio || "0.00";
    calcularTotal();
}

// Funciones para manejo de ventas
async function obtenerVentas() {
    try {
        const res = await fetch(`/Backend/controllers/ventaController.php`);
        const data = await res.json();
        
        state.ventas = data.map(venta => ({
            idVenta: venta.idVenta,
            cliente: venta.cliente || "Desconocido",
            producto: venta.producto || "Producto no especificado",
            cantidad: parseInt(venta.cantidad) || 0,
            manejoProducto: venta.manejo || "Sin manejo",
            precio: isNaN(parseFloat(venta.precio_unitario)) ? 0.0 : parseFloat(venta.precio_unitario),
            total: isNaN(parseFloat(venta.monto)) ? 0.0 : parseFloat(venta.monto),
            fecha: venta.fecha || "Fecha no disponible",
            pago: venta.tipoPago || "Método no especificado",
            observaciones: venta.observaciones?.replace(/\r?\n/g, "\n") || "Sin observaciones"
        }));

        renderizarVentas();
    } catch (error) {
        console.error("Error al obtener las ventas:", error);
        mostrarNotificacion("Error al cargar las ventas", "error");
    }
}

function renderizarVentas(ventasMostrar = state.ventas) {
    const tablaVentasBody = document.getElementById('tabla-ventas-body');
    tablaVentasBody.innerHTML = '';

    if (ventasMostrar.length === 0) {
        tablaVentasBody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    No se encontraron ventas
                </td>
            </tr>
        `;
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
    });
}

function buscarVentas(termino) {
    termino = termino.toLowerCase();
    const ventasFiltradas = state.ventas.filter(venta => {
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

function calcularTotal() {
    const cantidad = parseFloat(document.getElementById('cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('precio').value) || 0;
    document.getElementById('total-venta').textContent = (cantidad * precio).toFixed(2);
}

// Funciones para el modal de venta
function abrirModalNuevaVenta() {
    state.editando = false;
    state.ventaEditandoId = null;
    
    // Resetear completamente el formulario
    const form = document.getElementById('form-venta');
    form.reset();
    
    // Resetear elementos específicos
    document.getElementById('total-venta').textContent = '0.00';
    document.getElementById('fecha').valueAsDate = new Date();
    document.getElementById('titulo-modal-venta').textContent = 'Registrar Nueva Venta';
    
    // Resetear selects y radio buttons
    $('#select-cliente-frecuente').val('').trigger('change');
    $('#producto').val('').trigger('change');
    
    // Resetear tipo de cliente
    document.getElementById('cliente-frecuente').checked = true;
    document.getElementById('cliente-nuevo').checked = false;
    
    // Asegurarse de que los campos de cliente nuevo estén habilitados
    document.getElementById('nombre-cliente').disabled = false;
    document.getElementById('telefono-cliente').disabled = false;
    
    // Remover botón de cancelar si existe
    const cancelarBtn = document.getElementById('Cancelar-cliente');
    if (cancelarBtn) cancelarBtn.remove();
    
    // Restablecer botón guardar cliente
    const btnCliente = document.getElementById('guardar-cliente');
    if (btnCliente) {
        btnCliente.textContent = 'Guardar';
        btnCliente.className = 'px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg';
        btnCliente.disabled = false;
    }
    
    toggleClienteForms();
    
    // Asegurarse de que el modal esté visible
    document.getElementById('modal-venta').classList.remove('hidden');
}

async function obtenerDatosVenta(idVenta) {
    try {
        const res = await fetch(`/Backend/controllers/ventaController.php?idVenta=${idVenta}`);
        const data = await res.json();
        
        if (!data.success || !data.ventas?.length) {
            throw new Error(data.message || "No se pudo obtener la venta");
        }
        
        return data.ventas[0];
    } catch (error) {
        console.error("Error al obtener la venta:", error);
        mostrarNotificacion("Error al cargar los datos de la venta", "error");
        return null;
    }
}

window.editarVenta = async function(id) {
    const venta = await obtenerDatosVenta(id);
    if (!venta) return;

    state.editando = true;
    state.ventaEditandoId = id;

    // Configurar tipo de cliente basado en los datos de la venta
    if (venta.esClienteNuevo) { // Asume que tu API devuelve esta propiedad
        document.getElementById('cliente-nuevo').checked = true;
        document.getElementById('nombre-cliente').value = venta.nombreCliente;
        document.getElementById('telefono-cliente').value = venta.telefonoCliente;
    } else {
        document.getElementById('cliente-frecuente').checked = true;
        $('#select-cliente-frecuente').val(venta.idCliente).trigger('change');
    }
    toggleClienteForms();


    // Llenar datos del cliente
    const clienteSelect = document.getElementById("select-cliente-frecuente");
    clienteSelect.value = venta.Cliente || "";
    $(clienteSelect).trigger('change');

    // Seleccionar tipo de producto y producto
    const productoTipoSelect = document.getElementById("tipo-producto");
    productoTipoSelect.value = venta.TipoProducto || "";
    productoTipoSelect.dispatchEvent(new Event('change'));

    // Esperar a que se carguen los productos antes de seleccionar
    setTimeout(() => {
        const productoSelect = document.getElementById("producto");
        productoSelect.value = venta.Producto || "";
        $(productoSelect).trigger('change');

        // Seleccionar manejo de producto si existe
        if (venta.Manejo) {
            const radioSeleccionado = document.querySelector(`input[name="manejoProducto"][value="${venta.Manejo}"]`);
            if (radioSeleccionado) radioSeleccionado.checked = true;
        }
    }, 300);

    // Llenar el resto de los campos
    document.getElementById("fecha").value = venta.Fecha?.split(" ")[0] || "";
    document.getElementById("cantidad").value = venta.Cantidad || "";
    document.getElementById("precio").value = venta.Precio_Unitario || "";
    document.getElementById("pago").value = venta.Tipo_Pago || "";
    document.getElementById("observaciones").value = venta.Observaciones || "";
    document.getElementById("total-venta").textContent = 
        parseFloat(venta.Cantidad || 0) * (parseFloat(venta.Precio_Unitario || 0)).toFixed(2)

    document.getElementById("titulo-modal-venta").textContent = "Editar venta";
    document.getElementById("modal-venta").classList.remove("hidden");
};

// Funciones para eliminar ventas
async function eliminarVentaConStock(id) {
    try {
        const res = await fetch(`/Backend/controllers/ventaController.php?action=eliminarConStock&id=${id}`, {
            method: "DELETE"
        });
        const data = await res.json();
        
        if (data.success) {
            mostrarNotificacion("Stock actualizado y venta eliminada", "success");
            await obtenerVentas();
        } else {
            throw new Error(data.message || "Error al eliminar");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarNotificacion("Error al eliminar la venta", "error");
    }
}

async function eliminarVentaSinStock(id) {
    try {
        const res = await fetch(`/Backend/controllers/ventaController.php?action=eliminarSoloventa&id=${id}`, {
            method: "DELETE"
        });
        const data = await res.json();
        
        if (data.success) {
            mostrarNotificacion("Venta eliminada (sin afectar stock)", "success");
            await obtenerVentas();
        } else {
            throw new Error(data.message || "Error al eliminar");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarNotificacion("Error al eliminar la venta", "error");
    }
}

window.eliminarVenta = function(id) {
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
                eliminarVentaConStock(id);
            } else if (result.isDenied) {
                eliminarVentaSinStock(id);
            }
        });
    });
};

// Funciones para guardar ventas
function validarFormulario() {
    const camposRequeridos = [
        { id: "fecha", mensaje: "Por favor, ingresa una fecha" },
        { id: "cantidad", mensaje: "Por favor, ingresa una cantidad" },
        { id: "precio", mensaje: "Por favor, ingresa un precio" },
        { id: "pago", mensaje: "Por favor, selecciona un tipo de pago" },
        { id: "producto", mensaje: "Por favor, selecciona un producto" }
    ];

    for (const campo of camposRequeridos) {
        const elemento = document.getElementById(campo.id);
        if (!elemento.value.trim()) {
            mostrarNotificacion(campo.mensaje, "error");
            return false;
        }
    }

    if (document.getElementById("cliente-frecuente").checked) {
        if (!document.getElementById("select-cliente-frecuente").value) {
            mostrarNotificacion("Por favor, selecciona un cliente", "error");
            return false;
        }
    } else if (document.getElementById("cliente-nuevo").checked) {
        if (!document.getElementById("nombre-cliente").value.trim()) {
            mostrarNotificacion("Por favor, ingresa un nombre de cliente", "error");
            return false;
        }
        if (!document.getElementById("telefono-cliente").value.trim()) {
            mostrarNotificacion("Por favor, ingresa un teléfono", "error");
            return false;
        }
    }

    return true;
}

async function registrarCliente() {
    const nombreCliente = document.getElementById("nombre-cliente").value.trim();
    const telefono = document.getElementById("telefono-cliente").value.trim();

    if (!nombreCliente) {
        mostrarNotificacion("Por favor, ingresa un nombre de cliente", "error");
        return null;
    }

    try {
        const res = await fetch(`/Backend/controllers/clienteController.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombreCliente,
                telefono
            })
        });
        const data = await res.json();
        
        if (data.estado) {
            mostrarNotificacion("Cliente registrado correctamente", "success");
            return data.idCliente;
        } else {
            throw new Error(data.mensaje || "Error al registrar cliente");
        }
    } catch (error) {
        console.error("Error al registrar el cliente:", error);
        mostrarNotificacion("Error al registrar el cliente", "error");
        return null;
    }
}

async function guardarVenta(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    let idCliente;
    
    try {
        // Registrar cliente nuevo si es necesario
        if (document.getElementById("cliente-nuevo").checked) {
            idCliente = await registrarCliente();
            if (!idCliente) return;
        } else {
            idCliente = document.getElementById("select-cliente-frecuente").value;
        }

        const nuevaVenta = {
            idVenta: state.ventaEditandoId,
            fecha: document.getElementById("fecha").value,
            idCliente,
            productos: [{
                idProducto: document.getElementById("producto").value,
                cantidad: document.getElementById("cantidad").value || 0,
            }],
            montoVenta: parseFloat(document.getElementById("total-venta").textContent) || 0.0,
            IdtipoPago: parseInt(document.getElementById("pago").value),
            idManejoProducto: document.querySelector('input[name="manejoProducto"]:checked')?.value || null,
            observacionesVenta: document.getElementById("observaciones").value.trim()
        };

        const endpoint = state.editando ? 
            "/Backend/controllers/ventaController.php" : 
            "/Backend/controllers/ventaController.php";
        
        const method = state.editando ? "PUT" : "POST";

        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevaVenta)
        });
        
        const data = await res.json();
        
        if (data.success) {
            mostrarNotificacion(
                state.editando ? "Venta actualizada correctamente" : "Venta registrada correctamente", 
                "success"
            );
            document.getElementById("modal-venta").classList.add("hidden");
            await obtenerVentas();
        } else {
            throw new Error(data.message || "Error al guardar la venta");
        }
        
    } catch (error) {
        console.error("Error al guardar la venta:", error);
        mostrarNotificacion("Error al guardar la venta", "error");
    }
    // Habilitar el botón nuevo después de guardar
document.getElementById('btn-agregar-venta').disabled = false;
}

// Funciones para manejo de clientes
function toggleClienteForms() {
    const clienteNuevoChecked = document.getElementById('cliente-nuevo').checked;
    
    // Mostrar/ocultar formularios
    document.getElementById('cliente-nuevo-form').classList.toggle('hidden', !clienteNuevoChecked);
    document.getElementById('guardar-cliente').classList.toggle('hidden', !clienteNuevoChecked);
    document.getElementById('cliente-frecuente-form').classList.toggle('hidden', clienteNuevoChecked);

    // Siempre habilitar los radio buttons
    document.getElementById('cliente-nuevo').disabled = false;
    document.getElementById('cliente-frecuente').disabled = false;

    // Si cambiamos a cliente frecuente, resetear el formulario de nuevo
    if (!clienteNuevoChecked) {
        habilitarCamposCliente();
    }
}

function sistemaBotonCliente() {
    const nombreCliente = document.getElementById("nombre-cliente");
    const telefono = document.getElementById("telefono-cliente");
    const btnCliente = document.getElementById("guardar-cliente");

    if (!nombreCliente.value.trim()) {
        mostrarNotificacion("Por favor, ingresa un nombre de cliente", "error");
        return;
    }
    if (!telefono.value.trim()) {
        mostrarNotificacion("Por favor, ingresa un teléfono", "error");
        return;
    }

    // Deshabilitar campos
    nombreCliente.disabled = true;
    telefono.disabled = true;
    document.getElementById('cliente-nuevo').disabled = true;
    
    // Cambiar aspecto del botón
    btnCliente.textContent = "Guardado";
    btnCliente.className = "px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
    btnCliente.disabled = true;
    
    // Crear botón de cancelar si no existe
    if (!document.getElementById("Cancelar-cliente")) {
        const button = document.createElement("button");
        button.textContent = "Cancelar";
        button.id = "Cancelar-cliente";
        button.className = "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
        button.onclick = habilitarCamposCliente;
        btnCliente.parentNode.appendChild(button);
    }
}

function habilitarCamposCliente() {
    document.getElementById("nombre-cliente").disabled = false;
    document.getElementById("telefono-cliente").disabled = false;
    document.getElementById("cliente-nuevo").disabled = false;
    
    const btnCliente = document.getElementById("guardar-cliente");
    btnCliente.textContent = "Guardar";
    btnCliente.className = "px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg";
    btnCliente.disabled = false;

    const cancelarBtn = document.getElementById("Cancelar-cliente");
    if (cancelarBtn) cancelarBtn.remove();
}

// Funciones para observaciones
window.verObservaciones = function(id) {
    const venta = state.ventas.find(v => v.idVenta === id);
    if (venta) {
        document.getElementById("texto-observaciones").textContent = 
            venta.observaciones || "No hay observaciones registradas";
        document.getElementById("modal-observaciones").classList.remove('hidden');
    } else {
        console.error("No se encontró la venta con el id:", id);
        mostrarNotificacion("No se encontró la venta", "error");
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const tipos = {
        success: { bg: 'bg-green-500', icon: 'success' },
        error: { bg: 'bg-red-500', icon: 'error' },
        info: { bg: 'bg-blue-500', icon: 'info' }
    };

    const config = tipos[tipo] || tipos.info;
    
    Swal.fire({
        title: mensaje,
        icon: config.icon,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
}

// Inicialización final
document.getElementById('fecha').valueAsDate = new Date();