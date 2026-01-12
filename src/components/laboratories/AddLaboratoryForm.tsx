import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

type Props = {
  onSubmit: (form: any) => Promise<void> | void;
  initial?: any;
};

const CaptchaCanvas: React.FC<{ code: string; width?: number; height?: number }> = ({ code, width = 160, height = 50 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#f7fafc");
    g.addColorStop(1, "#eef2f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.15)`;
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2.5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(Math.random() * 120)}, ${Math.floor(Math.random() * 120)}, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }
    for (let i = 0; i < code.length; i++) {
      const ch = code.charAt(i);
      ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 60%, 30%)`;
      const fontSize = 22 + Math.random() * 8;
      ctx.font = `${fontSize}px sans-serif`;
      const x = 15 + i * (width / (code.length + 1));
      const y = 30 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }, [code, width, height]);
  return <canvas ref={canvasRef} width={width} height={height} className="border rounded bg-muted" />;
};

export default function AddLaboratoryForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<any>({
    name: initial?.name || "",
    registration_number: initial?.registration_number || "",
    email: initial?.email || "",
    password: "",
    phone: initial?.phone || "",
    website_url: initial?.website_url || "",
    gst_number: initial?.gst_number || "",
    state: initial?.state || "",
    city: initial?.city || "",
    address: initial?.address || "",
    captcha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) next.name = "Laboratory name is required";
    if (!form.registration_number || form.registration_number.trim().length < 3) next.registration_number = "Registration number is required";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email is required";
    
    if (initial) {
      // Edit mode: password is optional
      if (form.password && form.password.length < 6) {
        next.password = "Password must be at least 6 characters";
      }
    } else {
      // Add mode: password is required
      if (!form.password || form.password.length < 6) {
        next.password = "Password must be at least 6 characters";
      }
    }

    if (!form.phone || !/^\d{10}$/.test(form.phone)) next.phone = "Phone must be 10 digits";
    if (!form.state) next.state = "State is required";
    if (!form.city) next.city = "City is required";
    if (!form.address || form.address.trim().length < 5) next.address = "Address is required";
    if (!form.captcha || form.captcha.toUpperCase() !== captchaCode.toUpperCase()) next.captcha = "CAPTCHA is incorrect";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Laboratory Name</Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter name" />
          {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input id="registration_number" name="registration_number" value={form.registration_number} onChange={handleChange} placeholder="Enter registration number" />
          {errors.registration_number && <p className="text-red-600 text-sm mt-1">{errors.registration_number}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter password" />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone" />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <Label htmlFor="website_url">Website (optional)</Label>
          <Input id="website_url" name="website_url" value={form.website_url} onChange={handleChange} placeholder="Enter website" />
        </div>
        <div>
          <Label htmlFor="gst_number">GST Number (optional)</Label>
          <Input id="gst_number" name="gst_number" value={form.gst_number} onChange={handleChange} placeholder="Enter GST number" />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="Enter state" />
          {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="Enter city" />
          {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" value={form.address} onChange={handleTextChange} placeholder="Enter address" style={{ minHeight: 95 }} />
        {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-2 flex items-center gap-2">
          <CaptchaCanvas code={captchaCode} width={160} height={50} />
          <Button type="button" size="sm" onClick={generateCaptcha}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="captcha">Enter CAPTCHA</Label>
          <Input id="captcha" name="captcha" value={form.captcha} onChange={handleChange} placeholder="Enter CAPTCHA" className="uppercase" />
          {errors.captcha && <p className="text-red-600 text-sm mt-1">{errors.captcha}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Laboratory</Button>
      </div>
    </form>
  );
}
