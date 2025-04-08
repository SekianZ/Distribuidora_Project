<?php
class Usuario {
    private $conn;
    private $table = "usuarios";

    public $idUsuario;
    public $nombreUsuario;
    public $contrasena;
    public $tipo_usuario;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 📌 CREAR USUARIO
    public function crearUsuario() {
        $query = "INSERT INTO " . $this->table . " (nombreUsuario, contrasena, tipo_usuario) 
                  VALUES (:nombreUsuario, :contrasena, :tipo_usuario)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreUsuario", $this->nombreUsuario);
        $stmt->bindParam(":contrasena", $this->contrasena);
        $stmt->bindParam(":tipo_usuario", $this->tipo_usuario);
        return $stmt->execute();
    }

    // 📌 OBTENER TODOS LOS USUARIOS (SIN CONTRASEÑA)
    public function obtenerTodos() {
        $query = "SELECT idUsuario, nombreUsuario, tipo_usuario FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 📌 OBTENER USUARIO POR ID
    public function obtenerPorId($id) {
        $query = "SELECT idUsuario, nombreUsuario, tipo_usuario FROM " . $this->table . " WHERE idUsuario = :idUsuario";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idUsuario", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 📌 ELIMINAR USUARIO
    public function eliminarUsuario() {
        $query = "DELETE FROM " . $this->table . " WHERE idUsuario = :idUsuario";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idUsuario", $this->idUsuario);
        return $stmt->execute();
    }

    // 📌 VERIFICAR USUARIO (LOGIN)
    public function verificarUsuario($nombreUsuario, $contrasena) {
        $query = "SELECT idUsuario, nombreUsuario, contrasena, tipo_usuario FROM " . $this->table . " WHERE nombreUsuario = :nombreUsuario";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreUsuario", $nombreUsuario);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
        if ($usuario && password_verify($contrasena, $usuario['contrasena'])) {
            return [
                "idUsuario" => $usuario['idUsuario'],
                "nombreUsuario" => $usuario['nombreUsuario'],
                "tipo_usuario" => $usuario['tipo_usuario']
            ];
        }
    
        return false;
    }
}
?>
