<?php
class Producto {
    private $conn;
    private $table = "productos";

    public $idProducto;
    public $nombreProducto;
    public $idCategoria;
    public $precio;
    public $stock;
    public $estadoStock;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ✅ Crear un nuevo producto con estadoStock automático
    public function crearProducto() {
        $this->estadoStock = $this->determinarEstadoStock($this->stock);

        $query = "INSERT INTO " . $this->table . " (nombreProducto, idCategoria, precio, stock, estadoStock) 
                  VALUES (:nombreProducto, :idCategoria, :precio, :stock, :estadoStock)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nombreProducto", $this->nombreProducto);
        $stmt->bindParam(":idCategoria", $this->idCategoria);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":estadoStock", $this->estadoStock);
        return $stmt->execute();
    }

    // ✅ Obtener todos los productos
    public function obtenerTodos() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ Obtener un producto por ID
    public function obtenerPorId($id) {
        $query = "SELECT * FROM " . $this->table . " WHERE idProducto = :idProducto";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idProducto", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ✅ Actualizar un producto
    public function actualizarProducto() {
        $this->estadoStock = $this->determinarEstadoStock($this->stock);

        $query = "UPDATE " . $this->table . " 
                  SET nombreProducto = :nombreProducto, idCategoria = :idCategoria, 
                      precio = :precio, stock = :stock, estadoStock = :estadoStock 
                  WHERE idProducto = :idProducto";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idProducto", $this->idProducto);
        $stmt->bindParam(":nombreProducto", $this->nombreProducto);
        $stmt->bindParam(":idCategoria", $this->idCategoria);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":estadoStock", $this->estadoStock);
        return $stmt->execute();
    }

    // ✅ Eliminar un producto por ID
    public function eliminarProducto($id) {
        $query = "DELETE FROM " . $this->table . " WHERE idProducto = :idProducto";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idProducto", $id);
        return $stmt->execute();
    }

    // ✅ Actualizar solo el stock y estadoStock de un producto
    public function actualizarStock($id, $nuevoStock) {
        $nuevoEstado = $this->determinarEstadoStock($nuevoStock);

        $query = "UPDATE " . $this->table . " SET stock = :stock, estadoStock = :estadoStock WHERE idProducto = :idProducto";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idProducto", $id);
        $stmt->bindParam(":stock", $nuevoStock);
        $stmt->bindParam(":estadoStock", $nuevoEstado);
        return $stmt->execute();
    }

    // ✅ Buscar productos por nombre
    public function buscarProductos($nombre) {
        $query = "SELECT * FROM " . $this->table . " WHERE nombreProducto LIKE :nombreProducto";
        $stmt = $this->conn->prepare($query);
        $nombre = "%$nombre%";
        $stmt->bindParam(":nombreProducto", $nombre);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ Cambiar el estado del stock automáticamente
    public function cambiarEstadoStock($id) {
        $query = "SELECT stock FROM " . $this->table . " WHERE idProducto = :idProducto";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idProducto", $id);
        $stmt->execute();
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($producto) {
            $nuevoEstado = $this->determinarEstadoStock($producto['stock']);

            $queryUpdate = "UPDATE " . $this->table . " SET estadoStock = :estadoStock WHERE idProducto = :idProducto";
            $stmtUpdate = $this->conn->prepare($queryUpdate);
            $stmtUpdate->bindParam(":estadoStock", $nuevoEstado);
            $stmtUpdate->bindParam(":idProducto", $id);
            return $stmtUpdate->execute();
        }
        return false;
    }

    // ✅ Función para determinar el estado del stock
    private function determinarEstadoStock($stock) {
        if ($stock == 0) {
            return 'Agotado';
        } elseif ($stock > 0 && $stock <= 5) {
            return 'Bajo';
        } elseif ($stock > 5 && $stock <= 10) {
            return 'Medio';
        } else {
            return 'Alto';
        }
    }
}
?>
