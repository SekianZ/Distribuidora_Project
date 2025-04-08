<?php
class ManejoProducto {
    private $conn;
    private $table = "manejoproducto";

    public $idManejo;
    public $idCategoria;
    public $descripcion;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crear() {
        $query = "INSERT INTO " . $this->table . " (idCategoria, descripcion) VALUES (:idCategoria, :descripcion)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCategoria", $this->idCategoria);
        $stmt->bindParam(":descripcion", $this->descripcion);
        return $stmt->execute();
    }

    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE idManejo = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function actualizar() {
        $query = "UPDATE " . $this->table . " SET idCategoria = :idCategoria, descripcion = :descripcion WHERE idManejo = :idManejo";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idManejo", $this->idManejo);
        $stmt->bindParam(":idCategoria", $this->idCategoria);
        $stmt->bindParam(":descripcion", $this->descripcion);
        return $stmt->execute();
    }

    public function eliminar() {
        $query = "DELETE FROM " . $this->table . " WHERE idManejo = :idManejo";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idManejo", $this->idManejo);
        return $stmt->execute();
    }
}
?>
