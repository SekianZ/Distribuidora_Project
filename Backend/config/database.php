<?php
require_once __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        $this->host = $_ENV['DATABASE_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DATABASE_NAME'] ?? 'nombre_de_tu_base_de_datos';
        $this->username = $_ENV['DATABASE_USER'] ?? 'root';
        $this->password = $_ENV['DATABASE_PASSWORD'] ?? '';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $exception) {
            echo "❌ Error de conexión: " . $exception->getMessage();
        }
        return $this->conn;
    }

    public function probarConexion() {
        $this->conn = $this->getConnection();
        return $this->conn !== null;
    }
}
?>
