  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Heart, Stethoscope, Users, UserCheck, Eye, EyeOff, Shield, Lock } from "lucide-react";
  import CryptoJS from "crypto-js";
  import { configService } from "@/services/configService";
  import Swal from "sweetalert2";
  import Cookies from "js-cookie";
  import { PaIcons } from "@/components/icons/PaIcons";

  const roles = [
    { role: "hospital_admin", label: "Hospital Admin", Icon: Users },
    { role: "doctor", label: "Doctor", Icon: Stethoscope },
    { role: "staff", label: "Staff", Icon: UserCheck },
    //{ role: "patient", label: "Patient", Icon: Heart },
  ];

  export function LoginForm() {
    const [selectedRole, setSelectedRole] = useState("staff");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [showOtpScreen, setShowOtpScreen] = useState(false);
    const [tempLoguid, setTempLoguid] = useState<string | null>(null);
    const [tempRole, setTempRole] = useState<string | null>(null);
    const [AES_SECRET_KEY, setAesSecretKey] = useState<string | null>(null);
    const [API_URL, setApiUrl] = useState<string | null>(null);

    const navigate = useNavigate();

    // Load AES key and API URL from config
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
      if (!email.trim()) {
        Swal.fire("Validation Error", "Email is required", "warning");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Swal.fire("Validation Error", "Please enter a valid email", "warning");
        return false;
      }
      if (!password.trim()) {
        Swal.fire("Validation Error", "Password is required", "warning");
        return false;
      }
      if (!selectedRole) {
        Swal.fire("Validation Error", "Please select a role", "warning");
        return false;
      }
      return true;
    };

    const handleLoginSuccess = (data: any) => {
      // Set cookies correctly
      Cookies.set("token", data.token, { expires: 1 });
      Cookies.set("userInfo", JSON.stringify(data.userInfo), { expires: 1 });
      
      // Success alert and redirect
      let timerInterval: any;
      Swal.fire({
        title: "Login Successful 🎉",
        html: "Redirecting to dashboard in <b></b> seconds...",
        timer: 3000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer()!.querySelector("b");
          timerInterval = setInterval(() => {
            if (b) b.textContent = String(Math.ceil(Swal.getTimerLeft()! / 1000));
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
        },
      }).then(() => {
        // Navigate based on role dynamically
        // Use tempRole if available (for 2FA flow), otherwise selectedRole
        const roleToUse = tempRole || selectedRole;
        const userInfoRole = data.userInfo.role;

        switch (roleToUse) {
          case "hospital_admin":
            navigate("/hospital-dashboard");
            break;
          case "doctor":
            navigate("/doctor-dashboard");
            break;
          case "staff":
            if (userInfoRole === "Receptionist") {
              navigate("/reception-dashboard");
            } else {
              navigate("/staff-dashboard");
            }
            break;
          case "patient":
            navigate("/patient-dashboard");
            break;
          default:
            navigate("/login");
        }
      });
    };

    const handleVerifyOtp = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!API_URL) return;

      if (!otp.trim()) {
        Swal.fire("Validation Error", "Please enter OTP", "warning");
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/verify-login-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loguid: tempLoguid,
            role: tempRole,
            otp: otp
          }),
        });

        const data = await res.json();

        if (data.success) {
          handleLoginSuccess(data);
        } else {
          Swal.fire("OTP Verification Failed", data.message || "Invalid OTP", "error");
        }
      } catch (err: any) {
        Swal.fire("Error", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    const handleLogin = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!AES_SECRET_KEY || !API_URL) {
        Swal.fire("Error", "Configuration not loaded", "error");
        return;
      }

      if (!validateForm()) return;

      setLoading(true);

      try {
        // Encrypt email and password
        const encryptedPayload = {
          username: CryptoJS.AES.encrypt(email, AES_SECRET_KEY).toString(),
          password: CryptoJS.AES.encrypt(password, AES_SECRET_KEY).toString(),
          role: selectedRole,
        };

        const res = await fetch(`${API_URL}/user-auth-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(encryptedPayload),
        });

        const data = await res.json();
        
        // Handle 2FA Requirement
        if (data.status === 202 && data.requires_otp) {
          setTempLoguid(data.loguid);
          setTempRole(data.role);
          setShowOtpScreen(true);
          setLoading(false);
          Swal.fire("OTP Required", "Please enter the OTP sent to your registered device.", "info");
          return;
        }

        if (!res.ok || data.success === false) {
          Swal.fire("Login Failed", data.message || "Login failed", "error");
          return;
        }

        handleLoginSuccess(data);

      } catch (err: any) {
        Swal.fire("Login Failed", err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    const { Icon } = roles.find((r) => r.role === selectedRole) || roles[0];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-secondary-light p-4 xs-mbody">
        <Card className="w-full max-w-md medical-card loginbox-wrap">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16  rounded-full flex items-center justify-center">
              
            <img src={PaIcons.hospital1} alt="Email" className="w-16 h-16 " />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">
                HealthCare Pro
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 card-content-body">
            {/* OTP Screen */}
            {showOtpScreen ? (
              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div className="text-center mb-4">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Please enter the OTP to verify your identity.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password (OTP)</Label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="pl-10 tracking-widest font-mono text-lg"
                      autoFocus
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowOtpScreen(false);
                    setOtp("");
                    setTempLoguid(null);
                    setTempRole(null);
                  }}
                >
                  Back to Login
                </Button>
              </form>
            ) : (
            /* Role selection */
            <form
              className="space-y-4"
              onSubmit={handleLogin}   // 👈 triggers handleLogin when pressing Enter or clicking button
            >
              
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: string) => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(({ role, label, Icon }) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
                
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            )}

          </CardContent>
        </Card>
      </div>
    );
  }
