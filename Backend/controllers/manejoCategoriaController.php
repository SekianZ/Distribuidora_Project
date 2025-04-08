<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/ManejoProducto.php';

// Configuración de cabeceras para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inicializar conexión a la base de datos
$db = (new Database())->getConnection();
$manejoProducto = new ManejoProducto($db);

// Manejo de solicitudes según el método HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        crearManejoProducto();
        break;
    case 'GET':
        if (isset($_GET['idProducto'])) {
            obtenerManejoProductoPorId($_GET['idProducto']);
        } else {
            obtenerTodosLosManejos();
        }
        break;
    case 'PUT':
        actualizarManejoProducto();
        break;
    case 'DELETE':
        eliminarManejoProducto();
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
        break;
}

// ✅ Función para crear un nuevo ManejoProducto
function crearManejoProducto() {
    global $manejoProducto;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['idCategoria'], $data['descripcion']) ||
        !is_numeric($data['idCategoria']) || empty($data['descripcion'])) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }

    $manejoProducto->idCategoria = (int) $data['idCategoria'];
    $manejoProducto->descripcion = trim($data['descripcion']);

    if ($manejoProducto->crear()) {
        http_response_code(201);
        echo json_encode(["message" => "Manejo de Producto registrado con éxito"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error al registrar el Manejo de Producto"]);
    }
}

// ✅ Función para obtener todos los ManejosProducto
function obtenerTodosLosManejos() {
    global $manejoProducto;

    try {
        $resultados = $manejoProducto->obtenerTodos();
        http_response_code(200);
        echo json_encode($resultados);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener los datos", "error" => $e->getMessage()]);
    }
}

// ✅ Función para obtener un ManejoProducto por ID
function obtenerManejoProductoPorId($id) {
    global $manejoProducto;

    if (!is_numeric($id) || $id <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "ID inválido"]);
        return;
    }

    try {
        $resultado = $manejoProducto->obtenerPorId($id);
        if ($resultado) {
            http_response_code(200);
            echo json_encode($resultado);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Manejo de Producto no encontrado"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener los datos", "error" => $e->getMessage()]);
    }
}

// ✅ Función para actualizar un ManejoProducto
function actualizarManejoProducto() {
    global $manejoProducto;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['idManejo'], $data['idCategoria'], $data['descripcion']) ||
        !is_numeric($data['idManejo']) || !is_numeric($data['idCategoria']) || empty($data['descripcion'])) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }

    $manejoProducto->idManejo = (int) $data['idManejo'];
    $manejoProducto->idCategoria = (int) $data['idCategoria'];
    $manejoProducto->descripcion = trim($data['descripcion']);

    if ($manejoProducto->actualizar()) {
        http_response_code(200);
        echo json_encode(["message" => "Manejo de Producto actualizado con éxito"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error al actualizar el Manejo de Producto"]);
    }
}

// ✅ Función para eliminar un ManejoProducto
function eliminarManejoProducto() {
    global $manejoProducto;

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['idManejo']) || !is_numeric($data['idManejo'])) {
        http_response_code(400);
        echo json_encode(["message" => "ID inválido"]);
        return;
    }

    $manejoProducto->idManejo = (int) $data['idManejo'];

    if ($manejoProducto->eliminar()) {
        http_response_code(200);
        echo json_encode(["message" => "Manejo de Producto eliminado con éxito"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error al eliminar el Manejo de Producto"]);
    }
}
?>
