let resultadosDB = [];
let proveedores = [];

document.addEventListener('DOMContentLoaded', function () {
    obtenerClientes();
});

function obtenerClientes() {
    fetch("../Backend/controllers/proveedorController.php?action=obtenerProveedorparalista")
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log("✅ Se obtuvo exitosamente los clientes de la base de datos.");
            
            // Guardar los datos reales que vienen del backend
            resultadosDB = data.proveedores; // Asegúrate de que el backend devuelva un array llamado "proveedores"

            // Convertir a formato personalizado
            proveedores = resultadosDB.map(p => ({
                id: p.idProveedor,
                nombre: p.nombreProveedor,
                categoria: p.categoria,
                ruc: p.RUC,
                contacto: `${p.nombreRepresentante} - ${p.telefono}`,
                telefono: p.telefono,
                correo: p.correo,
                observaciones: p.productos
            }));

            console.log(proveedores); // Aquí ya puedes usarlos donde los necesites
            if (proveedores.length === 0) {
                console.log("No hay proveedores para mostrar");
            } else {
                renderProveedores(proveedores);
                renderPagination(proveedores);
            }
        } else {
            console.error("❌ No se pudo conectar a la base de datos.",data.success);
        }
    })
    .catch(error => console.error("Error en la solicitud:", error," "));
}


// // Datos de ejemplo para simular una base de datos
// let proveedores = [
//     {
//         id: 1,
//         nombre: "Distribuidor Oficial Huari",
//         categoria: "Cerveza",
//         ruc: "1234567890",
//         contacto: "Juan Pérez - 71234567",
//         telefono: "71234567",
//         email: "juan.perez@huari.com",
//         direccion: "Av. Arce #1234",
//         ciudad: "La Paz",
//         estado: "Activo",
//         observaciones: "Entrega los lunes y jueves"
//     },
//     {
//         id: 2,
//         nombre: "Importadora Pepe",
//         categoria: "Cerveza",
//         ruc: "9876543210",
//         contacto: "María López - 72345678",
//         telefono: "72345678",
//         email: "maria.lopez@pepe.com",
//         direccion: "Calle Junín #567",
//         ciudad: "Santa Cruz",
//         estado: "Activo",
//         observaciones: "Solicitar pedido con 48h de anticipación"
//     },
//     {
//         id: 3,
//         nombre: "Distribuidor Norte",
//         categoria: "Gas",
//         ruc: "5678901234",
//         contacto: "Carlos Gómez - 73456789",
//         telefono: "73456789",
//         email: "carlos.gomez@norte.com",
//         direccion: "Av. Villazón #890",
//         ciudad: "Cochabamba",
//         estado: "Inactivo",
//         observaciones: "Temporalmente sin stock"
//     },
//     {
//         id: 4,
//         nombre: "Bebidas del Sur",
//         categoria: "Bebida",
//         ruc: "3456789012",
//         contacto: "Ana Martínez - 74567890",
//         telefono: "74567890",
//         email: "ana.martinez@bebidasdelsur.com",
//         direccion: "Calle Sucre #345",
//         ciudad: "Tarija",
//         estado: "Activo",
//         observaciones: "Descuento por volumen"
//     },
// ];

// Variables para paginación
let currentPage = 1;
const itemsPerPage = 5;

// Inicialización al cargar la página

function setupEventListeners() {
    // Buscar proveedor
    document.getElementById('searchBtn').addEventListener('click', buscarProveedor);
    document.getElementById('searchInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            
        }
    });

    // Filtros
    document.getElementById('applyFiltersBtn').addEventListener('click', aplicarFiltros);
    document.getElementById('clearFiltersBtn').addEventListener('click', limpiarFiltros);
}

function toggleFilters() {
    const filterControls = document.getElementById('filterControls');
    const toggleText = document.getElementById('filterToggleText');

    if (filterControls.classList.contains('hidden')) {
        filterControls.classList.remove('hidden');
        toggleText.innerHTML = '<i class="fas fa-chevron-up mr-1 text-xs"></i> Ocultar';
    } else {
        filterControls.classList.add('hidden');
        toggleText.innerHTML = '<i class="fas fa-chevron-down mr-1 text-xs"></i> Mostrar';
    }
}

