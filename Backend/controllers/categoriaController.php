<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/categoria.php';

$db = (new Database())->getConnection();
$categoria = new Categoria($db);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($categoria->obtenerTodos());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    // Verifica si se recibió el nombre de la categoría
    if (!empty($data->nombreCategoria)) {
        $categoria->nombreCategoria = trim($data->nombreCategoria); // Eliminar espacios extra

        if ($categoria->crearCategoria()) {
            http_response_code(201); // Código 201: Creado
            echo json_encode(["estado" => true, "mensaje" => "Categoría creada correctamente"]);
        } else {
            http_response_code(500); // Código 500: Error en el servidor
            echo json_encode(["estado" => false, "mensaje" => "Error al crear la categoría"]);
        }
    } else {
        http_response_code(400); // Código 400: Petición incorrecta
        echo json_encode(["estado" => false, "mensaje" => "Datos incompletos: nombreCategoria es obligatorio"]);
    }
}
?>
