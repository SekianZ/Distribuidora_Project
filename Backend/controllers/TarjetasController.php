<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../models/Cliente.php";

$db = (new Database())->getConnection(); // Obtener conexión
$input = json_decode(file_get_contents('php://input'), true);
$action = $input['accion'] ?? '';

try {
    $db = (new Database())->getConnection();
    $clienteModel = new Cliente($db);

    switch ($action) {
        case 'obtenerStock':
            $stockProductos = obtenerStock($db);
            echo json_encode($stockProductos);
            break;
            
        case 'obtenerEstadisticasClientes':
            $estadisticas = [
                'totalClientes' => $clienteModel->contarClientes(),
                'clientesActivos' => $clienteModel->contarClientesActivos()
            ];
            echo json_encode($estadisticas);
            break;
            
        default:
            echo json_encode(['error' => 'Acción no válida']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}

// ✅ Función para obtener todos los productos con su nombre y stock
function obtenerStock($db) {
    $query = "SELECT idProducto, nombreProducto, stock FROM productos"; // Obtener id, nombre y stock
    $stmt = $db->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC); // Retornar array asociativo
}