function renderProveedores(proveedoresFiltrados = proveedores) {
    const tbody = document.getElementById('proveedoresTableBody');
    tbody.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProveedores = proveedoresFiltrados.slice(startIndex, endIndex);

    console.log(proveedoresFiltrados);

    if (paginatedProveedores.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                        <i class="fas fa-exclamation-circle mr-2"></i> No se encontraron proveedores
                    </td>`;
        tbody.appendChild(tr);
        return;
    }

    paginatedProveedores.forEach(proveedor => {
        const tr = document.createElement('tr');
        tr.className = 'table-row transition-smooth';
        tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-truck text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <div class="text-sm font-medium text-gray-900">${proveedor.nombre}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            ${proveedor.categoria}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${proveedor.ruc}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${proveedor.contacto}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${proveedor.correo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1">
                        <button class="btn-primary text-white px-3 py-1 text-xs rounded" onclick="openDetailsModal(${proveedor.id})">
                            <i class="fas fa-eye mr-1"></i>Ver
                        </button>
                        <button class="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600 transition-colors" onclick="openEditModal(${proveedor.id})">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <button class="btn-danger text-white px-3 py-1 text-xs rounded" onclick="confirmDelete(${proveedor.id})">
                            <i class="fas fa-trash mr-1"></i>Eliminar
                        </button>
                    </td>
                `;
        tbody.appendChild(tr);
    });
}

