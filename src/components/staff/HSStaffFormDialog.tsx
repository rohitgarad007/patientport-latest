import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

import { getStaffRoles, getStaffDepartments } from "@/services/staffService";
import { fetchHospitals } from "@/services/masterHospitalService";

type HSStaffFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
};

/** CaptchaCanvas renders code as noisy/distorted canvas */
const CaptchaCanvas: React.FC<{ code: string; width?: number; height?: number }> = ({
  code,
  width = 150,
  height = 50,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // background gradient
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#f7fafc");
    g.addColorStop(1, "#eef2f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // noise dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)},${Math.floor(
        Math.random() * 255
      )},${Math.floor(Math.random() * 255)},0.15)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // random lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120)},${Math.floor(
        Math.random() * 120
      )},${Math.floor(Math.random() * 120)},0.3)`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // draw letters
    const len = code.length;
    for (let i = 0; i < len; i++) {
      const ch = code.charAt(i);
      const fontSize = 22 + Math.floor(Math.random() * 8);
      ctx.font = `${fontSize}px "Arial"`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgb(${40 + Math.floor(Math.random() * 120)},${40 +
        Math.floor(Math.random() * 120)},${40 + Math.floor(Math.random() * 120)})`;

      const x = 12 + i * (width - 24) / len + (Math.random() - 0.5) * 6;
      const y = height / 2 + (Math.random() - 0.5) * 8;
      const angle = (Math.random() - 0.5) * 0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }, [code, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded" />;
};

