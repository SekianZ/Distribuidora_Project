<?php
class Cliente {
    private $conn;
    private $table = "clientes";

    public $idCliente;
    public $nombreCliente;
    public $docClientes;
    public $telefono;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crearCliente() {
        $query = "INSERT INTO " . $this->table . " (nombreCliente, docClientes, telefono, estado) VALUES (:nombreCliente, :docClientes, :telefono, :estado)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreCliente", $this->nombreCliente);
        $stmt->bindParam(":docClientes", $this->docClientes);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":estado", $this->estado);
    
        if ($stmt->execute()) {
            return $this->conn->lastInsertId(); // Retorna el ID insertado
        } else {
            return false; // Retorna false si la inserción falla
        }
    }

    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function actualizarCliente() {
        $query = "UPDATE " . $this->table . " SET nombreCliente = :nombreCliente, docClientes = :docClientes, telefono = :telefono, estado = :estado WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $this->idCliente);
        $stmt->bindParam(":nombreCliente", $this->nombreCliente);
        $stmt->bindParam(":docClientes", $this->docClientes);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":estado", $this->estado);
        return $stmt->execute();
    }

    public function eliminarCliente() {
        $query = "DELETE FROM " . $this->table . " WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $this->idCliente);
        return $stmt->execute();
    }

    public function cambiarEstado($estado) {
        $query = "UPDATE " . $this->table . " SET estado = :estado WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $this->idCliente);
        $stmt->bindParam(":estado", $estado);
        return $stmt->execute();
    }
}
?>
