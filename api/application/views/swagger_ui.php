<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.css" />
    <link rel="icon" type="image/png" href="<?php echo base_url('assets/images/hospital-1.png'); ?>" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
        .swagger-ui .topbar { background-color: #000; }
        .swagger-ui .topbar-wrapper img[alt="Swagger UI"], .swagger-ui .topbar-wrapper svg { visibility: hidden; display: none !important; }
        .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; }
        .swagger-ui .topbar-wrapper .link::before {
            content: "";
            background-image: url('<?php echo base_url("assets/images/hospital-1.png"); ?>');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            width: 50px; 
            height: 50px;
            display: inline-block;
            margin-right: 10px;
        }
        .swagger-ui .topbar-wrapper .link::after {
            content: "API Documentation";
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script>
    window.onload = function() {
        // Base URL for API
        const baseUrl = "<?php echo base_url('index.php/SwaggerController/json'); ?>";
        
        const ui = SwaggerUIBundle({
            urls: [
                {url: baseUrl + "/hospital_admin", name: "Hospital Admin API"},
                {url: baseUrl + "/doctor", name: "Doctor API"},
                {url: baseUrl + "/staff", name: "Staff API"}
            ],
            "urls.primaryName": "Hospital Admin API",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
        });
        window.ui = ui;
    };
    </script>
</body>
</html>
