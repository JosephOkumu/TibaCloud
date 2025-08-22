/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.1-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: AfyaMawinguni001
-- ------------------------------------------------------
-- Server version	11.8.1-MariaDB-4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `doctor_id` bigint(20) unsigned NOT NULL,
  `appointment_datetime` datetime NOT NULL,
  `status` enum('scheduled','completed','cancelled','rescheduled','no_show') NOT NULL DEFAULT 'scheduled',
  `type` enum('in_person','virtual') NOT NULL DEFAULT 'in_person',
  `reason_for_visit` text DEFAULT NULL,
  `symptoms` text DEFAULT NULL,
  `doctor_notes` text DEFAULT NULL,
  `prescription` text DEFAULT NULL,
  `meeting_link` varchar(255) DEFAULT NULL,
  `fee` decimal(10,2) NOT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointments_patient_id_foreign` (`patient_id`),
  KEY `appointments_doctor_id_foreign` (`doctor_id`),
  KEY `appointments_appointment_datetime_index` (`appointment_datetime`),
  KEY `appointments_status_index` (`status`),
  CONSTRAINT `appointments_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `specialty` varchar(255) NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `qualifications` text NOT NULL,
  `education` text DEFAULT NULL,
  `experience` text DEFAULT NULL,
  `consultation_fee` decimal(10,2) NOT NULL,
  `availability` text DEFAULT NULL,
  `is_available_for_consultation` tinyint(1) NOT NULL DEFAULT 1,
  `average_rating` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `doctors_license_number_unique` (`license_number`),
  KEY `doctors_user_id_foreign` (`user_id`),
  CONSTRAINT `doctors_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `lab_providers`
--

DROP TABLE IF EXISTS `lab_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_providers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `lab_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `certifications` text DEFAULT NULL,
  `services_offered` text NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `operating_hours` text DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(255) NOT NULL,
  `offers_home_sample_collection` tinyint(1) NOT NULL DEFAULT 0,
  `home_collection_fee` decimal(10,2) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `average_rating` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lab_providers_license_number_unique` (`license_number`),
  KEY `lab_providers_user_id_foreign` (`user_id`),
  CONSTRAINT `lab_providers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_providers`
--

