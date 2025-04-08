<?php
class Categoria {
    private $conn;
    private $table = "categorias";

    public $idCategoria;
    public $nombreCategoria;

    public function __construct($db) {
        $this->conn = $db;
    }

    // 📌 Crear una nueva categoría
    public function crearCategoria() {
        $query = "INSERT INTO " . $this->table . " (nombreCategoria) VALUES (:nombreCategoria)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreCategoria", $this->nombreCategoria);
        return $stmt->execute();
    }

    // 📌 Obtener todas las categorías
    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 📌 Obtener una categoría por ID
    public function obtenerPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE idCategoria = :idCategoria";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCategoria", $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // 📌 Actualizar una categoría
    public function actualizarCategoria() {
        $query = "UPDATE " . $this->table . " SET nombreCategoria = :nombreCategoria WHERE idCategoria = :idCategoria";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCategoria", $this->idCategoria, PDO::PARAM_INT);
        $stmt->bindParam(":nombreCategoria", $this->nombreCategoria);
        return $stmt->execute();
    }

    // 📌 Eliminar una categoría
    public function eliminarCategoria() {
        $query = "DELETE FROM " . $this->table . " WHERE idCategoria = :idCategoria";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCategoria", $this->idCategoria, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // 📌 Verificar si una categoría existe (por ID)
    public function existeCategoria($id) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " WHERE idCategoria = :idCategoria";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCategoria", $id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row["total"] > 0;
    }
}
?>
