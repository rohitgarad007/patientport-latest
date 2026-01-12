import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { configService } from '@/services/configService'; 
import Swal from 'sweetalert2';
import Cookies from "js-cookie";

export function SuperAdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [AES_SECRET_KEY, setAesSecretKey] = useState<string | null>(null);
  const [API_URL, setApiUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  // Load config
  useEffect(() => {
    const fetchConfig = async () => {
      const key = await configService.getAesSecretKey();
      const apiUrl = await configService.getApiUrl();
      setAesSecretKey(key);
      setApiUrl(apiUrl);
    };
    fetchConfig();
  }, []);

  const validateForm = (): boolean => {
    if (!email) {
      Swal.fire('Validation Error', 'Email is required', 'warning');
      return false;
    }
    // simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire('Validation Error', 'Please enter a valid email', 'warning');
      return false;
    }
    if (!password) {
      Swal.fire('Validation Error', 'Password is required', 'warning');
      return false;
    }
    return true;
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!AES_SECRET_KEY || !API_URL) {
      Swal.fire('Error', 'Configuration not loaded', 'error');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🔐 Encrypt payload
      const encryptedPayload = {
        username: CryptoJS.AES.encrypt(email, AES_SECRET_KEY).toString(),
        password: CryptoJS.AES.encrypt(password, AES_SECRET_KEY).toString(),
      };

      const res = await fetch(`${API_URL}/super-auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      

      Cookies.set("token", data.token, { expires: 1 }); 
      Cookies.set("adminInfo", JSON.stringify(data.adminInfo), { expires: 1 });

      let timerInterval: any;
      Swal.fire({
        title: 'Login Successful 🎉',
        html: 'Redirecting to dashboard in <b></b> seconds...',
        timer: 3000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer()!.querySelector('b');
          timerInterval = setInterval(() => {
            if (b) {
              b.textContent = String(Math.ceil(Swal.getTimerLeft()! / 1000));
            }
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        }
      }).then(() => {
        navigate('/super-dashboard');
      });


      /*Swal.fire('Success', 'Login successful', 'success');
      navigate('/super-dashboard');*/
    } catch (err: any) {
      Swal.fire('Login Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-secondary-light p-4">
      <Card className="w-full max-w-md medical-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Super Admin Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with your Super Admin account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
