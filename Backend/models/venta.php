<?php
class Venta {
    private $conn;
    private $table = "ventas";
    private $detalleTable = "detalleventas";

    public $idVenta;
    public $fecha;
    public $idCliente;
    public $tipoPago;
    public $manejoProducto;
    public $monto;
    public $observaciones;

    //DetalleVenta
    public $productos;


    public function __construct($db) {
        $this->conn = $db;
    }

    public function CambiarStockDisponible($idProducto, $cantidadLote) {
        try {
            $query = "UPDATE productos SET stock = stock - :cantidad WHERE idProducto = :idProducto";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":cantidad", $cantidadLote, PDO::PARAM_INT);
            $stmt->bindParam(":idProducto", $idProducto, PDO::PARAM_INT);
            $stmt->execute();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function ActualizarVentayDetalleVenta(){
        try{
            $this->conn->beginTransaction();
    
            // 🔹 Obtener productos anteriores
            $queryObtenerDetalles = "SELECT idProducto, cantidad FROM {$this->detalleTable} WHERE idVenta = :idVenta";
            $stmtObtenerDetalles = $this->conn->prepare($queryObtenerDetalles);
            $stmtObtenerDetalles->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
            $stmtObtenerDetalles->execute();
            $productosAnteriores = $stmtObtenerDetalles->fetchAll(PDO::FETCH_ASSOC);
    
            // 🔹 Convertir productos anteriores a un array asociativo
            $productosAnterioresMap = [];
            foreach ($productosAnteriores as $producto) {
                $productosAnterioresMap[$producto['idProducto']] = $producto['cantidad'];
            }
    
            // 🔹 Actualizar la Venta
            $queryActualizarVenta = "UPDATE {$this->table} 
                SET fecha = :fecha, idProveedor = :idCliente, idTipoPago = :tipoPago, monto = :monto, observaciones = :observaciones
                WHERE idVenta = :idVenta";
            $stmtActualizarVenta = $this->conn->prepare($queryActualizarVenta);
            $stmtActualizarVenta->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
            $stmtActualizarVenta->bindParam(":fecha", $this->fecha);
            $stmtActualizarVenta->bindParam(":idCliente", $this->idCliente, PDO::PARAM_INT);
            $stmtActualizarVenta->bindParam(":tipoPago", $this->tipoPago, PDO::PARAM_INT);
            $stmtActualizarVenta->bindParam(":monto", $this->monto);
            $stmtActualizarVenta->bindParam(":observaciones", $this->observaciones);
            $stmtActualizarVenta->execute();
    
            // 🔹 Procesar cada producto
            foreach ($this->productos as $producto) {
                $idProducto = $producto['idProducto'];
                $nuevaCantidad = $producto['cantidad'];
    
                // 🔹 Actualizar el detalle de la Venta
                $queryDetalleVenta = "UPDATE {$this->detalleTable} 
                                       SET cantidad = :cantidad 
                                       WHERE idVenta = :idVenta AND idProducto = :idProducto";
                $smtDetalleVenta = $this->conn->prepare($queryDetalleVenta);
                $smtDetalleVenta->bindValue(":cantidad", $nuevaCantidad, PDO::PARAM_INT);
                $smtDetalleVenta->bindValue(":idVenta", $this->idVenta, PDO::PARAM_INT);
                $smtDetalleVenta->bindValue(":idProducto", $idProducto, PDO::PARAM_INT);
                $smtDetalleVenta->execute();
    
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
            error_log("Error en crearVenta: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Error en la base de datos", "error" => $e->getMessage()]);
            return false;
        }
    }

    public function rellenarDatos() {
        // Obtener datos de la Venta
        $query = "SELECT * FROM " . $this->table . " WHERE idVenta = :idVenta";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
        $stmt->execute();
        $Venta = $stmt->fetch(PDO::FETCH_ASSOC);
    
        // Obtener detalles de la Venta (productos)
        $queryDetalle = "SELECT idProducto, cantidad FROM " . $this->detalleTable . " WHERE idVenta = :idVenta";
        $stmtDetalle = $this->conn->prepare($queryDetalle);
        $stmtDetalle->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
        $stmtDetalle->execute();
        $VentaDetalle = $stmtDetalle->fetchAll(PDO::FETCH_ASSOC);
    
        // Asignar datos de la Venta si existen
        if ($Venta) {
            $this->fecha = $Venta['fecha'];
            $this->idCliente = $Venta['idCliente'];
            $this->monto = $Venta['monto'];
            $this->observaciones = $Venta['observaciones'] ?? null;
        }
    
        // Asignar detalles de la Venta (productos) si existen
        $this->productos = $VentaDetalle ?: [];
    }



    // ✅ Crear una Venta con múltiples productos en su detalle
    public function crearVentayDetalleVenta() {
        try {
            $this->conn->beginTransaction();
    
            // 📌 Si la fecha no está definida, se usa la actual
            if (empty($this->fecha)) {
                $this->fecha = date("Y-m-d H:i:s");
            }
    
            // 🔹 Insertar en la tabla Ventas
            $query = "INSERT INTO " . $this->table . " (fecha, idCliente, idTipoPago, monto, observaciones,idManejo) 
                      VALUES (:fecha, :idProveedor, :tipoPago, :monto, :observaciones, :idManejo)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":fecha", $this->fecha);
            $stmt->bindParam(":idProveedor", $this->idCliente);
            $stmt->bindParam(":tipoPago", $this->tipoPago);
            $stmt->bindParam(":monto", $this->monto);
            $stmt->bindParam(":observaciones", $this->observaciones);
            $stmt->bindParam(":idManejo", $this->manejoProducto);
            $stmt->execute();
            $idVenta = $this->conn->lastInsertId();
    
            // 🔹 Insertar los detalles de la Venta y actualizar stock
            $queryDetalle = "INSERT INTO " . $this->detalleTable . " (idVenta, idProducto, cantidad) 
                             VALUES (:idVenta, :idProducto, :cantidad)";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
    
            foreach ($this->productos as $producto) {
                $stmtDetalle->bindParam(":idVenta", $idVenta);
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
            error_log("Error en crearVenta: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["message" => "Error en la base de datos", "error" => $e->getMessage()]);
            return false;
        }
    }
    

    // ✅ Obtener todas las Ventas
    public function obtenerTodas() {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerVentaEspecifica() {
        $query = "SELECT 
                    c.idCliente AS Cliente, 
                    p.idProducto AS Producto, 
                    dv.cantidad AS Cantidad, 
                    p.precio AS Precio_Unitario, 
                    v.fecha AS Fecha, 
                    tp.idTipoPago AS Tipo_Pago, 
                    v.observaciones AS Observaciones, 
                    v.idManejo AS Manejo,
                    p.idCategoria AS TipoProducto
                  FROM ventas v 
                  JOIN detalleVentas dv ON v.idVenta = dv.idVenta 
                  JOIN productos p ON dv.idProducto = p.idProducto 
                  JOIN clientes c ON v.idCliente = c.idCliente 
                  JOIN tipospago tp ON v.idTipoPago = tp.idTipoPago
                  WHERE v.idVenta = :idVenta";
    
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':idVenta', $this->idVenta, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerTodasParalista() {
        $query = "
            SELECT 
                v.idVenta,
                c.nombreCliente AS cliente,
                tp.metodoPago AS tipoPago,
                p.nombreProducto AS producto,
                dv.cantidad,
                p.precio AS precio_unitario,
                v.monto,
                v.fecha,
                v.observaciones,
                mp.descripcion AS manejo
            FROM ventas v
            JOIN clientes c ON v.idCliente = c.idCliente
            JOIN tipospago tp ON v.idTipoPago = tp.idTipoPago
            JOIN detalleventas dv ON v.idVenta = dv.idVenta
            JOIN productos p ON dv.idProducto = p.idProducto
            JOIN manejoproducto mp ON v.idManejo = mp.idManejo
            ORDER BY v.fecha DESC
        ";
    
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function eliminarVentaSinAlterarStock() {
        try {
            $this->conn->beginTransaction();
    
            // Eliminar detalles de la Venta primero
            $queryDetalle = "DELETE FROM " . $this->detalleTable . " WHERE idVenta = :idVenta";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
            $stmtDetalle->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
            $stmtDetalle->execute();
    
            // Luego eliminar la Venta
            $query = "DELETE FROM " . $this->table . " WHERE idVenta = :idVenta";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
            $stmt->execute();
    
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }

    public function eliminarStockDisponible() {
        try {
            $query = "UPDATE productos SET stock = stock + :cantidadLote WHERE idProducto = :idProducto";
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
    


    public function eliminarVentaYalterarStock() {
        try {
            $this->conn->beginTransaction();
    
            // Primero actualizar el stock antes de eliminar los productos
            $this->eliminarStockDisponible();
    
            // Eliminar detalles de la Venta
            $queryDetalle = "DELETE FROM " . $this->detalleTable . " WHERE idVenta = :idVenta";
            $stmtDetalle = $this->conn->prepare($queryDetalle);
            $stmtDetalle->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
            $stmtDetalle->execute();
    
            // Luego eliminar la Venta
            $query = "DELETE FROM " . $this->table . " WHERE idVenta = :idVenta";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":idVenta", $this->idVenta, PDO::PARAM_INT);
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
