# Server Setup Guide for Doc Writo

## Configuration Error Fix

If you're seeing "Configuration initialization failed. Please check your server setup", it means the server environment variables are not properly configured.

## Required Environment Variables

Your server needs these environment variables configured:

```
VITE_API_KEY=your_openai_api_key_here
VITE_API_KEY_DEEPSEEK=your_deepseek_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_AES_SECRET_KEY=your_aes_encryption_key_here
```

## Setup Methods

### Method 1: cPanel Environment Variables (Recommended)
1. Log into your hosting cPanel
2. Find "Environment Variables" or "PHP Variables"
3. Add each variable with its value
4. Save and restart if needed

### Method 2: .htaccess Environment Variables
Add to your `.htaccess` file in the root directory:
```apache
SetEnv VITE_API_KEY "your_openai_api_key_here"
SetEnv VITE_API_KEY_DEEPSEEK "your_deepseek_api_key_here"
SetEnv VITE_FIREBASE_API_KEY "your_firebase_api_key_here"
SetEnv VITE_AES_SECRET_KEY "your_aes_encryption_key_here"
```

### Method 3: PHP Configuration File
Create a `config_env.php` file in your root directory:
```php
<?php
// Set environment variables
$_ENV['VITE_API_KEY'] = 'your_openai_api_key_here';
$_ENV['VITE_API_KEY_DEEPSEEK'] = 'your_deepseek_api_key_here';
$_ENV['VITE_FIREBASE_API_KEY'] = 'your_firebase_api_key_here';
$_ENV['VITE_AES_SECRET_KEY'] = 'your_aes_encryption_key_here';
?>
```

Then include it at the top of `api/config.php`:
```php
require_once '../config_env.php';
```

## Testing the Configuration

After setting up environment variables:
1. Visit: `https://qa.docwrito.com/api/config`
2. You should see a JSON response with your configuration
3. If you see an error, check the missing_keys in the response

## Security Notes

- Never commit actual API keys to version control
- Use strong, unique keys for production
- Regularly rotate your API keys
- Monitor API usage for unusual activity

## Troubleshooting

### Error: "Configuration incomplete"
- Check that all 4 environment variables are set
- Ensure values are not empty strings
- Restart your web server after changes

### Error: "Access denied"
- Check that your browser sends a User-Agent header
- Ensure the request is coming from a legitimate browser

### Error: "Method not allowed"
- The endpoint only accepts GET requests
- Check your request method

## File Permissions

Ensure these files have proper permissions:
- `api/config.php` - 644 (readable by web server)
- `.htaccess` - 644 (readable by web server)
- Root directory - 755 (executable by web server)