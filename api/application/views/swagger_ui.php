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

        .pp-swagger-login-btn {
            margin-right: 8px !important;
            background: rgba(255, 255, 255, 0.08) !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            color: #fff !important;
        }
        .pp-swagger-login-btn:hover { background: rgba(255, 255, 255, 0.14) !important; }
        .pp-swagger-logout-btn {
            margin-right: 8px !important;
            background: transparent !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            color: rgba(255, 255, 255, 0.9) !important;
        }
        .pp-swagger-logout-btn:hover { background: rgba(255, 255, 255, 0.06) !important; }

        .pp-swagger-auth-fab {
            position: fixed;
            top: 10px;
            right: 12px;
            display: flex;
            gap: 8px;
            z-index: 999998;
        }
        .pp-swagger-auth-fab .btn {
            margin: 0 !important;
            padding: 6px 10px !important;
            border-radius: 8px !important;
            font-size: 12px !important;
            line-height: 1 !important;
        }

        .pp-swagger-login-backdrop {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 18px;
            background: rgba(0,0,0,0.55);
            z-index: 999999;
        }
        .pp-swagger-login-modal {
            width: 100%;
            max-width: 460px;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 20px 60px rgba(0,0,0,0.35);
            overflow: hidden;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
        }
        .pp-swagger-login-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            border-bottom: 1px solid #eef2f7;
        }
        .pp-swagger-login-title { font-weight: 700; font-size: 16px; color: #0f172a; }
        .pp-swagger-login-close {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            background: #fff;
            cursor: pointer;
            font-size: 18px;
            line-height: 30px;
            color: #334155;
        }
        .pp-swagger-login-body { padding: 14px 16px 4px; }
        .pp-swagger-login-row { margin-bottom: 12px; }
        .pp-swagger-login-label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; }
        .pp-swagger-login-input, .pp-swagger-login-select {
            width: 100%;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            outline: none;
            font-size: 14px;
            color: #0f172a;
            background: #fff;
        }
        .pp-swagger-login-input:focus, .pp-swagger-login-select:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(59,130,246,0.12);
        }
        .pp-swagger-login-error {
            display: none;
            margin: 8px 0 0;
            padding: 10px 12px;
            border-radius: 10px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            font-size: 13px;
        }
        .pp-swagger-login-footer {
            padding: 12px 16px 16px;
            display: flex;
            gap: 10px;
        }
        .pp-swagger-login-submit {
            flex: 1;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid rgba(37, 99, 235, 0.25);
            background: #2563eb;
            color: #fff;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
        }
        .pp-swagger-login-submit:hover { background: #1d4ed8; }
        .pp-swagger-login-secondary {
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            background: #fff;
            color: #0f172a;
            font-weight: 700;
            cursor: pointer;
            font-size: 14px;
        }
        .pp-swagger-login-secondary:hover { background: #f8fafc; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>

    <div id="pp-swagger-login-backdrop" class="pp-swagger-login-backdrop">
        <div class="pp-swagger-login-modal" role="dialog" aria-modal="true" aria-labelledby="pp-swagger-login-title">
            <div class="pp-swagger-login-header">
                <div id="pp-swagger-login-title" class="pp-swagger-login-title">Sign in for API testing</div>
                <button type="button" id="pp-swagger-login-close" class="pp-swagger-login-close" aria-label="Close">×</button>
            </div>
            <div class="pp-swagger-login-body">
                <div class="pp-swagger-login-row">
                    <label class="pp-swagger-login-label" for="pp-swagger-login-role">Select role</label>
                    <select id="pp-swagger-login-role" class="pp-swagger-login-select">
                        <option value="hospital_admin">Hospital Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="staff">Staff</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="laboratory">Laboratory</option>
                    </select>
                </div>
                <div class="pp-swagger-login-row">
                    <label class="pp-swagger-login-label" for="pp-swagger-login-email">Email</label>
                    <input id="pp-swagger-login-email" class="pp-swagger-login-input" type="text" autocomplete="username" placeholder="Enter your email" />
                </div>
                <div class="pp-swagger-login-row">
                    <label class="pp-swagger-login-label" for="pp-swagger-login-password">Password</label>
                    <input id="pp-swagger-login-password" class="pp-swagger-login-input" type="password" autocomplete="current-password" placeholder="Enter your password" />
                </div>
                <div id="pp-swagger-login-otp-row" class="pp-swagger-login-row" style="display:none;">
                    <label class="pp-swagger-login-label" for="pp-swagger-login-otp">OTP</label>
                    <input id="pp-swagger-login-otp" class="pp-swagger-login-input" type="text" inputmode="numeric" autocomplete="one-time-code" placeholder="Enter OTP" />
                </div>
                <div id="pp-swagger-login-error" class="pp-swagger-login-error"></div>
            </div>
            <div class="pp-swagger-login-footer">
                <button type="button" id="pp-swagger-login-cancel" class="pp-swagger-login-secondary">Cancel</button>
                <button type="button" id="pp-swagger-login-submit" class="pp-swagger-login-submit">Sign In</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js" charset="UTF-8"> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js" charset="UTF-8"></script>
    <script>
    window.onload = function() {
        const apiBaseUrl = "<?php echo rtrim(base_url(), '/'); ?>";
        const aesKey = "RohitGaradHos@173414";

        const authStorageKey = "pp_swagger_bearer_token";
        const authRoleKey = "pp_swagger_role";

        const loginBackdropEl = document.getElementById("pp-swagger-login-backdrop");
        const loginCloseEl = document.getElementById("pp-swagger-login-close");
        const loginCancelEl = document.getElementById("pp-swagger-login-cancel");
        const loginSubmitEl = document.getElementById("pp-swagger-login-submit");
        const roleEl = document.getElementById("pp-swagger-login-role");
        const emailEl = document.getElementById("pp-swagger-login-email");
        const passwordEl = document.getElementById("pp-swagger-login-password");
        const otpRowEl = document.getElementById("pp-swagger-login-otp-row");
        const otpEl = document.getElementById("pp-swagger-login-otp");
        const errorEl = document.getElementById("pp-swagger-login-error");

        const state = { step: "login", loguid: null, role: null, ui: null };

        function showError(message) {
            if (!errorEl) return;
            errorEl.textContent = message || "Something went wrong";
            errorEl.style.display = "block";
        }
        function clearError() {
            if (!errorEl) return;
            errorEl.textContent = "";
            errorEl.style.display = "none";
        }
        function openLoginModal() {
            clearError();
            if (otpRowEl) otpRowEl.style.display = "none";
            if (otpEl) otpEl.value = "";
            state.step = "login";
            state.loguid = null;
            state.role = null;
            if (loginSubmitEl) loginSubmitEl.textContent = "Sign In";
            if (loginBackdropEl) loginBackdropEl.style.display = "flex";
            setTimeout(() => { if (emailEl) emailEl.focus(); }, 50);
        }
        function closeLoginModal() {
            if (loginBackdropEl) loginBackdropEl.style.display = "none";
        }

        function encryptForBackend(value) {
            if (typeof CryptoJS === "undefined" || !CryptoJS.AES) {
                throw new Error("Crypto library is not loaded");
            }
            return CryptoJS.AES.encrypt(String(value), aesKey).toString();
        }

        function buildUrl(path, withIndexPhp) {
            const base = apiBaseUrl.replace(/\/$/, "");
            const p = String(path || "").replace(/^\//, "");
            if (withIndexPhp) return base + "/index.php/" + p;
            return base + "/" + p;
        }

        async function postJson(url, body) {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(body || {})
            });
            const json = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, json };
        }

        function setSwaggerToken(ui, token) {
            if (!ui) return false;
            const rawToken = String(token || "").trim();
            if (!rawToken) return false;

            const schemeCandidates = ["bearerAuth", "BearerAuth", "jwtAuth", "jwt", "JWT"];
            for (let i = 0; i < schemeCandidates.length; i++) {
                const schemeName = schemeCandidates[i];
                try {
                    if (typeof ui.preauthorizeApiKey === "function") {
                        ui.preauthorizeApiKey(schemeName, rawToken);
                        return true;
                    }
                } catch (e) {}
            }

            try {
                const system = ui.getSystem && ui.getSystem();
                const authActions = system && system.authActions;
                if (authActions && typeof authActions.authorize === "function") {
                    for (let i = 0; i < schemeCandidates.length; i++) {
                        const schemeName = schemeCandidates[i];
                        const payload = {};
                        payload[schemeName] = {
                            name: schemeName,
                            schema: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
                            value: rawToken
                        };
                        try {
                            authActions.authorize(payload);
                            return true;
                        } catch (e) {}
                    }
                }
            } catch (e) {}

            return false;
        }

        function clearSwaggerToken(ui) {
            try { localStorage.removeItem(authStorageKey); } catch (e) {}
            try { localStorage.removeItem(authRoleKey); } catch (e) {}
            try {
                const system = ui && ui.getSystem && ui.getSystem();
                const authActions = system && system.authActions;
                if (authActions && typeof authActions.logout === "function") {
                    authActions.logout(["bearerAuth"]);
                }
            } catch (e) {}
        }

        function getSavedToken() {
            try { return localStorage.getItem(authStorageKey) || ""; } catch (e) { return ""; }
        }
        function normalizeJwtToken(token) {
            const raw = String(token || "").trim();
            if (!raw) return "";
            return raw.replace(/^Bearer\s+/i, "").trim();
        }
        function saveToken(token, role) {
            try { localStorage.setItem(authStorageKey, normalizeJwtToken(token)); } catch (e) {}
            try { localStorage.setItem(authRoleKey, String(role || "")); } catch (e) {}
        }

        function updateTopbarAuthButtons() {
            const existingLogin = document.querySelector("[data-pp-swagger-login='1']");
            const existingLogout = document.querySelector("[data-pp-swagger-logout='1']");
            const token = getSavedToken();

            if (token) {
                if (existingLogin) existingLogin.style.display = "none";
                if (existingLogout) existingLogout.style.display = "";
            } else {
                if (existingLogin) existingLogin.style.display = "";
                if (existingLogout) existingLogout.style.display = "none";
            }
        }

        function injectLoginButtons() {
            const authBtn = document.querySelector(".swagger-ui button.authorize");
            if (!authBtn || !authBtn.parentNode) return false;
            const container = authBtn.parentNode;

            if (!document.querySelector("[data-pp-swagger-login='1']")) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "btn pp-swagger-login-btn";
                btn.setAttribute("data-pp-swagger-login", "1");
                btn.textContent = "Login";
                btn.addEventListener("click", openLoginModal);
                container.insertBefore(btn, authBtn);
            }

            if (!document.querySelector("[data-pp-swagger-logout='1']")) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "btn pp-swagger-logout-btn";
                btn.setAttribute("data-pp-swagger-logout", "1");
                btn.textContent = "Logout";
                btn.addEventListener("click", function() {
                    clearSwaggerToken(window.ui);
                    updateTopbarAuthButtons();
                });
                container.insertBefore(btn, authBtn);
            }

            updateTopbarAuthButtons();
            return true;
        }

        function autoExecuteExpandedOps() {
            const token = getSavedToken();
            if (!token) return;

            const targetKey = "pp_swagger_autorun_POST_/HSPatientController/ManagePatientList";
            const isTarget = (opblock) => {
                if (!opblock || !opblock.classList || !opblock.classList.contains("is-open")) return false;
                const methodEl = opblock.querySelector(".opblock-summary-method");
                const pathEl = opblock.querySelector(".opblock-summary-path");
                const method = methodEl ? String(methodEl.textContent || "").trim().toUpperCase() : "";
                const path = pathEl ? String(pathEl.getAttribute("data-path") || pathEl.textContent || "").trim() : "";
                return method === "POST" && path === "/HSPatientController/ManagePatientList";
            };

            const ranRecently = (ms) => {
                try {
                    const v = parseInt(sessionStorage.getItem(targetKey) || "0", 10);
                    if (!v) return false;
                    return (Date.now() - v) < ms;
                } catch (e) {
                    return false;
                }
            };

            const markRan = () => {
                try { sessionStorage.setItem(targetKey, String(Date.now())); } catch (e) {}
            };

            const run = (opblock) => {
                if (!isTarget(opblock)) return;
                if (ranRecently(5000)) return;
                markRan();

                const tryBtn = opblock.querySelector("button.try-out__btn");
                if (tryBtn && /try it out/i.test(String(tryBtn.textContent || ""))) {
                    tryBtn.click();
                }

                setTimeout(() => {
                    const executeBtn = opblock.querySelector("button.execute, .btn.execute");
                    if (executeBtn) executeBtn.click();
                }, 250);
            };

            document.querySelectorAll(".opblock").forEach(run);

            const root = document.getElementById("swagger-ui") || document.body;
            const observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                    const m = mutations[i];
                    if (m.type === "attributes" && m.target && m.target.classList && m.target.classList.contains("opblock")) {
                        run(m.target);
                        continue;
                    }
                    if (m.type === "childList" && m.addedNodes) {
                        m.addedNodes.forEach((n) => {
                            if (!n || !n.querySelectorAll) return;
                            const blocks = n.classList && n.classList.contains("opblock") ? [n] : Array.from(n.querySelectorAll(".opblock"));
                            blocks.forEach(run);
                        });
                    }
                }
            });
            observer.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
        }

        function ensureFloatingAuthButtons() {
            let fab = document.getElementById("pp-swagger-auth-fab");
            if (!fab) {
                fab = document.createElement("div");
                fab.id = "pp-swagger-auth-fab";
                fab.className = "pp-swagger-auth-fab";

                const loginBtn = document.createElement("button");
                loginBtn.type = "button";
                loginBtn.className = "btn pp-swagger-login-btn";
                loginBtn.setAttribute("data-pp-swagger-login", "1");
                loginBtn.textContent = "Login";
                loginBtn.addEventListener("click", openLoginModal);

                const logoutBtn = document.createElement("button");
                logoutBtn.type = "button";
                logoutBtn.className = "btn pp-swagger-logout-btn";
                logoutBtn.setAttribute("data-pp-swagger-logout", "1");
                logoutBtn.textContent = "Logout";
                logoutBtn.addEventListener("click", function() {
                    clearSwaggerToken(window.ui);
                    updateTopbarAuthButtons();
                });

                fab.appendChild(loginBtn);
                fab.appendChild(logoutBtn);
                document.body.appendChild(fab);
            }
            updateTopbarAuthButtons();
        }

        async function handleLoginSubmit() {
            clearError();

            if (state.step === "otp") {
                const otp = otpEl ? String(otpEl.value || "").trim() : "";
                if (!otp) { showError("OTP is required"); return; }
                const verifyBody = { loguid: state.loguid, role: state.role, otp: otp };

                let result = await postJson(buildUrl("verify-login-otp", false), verifyBody);
                if (!result.ok && (result.status === 404 || result.status === 0)) {
                    result = await postJson(buildUrl("verify-login-otp", true), verifyBody);
                }

                if (result.json && result.json.success && result.json.token) {
                    saveToken(result.json.token, state.role);
                    setSwaggerToken(window.ui, result.json.token);
                    closeLoginModal();
                    updateTopbarAuthButtons();
                    return;
                }

                showError((result.json && result.json.message) ? result.json.message : "OTP verification failed");
                return;
            }

            const role = roleEl ? String(roleEl.value || "").trim() : "hospital_admin";
            const email = emailEl ? String(emailEl.value || "").trim() : "";
            const password = passwordEl ? String(passwordEl.value || "") : "";

            if (!email) { showError("Email is required"); return; }
            if (!password) { showError("Password is required"); return; }

            let urlPath = "user-auth-login";
            let payload = null;

            try {
                if (role === "super_admin") {
                    urlPath = "super-auth-login";
                    payload = { username: encryptForBackend(email), password: encryptForBackend(password) };
                } else if (role === "laboratory") {
                    urlPath = "lab-auth-login";
                    payload = { username: encryptForBackend(email), password: encryptForBackend(password) };
                } else {
                    urlPath = "user-auth-login";
                    payload = { username: encryptForBackend(email), password: encryptForBackend(password), role: role };
                }
            } catch (e) {
                showError(e && e.message ? e.message : "Encryption failed");
                return;
            }

            let result = await postJson(buildUrl(urlPath, false), payload);
            if (!result.ok && (result.status === 404 || result.status === 0)) {
                result = await postJson(buildUrl(urlPath, true), payload);
            }

            if (result.json && result.json.success && result.json.requires_otp && result.json.loguid) {
                state.step = "otp";
                state.loguid = result.json.loguid;
                state.role = result.json.role || role;
                if (otpRowEl) otpRowEl.style.display = "";
                if (loginSubmitEl) loginSubmitEl.textContent = "Verify OTP";
                if (otpEl) { otpEl.value = ""; otpEl.focus(); }
                return;
            }

            if (result.json && result.json.success && result.json.token) {
                saveToken(result.json.token, role);
                setSwaggerToken(window.ui, result.json.token);
                closeLoginModal();
                updateTopbarAuthButtons();
                return;
            }

            showError((result.json && result.json.message) ? result.json.message : "Login failed");
        }

        if (loginBackdropEl) {
            loginBackdropEl.addEventListener("click", function(e) {
                if (e && e.target === loginBackdropEl) closeLoginModal();
            });
        }
        if (loginCloseEl) loginCloseEl.addEventListener("click", closeLoginModal);
        if (loginCancelEl) loginCancelEl.addEventListener("click", closeLoginModal);
        if (loginSubmitEl) loginSubmitEl.addEventListener("click", handleLoginSubmit);
        document.addEventListener("keydown", function(e) {
            if (e && e.key === "Escape") closeLoginModal();
        });

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
            persistAuthorization: true,
            requestInterceptor: (req) => {
                try {
                    const t = localStorage.getItem(authStorageKey);
                    const token = normalizeJwtToken(t);
                    if (token) {
                        req.headers = req.headers || {};
                        req.headers["Authorization"] = "Bearer " + token;
                        req.headers["X-Authorization"] = "Bearer " + token;
                        req.headers["X-Access-Token"] = token;
                    }
                } catch (e) {}
                return req;
            },
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

        const savedToken = getSavedToken();
        if (savedToken) {
            setSwaggerToken(ui, savedToken);
        }
        autoExecuteExpandedOps();

        const tryInject = () => {
            const injected = injectLoginButtons();
            if (injected) {
                updateTopbarAuthButtons();
                return true;
            }
            return false;
        };

        let attempts = 0;
        const maxAttempts = 40;
        const intervalId = setInterval(() => {
            attempts += 1;
            if (tryInject() || attempts >= maxAttempts) {
                clearInterval(intervalId);
            }
        }, 150);

        const observer = new MutationObserver(() => {
            tryInject();
            ensureFloatingAuthButtons();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        ensureFloatingAuthButtons();
    };
    </script>
</body>
</html>
