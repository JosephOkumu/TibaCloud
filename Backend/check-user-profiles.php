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

    // Check if the user_profiles table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'user_profiles'");
    $tableExists = $stmt->rowCount() > 0;

    echo "user_profiles table exists: " . ($tableExists ? "Yes\n" : "No\n");

    if (!$tableExists) {
        // Create the user_profiles table
        echo "Creating user_profiles table...\n";
        
        $sql = "CREATE TABLE user_profiles (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            address TEXT NULL,
            city VARCHAR(100) NULL,
            state VARCHAR(100) NULL,
            country VARCHAR(100) NULL DEFAULT 'Kenya',
            profile_image VARCHAR(255) NULL,
            bio TEXT NULL,
            date_of_birth DATE NULL,
            gender VARCHAR(20) NULL,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        
        $pdo->exec($sql);
        
        echo "user_profiles table created successfully!\n";
    }

    // Let's also check if is_active column exists in users table
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "\nChecking columns in users table:\n";
    foreach ($columns as $column) {
        echo "- " . $column . "\n";
    }
    
    $hasIsActive = in_array('is_active', $columns);
    $hasUserTypeId = in_array('user_type_id', $columns);
    $hasPhoneNumber = in_array('phone_number', $columns);
    
    echo "\nis_active column exists: " . ($hasIsActive ? "Yes\n" : "No\n");
    echo "user_type_id column exists: " . ($hasUserTypeId ? "Yes\n" : "No\n");
    echo "phone_number column exists: " . ($hasPhoneNumber ? "Yes\n" : "No\n");
    
    // Add missing columns if needed
    if (!$hasIsActive) {
        echo "Adding is_active column to users table...\n";
        $pdo->exec("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
        echo "is_active column added successfully!\n";
    }
    
    if (!$hasUserTypeId) {
        echo "Adding user_type_id column to users table...\n";
        $pdo->exec("ALTER TABLE users ADD COLUMN user_type_id BIGINT UNSIGNED NULL");
        $pdo->exec("ALTER TABLE users ADD CONSTRAINT fk_user_type FOREIGN KEY (user_type_id) REFERENCES user_types(id)");
        echo "user_type_id column added successfully!\n";
    }
    
    if (!$hasPhoneNumber) {
        echo "Adding phone_number column to users table...\n";
        $pdo->exec("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL");
        echo "phone_number column added successfully!\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