export default function HSStaffFormDialog({ open, onOpenChange, onSubmit, initialData }: HSStaffFormDialogProps) {
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    role: null,
    department: null,
    shift: null,
    experienceYears: null,
    experienceMonths: null,
    password: "",
    captcha: "",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [captchaCode, setCaptchaCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  const yearOptions = Array.from({ length: 46 }, (_, i) => ({ label: `${i} Years`, value: `${i}` }));
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i} Months`, value: `${i}` }));
  const shiftOptions = [
    { label: "Day", value: "Day" },
    { label: "Night", value: "Night" },
  ];

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  const validateField = (name: string, value: any) => {
    switch (name) {
      case "name":
        if (!value || value.trim().length < 2) return "Name must be at least 2 characters";
        return "";
      case "email":
        if (!initialData && !value) return "Email is required";
        if (value && !/^\S+@\S+\.\S+$/.test(value)) return "Invalid email";
        return "";
      case "phone":
        if (!value) return "Phone is required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
      case "role":
        if (!value) return "Please select role";
        return "";
      case "department":
        if (!value) return "Please select department";
        return "";
     
      case "shift":
        if (!value) return "Please select shift";
        return "";
      case "experienceYears":
        if (!value) return "Select years";
        return "";
      case "experienceMonths":
        if (!value) return "Select months";
        return "";
      case "password":
        if (!initialData && (!value || value.length < 8)) return "Password must be at least 8 characters";
        return "";
      case "captcha":
        if (!value) return "Please enter CAPTCHA";
        if (value.toUpperCase() !== captchaCode.toUpperCase()) return "CAPTCHA does not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    const err = validateField(name, value);
    setFormErrors((prev: any) => {
      const copy = { ...prev };
      if (err) copy[name] = err;
      else delete copy[name];
      return copy;
    });
  };

  const isFormValid = () => Object.keys(formErrors).length === 0 && 
    formData.name && formData.phone && formData.role && formData.department && 
    formData.shift && formData.experienceYears && formData.experienceMonths &&
    (!initialData ? formData.email && formData.password : true) && formData.captcha;

  const handleSubmit = async () => {
    // Validate all fields
    const fields = ["name","phone","role","department","shift","experienceYears","experienceMonths","captcha"];
    if (!initialData) fields.push("email","password");

    const errors: any = {};
    fields.forEach(f => {
      const err = validateField(f, formData[f]);
      if (err) errors[f] = err;
    });
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role?.value || "",
      department: formData.department?.value || "",
      shift: formData.shift?.value || "",
      experienceYears: formData.experienceYears?.value || "",
      experienceMonths: formData.experienceMonths?.value || "",
      password: formData.password || undefined,
    };

    await onSubmit(payload);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      generateCaptcha();
      getStaffRoles().then((res) => { if (res.success) setRoles(res.data.map((r: any) => ({ label: r.roleName, value: r.roleName }))); });
      getStaffDepartments().then((res) => { if (res.success) setDepartments(res.data.map((d: any) => ({ label: d.departmentName, value: d.departmentName }))); });
     
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role ? { label: initialData.role, value: initialData.role } : null,
        department: initialData.department ? { label: initialData.department, value: initialData.department } : null,
        shift: initialData.shift ? { label: initialData.shift, value: initialData.shift } : null,
        experienceYears: initialData.experienceYears ? { label: `${initialData.experienceYears}`, value: `${initialData.experienceYears}` } : null,
        experienceMonths: initialData.experienceMonths ? { label: `${initialData.experienceMonths}`, value: `${initialData.experienceMonths}` } : null,
        password: "",
        captcha: "",
      });
      setFormErrors({});
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: null,
        department: null,
        shift: null,
        experienceYears: null,
        experienceMonths: null,
        password: "",
        captcha: "",
      });
      setFormErrors({});
    }
  }, [initialData, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{initialData ? "Edit Staff" : "Add Staff"}</DialogTitle>
          <DialogDescription className="text-center">{initialData ? "Update staff details" : "Enter staff details"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="John Smith" />
              {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
            </div>

            
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!initialData && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="staff@hospital.com" />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>
            )}
            {/* Password */}
            {!initialData && (
            
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
              </div>
              
            )}
          </div>

          {/* Phone & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="0000000000" />
              {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select options={roles} value={formData.role} onChange={(val) => handleChange("role", val)} placeholder="Select role" isSearchable />
              {formErrors.role && <p className="text-red-600 text-sm mt-1">{formErrors.role}</p>}
            </div>
          </div>

          {/* Department & Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select options={departments} value={formData.department} onChange={(val) => handleChange("department", val)} placeholder="Select department" isSearchable />
              {formErrors.department && <p className="text-red-600 text-sm mt-1">{formErrors.department}</p>}
            </div>
            
          </div>

          {/* Shift & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select options={shiftOptions} value={formData.shift} onChange={(val) => handleChange("shift", val)} placeholder="Select shift" isSearchable />
              {formErrors.shift && <p className="text-red-600 text-sm mt-1">{formErrors.shift}</p>}
            </div>
            <div>
              <Label>Experience</Label>
              <div className="col-span-2 md:col-span-1 flex items-center gap-4 w-full">
                <Select options={yearOptions} value={formData.experienceYears} onChange={(val) => handleChange("experienceYears", val)} placeholder="Years" isSearchable />
                <Select options={monthOptions} value={formData.experienceMonths} onChange={(val) => handleChange("experienceMonths", val)} placeholder="Months" isSearchable />
              </div>
              {(formErrors.experienceYears || formErrors.experienceMonths) && (
                <p className="text-red-600 text-sm mt-1">{formErrors.experienceYears || formErrors.experienceMonths}</p>
              )}
            </div>
          </div>

          

          {/* CAPTCHA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-3 md:col-span-1 flex items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <CaptchaCanvas code={captchaCode} />
                <Button size="sm" onClick={generateCaptcha}>
                  Refresh
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="captcha">Enter CAPTCHA</Label>
              <Input id="captcha" value={formData.captcha} onChange={(e) => handleChange("captcha", e.target.value.toUpperCase())} placeholder="Enter CAPTCHA" />
              {formErrors.captcha && <p className="text-red-600 text-sm mt-1">{formErrors.captcha}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSubmit} disabled={!isFormValid()}>
              {initialData ? "Update Staff" : "Add Staff"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
