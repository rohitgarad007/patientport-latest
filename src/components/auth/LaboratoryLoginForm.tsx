
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Microscope, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { configService } from '@/services/configService'; 
import Swal from 'sweetalert2';
import Cookies from "js-cookie";

export function LaboratoryLoginForm() {
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

  const validateForm = () => {
    if (!email || !password) {
      Swal.fire('Error', 'Please fill in all fields', 'error');
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

      const res = await fetch(`${API_URL}/lab-auth-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Login failed');

      Cookies.set("labToken", data.token, { expires: 1 }); 
      Cookies.set("labInfo", JSON.stringify(data.labInfo), { expires: 1 });

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
        navigate('/laboratory-dashboard');
      });

    } catch (err: any) {
      Swal.fire('Login Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-background to-indigo-50 p-4">
      <Card className="w-full max-w-md medical-card border-t-4 border-t-indigo-500 shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Microscope className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">Laboratory Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to Laboratory Portal
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
                className="h-11"
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
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button type="submit" className="w-full h-11 text-base bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
