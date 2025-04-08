<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/proveedor.php';

$db = (new Database())->getConnection();
$proveedor = new Proveedor($db);
header('Content-Type: application/json');

// Manejar solicitudes según el método HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        registrarProducto();
        break;
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'obtenerProveedorparalista') {
            obtenerProveedores();
        } else {
            obtenerProveedoresconProductos();
        }
        break;
    case 'DELETE':
        eliminarCompra();
        break;
    case 'PUT':
        actualizarCompra();
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
        break;
}

function obtenerProveedores() {
    global $proveedor;
    try {
        // Si no se especifica "obtenerCompraConId", obtenemos todas las compras
        $proveedores = $proveedor->obtenerTodosParalista();
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "proveedores" => $proveedores
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener compras", "error" => $e->getMessage()]);
    }
}

function obtenerProveedoresconProductos() {
    global $proveedor;
    echo json_encode($proveedor->obtenerProveedorconProductos());
}

function registrarProducto() {
    $data = json_decode(file_get_contents("php://input"), true);
    global $proveedor;
    try {
        if (!empty($data['nombreProveedor']) && 
            !empty($data['ruc']) && 
            !empty($data['telefono']) && 
            !empty($data['representante']) && 
            isset($data['productos'])) { 
        
            $proveedor->nombreProveedor = $data['nombreProveedor'];
            $proveedor->ruc = $data['ruc'];
            $proveedor->telefono = $data['telefono'];
            $proveedor->Nombrerepresentante = $data['representante'];
            $proveedor->productos = is_array($data['productos']) ? $data['productos'] : [$data['productos']];

            // 📌 Intentar crear el proveedor con productos
            $resultado = $proveedor->crearProveedorConProductos();

            if ($resultado['success']) {
                http_response_code(201); // Código 201: Created
            } else {
                http_response_code(500); // Código 500: Internal Server Error
            }

            echo json_encode($resultado);
        } else {
            http_response_code(400);
            echo json_encode(["message" => "Datos incompletos"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al crear proveedor", "error" => $e->getMessage()]);
    }
}