import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
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
import { getDoctorSpecializations } from "@/services/doctorService";
import { Eye, EyeOff } from "lucide-react";

type HSDoctorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  hospitals: any[];
  initialData?: any; // for edit mode
};

/**
 * CaptchaCanvas - renders `code` as a noisy/distorted image on a canvas to prevent simple DOM scraping.
 */
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

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Background - subtle gradient
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#f7fafc");
    g.addColorStop(1, "#eef2f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Add random dots for noise
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.15)`;
      ctx.beginPath();
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 2.5;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Random lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(
        Math.random() * 120
      )}, ${Math.floor(Math.random() * 120)}, 0.3)`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw each character with slight random rotation/scale
    const len = code.length;
    for (let i = 0; i < len; i++) {
      const ch = code.charAt(i);
      const fontSize = 22 + Math.floor(Math.random() * 8);
      ctx.font = `${fontSize}px "Arial"`;
      ctx.textBaseline = "middle";

      // random color but not too light
      ctx.fillStyle = `rgb(${40 + Math.floor(Math.random() * 120)}, ${40 +
        Math.floor(Math.random() * 120)}, ${40 + Math.floor(Math.random() * 120)})`;

      // approximate spacing
      const x = 12 + i * (width - 24) / len + (Math.random() - 0.5) * 6;
      const y = height / 2 + (Math.random() - 0.5) * 8;

      const angle = (Math.random() - 0.5) * 0.6; // rotate -0.3..0.3 rad
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }

    // Extra arcs for noise
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(
        Math.random() * 150
      )}, ${Math.floor(Math.random() * 150)}, 0.25)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 10 + Math.random() * 20, Math.random() * 2, Math.random() * 4);
      ctx.stroke();
    }
  }, [code, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="rounded" />;
};

