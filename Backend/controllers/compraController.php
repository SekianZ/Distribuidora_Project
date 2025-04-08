<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/compra.php';

// Configuración de cabeceras para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, DELETE,PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inicializar conexión a la base de datos
$db = (new Database())->getConnection();
$compra = new Compra($db);

// Manejar solicitudes según el método HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        registrarCompra();
        break;
    case 'GET':
            obtenerTodasLasCompras();
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

// ✅ Función para registrar una compra
function registrarCompra() {
    global $compra;

    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar los datos recibidos
    if (!isset($data['idProveedor'], $data['productos'], $data['tipoPago'], $data['monto']) ||
        !is_array($data['productos']) ||
        empty($data['productos']) ||
        !ctype_digit($data['idProveedor'])  ||
        !is_numeric($data['monto'])
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }
    
    // Convertir los datos a tipos adecuados
    $compra->idProveedor = (int) $data['idProveedor'];
    $compra->tipoPago = (int) $data['tipoPago'];
    $compra->monto = (float) $data['monto'];
    $compra->fecha = $data['fecha'];
    $compra->observaciones = $data['observaciones'] ?? null;
    $compra->productos = $data['productos'];

    try {
        if ($compra->crearCompraydetallecompra()) {
            http_response_code(201);
            echo json_encode([
                "success" => true,
                "message" => "Compra registrada con éxito"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al registrar la compra"
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error en el servidor",
            "error" => $e->getMessage()
        ]);
    }
}


// ✅ Función para obtener todas las compras
function obtenerTodasLasCompras() {
    global $compra;

    try {
        if (isset($_GET['action']) && $_GET['action'] === 'obtenerCompraConId' && isset($_GET['id'])) {
            $CompraR = $compra->obtenerPorId($_GET['id']);

            if ($CompraR) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "compra" => $CompraR
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    "success" => false,
                    "message" => "Compra no encontrada"
                ]);
            }
            return; // Salimos para evitar que continúe con la consulta de todas las compras
        }

        // Si no se especifica "obtenerCompraConId", obtenemos todas las compras
        $compras = $compra->obtenerTodasParalista();
        http_response_code(200);
        echo json_encode($compras);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener compras", "error" => $e->getMessage()]);
    }
}

// ✅ Función para obtener una compra por ID
function obtenerCompraPorId($id) {
    global $compra;

    if (!is_numeric($id) || $id <= 0) {
        http_response_code(400);
        echo json_encode(["message" => "ID de compra inválido"]);
        return;
    }

    try {
        $compraEncontrada = $compra->obtenerPorId($id);
        if ($compraEncontrada) {
            http_response_code(200);
            echo json_encode($compraEncontrada);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Compra no encontrada"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener la compra", "error" => $e->getMessage()]);
    }
}

function actualizarCompra() {
    global $compra;

    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    // 🔹 Validar que los datos obligatorios estén presentes
    if (!isset($data['idCompra'], $data['idProveedor'], $data['productos'], $data['tipoPago'], $data['monto']) ||
        !is_array($data['productos']) || empty($data['productos']) ||
        !ctype_digit((string) $data['idCompra']) || !ctype_digit((string) $data['idProveedor']) ||
        !is_numeric($data['monto'])
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }
    // 🔹 Validar que cada producto tenga 'idProducto' y 'cantidad'
    foreach ($data['productos'] as $producto) {
        if (!isset($producto['idProducto'], $producto['cantidad']) ||
            !ctype_digit((string) $producto['idProducto']) || !ctype_digit((string) $producto['cantidad'])
        ) {
            http_response_code(400);
            echo json_encode(["message" => "Formato incorrecto en productos"]);
            return;
        }
    }
    

    // 🔹 Convertir los datos a tipos adecuados
    $compra->idCompra = (int) $data['idCompra'];
    $compra->idProveedor = (int) $data['idProveedor'];
    $compra->tipoPago = (int) $data['tipoPago'];
    $compra->monto = (float) $data['monto'];
    $compra->fecha = $data['fecha'];
    $compra->observaciones = $data['observaciones'] ?? null;
    $compra->productos = $data['productos'];

    try {
        if ($compra->actualizarCompra()) {
            http_response_code(200); // 🔹 Código correcto para actualización
            echo json_encode([
                "success" => true,
                "message" => "Compra actualizada con éxito"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Error al actualizar la compra"
            ]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error en el servidor",
            "error" => $e->getMessage()
        ]);
    }
}

function eliminarCompra() {
    global $compra;

    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de compra inválido"]);
        return;
    }

    $compra->idCompra = $_GET['id'];
    $compra->rellenarDatos(); // 🔹 Obtener los datos antes de eliminar

    try {
        switch ($_GET['action']) {
            case 'eliminarConStock':
                $resultado = $compra->eliminarCompraYalterarStock();
                $mensaje = $resultado ? "Compra y stock eliminados correctamente" : "Error al eliminar la compra y el stock";
                break;

            case 'eliminarSoloCompra':
                $resultado = $compra->eliminarCompraSinAlterarStock();
                $mensaje = $resultado ? "Compra eliminada correctamente sin afectar el stock" : "Error al eliminar solo la compra";
                break;

            default:
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Acción inválida"]);
                return;
        }

        if ($resultado) {
            http_response_code(200);
            echo json_encode(["success" => true, "message" => $mensaje]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $mensaje]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Error al eliminar la compra",
            "error" => $e->getMessage()
        ]);
    }
}

?>
