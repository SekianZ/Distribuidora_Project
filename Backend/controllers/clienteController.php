<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Cliente.php';

$db = (new Database())->getConnection();
$cliente = new Cliente($db);
header('Content-Type: application/json'); // 📌 Importante para indicar JSON
// Habilitar CORS (colocar al inicio del archivo)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header('Content-Type: application/json');

// Manejar preflight para CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['id'])) {
            // Obtener un cliente específico
            $cliente->idCliente = $_GET['id'];
            $resultado = $cliente->obtenerPorId($cliente->idCliente);
            echo json_encode($resultado);
        } else {
            // Obtener todos los clientes
            echo json_encode($cliente->obtenerTodos());
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->nombreCliente)) {
            $cliente->nombreCliente = trim($data->nombreCliente);
            $cliente->telefono = !empty($data->telefono) ? trim($data->telefono) : null;
            $cliente->correo = !empty($data->correo) ? trim($data->correo) : null;
            $cliente->estado = 'Activo';

            $idCliente = $cliente->crearCliente();

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
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents("php://input"));

        if ($id && !empty($data)) {
            $cliente->idCliente = $id;
            $cliente->nombreCliente = trim($data->nombreCliente);
            $cliente->telefono = !empty($data->telefono) ? trim($data->telefono) : null;
            $cliente->correo = !empty($data->correo) ? trim($data->correo) : null;
            $cliente->estado = !empty($data->estado) ? trim($data->estado) : 'Activo';

            if ($cliente->actualizarCliente()) {
                echo json_encode(["estado" => true, "mensaje" => "Cliente actualizado correctamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["estado" => false, "mensaje" => "Error al actualizar cliente"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["estado" => false, "mensaje" => "Datos incompletos"]);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'] ?? null;

        if ($id) {
            $cliente->idCliente = $id;
            if ($cliente->eliminarCliente()) {
                echo json_encode(["estado" => true, "mensaje" => "Cliente marcado como inactivo"]);
            } else {
                http_response_code(500);
                echo json_encode(["estado" => false, "mensaje" => "Error al desactivar cliente"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["estado" => false, "mensaje" => "ID no proporcionado"]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'estado' => false,
        'mensaje' => 'Error interno del servidor: ' . $e->getMessage()
    ]);
    exit;
}
