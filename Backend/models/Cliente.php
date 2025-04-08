<?php
class Cliente {
    private $conn;
    private $table = "clientes";

    public $idCliente;
    public $nombreCliente;
    public $telefono;
    public $correo;
    public $estado;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function crearCliente() {
        $query = "INSERT INTO " . $this->table . " 
                 (nombreCliente, telefono, correo, estado) 
                 VALUES (:nombreCliente, :telefono, :correo, :estado)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreCliente", $this->nombreCliente);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":correo", $this->correo);
        $stmt->bindParam(":estado", $this->estado);
        
        return $stmt->execute() ? $this->conn->lastInsertId() : false;
    }

    // Solo obtener clientes activos
    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table . " WHERE estado = 'Activo'";
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
        $query = "UPDATE " . $this->table . " SET 
                 nombreCliente = :nombreCliente, 
                 telefono = :telefono, 
                 correo = :correo
                 WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $this->idCliente);
        $stmt->bindParam(":nombreCliente", $this->nombreCliente);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":correo", $this->correo);
        return $stmt->execute();
    }

    // Soft delete - Marcar como inactivo en lugar de eliminar
    public function eliminarCliente() {
        $query = "UPDATE " . $this->table . " SET estado = 'Inactivo' WHERE idCliente = :idCliente";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCliente", $this->idCliente);
        return $stmt->execute();
    }  
    // public function cambiarEstado($estado) {
    //     $query = "UPDATE " . $this->table . " SET estado = :estado WHERE idCliente = :idCliente";
    //     $stmt = $this->conn->prepare($query);
    //     $stmt->bindParam(":idCliente", $this->idCliente);
    //     $stmt->bindParam(":estado", $estado);
    //     return $stmt->execute();
    // }
    public function contarClientes() {
        $query = "SELECT COUNT(*) as total FROM " . $this->table;
        $stmt = $this->conn->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'];
    }
    
    public function contarClientesActivos() {
        $query = "SELECT COUNT(*) as activos FROM " . $this->table . " WHERE estado = 'activo'";
        $stmt = $this->conn->query($query);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['activos'];
    }
}
?>
