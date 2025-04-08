<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Cliente.php';

$db = (new Database())->getConnection();
$cliente = new Cliente($db);
header('Content-Type: application/json'); // 📌 Importante para indicar JSON

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($cliente->obtenerTodos());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->nombreCliente)) {
        $cliente->nombreCliente = trim($data->nombreCliente);
        $cliente->telefono = !empty($data->telefono) ? trim($data->telefono) : null;
        $cliente->estado = !empty($data->estado) ? trim($data->estado) : 'activo';

        $idCliente = $cliente->crearCliente(); // Captura el ID insertado

        if ($idCliente) {
            http_response_code(201);
            echo json_encode(["estado" => true, "idCliente" => $idCliente, "mensaje" => "Cliente creado correctamente"]);
        } else {
            http_response_code(500);
            echo json_encode(["estado" => false, "mensaje" => "Error al crear cliente"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["estado" => false, "mensaje" => "Datos incompletos"]);
    }
}
?>
