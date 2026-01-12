<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Receipt Access</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f3f4f6; margin: 0; }
        .card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; }
        .title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; text-align: center; color: #111827; }
        .input-group { margin-bottom: 1rem; }
        input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-sizing: border-box; }
        button { width: 100%; background-color: #2563eb; color: white; padding: 0.5rem; border: none; border-radius: 0.375rem; cursor: pointer; font-weight: 500; }
        button:hover { background-color: #1d4ed8; }
        .error { color: #dc2626; font-size: 0.875rem; margin-top: 0.5rem; text-align: center; display: none; }
    </style>
</head>
<body>
    <div class="card">
        <div class="title">Protected Document</div>
        <p style="text-align: center; color: #6b7280; margin-bottom: 1.5rem; font-size: 0.875rem;">Please enter the password to view this receipt.</p>
        <form id="accessForm">
            <div class="input-group">
                <input type="password" id="password" placeholder="Enter Password" required>
            </div>
            <button type="submit">View Receipt</button>
            <div id="errorMsg" class="error"></div>
        </form>
    </div>

    <script>
        document.getElementById('accessForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMsg');
            const btn = this.querySelector('button');
            
            btn.disabled = true;
            btn.textContent = 'Verifying...';
            errorDiv.style.display = 'none';

            fetch('<?php echo base_url("shared/receipt/verify"); ?>', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'token=<?php echo $token; ?>&password=' + encodeURIComponent(password)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = data.download_url;
                } else {
                    errorDiv.textContent = data.message;
                    errorDiv.style.display = 'block';
                    btn.disabled = false;
                    btn.textContent = 'View Receipt';
                }
            })
            .catch(err => {
                errorDiv.textContent = 'An error occurred. Please try again.';
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'View Receipt';
            });
        });
    </script>
</body>
</html>
