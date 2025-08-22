<?php
// Script to check if user registration details are saved in the database

// Database connection parameters (using the same as Laravel)
require_once __DIR__ . '/vendor/autoload.php';

// Load .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Get database connection details from .env
$host = $_ENV['DB_HOST'];
$database = $_ENV['DB_DATABASE'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];

echo "Connecting to database: $database on $host as $username\n";

try {
    // Create PDO connection
    $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    echo "Connection successful!\n\n";
    
    // Query to get users with their user types
    $query = "
        SELECT u.id, u.name, u.email, u.phone_number, u.license_number, u.national_id, ut.name as user_type, u.created_at
        FROM users u
        JOIN user_types ut ON u.user_type_id = ut.id
        ORDER BY u.id DESC
    ";
    
    $stmt = $pdo->query($query);
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo "Found " . count($users) . " registered users:\n\n";
        
        // Display user details
        foreach ($users as $user) {
            echo "ID: " . $user['id'] . "\n";
            echo "Name: " . $user['name'] . "\n";
            echo "Email: " . $user['email'] . "\n";
            echo "Phone: " . $user['phone_number'] . "\n";
            echo "User Type: " . $user['user_type'] . "\n";
            
            // Only show verification details for providers
            if (in_array($user['user_type'], ['doctor', 'laboratory', 'nursing', 'pharmacy'])) {
                echo "License Number: " . $user['license_number'] . "\n";
                echo "National ID: " . $user['national_id'] . "\n";
            }
            
            echo "Registered on: " . $user['created_at'] . "\n";
            echo "-------------------------------------\n";
        }
    } else {
        echo "No users found in the database.\n";
    }
    
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage() . "\n";
}
