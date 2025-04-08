<?php
class Compra {
    private $conn;
    private $table = "compras";
    private $detalleTable = "detallecompras";

    public $idCompra;
    public $fecha;
    public $tipoPago;
    public $monto;
    public $idProveedor;
    public $observaciones;

    public $productos; // Array con idProducto y cantidadLote

    public function __construct($db) {
        $this->conn = $db;
    }

    public function CambiarStockDisponible($idProducto, $cantidadLote) {
        try {
            $query = "UPDATE productos SET stock = stock + :cantidadLote WHERE idProducto = :idProducto";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cantidadLote", $cantidadLote, PDO::PARAM_INT);
            $stmt->bindParam(":idProducto", $idProducto, PDO::PARAM_INT);
            $stmt->execute();
    
            // 🔹 Verificar si realmente se afectó alguna fila
            if ($stmt->rowCount() === 0) {
                error_log("No se actualizó el stock para idProducto: $idProducto");
                return false;
            }
    
            return true;
        } catch (Exception $e) {
            error_log("Error en CambiarStockDisponible: " . $e->getMessage());
            return false;
        }
    }

    public function eliminarStockDisponible() {
        try {
            $query = "UPDATE productos SET stock = stock - :cantidadLote WHERE idProducto = :idProducto";
            $stmt = $this->conn->prepare($query);
    
            foreach ($this->productos as $producto) {
                $stmt->bindParam(":cantidadLote", $producto['cantidad'], PDO::PARAM_INT);
                $stmt->bindParam(":idProducto", $producto['idProducto'], PDO::PARAM_INT);
                $stmt->execute();
            }
    
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    




    // ✅ Crear una compra con múltiples productos en su detalle
    public function crearCompraydetallecompra() {
        try {
            $this->conn->beginTransaction();
    
            // 📌 Si la fecha no está definida, se usa la actual
            if (empty($this->fecha)) {
                $this->fecha = date("Y-m-d H:i:s");
            }
    
            // 🔹 Insertar en la tabla compras
            $query = "INSERT INTO " . $this->table . " (fecha, idProveedor, idTipoPago, monto, observaciones) 
                      VALUES (:fecha, :idProveedor, :tipoPago, :monto, :observaciones)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":fecha", $this->fecha);
            $stmt->bindParam(":idProveedor", $this->idProveedor);
            $stmt->bindParam(":tipoPago", $this->tipoPago);
            $stmt->bindParam(":monto", $this->monto);
            $stmt->bindParam(":observaciones", $this->observaciones);
            $stmt->execute();
            $idCompra = $this->conn->lastInsertId();
    
            // 🔹 Insertar los detalles de la compra y actualizar stock
            $queryDetalle = "INSERT INTO " . $this->detalleTable . " (idCompra, idProducto, cantidad) 
                             VALUES (:idCompra, :idProducto, :cantidad)";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
    
            foreach ($this->productos as $producto) {
                $stmtDetalle->bindParam(":idCompra", $idCompra);
                $stmtDetalle->bindParam(":idProducto", $producto['idProducto']);
                $stmtDetalle->bindParam(":cantidad", $producto['cantidad']);
                $stmtDetalle->execute();
            
                if (!$this->CambiarStockDisponible($producto['idProducto'], $producto['cantidad'])) {
                    $this->conn->rollBack();
                    return false;
                }
            }
    
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error en crearCompra: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Error en la base de datos", "error" => $e->getMessage()]);
            return false;
        }
    }
    

    // ✅ Obtener todas las compras
    public function obtenerTodas() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerTodasParalista() {
        $query = "
            SELECT 
                c.idCompra,
                p.nombreProveedor AS proveedor,
                tp.metodoPago AS tipoPago,
                pr.nombreProducto AS producto,
                dc.cantidad,
                pr.precio AS precio_unitario,
                (dc.cantidad * pr.precio) AS total,
                c.monto,
                c.fecha,
                c.observaciones
            FROM compras c
            JOIN proveedores p ON c.idProveedor = p.idProveedor
            JOIN tipospago tp ON c.idTipoPago = tp.idTipoPago
            JOIN detallecompras dc ON c.idCompra = dc.idCompra
            JOIN productos pr ON dc.idProducto = pr.idProducto
            ORDER BY c.fecha DESC
        ";
    
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ Obtener una compra por ID con sus detalles
    public function obtenerPorId($idCompra) {
        $query = "SELECT * FROM " . $this->table . " WHERE idCompra = :idCompra";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCompra", $idCompra);
        $stmt->execute();
        $compra = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($compra) {
            $compra['detalles'] = $this->obtenerDetallesPorCompra($idCompra);
        }

        return $compra;
    }

    // ✅ Obtener los detalles de una compra específica
    public function obtenerDetallesPorCompra($idCompra) {
        $query = "SELECT d.*, p.precio
            FROM detallecompras d
            JOIN productos p ON d.idProducto = p.idProducto
            WHERE d.idCompra = :idCompra;";
    
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCompra", $idCompra);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ✅ Actualizar una compra
    public function actualizarCompra() {
        try {
            $this->conn->beginTransaction();
    
            // 🔹 Obtener productos anteriores
            $queryObtenerDetalles = "SELECT idProducto, cantidad FROM {$this->detalleTable} WHERE idCompra = :idCompra";
            $stmtObtenerDetalles = $this->conn->prepare($queryObtenerDetalles);
            $stmtObtenerDetalles->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmtObtenerDetalles->execute();
            $productosAnteriores = $stmtObtenerDetalles->fetchAll(PDO::FETCH_ASSOC);
    
            // 🔹 Convertir productos anteriores a un array asociativo
            $productosAnterioresMap = [];
            foreach ($productosAnteriores as $producto) {
                $productosAnterioresMap[$producto['idProducto']] = $producto['cantidad'];
            }
    
            // 🔹 Actualizar la compra
            $queryActualizarCompra = "UPDATE {$this->table} 
                SET fecha = :fecha, idProveedor = :idProveedor, idTipoPago = :tipoPago, monto = :monto, observaciones = :observaciones
                WHERE idCompra = :idCompra";
            $stmtActualizarCompra = $this->conn->prepare($queryActualizarCompra);
            $stmtActualizarCompra->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmtActualizarCompra->bindParam(":fecha", $this->fecha);
            $stmtActualizarCompra->bindParam(":idProveedor", $this->idProveedor, PDO::PARAM_INT);
            $stmtActualizarCompra->bindParam(":tipoPago", $this->tipoPago, PDO::PARAM_INT);
            $stmtActualizarCompra->bindParam(":monto", $this->monto);
            $stmtActualizarCompra->bindParam(":observaciones", $this->observaciones);
            $stmtActualizarCompra->execute();
    
            // 🔹 Procesar cada producto
            foreach ($this->productos as $producto) {
                $idProducto = $producto['idProducto'];
                $nuevaCantidad = $producto['cantidad'];
    
                // 🔹 Actualizar el detalle de la compra
                $queryDetalleCompra = "UPDATE {$this->detalleTable} 
                                       SET cantidad = :cantidad 
                                       WHERE idCompra = :idCompra AND idProducto = :idProducto";
                $smtDetalleCompra = $this->conn->prepare($queryDetalleCompra);
                $smtDetalleCompra->bindValue(":cantidad", $nuevaCantidad, PDO::PARAM_INT);
                $smtDetalleCompra->bindValue(":idCompra", $this->idCompra, PDO::PARAM_INT);
                $smtDetalleCompra->bindValue(":idProducto", $idProducto, PDO::PARAM_INT);
                $smtDetalleCompra->execute();
    
                // 🔹 Calcular diferencia de stock
                $cantidadAnterior = isset($productosAnterioresMap[$idProducto]) ? $productosAnterioresMap[$idProducto] : 0;
                $diferenciaStock = $nuevaCantidad - $cantidadAnterior;
    
                // 🔹 Actualizar stock solo si hay cambios
                if ($diferenciaStock != 0) {
                    if (!$this->CambiarStockDisponible($idProducto, $diferenciaStock)) {
                        $this->conn->rollBack();
                        return false;
                    }
                }
            }
    
            $this->conn->commit();
            return true;
    
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error en actualizarCompra: " . $e->getMessage());
            return false; // Quitamos la respuesta HTTP aquí
        }
    }
    
    
    public function rellenarDatos() {
        // Obtener datos de la compra
        $query = "SELECT * FROM " . $this->table . " WHERE idCompra = :idCompra";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
        $stmt->execute();
        $compra = $stmt->fetch(PDO::FETCH_ASSOC);
    
        // Obtener detalles de la compra (productos)
        $queryDetalle = "SELECT idProducto, cantidad FROM " . $this->detalleTable . " WHERE idCompra = :idCompra";
        $stmtDetalle = $this->conn->prepare($queryDetalle);
        $stmtDetalle->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
        $stmtDetalle->execute();
        $compraDetalle = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
    
        // Asignar datos de la compra si existen
        if ($compra) {
            $this->fecha = $compra['fecha'];
            $this->idProveedor = $compra['idProveedor'];
            $this->monto = $compra['monto'];
            $this->observaciones = $compra['observaciones'] ?? null;
        }
    
        // Asignar detalles de la compra (productos) si existen
        $this->productos = $compraDetalle ?: [];
    }

    // ✅ Eliminar una compra y sus detalles

    public function eliminarCompraSinAlterarStock() {
        try {
            $this->conn->beginTransaction();
    
            // Eliminar detalles de la compra primero
            $queryDetalle = "DELETE FROM " . $this->detalleTable . " WHERE idCompra = :idCompra";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
            $stmtDetalle->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmtDetalle->execute();
    
            // Luego eliminar la compra
            $query = "DELETE FROM " . $this->table . " WHERE idCompra = :idCompra";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmt->execute();
    
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    


    public function eliminarCompraYalterarStock() {
        try {
            $this->conn->beginTransaction();
    
            // Primero actualizar el stock antes de eliminar los productos
            $this->eliminarStockDisponible();
    
            // Eliminar detalles de la compra
            $queryDetalle = "DELETE FROM " . $this->detalleTable . " WHERE idCompra = :idCompra";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
            $stmtDetalle->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmtDetalle->execute();
    
            // Luego eliminar la compra
            $query = "DELETE FROM " . $this->table . " WHERE idCompra = :idCompra";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":idCompra", $this->idCompra, PDO::PARAM_INT);
            $stmt->execute();
    
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
?>
