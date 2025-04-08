<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/usuario.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET,PUT,DELETE');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = (new Database())->getConnection();
$usuario = new Usuario($db);

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));
$action = $_POST['action'] ?? ($data->action ?? null);

// Verifica que se envió una acción válida
if (!$action && $method === 'POST') {
    http_response_code(400);
    echo json_encode(["message" => "Acción no especificada"]);
    exit;
}

try {
    if ($method === 'POST') {
        switch ($action) {
            case 'login':
                if (!empty($data->nombreUsuario) && !empty($data->contrasena)) {
                    $resultado = $usuario->verificarUsuario($data->nombreUsuario, $data->contrasena);

                    if ($resultado) {
                        echo json_encode(["message" => "Inicio de sesión exitoso", "usuario" => $resultado]);
                    } else {
                        http_response_code(401);
                        echo json_encode(["message" => "Usuario o contraseña incorrectos"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Datos incompletos"]);
                }
                break;

            case 'create':
                if (!empty($data->nombreUsuario) && !empty($data->contrasena)) {
                    $usuario->nombreUsuario = htmlspecialchars(strip_tags($data->nombreUsuario));
                    $usuario->contrasena = password_hash($data->contrasena, PASSWORD_DEFAULT);
                    $usuario->tipo_usuario = htmlspecialchars(strip_tags($data->tipo_usuario ?? "usuario"));

                    if ($usuario->crearUsuario()) {
                        http_response_code(201);
                        echo json_encode(["message" => "Usuario creado exitosamente"]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["message" => "Error al crear usuario"]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Datos incompletos"]);
                }
                break;

            default:
                http_response_code(400);
                echo json_encode(["message" => "Acción no válida"]);
        }
    } elseif ($method === 'GET') {
            echo json_encode($usuario->obtenerTodos());
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error en el servidor", "error" => $e->getMessage()]);
    echo "si entro";
}

?>
