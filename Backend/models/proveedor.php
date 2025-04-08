<?php
class Proveedor
{
    private $conn;
    private $table = "proveedores";

    public $idProveedor;
    public $nombreProveedor;
    public $ruc;
    public $telefono;
    public $Nombrerepresentante;
    public $productos;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // 📌 3. Crear proveedor con productos asociados
    // Función para crear proveedor con productos

    public function obtenerProveedorconProductos()
    {
        $query = "SELECT 
        p.idProveedor, p.nombreProveedor, p.ruc, p.telefono, p.nombreRepresentante,
        pr.idProducto, pr.nombreProducto, pr.precio
    FROM proveedores p
    LEFT JOIN proveedor_productos pp ON p.idProveedor = pp.idProveedor
    LEFT JOIN productos pr ON pp.idProducto = pr.idProducto
    ORDER BY p.idProveedor, pr.idProducto;";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $proveedores = [];

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $idProveedor = $row['idProveedor'];

            if (!isset($proveedores[$idProveedor])) {
                // Inicializar el proveedor si no está registrado aún
                $proveedores[$idProveedor] = [
                    'idProveedor' => $row['idProveedor'],
                    'nombreProveedor' => $row['nombreProveedor'],
                    'ruc' => $row['ruc'],
                    'telefono' => $row['telefono'],
                    'nombreRepresentante' => $row['nombreRepresentante'],
                    'productos' => [] // Array vacío para productos
                ];
            }

            // Agregar productos si existen
            if (!empty($row['idProducto'])) {
                $proveedores[$idProveedor]['productos'][] = [
                    'idProducto' => $row['idProducto'],
                    'nombreProducto' => $row['nombreProducto'],
                    'precioUnitario' => $row['precio'] // ✅ Agregar el precio
                ];
            }
        }

        // Convertir el array asociativo en un array indexado
        return array_values($proveedores);
    }
    public function crearProveedorConProductos()
    {
        // Iniciar la transacción
        $this->conn->beginTransaction();

        try {
            // Insertar los datos del proveedor
            $queryProveedor = "INSERT INTO proveedores (nombreProveedor, RUC, telefono, nombreRepresentante) VALUES (:nombre, :ruc, :telefono, :representante)";
            $stmtProveedor = $this->conn->prepare($queryProveedor);
            $stmtProveedor->bindValue(':nombre', $this->nombreProveedor);
            $stmtProveedor->bindValue(':ruc', $this->ruc);
            $stmtProveedor->bindValue(':telefono', $this->telefono);
            $stmtProveedor->bindValue(':representante', $this->Nombrerepresentante);

            // 📌 Verificar si la inserción del proveedor fue exitosa
            if (!$stmtProveedor->execute()) {
                throw new Exception("Error al insertar proveedor.");
            }

            // Obtener el ID del proveedor insertado
            $proveedorId = $this->conn->lastInsertId();

            // 📌 Insertar la relación entre proveedor y productos (si hay productos)
            if (!empty($this->productos)) {
                $queryProductos = "INSERT INTO proveedor_productos (idProveedor, idProducto) VALUES (:proveedor_id, :producto_id)";
                $stmtProductos = $this->conn->prepare($queryProductos);

                // Insertar cada producto
                foreach ($this->productos as $productoId) {
                    $stmtProductos->bindValue(':proveedor_id', $proveedorId);
                    $stmtProductos->bindValue(':producto_id', $productoId);

                    if (!$stmtProductos->execute()) {
                        throw new Exception("Error al insertar relación proveedor-producto.");
                    }
                }
            }

            // Confirmar los cambios
            $this->conn->commit();

            return ["success" => true, "message" => "Proveedor y productos registrados correctamente"];
        } catch (Exception $e) {
            // Si ocurre un error, revertir los cambios
            $this->conn->rollBack();
            error_log("Error en crearProveedorConProductos: " . $e->getMessage());
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    public function obtenerTodosParalista() {
        $query = "SELECT 
                    p.idProveedor,
                    p.nombreProveedor,
                    p.RUC,
                    p.telefono,
                    p.correo,
                    p.nombreRepresentante,
                    c.nombreCategoria AS categoria,
                    GROUP_CONCAT(pr.nombreProducto SEPARATOR ', ') AS productos
                  FROM proveedores p
                  JOIN proveedor_productos pp ON p.idProveedor = pp.idProveedor
                  JOIN productos pr ON pp.idProducto = pr.idProducto
                  JOIN categorias c ON pr.idCategoria = c.idCategoria
                  GROUP BY p.idProveedor, c.nombreCategoria";
    
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    
        // Retorna todos los datos como array asociativo
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    public function obtenerTodos()
    {
        $query = "SELECT * FROM " . $this->table;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