function renderPagination(proveedoresFiltrados = proveedores) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(proveedoresFiltrados.length / itemsPerPage);
    const totalItems = proveedoresFiltrados.length;

    if (totalPages <= 1) {
        // Mostrar solo el contador de items
        pagination.innerHTML = `
                    <div class="text-sm text-gray-500">
                        Mostrando ${Math.min(itemsPerPage, totalItems)} de ${totalItems} proveedores
                    </div>
                `;
        return;
    }

    // Contador de items
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const counter = document.createElement('div');
    counter.className = 'text-sm text-gray-500';
    counter.textContent = `Mostrando ${startItem}-${endItem} de ${totalItems} proveedores`;

    // Contenedor de botones
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'flex gap-1';

    // Botón Anterior
    if (currentPage > 1) {
        const prevLink = document.createElement('button');
        prevLink.className = 'px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200 flex items-center';
        prevLink.innerHTML = '<i class="fas fa-chevron-left mr-1"></i>';
        prevLink.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage--;
            renderProveedores(proveedoresFiltrados);
            renderPagination(proveedoresFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        buttonsContainer.appendChild(prevLink);
    }

    // Números de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPageLink = document.createElement('button');
        firstPageLink.className = 'px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200';
        firstPageLink.textContent = '1';
        firstPageLink.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = 1;
            renderProveedores(proveedoresFiltrados);
            renderPagination(proveedoresFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        buttonsContainer.appendChild(firstPageLink);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            buttonsContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('button');
        pageLink.className = `px-3 py-1 border rounded transition-colors duration-200 ${i === currentPage ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-100'}`;
        pageLink.textContent = i;
        pageLink.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = i;
            renderProveedores(proveedoresFiltrados);
            renderPagination(proveedoresFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        buttonsContainer.appendChild(pageLink);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1';
            ellipsis.textContent = '...';
            buttonsContainer.appendChild(ellipsis);
        }

        const lastPageLink = document.createElement('button');
        lastPageLink.className = 'px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200';
        lastPageLink.textContent = totalPages;
        lastPageLink.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage = totalPages;
            renderProveedores(proveedoresFiltrados);
            renderPagination(proveedoresFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        buttonsContainer.appendChild(lastPageLink);
    }

    // Botón Siguiente
    if (currentPage < totalPages) {
        const nextLink = document.createElement('button');
        nextLink.className = 'px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors duration-200 flex items-center';
        nextLink.innerHTML = '<i class="fas fa-chevron-right ml-1"></i>';
        nextLink.addEventListener('click', function (e) {
            e.preventDefault();
            currentPage++;
            renderProveedores(proveedoresFiltrados);
            renderPagination(proveedoresFiltrados);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        buttonsContainer.appendChild(nextLink);
    }

    // Agregar elementos al contenedor de paginación
    pagination.appendChild(counter);
    pagination.appendChild(buttonsContainer);
}

function buscarProveedor() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (!searchTerm) {
        renderProveedores();
        renderPagination();
        return;
    }

    const resultados = proveedores.filter(proveedor =>
        proveedor.nombre.toLowerCase().includes(searchTerm) ||
        proveedor.ruc.includes(searchTerm) ||
        proveedor.contacto.toLowerCase().includes(searchTerm) ||
        proveedor.ciudad.toLowerCase().includes(searchTerm)
    );

    currentPage = 1;
    renderProveedores(resultados);
    renderPagination(resultados);
}

function aplicarFiltros() {
    const categoria = document.getElementById('filterCategoria').value;
    const estado = document.getElementById('filterEstado').value;
    const ciudad = document.getElementById('filterCiudad').value;

    const resultados = proveedores.filter(proveedor => {
        return (categoria === '' || proveedor.categoria === categoria) &&
            (estado === '' || proveedor.estado === estado) &&
            (ciudad === '' || proveedor.ciudad === ciudad);
    });

    currentPage = 1;
    renderProveedores(resultados);
    renderPagination(resultados);
}

function limpiarFiltros() {
    document.getElementById('filterCategoria').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterCiudad').value = '';

    currentPage = 1;
    renderProveedores();
    renderPagination();
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById(modalId).classList.add('flex');
    document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.getElementById(modalId).classList.remove('flex');
    document.body.style.overflow = "auto";

    // Limpiar errores de validación al cerrar el modal
    if (modalId === 'nuevoProveedorModal') {
        clearValidationErrors();
    }
}

function openDetailsModal(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);

    if (!proveedor) return;

    document.getElementById('detailsNombre').textContent = proveedor.nombre;
    document.getElementById('detailsCategoria').textContent = proveedor.categoria;
    document.getElementById('detailsRuc').textContent = proveedor.ruc;
    document.getElementById('detailsContacto').textContent = proveedor.contacto;
    document.getElementById('detailsEmail').textContent = proveedor.correo || 'No especificado';
    document.getElementById('detailsDireccion').textContent = proveedor.direccion;
    document.getElementById('detailsObservaciones').textContent = proveedor.observaciones || 'Ninguna';

    // Configurar el badge de estado
    const estadoBadge = document.getElementById('estadoBadge');
    estadoBadge.className = `inline-block px-2 py-1 rounded-full text-xs font-medium ${proveedor.observaciones === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    estadoBadge.textContent = proveedor.observaciones;

    openModal('detailsProveedorModal');
}

function openEditModal(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);

    if (!proveedor) return;

    document.getElementById('editId').value = proveedor.id;
    document.getElementById('editNombre').value = proveedor.nombre;
    document.getElementById('editCategoria').value = proveedor.categoria;
    document.getElementById('editRuc').value = proveedor.ruc;
    document.getElementById('editTelefono').value = proveedor.telefono;
    document.getElementById('editEmail').value = proveedor.email || '';
    document.getElementById('editDireccion').value = proveedor.direccion;
    document.getElementById('editCiudad').value = proveedor.ciudad;
    document.getElementById('editContacto').value = proveedor.contacto.split(' - ')[0] || '';
    document.getElementById('editEstado').value = proveedor.estado;
    document.getElementById('editObservaciones').value = proveedor.observaciones || '';

    openModal('editProveedorModal');
}

function guardarNuevoProveedor() {
    // Validar campos requeridos
    if (!validateNewProviderForm()) {
        return;
    }

    // Crear nuevo proveedor
    const nuevoId = proveedores.length > 0 ? Math.max(...proveedores.map(p => p.id)) + 1 : 1;

    const nuevoProveedor = {
        id: nuevoId,
        nombre: document.getElementById('nombreProveedor').value,
        categoria: document.getElementById('categoriaProveedor').value,
        ruc: document.getElementById('rucProveedor').value,
        telefono: document.getElementById('telefonoProveedor').value,
        email: document.getElementById('emailProveedor').value || null,
        direccion: document.getElementById('direccionProveedor').value,
        ciudad: document.getElementById('ciudadProveedor').value,
        contacto: document.getElementById('contactoProveedor').value ?
            `${document.getElementById('contactoProveedor').value} - ${document.getElementById('telefonoProveedor').value}` :
            `Contacto - ${document.getElementById('telefonoProveedor').value}`,
        estado: "Activo",
        observaciones: document.getElementById('observacionesProveedor').value || null
    };

    // Agregar a la lista
    proveedores.unshift(nuevoProveedor);

    // Cerrar modal y actualizar tabla
    closeModal('nuevoProveedorModal');

    // Resetear formulario
    document.getElementById('nuevoProveedorForm').reset();

    // Mostrar notificación de éxito
    showNotification('Proveedor registrado con éxito', 'success');

    // Actualizar vista
    currentPage = 1;
    renderProveedores();
    renderPagination();
}

function guardarEdicionProveedor() {
    const id = parseInt(document.getElementById('editId').value);
    const proveedorIndex = proveedores.findIndex(p => p.id === id);

    if (proveedorIndex === -1) return;

    // Actualizar datos del proveedor
    proveedores[proveedorIndex] = {
        ...proveedores[proveedorIndex],
        nombre: document.getElementById('editNombre').value,
        categoria: document.getElementById('editCategoria').value,
        ruc: document.getElementById('editRuc').value,
        telefono: document.getElementById('editTelefono').value,
        email: document.getElementById('editEmail').value || null,
        direccion: document.getElementById('editDireccion').value,
        ciudad: document.getElementById('editCiudad').value,
        contacto: document.getElementById('editContacto').value ?
            `${document.getElementById('editContacto').value} - ${document.getElementById('editTelefono').value}` :
            `Contacto - ${document.getElementById('editTelefono').value}`,
        estado: document.getElementById('editEstado').value,
        observaciones: document.getElementById('editObservaciones').value || null
    };

    // Cerrar modal y actualizar tabla
    closeModal('editProveedorModal');

    // Mostrar notificación de éxito
    showNotification('Cambios guardados con éxito', 'success');

    // Actualizar vista
    renderProveedores();
    renderPagination();
}

function confirmDelete(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);

    if (!proveedor) return;

    // Mostrar modal de confirmación personalizado
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar al proveedor "${proveedor.nombre}"?`);

    if (confirmDelete) {
        // Eliminar proveedor (simulado)
        proveedores = proveedores.filter(p => p.id !== proveedorId);

        // Mostrar notificación de éxito
        showNotification(`Proveedor "${proveedor.nombre}" eliminado`, 'success');

        // Actualizar vista
        currentPage = 1;
        renderProveedores();
        renderPagination();
    }
}

