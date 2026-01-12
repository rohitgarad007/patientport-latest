import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select as UiSelect, SelectTrigger as UiSelectTrigger, SelectValue as UiSelectValue, SelectContent as UiSelectContent, SelectItem as UiSelectItem } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { format, parse } from "date-fns";

type HSPatientFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any; // for edit mode
};

/**
 * CaptchaCanvas - same as in Doctor form
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

    ctx.clearRect(0, 0, width, height);

    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#f7fafc");
    g.addColorStop(1, "#eef2f7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.15)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 120)}, ${Math.floor(
        Math.random() * 120
      )}, ${Math.floor(Math.random() * 120)}, 0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    for (let i = 0; i < code.length; i++) {
      const ch = code.charAt(i);
      const fontSize = 22 + Math.floor(Math.random() * 8);
      ctx.font = `${fontSize}px "Arial"`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgb(${40 + Math.floor(Math.random() * 120)}, ${40 +
        Math.floor(Math.random() * 120)}, ${40 + Math.floor(Math.random() * 120)})`;

      const x = 12 + i * (width - 24) / code.length + (Math.random() - 0.5) * 6;
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

const formatDate = (date: any) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0]; // yyyy-mm-dd
};

export default function HSPatientFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: HSPatientFormDialogProps) {
  const [formData, setFormData] = useState<any>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
    address: "",
    captcha: "",
  });

  const [captchaCode, setCaptchaCode] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => new Date());

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const bloodGroupOptions = [
    "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-",
  ].map((bg) => ({ value: bg, label: bg }));

  useEffect(() => {
    if (open) {
      generateCaptcha();
      if (!initialData) resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName ?? "",
        lastName: initialData.lastName ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        dob: formatDate(initialData.dob),
        gender: initialData.gender ?? "",
        bloodGroup: initialData.bloodGroup ?? "",
        emergencyContact: initialData.emergencyContact ?? "",
        address: initialData.address ?? "",
        captcha: "",
      });
      setFormErrors({});
    }
  }, [initialData]);

  // Keep calendar in sync with current DOB
  useEffect(() => {
    if (formData.dob) {
      const d = new Date(formData.dob);
      if (!isNaN(d.getTime())) {
        setVisibleMonth(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
  }, [formData.dob]);

  const requiredFields = [
    "firstName", "lastName", "email", "phone", "dob", "gender", "bloodGroup", "captcha",
  ];

  const isFormValid = requiredFields.every((f) => formData[f] && !formErrors[f]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      emergencyContact: "",
      address: "",
      captcha: "",
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

  const validateField = (name: string, value: any) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value || value.trim().length < 2) return "Must be at least 2 characters";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
        return "";
      case "phone":
        if (!/^\d{10}$/.test(value)) return "Phone must be 10 digits";
        return "";
      case "dob":
        if (!value) return "Date of Birth is required";
        if (new Date(value) > new Date()) return "Date of Birth cannot be in the future";
        return "";
      case "gender":
        if (!value) return "Please select gender";
        return "";
      case "bloodGroup":
        if (!value) return "Please select blood group";
        return "";
      case "captcha":
        if (!value) return "Enter CAPTCHA";
        if (String(value).toUpperCase() !== String(captchaCode).toUpperCase())
          return "CAPTCHA does not match";
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

  const handleSubmit = async () => {
    const errors: any = {};
    for (const f of requiredFields) {
      const val = formData[f];
      const v = validateField(f, val);
      if (v) errors[f] = v;
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dob: formatDate(formData.dob), // normalized
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      emergencyContact: formData.emergencyContact?.trim() ?? "",
      address: formData.address?.trim() ?? "",
    };

    if (initialData?.id) payload.id = initialData.id;

    await onSubmit(payload);
    onOpenChange(false);
  };




  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {initialData ? "Edit Patient" : "Add New Patient"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {initialData ? "Update patient details in the system" : "Enter patient details to add to the system"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} placeholder="John" />
              {formErrors.firstName && <p className="text-red-600 text-sm">{formErrors.firstName}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} placeholder="Doe" />
              {formErrors.lastName && <p className="text-red-600 text-sm">{formErrors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {!initialData && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="patient@email.com" />
                  {formErrors.email && <p className="text-red-600 text-sm">{formErrors.email}</p>}
                </div>
               </>
            )}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="0000000000" />
              {formErrors.phone && <p className="text-red-600 text-sm">{formErrors.phone}</p>}
            </div>
           
                
             
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="dob"
                    type="button"
                    variant="outline"
                    className="flex w-full items-center gap-2  border-2 h-12 px-4 justify-between"
                  >
                    <span className="text-left">
                      {formData.dob
                        ? format(parse(formData.dob || "", "yyyy-MM-dd", new Date()), "MMMM d, yyyy")
                        : "Select date"}
                    </span>
                    <CalendarDays className="h-5 w-5 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-3 w-[320px]">
                  <div className="flex items-center gap-2 mb-2">
                    <UiSelect
                      value={String(visibleMonth.getMonth())}
                      onValueChange={(m) => {
                        const month = Number(m);
                        setVisibleMonth(new Date(visibleMonth.getFullYear(), month, 1));
                      }}
                    >
                      <UiSelectTrigger className="w-[160px] h-10 rounded-xl border-2 px-4">
                        <UiSelectValue placeholder="Month" />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        {["January","February","March","April","May","June","July","August","September","October","November","December"].map((label, idx) => (
                          <UiSelectItem key={label} value={String(idx)}>{label}</UiSelectItem>
                        ))}
                      </UiSelectContent>
                    </UiSelect>

                    <UiSelect
                      value={String(visibleMonth.getFullYear())}
                      onValueChange={(y) => {
                        const year = Number(y);
                        setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
                      }}
                    >
                      <UiSelectTrigger className="w-[140px] h-10 rounded-xl border-2 px-4">
                        <UiSelectValue placeholder="Year" />
                      </UiSelectTrigger>
                      <UiSelectContent>
                        {Array.from({ length: new Date().getFullYear() - 1960 + 1 }, (_, i) => 1960 + i).map((year) => (
                          <UiSelectItem key={year} value={String(year)}>{year}</UiSelectItem>
                        ))}
                      </UiSelectContent>
                    </UiSelect>
                  </div>

                  <Calendar
                    mode="single"
                    month={visibleMonth}
                    onMonthChange={setVisibleMonth}
                    selected={formData.dob ? parse(formData.dob, "yyyy-MM-dd", new Date()) : undefined}
                    onSelect={(day) => {
                      if (day) {
                        const iso = format(day, "yyyy-MM-dd");
                        handleChange("dob", iso);
                        setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                      }
                    }}
                    fromDate={new Date(1960, 0, 1)}
                    toDate={new Date()}
                    showOutsideDays
                  />
                </PopoverContent>
              </Popover>

              {formErrors.dob && <p className="text-red-600 text-sm mt-1">{formErrors.dob}</p>}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select options={genderOptions} value={genderOptions.find((g) => g.value === formData.gender) || null} onChange={(opt) => handleChange("gender", opt?.value || "")} placeholder="Select gender" />
              {formErrors.gender && <p className="text-red-600 text-sm">{formErrors.gender}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select options={bloodGroupOptions} value={bloodGroupOptions.find((bg) => bg.value === formData.bloodGroup) || null} onChange={(opt) => handleChange("bloodGroup", opt?.value || "")} placeholder="Select blood group" />
              {formErrors.bloodGroup && <p className="text-red-600 text-sm">{formErrors.bloodGroup}</p>}
            </div>
            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" value={formData.emergencyContact} onChange={(e) => handleChange("emergencyContact", e.target.value)} placeholder="Emergency phone number" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Enter full address"
            />
          </div>

          <div className="col-span-3 md:col-span-1 flex items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <CaptchaCanvas code={captchaCode} width={160} height={50} />
              <Button onClick={generateCaptcha} size="sm">Refresh</Button>
            </div>
            <div>
              <Label htmlFor="captcha">Enter CAPTCHA</Label>
              <Input id="captcha" value={formData.captcha} onChange={(e) => handleChange("captcha", e.target.value)} placeholder="Enter CAPTCHA" className="uppercase" />
              {formErrors.captcha && <p className="text-red-600 text-sm">{formErrors.captcha}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSubmit} disabled={!isFormValid}>
              {initialData ? "Update Patient" : "Add Patient"}
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
