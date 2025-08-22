<?php

// Connect to the database
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

    // Check if the user_types table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_types'");
    $tableExists = $stmt->rowCount() > 0;

    echo "user_types table exists: " . ($tableExists ? "Yes\n" : "No\n");

    if ($tableExists) {
        // Check if there are any records in the user_types table
        $stmt = $pdo->query("SELECT * FROM user_types");
        $types = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "Number of user types: " . count($types) . "\n";

        if (count($types) > 0) {
            echo "Available user types:\n";
            foreach ($types as $type) {
                echo "- ID: " . $type['id'] . ", Name: " . $type['name'] . "\n";
            }
        } else {
            echo "No user types found in the table.\n";
            
            // Let's seed the user_types table with the necessary data
            echo "\nSeeding user_types table with required data...\n";
            
            $userTypes = [
                ['name' => 'patient', 'display_name' => 'Patient'],
                ['name' => 'doctor', 'display_name' => 'Doctor'],
                ['name' => 'nursing', 'display_name' => 'Nursing Provider'],
                ['name' => 'laboratory', 'display_name' => 'Laboratory'],
                ['name' => 'pharmacy', 'display_name' => 'Pharmacy']
            ];
            
            $stmt = $pdo->prepare("INSERT INTO user_types (name, display_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
            
            foreach ($userTypes as $type) {
                $stmt->execute([$type['name'], $type['display_name']]);
                echo "Added user type: " . $type['name'] . "\n";
            }
            
            echo "User types added successfully!\n";
        }
    } else {
        // Create the user_types table
        echo "Creating user_types table...\n";
        
        $sql = "CREATE TABLE user_types (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            display_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        )";
        
        $pdo->exec($sql);
        
        echo "user_types table created successfully!\n";
        
        // Seed the table with data
        echo "Seeding user_types table with required data...\n";
        
        $userTypes = [
            ['name' => 'patient', 'display_name' => 'Patient'],
            ['name' => 'doctor', 'display_name' => 'Doctor'],
            ['name' => 'nursing', 'display_name' => 'Nursing Provider'],
            ['name' => 'laboratory', 'display_name' => 'Laboratory'],
            ['name' => 'pharmacy', 'display_name' => 'Pharmacy']
        ];
        
        $stmt = $pdo->prepare("INSERT INTO user_types (name, display_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
        
        foreach ($userTypes as $type) {
            $stmt->execute([$type['name'], $type['display_name']]);
            echo "Added user type: " . $type['name'] . "\n";
        }
        
        echo "User types added successfully!\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
