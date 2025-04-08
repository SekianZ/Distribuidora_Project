<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/venta.php';

// Configuración de cabeceras para CORS y JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Inicializar conexión a la base de datos
$db = (new Database())->getConnection();
$venta = new venta($db);

// Manejar solicitudes según el método HTTP
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        registrarventa();
        break;
    case 'GET':
        if(isset($_GET['idVenta'])){
            obtenerVentaEspecifica();
        }else{
            obtenerTodasLasventas();
        }
        break;
    case 'PUT':
        actualizarventa();
    case 'DELETE':
        eliminarVenta();
        break;
    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
        break;
}

// ✅ Función para registrar una venta
function registrarventa() {
    global $venta;

    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar los datos recibidos
    if (!isset($data['idCliente'], $data['productos'], $data['IdtipoPago'], $data['montoVenta']) ||
        !is_array($data['productos']) ||
        empty($data['productos']) ||
        !is_numeric($data['idCliente']) ||  // Cambié ctype_digit() por is_numeric()
        !is_numeric($data['IdtipoPago']) || // Cambié ctype_digit() por is_numeric()
        !is_numeric($data['montoVenta'])
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }
    
    // Convertir los datos a tipos adecuados
    $venta->idCliente = (int) $data['idCliente'];
    $venta->fecha = $data['fecha']??null;
    $venta->tipoPago = (int) $data['IdtipoPago'];
    $venta->monto = (float) $data['montoVenta'];
    $venta->manejoProducto = (int) $data['idManejoProducto'];
    $venta->observaciones = $data['observacionesVenta'] ?? null;
    $venta->productos = $data['productos'];

    try {
        if ($venta->crearventaydetalleventa()) {
            http_response_code(201);
            echo json_encode(["message" => "venta registrada con éxito", "success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al registrar la venta", "success" => false]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error en el servidor", "error" => $e->getMessage()]);
    }
}

function actualizarventa(){
    global $venta;

    // Obtener datos de la solicitud
    $data = json_decode(file_get_contents("php://input"), true);

    // Validar los datos recibidos
    if (!isset($data['idCliente'], $data['productos'], $data['IdtipoPago'], $data['montoVenta']) ||
        !is_array($data['productos']) ||
        empty($data['productos']) ||
        !is_numeric($data['idCliente']) ||  // Cambié ctype_digit() por is_numeric()
        !is_numeric($data['IdtipoPago']) || // Cambié ctype_digit() por is_numeric()
        !is_numeric($data['montoVenta'])
    ) {
        http_response_code(400);
        echo json_encode(["message" => "Datos incompletos o incorrectos"]);
        return;
    }
    
    // Convertir los datos a tipos adecuado
    $venta->idVenta = (int) $data['idVenta'];
    $venta->fecha = $data['fecha']??null;
    $venta->idCliente = (int) $data['idCliente'];
    $venta->tipoPago = (int) $data['IdtipoPago'];
    $venta->monto = (float) $data['montoVenta'];
    $venta->manejoProducto = (int) $data['idManejoProducto'];
    $venta->observaciones = $data['observacionesVenta'] ?? null;
    $venta->productos = $data['productos'];

    try {
        if ($venta->ActualizarVentayDetalleVenta()) {
            http_response_code(201);
            echo json_encode(["message" => "venta registrada con éxito", "success" => true]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error al registrar la venta", "success" => false]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error en el servidor", "error" => $e->getMessage()]);
    }
}


// ✅ Función para obtener todas las ventas
function obtenerTodasLasventas() {
    global $venta;

    try {
        $ventas = $venta->obtenerTodasParalista();
        http_response_code(200);
        echo json_encode($ventas);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener ventas", "error" => $e->getMessage()]);
    }
}

function obtenerVentaEspecifica(){
    global $venta;

    $venta->idVenta =(int)$_GET['idVenta'];
    try {
        $ventas = $venta->obtenerVentaEspecifica();
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "ventas" => $ventas
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error al obtener ventas", "error" => $e->getMessage()]);
    }
}



// ✅ Función para obtener una venta por ID
function eliminarVenta() {
    global $venta;

    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de compra inválido"]);
        return;
    }

    $venta->idVenta = $_GET['id'];
    $venta->rellenarDatos(); // 🔹 Obtener los datos antes de eliminar

    try {
        switch ($_GET['action']) {
            case 'eliminarConStock':
                $resultado = $venta->eliminarVentaYalterarStock();
                $mensaje = $resultado ? "Venta y stock eliminados correctamente" : "Error al eliminar la Venta y el stock";
                break;

            case 'eliminarSoloventa':
                $resultado = $venta->eliminarVentaSinAlterarStock();
                $mensaje = $resultado ? "Venta eliminada correctamente sin afectar el stock" : "Error al eliminar solo la Venta";
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