LOCK TABLES `lab_providers` WRITE;
/*!40000 ALTER TABLE `lab_providers` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `lab_providers` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `lab_provider_id` bigint(20) unsigned NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `test_description` text DEFAULT NULL,
  `test_price` decimal(10,2) NOT NULL,
  `scheduled_datetime` datetime NOT NULL,
  `sample_collection_mode` enum('lab_visit','home_collection') NOT NULL DEFAULT 'lab_visit',
  `sample_collection_address` text DEFAULT NULL,
  `status` enum('scheduled','sample_collected','processing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `results` text DEFAULT NULL,
  `results_available_at` datetime DEFAULT NULL,
  `doctor_referral` text DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lab_tests_patient_id_foreign` (`patient_id`),
  KEY `lab_tests_lab_provider_id_foreign` (`lab_provider_id`),
  KEY `lab_tests_scheduled_datetime_index` (`scheduled_datetime`),
  KEY `lab_tests_status_index` (`status`),
  CONSTRAINT `lab_tests_lab_provider_id_foreign` FOREIGN KEY (`lab_provider_id`) REFERENCES `lab_providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_tests_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `medicine_order_items`
--

DROP TABLE IF EXISTS `medicine_order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `medicine_id` bigint(20) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `special_instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medicine_order_items_medicine_id_foreign` (`medicine_id`),
  KEY `medicine_order_items_order_id_medicine_id_index` (`order_id`,`medicine_id`),
  CONSTRAINT `medicine_order_items_medicine_id_foreign` FOREIGN KEY (`medicine_id`) REFERENCES `medicines` (`id`),
  CONSTRAINT `medicine_order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `medicine_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_order_items`
--

LOCK TABLES `medicine_order_items` WRITE;
/*!40000 ALTER TABLE `medicine_order_items` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `medicine_order_items` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `medicine_orders`
--

DROP TABLE IF EXISTS `medicine_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicine_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `pharmacy_id` bigint(20) unsigned NOT NULL,
  `order_number` varchar(255) NOT NULL,
  `status` enum('pending','processing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `delivery_address` text NOT NULL,
  `delivery_contact_number` varchar(255) NOT NULL,
  `delivery_instructions` text DEFAULT NULL,
  `is_prescription_required` tinyint(1) NOT NULL DEFAULT 0,
  `prescription_image` varchar(255) DEFAULT NULL,
  `delivery_datetime` datetime DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `medicine_orders_order_number_unique` (`order_number`),
  KEY `medicine_orders_patient_id_foreign` (`patient_id`),
  KEY `medicine_orders_pharmacy_id_foreign` (`pharmacy_id`),
  KEY `medicine_orders_order_number_index` (`order_number`),
  KEY `medicine_orders_status_index` (`status`),
  KEY `medicine_orders_created_at_index` (`created_at`),
  CONSTRAINT `medicine_orders_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medicine_orders_pharmacy_id_foreign` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicine_orders`
--

LOCK TABLES `medicine_orders` WRITE;
/*!40000 ALTER TABLE `medicine_orders` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `medicine_orders` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `medicines`
--

DROP TABLE IF EXISTS `medicines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicines` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `pharmacy_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `generic_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `dosage_form` varchar(255) NOT NULL,
  `strength` varchar(255) DEFAULT NULL,
  `requires_prescription` tinyint(1) NOT NULL DEFAULT 0,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image` varchar(255) DEFAULT NULL,
  `side_effects` text DEFAULT NULL,
  `contraindications` text DEFAULT NULL,
  `storage_instructions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `medicines_pharmacy_id_foreign` (`pharmacy_id`),
  KEY `medicines_name_index` (`name`),
  KEY `medicines_category_index` (`category`),
  KEY `medicines_is_available_index` (`is_available`),
  CONSTRAINT `medicines_pharmacy_id_foreign` FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicines`
--

LOCK TABLES `medicines` WRITE;
/*!40000 ALTER TABLE `medicines` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `medicines` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `migrations` VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2025_05_22_175609_create_users_table',1),
(5,'2025_05_22_175610_create_user_types_table',1),
(6,'2025_05_22_175611_create_user_profiles_table',1),
(7,'2025_05_22_175629_create_doctors_table',1),
(8,'2025_05_22_175630_create_lab_providers_table',1),
(9,'2025_05_22_175630_create_nursing_providers_table',1),
(10,'2025_05_22_175631_create_pharmacies_table',1),
(11,'2025_05_22_175656_create_appointments_table',1),
(12,'2025_05_22_175657_create_lab_tests_table',1),
(13,'2025_05_22_175657_create_nursing_services_table',1),
(14,'2025_05_22_175701_create_medicines_table',1),
(15,'2025_05_22_175721_create_medicine_orders_table',1),
(16,'2025_05_22_175722_create_payments_table',1),
(17,'2025_05_22_175722_create_reviews_table',1),
(18,'2025_05_22_185528_create_medicine_order_items_table',1),
(19,'2025_05_22_210713_create_pharmacies_table',1),
(20,'2025_05_23_054300_create_personal_access_tokens_table',1),
(21,'2025_05_23_054500_ensure_pharmacy_table',1),
(22,'2025_05_23_110000_create_user_types_table',1),
(23,'2025_05_23_110001_create_user_profiles_table',1),
(24,'2025_05_23_120000_add_verification_fields_to_users_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `nursing_providers`
--

DROP TABLE IF EXISTS `nursing_providers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nursing_providers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `provider_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `qualifications` text NOT NULL,
  `services_offered` text NOT NULL,
  `service_areas` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `base_rate_per_hour` decimal(10,2) NOT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `average_rating` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nursing_providers_license_number_unique` (`license_number`),
  KEY `nursing_providers_user_id_foreign` (`user_id`),
  CONSTRAINT `nursing_providers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nursing_providers`
--

LOCK TABLES `nursing_providers` WRITE;
/*!40000 ALTER TABLE `nursing_providers` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `nursing_providers` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `nursing_services`
--

DROP TABLE IF EXISTS `nursing_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nursing_services` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `patient_id` bigint(20) unsigned NOT NULL,
  `nursing_provider_id` bigint(20) unsigned NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_description` text DEFAULT NULL,
  `service_price` decimal(10,2) NOT NULL,
  `scheduled_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `patient_address` text NOT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  `care_notes` text DEFAULT NULL,
  `patient_requirements` text DEFAULT NULL,
  `medical_history` text DEFAULT NULL,
  `doctor_referral` text DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `recurrence_pattern` varchar(255) DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nursing_services_patient_id_foreign` (`patient_id`),
  KEY `nursing_services_nursing_provider_id_foreign` (`nursing_provider_id`),
  KEY `nursing_services_scheduled_datetime_index` (`scheduled_datetime`),
  KEY `nursing_services_status_index` (`status`),
  CONSTRAINT `nursing_services_nursing_provider_id_foreign` FOREIGN KEY (`nursing_provider_id`) REFERENCES `nursing_providers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `nursing_services_patient_id_foreign` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nursing_services`
--

LOCK TABLES `nursing_services` WRITE;
/*!40000 ALTER TABLE `nursing_services` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `nursing_services` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `payable_type` varchar(255) NOT NULL,
  `payable_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_method` enum('card','mobile_money','bank_transfer','cash') NOT NULL DEFAULT 'mobile_money',
  `transaction_reference` varchar(255) DEFAULT NULL,
  `payment_details` text DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_payment_id_unique` (`payment_id`),
  KEY `payments_user_id_foreign` (`user_id`),
  KEY `payments_payable_type_payable_id_index` (`payable_type`,`payable_id`),
  KEY `payments_payment_id_index` (`payment_id`),
  KEY `payments_status_index` (`status`),
  KEY `payments_paid_at_index` (`paid_at`),
  CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `personal_access_tokens` VALUES
(1,'App\\Models\\User',1,'auth_token','caad6da4c5d70d86457b1e1e0bc15ebfad43788493a7bb16dda5194b6db92f20','[\"*\"]',NULL,NULL,'2025-06-10 12:38:01','2025-06-10 12:38:01'),
(2,'App\\Models\\User',2,'auth_token','edfe55094411b4f30c6bb7c9bf3673f1ed9053f7def4efc50d566dfbf6310910','[\"*\"]',NULL,NULL,'2025-06-10 12:45:55','2025-06-10 12:45:55'),
(3,'App\\Models\\User',3,'auth_token','96ef2772bde26458ad36751e03fb107abf50b2e09d6efc4dd890a05fc1d9d17f','[\"*\"]',NULL,NULL,'2025-06-10 12:47:41','2025-06-10 12:47:41'),
(4,'App\\Models\\User',4,'auth_token','b309b549e445f4a00c6560c104071499c55d178ed8aebcf0bbc12266b6c06070','[\"*\"]',NULL,NULL,'2025-06-12 18:21:54','2025-06-12 18:21:54'),
(5,'App\\Models\\User',5,'auth_token','0ae36db3da7f5eece888d03b53bceefefe73b7cbd28bdbf9be11469689154bcb','[\"*\"]',NULL,NULL,'2025-06-12 18:33:14','2025-06-12 18:33:14'),
(6,'App\\Models\\User',2,'auth_token','1542e6fac1b0c63e23467f67f911d74fc409d53f18efdca7e3d816292e814206','[\"*\"]',NULL,NULL,'2025-06-12 20:31:43','2025-06-12 20:31:43'),
(7,'App\\Models\\User',6,'auth_token','03c5b0436936f46353b553837aef4b8d91a70fd674bd357057796417f0765937','[\"*\"]',NULL,NULL,'2025-06-13 01:46:10','2025-06-13 01:46:10'),
(8,'App\\Models\\User',2,'auth_token','5228148c5a64bfe15e69cbe9e57936987b7eeea56100af17b284004474b73364','[\"*\"]',NULL,NULL,'2025-06-13 22:31:51','2025-06-13 22:31:51'),
(9,'App\\Models\\User',4,'auth_token','9e5deee88352220c60fbb24c1dcb7049d1971995c7318e102abe312d5ad63ad7','[\"*\"]',NULL,NULL,'2025-06-13 22:32:48','2025-06-13 22:32:48'),
(10,'App\\Models\\User',7,'auth_token','f637ab7cd5c75bb2b871a0ab5696b7bb304d90c9a244ddca3baee016320d9875','[\"*\"]',NULL,NULL,'2025-06-13 22:34:37','2025-06-13 22:34:37'),
(11,'App\\Models\\User',7,'auth_token','c4d4debdca23b8645397a286bf36f33bba79309e405e29be1e7bbfc61d4fb12b','[\"*\"]',NULL,NULL,'2025-06-14 01:48:08','2025-06-14 01:48:08'),
(12,'App\\Models\\User',2,'auth_token','27c5595727c34f17de02612e3ae3ab5129508de25e5d6d1c2cc6cc4a325a525d','[\"*\"]',NULL,NULL,'2025-06-14 01:48:38','2025-06-14 01:48:38'),
(13,'App\\Models\\User',4,'auth_token','8c011c00fc6b4c5c969db8e8605bbf09bb272a94b3f97cf29de0f008137aa72e','[\"*\"]',NULL,NULL,'2025-06-14 01:49:02','2025-06-14 01:49:02');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `pharmacies`
--

DROP TABLE IF EXISTS `pharmacies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pharmacies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `pharmacy_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `operating_hours` text DEFAULT NULL,
  `address` text NOT NULL,
  `city` varchar(255) NOT NULL,
  `offers_delivery` tinyint(1) NOT NULL DEFAULT 0,
  `delivery_fee` decimal(10,2) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `average_rating` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pharmacies_license_number_unique` (`license_number`),
  KEY `pharmacies_user_id_foreign` (`user_id`),
  CONSTRAINT `pharmacies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pharmacies`
--

LOCK TABLES `pharmacies` WRITE;
/*!40000 ALTER TABLE `pharmacies` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `pharmacies` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `reviewable_type` varchar(255) NOT NULL,
  `reviewable_id` bigint(20) unsigned NOT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `comment` text DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `service_reference` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_reviewable_type_reviewable_id_index` (`reviewable_type`,`reviewable_id`),
  KEY `reviews_rating_index` (`rating`),
  KEY `reviews_created_at_index` (`created_at`),
  KEY `reviews_user_id_reviewable_type_reviewable_id_index` (`user_id`,`reviewable_type`,`reviewable_id`),
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
set autocommit=0;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_profiles_user_id_foreign` (`user_id`),
  CONSTRAINT `user_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_profiles` VALUES
(1,1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-10 12:38:01','2025-06-10 12:38:01'),
(2,2,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-10 12:45:55','2025-06-10 12:45:55'),
(3,3,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-10 12:47:41','2025-06-10 12:47:41'),
(4,4,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-12 18:21:54','2025-06-12 18:21:54'),
(5,5,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-12 18:33:14','2025-06-12 18:33:14'),
(6,6,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-13 01:46:10','2025-06-13 01:46:10'),
(7,7,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2025-06-13 22:34:37','2025-06-13 22:34:37');
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `user_types`
--

DROP TABLE IF EXISTS `user_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_types` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_types`
--

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `user_types` VALUES
(1,'patient','',NULL,'2025-06-10 15:37:31','2025-06-10 15:37:31'),
(2,'doctor','',NULL,'2025-06-10 15:37:31','2025-06-10 15:37:31'),
(3,'nursing','',NULL,'2025-06-10 15:37:31','2025-06-10 15:37:31'),
(4,'laboratory','',NULL,'2025-06-10 15:37:31','2025-06-10 15:37:31'),
(5,'pharmacy','',NULL,'2025-06-10 15:37:31','2025-06-10 15:37:31');
/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;
commit;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `license_number` varchar(255) DEFAULT NULL,
  `national_id` varchar(255) DEFAULT NULL,
  `user_type_id` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
set autocommit=0;
INSERT INTO `users` VALUES
(1,'fred','fred@gmail.com',NULL,'$2y$12$VyJPXe0y.XtLePVQVGsDLOcXCLUIk8kT5zjN7Q9Y9/M/cscm9wG6i','8373920202','3333333','1223442',2,1,NULL,'2025-06-10 12:38:01','2025-06-10 12:38:01'),
(2,'lab001','lab001@gmail.com',NULL,'$2y$12$HBkUQXWb.gaaTzbZ23IXauiuiO3KXvGPhi1C7cp7HH6bd5QJayNI6','837493202','53938393','2332222',4,1,NULL,'2025-06-10 12:45:55','2025-06-10 12:45:55'),
(3,'joseph','joseph@gmail.com',NULL,'$2y$12$aWkasPOp/VJZWdPh65MWweopM3Ndhg0s9weZ1oLu4p/QLdu5AAPfC','4329849383',NULL,NULL,1,1,NULL,'2025-06-10 12:47:41','2025-06-10 12:47:41'),
(4,'Nurse001','nurse001@gmail.com',NULL,'$2y$12$YTWCUpI6dxdJEyK7CM8wpu1/8YrACDbycJ0D/ly.43QyPGs.lZ/PW','7383739393','487583','33231',3,1,NULL,'2025-06-12 18:21:54','2025-06-12 18:21:54'),
(5,'Doctor001','doctor001@gmail.com',NULL,'$2y$12$xwGq44zf0ITFuG1P1OZ2vOcqkgmiJ9fOMR9YO35R0yYhNsQfvsvv.','9876222','45643','344',2,1,NULL,'2025-06-12 18:33:14','2025-06-12 18:33:14'),
(6,'lab009','lab009@gmail.com',NULL,'$2y$12$9qXkMmBg3GH63clcabO5Se0ObE5l1hZF5eHrH9CF9Ix8E4Tee1BEW','8377387229','82378232','738997398',2,1,NULL,'2025-06-13 01:46:10','2025-06-13 01:46:10'),
(7,'doc001','doc001@gmail.com',NULL,'$2y$12$XKmWJ86JYocH9QIi0moYcO/GNQKeSCn1bSSNxqhQ04Kl93k4VUT0e','837338393','45532','2332',2,1,NULL,'2025-06-13 22:34:37','2025-06-13 22:34:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
commit;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-06-14 12:27:59
