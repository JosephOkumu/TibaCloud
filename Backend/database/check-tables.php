<?php

// Get database configuration from .env
$dbConnection = 'mysql';
$dbHost = '127.0.0.1';
$dbPort = '3306';
$dbDatabase = 'afya_mawinguni';
$dbUsername = 'root';
$dbPassword = 'Fyaman42';

try {
    // Connect to the database
    $pdo = new PDO(
        "{$dbConnection}:host={$dbHost};port={$dbPort};dbname={$dbDatabase}",
        $dbUsername,
        $dbPassword
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get all tables
    $stmt = $pdo->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "Tables in database ({$dbDatabase}):\n";
    echo "--------------------------------\n";
    foreach ($tables as $table) {
        echo "- {$table}\n";
    }
    echo "\nTotal tables: " . count($tables) . "\n";

    // Check for potential duplicates (tables with similar names)
    $tablesToCheck = [
        'pharmacies',
        'users',
        'personal_access_tokens'
    ];

    echo "\nChecking for potential duplicates...\n";
    echo "--------------------------------\n";
    foreach ($tablesToCheck as $baseTable) {
        $similarTables = [];
        foreach ($tables as $table) {
            if (strpos($table, $baseTable) !== false && $table !== $baseTable) {
                $similarTables[] = $table;
            }
        }
        
        echo "Tables similar to '{$baseTable}': ";
        if (count($similarTables) > 0) {
            echo "\n- " . implode("\n- ", $similarTables) . "\n";
        } else {
            echo "None found\n";
        }
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