function validateNewProviderForm() {
    let isValid = true;
    const nombre = document.getElementById('nombreProveedor');
    const ruc = document.getElementById('rucProveedor');
    const telefono = document.getElementById('telefonoProveedor');
    const direccion = document.getElementById('direccionProveedor');
    const ciudad = document.getElementById('ciudadProveedor');
    const categoria = document.getElementById('categoriaProveedor');
    const email = document.getElementById('emailProveedor');

    // Limpiar errores previos
    clearValidationErrors();

    // Validar nombre
    if (!nombre.value.trim()) {
        document.getElementById('errorNombre').textContent = 'El nombre es requerido';
        nombre.classList.add('border-red-500');
        isValid = false;
    }

    // Validar RUC
    if (!ruc.value.trim()) {
        document.getElementById('errorRuc').textContent = 'El RUC es requerido';
        ruc.classList.add('border-red-500');
        isValid = false;
    } else if (!/^\d+$/.test(ruc.value)) {
        document.getElementById('errorRuc').textContent = 'El RUC debe contener solo números';
        ruc.classList.add('border-red-500');
        isValid = false;
    }

    // Validar teléfono
    if (!telefono.value.trim()) {
        document.getElementById('errorTelefono').textContent = 'El teléfono es requerido';
        telefono.classList.add('border-red-500');
        isValid = false;
    } else if (!/^\d+$/.test(telefono.value)) {
        document.getElementById('errorTelefono').textContent = 'El teléfono debe contener solo números';
        telefono.classList.add('border-red-500');
        isValid = false;
    }

    // Validar dirección
    if (!direccion.value.trim()) {
        document.getElementById('errorDireccion').textContent = 'La dirección es requerida';
        direccion.classList.add('border-red-500');
        isValid = false;
    }

    // Validar ciudad
    if (!ciudad.value) {
        document.getElementById('errorCiudad').textContent = 'La ciudad es requerida';
        ciudad.classList.add('border-red-500');
        isValid = false;
    }

    // Validar categoría
    if (!categoria.value) {
        document.getElementById('errorCategoria').textContent = 'La categoría es requerida';
        categoria.classList.add('border-red-500');
        isValid = false;
    }

    // Validar email si está presente
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        document.getElementById('errorEmail').textContent = 'Ingrese un email válido';
        email.classList.add('border-red-500');
        isValid = false;
    }

    return isValid;
}

function clearValidationErrors() {
    const errorMessages = document.querySelectorAll('[id^="error"]');
    errorMessages.forEach(el => el.textContent = '');

    const invalidFields = document.querySelectorAll('.border-red-500');
    invalidFields.forEach(el => el.classList.remove('border-red-500'));
}

function showNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white flex items-center ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    notification.innerHTML = `
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                ${message}
            `;

    // Agregar al cuerpo del documento
    document.body.appendChild(notification);

    // Eliminar después de 3 segundos
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Cerrar el modal si se hace clic fuera del contenido
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
        event.target.classList.remove('flex');
        document.body.style.overflow = "auto";

        // Limpiar errores de validación al cerrar el modal
        clearValidationErrors();
    }
}