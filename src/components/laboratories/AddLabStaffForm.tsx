import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

type Props = {
  onSubmit: (form: any) => Promise<void> | void;
  initial?: any;
  activeLaboratories: any[];
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

export default function AddLabStaffForm({ onSubmit, initial, activeLaboratories }: Props) {
  const [form, setForm] = useState<any>({
    lab_id: initial?.lab_id || "",
    name: initial?.name || "",
    email: initial?.email || "",
    password: "",
    phone: initial?.phone || "",
    role: initial?.role || "",
    captcha: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
    if (!form.lab_id) next.lab_id = "Laboratory is required";
    if (!form.name || form.name.trim().length < 2) next.name = "Name is required";
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Valid email is required";
    
    if (initial) {
      if (form.password && form.password.length < 6) {
        next.password = "Password must be at least 6 characters";
      }
    } else {
      if (!form.password || form.password.length < 6) {
        next.password = "Password must be at least 6 characters";
      }
    }

    if (!form.phone || !/^\d{10}$/.test(form.phone)) next.phone = "Phone must be 10 digits";
    if (!form.role) next.role = "Role is required";
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
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lab_id">Laboratory</Label>
            <Select value={form.lab_id} onValueChange={(val) => handleSelectChange("lab_id", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Laboratory" />
              </SelectTrigger>
              <SelectContent>
                {activeLaboratories.map((lab) => (
                  <SelectItem key={lab.labuid} value={lab.labuid}>
                    {lab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lab_id && <p className="text-red-600 text-sm mt-1">{errors.lab_id}</p>}
          </div>

          <div>
            <Label htmlFor="name">Staff Name</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Enter staff name" />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="password">Password {initial && "(optional)"}</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter password" />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
        </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone" />
          {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={form.role} onValueChange={(val) => handleSelectChange("role", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="pathologist">Pathologist</SelectItem>
              <SelectItem value="lab-technician">Lab Technician</SelectItem>
              <SelectItem value="receptionist">Receptionist</SelectItem>
              <SelectItem value="phlebotomist">Phlebotomist</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
        </div>
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
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Staff</Button>
      </div>
    </form>
  );
}
