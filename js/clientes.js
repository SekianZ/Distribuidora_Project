

// Funciones para los modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Deshabilitar el cierre al hacer clic fuera
    modal.style.pointerEvents = "auto"; // Asegurar que el modal sea clickeable
    modal.querySelector('.modal-content').style.pointerEvents = "auto"; // Asegurar que el contenido sea clickeable
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = "auto";
}

function openEditModal(button) {
    openModal("nuevoClienteModal");
}

async function confirmDelete(button, accion = "eliminar", esInactivo = false) {
    const id = button.getAttribute('data-id');
    const nombre = button.closest('tr').querySelector('td:first-child').textContent;
    const mensaje = esInactivo 
        ? `¿Seguro que deseas marcar como inactivo al cliente "${nombre}"?`
        : `¿Seguro que deseas ${accion} el cliente "${nombre}"?`;

    if (confirm(mensaje)) {
        try {
            const resultado = await eliminarCliente(id);
            
            if (resultado.estado) {
                alert(esInactivo 
                    ? 'Cliente marcado como inactivo' 
                    : `Cliente ${accion} exitosamente`);
                cargarClientes();

            } else {
                alert('Error: ' + resultado.mensaje);
            }
        } catch (error) {
            console.error(`Error al ${accion} cliente:`, error);
            alert('Error al conectar con el servidor');
        }
    }
}
// Actualizar la función cargarClientes para usar openDetallesModal
async function cargarClientes() {
    try {
        const response = await fetch('../Backend/controllers/clienteController.php');
        const clientes = await response.json();

        const tabla = document.getElementById('tabla-clientes');
        tabla.innerHTML = '';

        clientes.forEach(cliente => {
            const fila = `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cliente.nombreCliente}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.telefono || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.correo || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button class="text-blue-600 hover:text-blue-800" onclick="openDetallesModal(this)" data-id="${cliente.idCliente}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button class="text-yellow-600 hover:text-yellow-800" onclick="openEditModal(this)" data-id="${cliente.idCliente}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button class="text-red-600 hover:text-red-800" onclick="confirmDelete(this)" data-id="${cliente.idCliente}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
            window.actualizarTodasLasTarjetas();
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// Función para crear un nuevo cliente
async function crearCliente(datosCliente) {
    try {
        const response = await fetch('../Backend/controllers/clienteController.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosCliente)
        });
        return await response.json();
    } catch (error) {
        console.error('Error al crear cliente:', error);
        return { estado: false, mensaje: 'Error de conexión' };
    }
}


// Función para manejar el envío del formulario (crear/editar)
function manejarFormularioCliente() {
    const form = document.getElementById('formCliente');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validar campos requeridos
        const nombre = document.getElementById('nombreCliente').value.trim();
        const telefono = document.getElementById('telefono').value.trim();

        if (!nombre) {
            alert('El nombre del cliente es obligatorio');
            return;
        }

        // Construir objeto de datos (sin el campo estado)
        const datosCliente = {
            nombreCliente: nombre,
            telefono: telefono || null, // Si está vacío, se envía como null
            correo: document.getElementById('correo').value.trim() || null
        };

        const idCliente = document.getElementById('idCliente').value;
        let resultado;

        try {
            if (idCliente) {
                // Editar cliente existente
                resultado = await editarCliente(idCliente, datosCliente);
            } else {
                // Crear nuevo cliente (se asigna estado "Activo" automáticamente en el backend)
                resultado = await crearCliente(datosCliente);
            }

            if (resultado.estado) {
                alert(idCliente ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
                closeModal('nuevoClienteModal');
                cargarClientes();
                resetearModal();
            } else {
                throw new Error(resultado.mensaje || 'Operación fallida');
            }
        } catch (error) {
            console.error('Error en manejarFormularioCliente:', error);
            alert('Error: ' + error.message);
        }
    });
}

async function editarCliente(id, datosCliente) {
    try {
        const response = await fetch(`../Backend/controllers/clienteController.php?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosCliente)
        });
        return await response.json();
    } catch (error) {
        console.error('Error al editar cliente:', error);
        return { estado: false, mensaje: 'Error de conexión' };
    }
}

async function eliminarCliente(id) {
    try {
        const response = await fetch(`../Backend/controllers/clienteController.php?id=${id}`, {
            method: 'DELETE'
        });

        return await response.json();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        return { estado: false, mensaje: 'Error de conexión' };
    }
}



async function openDetallesModal(button) {
    const id = button.getAttribute('data-id');

    try {
        // Obtener datos del cliente
        const response = await fetch(`../Backend/controllers/clienteController.php?id=${id}`);
        const cliente = await response.json();

        // Llenar el modal de detalles
        document.getElementById('detalle-id').textContent = cliente.idCliente;
        document.getElementById('detalle-nombre').textContent = cliente.nombreCliente;
        document.getElementById('detalle-telefono').textContent = cliente.telefono || '-';
        document.getElementById('detalle-correo').textContent = cliente.correo || '-';


        // Configurar el botón de editar para que abra el modal de edición
        document.getElementById('btnEditarDesdeDetalle').onclick = function () {
            closeModal('detallesClienteModal');
            openEditModal(button);
        };

        // Abrir modal
        openModal('detallesClienteModal');
    } catch (error) {
        console.error('Error al cargar detalles del cliente:', error);
        alert('Error al cargar detalles del cliente');
    }
}

// Función para abrir modal de edición
async function openEditModal(button) {
    const id = button.getAttribute('data-id');

    try {
        // Obtener datos del cliente
        const response = await fetch(`../Backend/controllers/clienteController.php?id=${id}`);
        const cliente = await response.json();

        // Llenar el formulario con los datos
        document.getElementById('idCliente').value = cliente.idCliente;
        document.getElementById('nombreCliente').value = cliente.nombreCliente;
        document.getElementById('telefono').value = cliente.telefono;
        document.getElementById('correo').value = cliente.correo || '';

        // Cambiar título del modal
        document.getElementById('modalTitulo').textContent = 'Editar Cliente';
        document.getElementById('btnGuardar').textContent = 'Actualizar Cliente';

        // Abrir modal
        openModal('nuevoClienteModal');
    } catch (error) {
        console.error('Error al cargar cliente:', error);
        alert('Error al cargar datos del cliente');
    }
}
// Función para resetear el modal cuando se cierre
function configurarCierreModal() {
    const modal = document.getElementById('nuevoClienteModal');

    // Solo el botón de cerrar (×) y el botón Cancelar resetearán el modal
    document.querySelector('#nuevoClienteModal .close').addEventListener('click', function () {
        resetearModal();
        closeModal('nuevoClienteModal');
    });

    // Configurar el botón Cancelar
    document.querySelector('#nuevoClienteModal .modal-footer button[onclick*="closeModal"]').addEventListener('click', function () {
        resetearModal();
        closeModal('nuevoClienteModal');
    });
}

function resetearModal() {
    const form = document.getElementById('formCliente');
    form.reset();
    document.getElementById('idCliente').value = '';
    document.getElementById('modalTitulo').textContent = 'Registrar Nuevo Cliente';
    document.getElementById('btnGuardar').textContent = 'Guardar Cliente';

    // Opcional: Resetear clases de validación si las hay
    document.getElementById('nombreCliente').classList.remove('border-red-500');
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarClientes();
    manejarFormularioCliente();
    configurarCierreModal();
});