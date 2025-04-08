<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/tipo_pago.php';
$db = (new Database())->getConnection();
$TipoPago = new TipoPago($db);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($TipoPago->obtenerTodos());
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
}
?>
