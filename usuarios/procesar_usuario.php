<?php
include 'conexion.php';

// Obtener datos del formulario
$idUsuario = $_POST['idUsuario'] ?? null;
$nombreUsuario = $_POST['nombreUsuario'];
$permiso = $_POST['permiso'];
$contraseña = $_POST['contraseña']; // Recibimos la contraseña en texto plano

if (empty($idUsuario)) {
    // Insertar nuevo usuario (sin cifrar la contraseña)
    $sql = "INSERT INTO usuarios (nombreUsuario, contraseña, permiso) 
            VALUES ('$nombreUsuario', '$contraseña', '$permiso')";
} else {
    // Actualizar usuario
    if (!empty($contraseña)) {
        // Actualizar con nueva contraseña (sin cifrar)
        $sql = "UPDATE usuarios SET 
                nombreUsuario = '$nombreUsuario',
                contraseña = '$contraseña',
                permiso = '$permiso'
                WHERE idUsuario = $idUsuario";
    } else {
        // No actualizar la contraseña
        $sql = "UPDATE usuarios SET 
                nombreUsuario = '$nombreUsuario',
                permiso = '$permiso'
                WHERE idUsuario = $idUsuario";
    }
}

if ($conn->query($sql) === TRUE) {
    echo "Usuario guardado correctamente";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>