

// Funciones para los modales
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
    document.body.style.overflow = "auto";
}

function openEditModal(button) {
    openModal("nuevoClienteModal");
}

function confirmDelete(button) {
    if (confirm("¿Seguro que deseas eliminar este cliente?")) {
        let row = button.closest("tr");
        if (row) row.remove();
    }
}



// clientes.js - Agregar estas funciones al final del archivo

// Función para cargar clientes desde el backend
async function cargarClientes() {
    try {
        const response = await fetch('../Backend/controllers/clienteController.php');
        const clientes = await response.json();

        const tabla = document.getElementById('tabla-clientes');
        tabla.innerHTML = '';

        clientes.forEach(cliente => {
            const estadoClass = cliente.estado === 'Activo' ? 'status-active' : 'status-inactive';
            const fila = `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cliente.nombreCliente}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.telefono || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.correo || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="status-badge ${estadoClass}">${cliente.estado}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onclick="openEditModal(this)" data-id="${cliente.idCliente}" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                        <button onclick="confirmDelete(this)" data-id="${cliente.idCliente}" class="text-red-600 hover:text-red-900">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
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

// Función para manejar el envío del formulario
// Función para manejar el envío del formulario (crear/editar)
function manejarFormularioCliente() {
    const form = document.getElementById('formCliente');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const datosCliente = {
            nombreCliente: document.getElementById('nombreCliente').value,
            telefono: document.getElementById('telefono').value,
            correo: document.getElementById('correo').value,
            estado: document.getElementById('estado').value
        };
        
        const idCliente = document.getElementById('idCliente').value;
        let resultado;
        
        if (idCliente) {
            // Editar cliente existente
            resultado = await editarCliente(idCliente, datosCliente);
        } else {
            // Crear nuevo cliente
            resultado = await crearCliente(datosCliente);
        }
        
        if (resultado.estado) {
            alert(idCliente ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
            closeModal('nuevoClienteModal');
            cargarClientes();
            form.reset();
        } else {
            alert('Error: ' + (resultado.mensaje || 'Operación fallida'));
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

// Modificar la función confirmDelete
async function confirmDelete(button) {
    const id = button.getAttribute('data-id');

    if (confirm("¿Seguro que deseas eliminar este cliente?")) {
        const resultado = await eliminarCliente(id);

        if (resultado.estado) {
            alert('Cliente eliminado exitosamente');
            cargarClientes();
        } else {
            alert('Error: ' + resultado.mensaje);
        }
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
        document.getElementById('estado').value = cliente.estado;

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
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            resetearModal();
        }
    });
    
    document.querySelector('#nuevoClienteModal .close').addEventListener('click', resetearModal);
}

function resetearModal() {
    const form = document.getElementById('formCliente');
    form.reset();
    document.getElementById('idCliente').value = '';
    document.getElementById('modalTitulo').textContent = 'Registrar Nuevo Cliente';
    document.getElementById('btnGuardar').textContent = 'Guardar Cliente';
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    cargarClientes();
    manejarFormularioCliente();
    configurarCierreModal();
});