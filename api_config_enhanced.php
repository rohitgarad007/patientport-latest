<?php
/**
 * Enhanced Secure Configuration Endpoint
 * Provides runtime configuration without exposing keys in JavaScript bundle
 * 
 * This file should be placed in your web server's public directory
 * and configured with proper environment variables
 */

// Try to load environment configuration file if it exists
if (file_exists('../config_env.php')) {
    require_once '../config_env.php';
}

// Set proper headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Security: Add basic request validation
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
if (empty($userAgent)) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    exit;
}

// Function to get environment variable with fallback
function getEnvVar($key, $default = '') {
    // Try $_ENV first
    if (isset($_ENV[$key]) && !empty($_ENV[$key])) {
        return $_ENV[$key];
    }
    
    // Try getenv()
    $value = getenv($key);
    if ($value !== false && !empty($value)) {
        return $value;
    }
    
    // Try $_SERVER
    if (isset($_SERVER[$key]) && !empty($_SERVER[$key])) {
        return $_SERVER[$key];
    }
    
    return $default;
}

// Load configuration from environment variables
$config = [
    'VITE_API_KEY' => getEnvVar('VITE_API_KEY'),
    'VITE_API_KEY_DEEPSEEK' => getEnvVar('VITE_API_KEY_DEEPSEEK'),
    'VITE_FIREBASE_API_KEY' => getEnvVar('VITE_FIREBASE_API_KEY'),
    'VITE_AES_SECRET_KEY' => getEnvVar('VITE_AES_SECRET_KEY')
];

// Validate that all required keys are present
$requiredKeys = ['VITE_API_KEY', 'VITE_API_KEY_DEEPSEEK', 'VITE_FIREBASE_API_KEY', 'VITE_AES_SECRET_KEY'];
$missingKeys = [];

foreach ($requiredKeys as $key) {
    if (empty($config[$key])) {
        $missingKeys[] = $key;
    }
}

// If any keys are missing, return detailed error with setup instructions
if (!empty($missingKeys)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Configuration initialization failed. Please check your server setup.',
        'missing_keys' => $missingKeys,
        'setup_instructions' => [
            'method_1' => 'Set environment variables in your hosting control panel',
            'method_2' => 'Add SetEnv directives to your .htaccess file',
            'method_3' => 'Create config_env.php file with your API keys',
            'documentation' => 'See SERVER_SETUP.md for detailed instructions'
        ],
        'debug_info' => [
            'config_file_exists' => file_exists('../config_env.php'),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'php_version' => PHP_VERSION
        ]
    ]);
    exit;
}

// Log access (optional, for monitoring)
error_log("Config accessed from IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));

// Return configuration
echo json_encode($config);
?>