<?php
$servername = "localhost";
$username = "root";
$password = "";
$database = "bddistribuidora";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>
