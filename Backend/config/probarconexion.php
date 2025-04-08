<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once __DIR__ . '/../config/database.php';

header("Content-Type: application/json");

$database = new Database();
$response = ["success" => $database->probarConexion()];

echo json_encode($response);