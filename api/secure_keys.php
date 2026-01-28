<?php
/**
 * SECURE KEYS CONFIGURATION
 * -------------------------
 * This file contains sensitive API keys and secrets.
 * It should be included by the backend, but NEVER exposed directly to the web.
 * 
 * Instructions:
 * 1. Replace the placeholders below with your actual API keys.
 * 2. Ensure this file is protected by .htaccess or placed outside the web root.
 */

// Prevent direct access
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    header('HTTP/1.0 403 Forbidden');
    exit('Direct access forbidden.');
}

// Set environment variables for the current request
// Uncomment and populate these lines if you are not using .htaccess or server environment variables
// putenv("VITE_API_KEY=YOUR_OPENAI_API_KEY");
// putenv("VITE_API_KEY_DEEPSEEK=YOUR_DEEPSEEK_API_KEY");
// putenv("VITE_API_KEY_GEMINI=YOUR_GEMINI_API_KEY");
// putenv("VITE_AES_SECRET_KEY=RohitGaradHos@173414"); // Used for encryption

// Firebase Config (if needed on backend)
// putenv("VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY");
?>
