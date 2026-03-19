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

## Notifications WebSocket Server (Production)

The doctor navbar live notifications use a small Node.js WebSocket server defined in [notifications-ws-server.mjs](file:///c:/xampp/htdocs/patientport-latest/notifications-ws-server.mjs).

In development you start it with:

```bash
npm run notifications:ws
```

In production you must run it as a separate always-on background process (PM2/systemd/Docker). Your PHP API publishes updates to this server using HTTP, and the doctor UI connects to it using WebSocket.

### Environment Variables (WebSocket Server)

Set these on the machine where you run the Node.js WebSocket server:

```
WS_NOTIFICATIONS_PORT=8081
WS_PUBLISH_SECRET=your_long_random_secret
```

### Environment Variables (PHP API Publisher)

Set these on the machine running the PHP API (CodeIgniter):

```
WS_NOTIFICATIONS_PUBLISH_URL=http://127.0.0.1:8081/publish
WS_PUBLISH_SECRET=your_long_random_secret
```

`WS_PUBLISH_SECRET` must match on both sides. The API sends it as `X-WS-SECRET` header and the server validates it.

### Frontend Build Variable (Doctor UI WebSocket URL)

At build time (Vite), set one of these so the frontend knows where to connect:

```
VITE_DOCTOR_NOTIFICATIONS_WS_URL=wss://YOUR_DOMAIN/ws
VITE_WS_NOTIFICATIONS_URL=wss://YOUR_DOMAIN/ws
```

If you do not set it, the frontend falls back to `ws(s)://<current-host>:8081/ws`.

### Recommended Setup (PM2 on Linux)

1. Install Node.js (LTS) and dependencies:
```bash
cd /path/to/patientport-latest
npm ci
```

2. Start the WebSocket server with PM2:
```bash
npm i -g pm2
pm2 start npm --name notifications-ws -- run notifications:ws
pm2 save
pm2 startup
```

3. Verify it is listening:
```bash
pm2 logs notifications-ws
```

### Nginx Reverse Proxy (HTTPS + WebSocket)

If you want to expose it on standard HTTPS/WSS (recommended), proxy `/ws` and `/publish` to the Node process:

```nginx
location /ws {
  proxy_pass http://127.0.0.1:8081/ws;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
}

location /publish {
  proxy_pass http://127.0.0.1:8081/publish;
  proxy_set_header Host $host;
}
```

Then set:
- `VITE_DOCTOR_NOTIFICATIONS_WS_URL=wss://YOUR_DOMAIN/ws`
- `WS_NOTIFICATIONS_PUBLISH_URL=http://127.0.0.1:8081/publish` (or `http://YOUR_DOMAIN/publish` if you prefer)

### Scaling Note

This WebSocket server keeps connected doctor sessions in memory. For multiple server instances behind a load balancer, you must use sticky sessions or implement a shared pub/sub layer (example: Redis) so publishes reach the same instance where the doctor is connected. The simplest production setup is running a single WebSocket server instance.

### GoDaddy Hosting Notes

GoDaddy hosting can mean different products, and the WebSocket server requirement depends on which one you use:

#### GoDaddy Shared Hosting (cPanel) / Web Hosting

Shared hosting usually does not allow running an always-on Node.js process (no systemd/PM2, no long-running background server). In that case you cannot host `notifications-ws-server.mjs` on the same shared hosting plan.

Use one of these supported approaches:

- Option A (Recommended): Run the WebSocket server on a GoDaddy VPS / Dedicated Server.
- Option B: Run the WebSocket server on a separate Node hosting provider (Render/Railway/Fly/EC2/etc.) and point your PHP API + frontend to it.

#### GoDaddy VPS / Dedicated Server (Linux) (Recommended)

1. SSH into the server and install Node.js (LTS).
2. Upload the project (or at minimum `notifications-ws-server.mjs` and `package.json`).
3. Install dependencies and start with PM2:
```bash
cd /path/to/patientport-latest
npm ci
npm i -g pm2
pm2 start npm --name notifications-ws -- run notifications:ws
pm2 save
pm2 startup
```

4. Set server environment variables:
```
WS_NOTIFICATIONS_PORT=8081
WS_PUBLISH_SECRET=your_long_random_secret
```

5. Set PHP API publisher variables (in your PHP environment):
```
WS_NOTIFICATIONS_PUBLISH_URL=http://127.0.0.1:8081/publish
WS_PUBLISH_SECRET=your_long_random_secret
```

6. If you use Nginx/Apache as reverse proxy with HTTPS, proxy `/ws` and `/publish` to the Node process and set:
```
VITE_DOCTOR_NOTIFICATIONS_WS_URL=wss://YOUR_DOMAIN/ws
```

#### Separate Node Hosting (Works with GoDaddy Shared Hosting)

If your PHP site is on GoDaddy shared hosting, host the WebSocket server somewhere else and configure URLs:

1. Deploy `notifications-ws-server.mjs` to a Node hosting provider.
2. On that Node host set:
```
WS_NOTIFICATIONS_PORT=8081
WS_PUBLISH_SECRET=your_long_random_secret
```

3. In your GoDaddy PHP environment set:
```
WS_NOTIFICATIONS_PUBLISH_URL=https://YOUR_NODE_HOST/publish
WS_PUBLISH_SECRET=your_long_random_secret
```

4. In your frontend build set:
```
VITE_DOCTOR_NOTIFICATIONS_WS_URL=wss://YOUR_NODE_HOST/ws
```

This makes the doctor UI connect to the external WebSocket server, while the PHP API publishes notifications to that same external server.

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
