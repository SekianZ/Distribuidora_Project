<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/producto.php';

$db = (new Database())->getConnection();
$producto = new Producto($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($producto->obtenerTodos());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->nombreProducto) && !empty($data->idCategoria) && !empty($data->precio)) {
        $producto->nombreProducto = $data->nombreProducto;
        $producto->idCategoria = $data->idCategoria;
        $producto->precio = $data->precio;
        $producto->stock = $data->stock ?? 0;
        $producto->estadoStock = $data->estadoStock ?? "disponible";

        if ($producto->crearProducto()) {
            echo json_encode(["message" => "Producto agregado"]);
        } else {
            echo json_encode(["message" => "Error al agregar producto"]);
        }
    } else {
        echo json_encode(["message" => "Datos incompletos"]);
    }
}
?>