export default function HSDoctorFormDialog({
  open,
  onOpenChange,
  onSubmit,
  hospitals,
  initialData,
}: HSDoctorFormDialogProps) {
  const [formData, setFormData] = useState<any>({
    doctorName: "",
    doctorEmail: "",
    phone: "",
    specialization: "",
    doctorFees: "",
    password: "",
    expYear: null as { label: string; value: string } | null,
    expMonth: null as { label: string; value: string } | null,
    captcha: "",
    profileImageFile: null as File | null,
  });

  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [captchaCode, setCaptchaCode] = useState(""); // generated captcha
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  // Options for years (0-45) and months (0-11)
  const yearOptions = Array.from({ length: 46 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i}`, value: `${i}` }));

  useEffect(() => {
    if (open) {
      generateCaptcha();
      fetchSpecializations();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        doctorName: initialData.doctorName ?? "",
        doctorEmail: initialData.doctorEmail ?? "",
        phone: initialData.phone ?? "",
        specialization: initialData.specialization ?? "",
        doctorFees: initialData.doctorFees ?? "",
        password: "", // do not prefill password for security reasons
        expYear: initialData.expYear ? { label: `${initialData.expYear}`, value: `${initialData.expYear}` } : null,
        expMonth: initialData.expMonth ? { label: `${initialData.expMonth}`, value: `${initialData.expMonth}` } : null,
        captcha: "",
        profileImageFile: null,
      });
      setFormErrors({});
    } else if (open) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, open]);

  const requiredFields = [
    "doctorName",
    "phone",
    "specialization",
    "expYear",
    "expMonth",
    "captcha",
  ];

  if (!initialData) {
    requiredFields.push("doctorEmail", "password");
  }

  const isFormValid = requiredFields.every((f) => {
    const val = formData[f];
    const err = formErrors[f];
    return val && !err; // field has value and no error
  });

  const resetForm = () => {
    setFormData({
      doctorName: "",
      doctorEmail: "",
      phone: "",
      specialization: "",
      doctorFees: "",
      password: "",
      expYear: null,
      expMonth: null,
      captcha: "",
      profileImageFile: null,
    });
    setFormErrors({});
    generateCaptcha();
  };

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
  };

  const fetchSpecializations = async () => {
    try {
      setLoadingSpecs(true);
      const res = await getDoctorSpecializations();
      const specs = res?.data || res;
      setSpecializations(specs.map((s: any) => ({ value: String(s.id), label: s.name })));
    } catch (err) {
      console.error("Failed to load specializations", err);
    } finally {
      setLoadingSpecs(false);
    }
  };

  // validation logic used both on change and on submit
  const validateField = (name: string, value: any) => {
    const isAdd = !initialData;
    switch (name) {
      case "doctorName":
        if (!value || value.trim().length < 2 || value.trim().length > 150) return "Doctor name must be 2-150 characters";
        return "";
      case "doctorEmail":
        if (isAdd) {
          if (!value) return "Email is required";
          const re = /^\S+@\S+\.\S+$/;
          if (!re.test(value)) return "Please enter a valid email";
        }
        return "";
      case "phone":
        if (!value) return "Phone is required";
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
      case "specialization":
        if (!value) return "Please select specialization";
        return "";
      case "password":
        if (isAdd && value && value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "expYear":
        if (!value) return "Please select experience year";
        return "";
      case "expMonth":
        if (!value) return "Please select experience month";
        return "";
      case "captcha":
        if (!value) return "Please enter CAPTCHA";
        if (String(value).toUpperCase() !== String(captchaCode).toUpperCase()) return "CAPTCHA does not match";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    // live-validation: set or clear error for this field
    const err = validateField(name, value);
    setFormErrors((prev: any) => {
      const copy = { ...prev };
      if (err) copy[name] = err;
      else delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async () => {
    // full form validation
    const fieldsToValidate = [
      "doctorName",
      "phone",
      "specialization",
      "expYear",
      "expMonth",
      "captcha",
    ];
    if (!initialData) {
      // add-mode additional validations
      fieldsToValidate.push("doctorEmail", "password");
    }

    const errors: any = {};
    for (const f of fieldsToValidate) {
      const val = formData[f];
      const v = validateField(f, val);
      if (v) errors[f] = v;
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // focus on first error field could be added
      return;
    }

    // Prepare payload: convert exp selects to values
    const payload: any = {
      doctorName: formData.doctorName.trim(),
      phone: formData.phone.trim(),
      specialization: formData.specialization,
      doctorFees: formData.doctorFees ?? "",
      expYear: formData.expYear?.value ?? "",
      expMonth: formData.expMonth?.value ?? "",
      profileImageFile: formData.profileImageFile || null,
    };

    // Add email & password only in Add mode
    if (!initialData) {
      payload.doctorEmail = formData.doctorEmail?.trim() ?? "";
      // if password empty we can omit or send empty (backend may default)
      if (formData.password) payload.password = formData.password;
    } else {
      // if edit mode, also include identifier (backend likely needs id)
      if (initialData?.id) payload.id = initialData.id;
      if (initialData?.doctorUid) payload.doctorUid = initialData.doctorUid;
    }

    await onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">{initialData ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
          <DialogDescription className="text-center">
            {initialData ? "Update doctor details in the system" : "Enter doctor details to add to the system"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="doctorName">Full Name</Label>
            <Input id="doctorName" value={formData.doctorName} onChange={(e) => handleChange("doctorName", e.target.value)} placeholder="Dr. John Smith" />
            {formErrors.doctorName && <p className="text-red-600 text-sm mt-1">{formErrors.doctorName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!initialData && (
              <>
                {/* Email (only when adding) */}
                <div>
                  <Label htmlFor="doctorEmail">Email</Label>
                  <Input id="doctorEmail" type="email" value={formData.doctorEmail} onChange={(e) => handleChange("doctorEmail", e.target.value)} placeholder="doctor@hospital.com" />
                  {formErrors.doctorEmail && <p className="text-red-600 text-sm mt-1">{formErrors.doctorEmail}</p>}
                </div>

                {/* Password (only when adding) */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => handleChange("password", e.target.value)} placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-2 text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Phone & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="0000000000" />
              {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <Label>Experience</Label>
              <div className="flex gap-2 items-start">
                <div className="w-1/2">
                  <Select options={yearOptions} value={formData.expYear} onChange={(val) => handleChange("expYear", val)} placeholder="Years" isSearchable />
                  {formErrors.expYear && <p className="text-red-600 text-sm mt-1">{formErrors.expYear}</p>}
                </div>
                <div className="w-1/2">
                  <Select options={monthOptions} value={formData.expMonth} onChange={(val) => handleChange("expMonth", val)} placeholder="Months" isSearchable />
                  {formErrors.expMonth && <p className="text-red-600 text-sm mt-1">{formErrors.expMonth}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Specialization & Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select isLoading={loadingSpecs} options={specializations} value={specializations.find((s) => s.value === formData.specialization) || null} onChange={(opt) => handleChange("specialization", opt?.value || "")} placeholder="Select specialization..." isClearable />
              {formErrors.specialization && <p className="text-red-600 text-sm mt-1">{formErrors.specialization}</p>}
            </div>

            {/* Profile Image */}
            <div>
              <Label htmlFor="profileImage">Profile Image</Label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                  handleChange("profileImageFile", file);
                }}
              />
              {formData.profileImageFile && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(formData.profileImageFile)}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Fee & CAPTCHA */}
           <div className="col-span-3 md:col-span-1 flex items-center gap-4 w-full">
            <div>
              <Label htmlFor="fee">Consultation Fee (Rs.)</Label>
              <Input id="fee" type="number" value={formData.doctorFees} onChange={(e) => handleChange("doctorFees", e.target.value)} placeholder="200" />
            </div>

            <div className="flex items-center gap-2">
              <CaptchaCanvas code={captchaCode} width={160} height={50} />
              <div className="flex flex-col gap-2">
                <Button onClick={generateCaptcha} size="sm">Refresh</Button>
              </div>
            </div>

            <div>
              <Label htmlFor="captcha">Enter CAPTCHA</Label>
              <Input id="captcha" value={formData.captcha} onChange={(e) => handleChange("captcha", e.target.value)} placeholder="Enter CAPTCHA" className="uppercase" />
              {formErrors.captcha && <p className="text-red-600 text-sm mt-1">{formErrors.captcha}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSubmit} disabled={!isFormValid}>
              {initialData ? "Update Doctor" : "Add Doctor"}
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
