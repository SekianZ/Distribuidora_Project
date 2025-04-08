<?php
require_once __DIR__ . "/../config/database.php";

$db = (new Database())->getConnection(); // Obtener conexión

try {
    $stockProductos = obtenerStock($db);
    echo json_encode($stockProductos); // Devolver en formato JSON
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