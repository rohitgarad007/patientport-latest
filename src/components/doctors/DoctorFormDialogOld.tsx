import { useEffect, useState } from "react";
import Select from "react-select"; // ✅ new import
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
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

type DoctorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  hospitals: any[];
  initialData?: any; // for edit mode
};

export default function DoctorFormDialog({
  open,
  onOpenChange,
  onSubmit,
  hospitals,
  initialData,
}: DoctorFormDialogProps) {
  const [formData, setFormData] = useState<any>({
    doctorName: "",
    doctorEmail: "",
    phone: "",
    specialization: "",
    hospitalId: "",
    doctorFees: "",
    password: "",
    expYear: null as { label: string; value: string } | null,
    expMonth: null as { label: string; value: string } | null,
  });

  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [captcha, setCaptcha] = useState("");       // user input
  const [captchaImage, setCaptchaImage] = useState(""); // generated captcha image URL
  const [showPassword, setShowPassword] = useState(false); // 👀 toggle state
  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (open) generateCaptcha();
  }, [open]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);
  };

  // Options for years (0-45) and months (0-11)
  const yearOptions = Array.from({ length: 46 }, (_, i) => ({ label: `${i}`, value: `${i}` }));
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({ label: `${i}`, value: `${i}` }));

  // ✅ Load doctor specializations dynamically
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        setLoadingSpecs(true);
        const res = await getDoctorSpecializations();
        const specs = res?.data || res;
        setSpecializations(
          specs.map((s: any) => ({ value: String(s.id), label: s.name }))
        );
      } catch (err) {
        console.error("Failed to load specializations", err);
      } finally {
        setLoadingSpecs(false);
      }
    };
    if (open) fetchSpecs();
  }, [open]);

  // ✅ Reset form when dialog opens/closes
  useEffect(() => {
    if (initialData) {
      //setFormData(initialData);

      setFormData({
        ...initialData,
        expYear: initialData.expYear
          ? { label: `${initialData.expYear}`, value: `${initialData.expYear}` }
          : null,
        expMonth: initialData.expMonth
          ? { label: `${initialData.expMonth}`, value: `${initialData.expMonth}` }
          : null,
      });

    } else {
      setFormData({
        doctorName: "",
        doctorEmail: "",
        phone: "",
        specialization: "",
        hospitalId: "",
        doctorFees: "",
        password: "", // reset password on add
        expYear: null,
        expMonth: null,
      });
    }
  }, [initialData, open]);




  

  const handleSubmit = async () => {
    if (!formData.captcha || formData.captcha.toUpperCase() !== captcha.toUpperCase()) {
      //alert("CAPTCHA is incorrect");
      Swal.fire({
        icon: "error",           // ❌ error icon
        title: "CAPTCHA Incorrect",
        text: "Please try again",
        timer: 3000,             // auto-close after 3 seconds
        timerProgressBar: true,  // optional progress bar
        showConfirmButton: false // hide OK button
      });

      generateCaptcha();
      return;
    }

    const errors: any = {};
    const isAdd = !initialData;
    // Doctor Name
    if (!formData.doctorName || formData.doctorName.trim().length < 2 || formData.doctorName.trim().length > 150) {
      errors.doctorName = "Doctor name must be 2-150 characters";
    }

    // Email validation (only for Add)
    if (isAdd) {
      if (!formData.doctorEmail || !/^\S+@\S+\.\S+$/.test(formData.doctorEmail)) {
        errors.doctorEmail = "Please enter a valid email";
      }
    }

    // Phone validation
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone must be 10 digits";
    }

    // Specialization
    if (!formData.specialization) {
      errors.specialization = "Please select specialization";
    }

    // Hospital
    if (!formData.hospitalId) {
      errors.hospitalId = "Please select hospital";
    }

    // Password (only for Add)
    if (isAdd && formData.password && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Experience Year & Month
    if (!formData.expYear) {
      errors.expYear = "Please select experience year";
    }
    if (!formData.expMonth) {
      errors.expMonth = "Please select experience month";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      ...formData,
      expYear: formData.expYear?.value || "",
      expMonth: formData.expMonth?.value || "",
    };


    //await onSubmit(formData);
    await onSubmit(payload);
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {initialData ? "Edit Doctor" : "Add New Doctor"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {initialData
              ? "Update doctor details in the system"
              : "Enter doctor details to add to the system"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="doctorName">Full Name</Label>
            <Input
              id="doctorName"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              placeholder="Dr. John Smith"
            />
            {formErrors.doctorName && <p className="text-red-600 text-sm mt-1">{formErrors.doctorName}</p>}
          </div>

          <div className={`grid grid-cols-1 ${initialData ? "md:grid-cols-2" : "md:grid-cols-2"} gap-4`}>
            {/* Email */}
            {!initialData && (
              <div>
                <Label htmlFor="doctorEmail">Email</Label>
                <Input
                  id="doctorEmail"
                  type="email"
                  value={formData.doctorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorEmail: e.target.value })
                  }
                  placeholder="doctor@hospital.com"
                />
                {formErrors.doctorEmail && <p className="text-red-600 text-sm mt-1">{formErrors.doctorEmail}</p>}
              </div>
            )}

            {/* Password (hide on update) */}
            {!initialData && (
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="00000-00000"
              />
              {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
            </div>
            <div>
              <Label>Experience</Label>
              <div className="flex gap-2">
                <Select
                  options={yearOptions}
                  value={formData.expYear}
                  onChange={(val) => setFormData({ ...formData, expYear: val })}
                  placeholder="Years"
                  isSearchable
                />
                {formErrors.expYear && <p className="text-red-600 text-sm mt-1">{formErrors.expYear}</p>}
                <Select
                  options={monthOptions}
                  value={formData.expMonth}
                  onChange={(val) => setFormData({ ...formData, expMonth: val })}
                  placeholder="Months"
                  isSearchable
                />
                {formErrors.expMonth && <p className="text-red-600 text-sm mt-1">{formErrors.expMonth}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialization */}
            <div>
              <Label htmlFor="specialization">Specialization</Label>
              <Select
                isLoading={loadingSpecs}
                options={specializations}
                value={
                  specializations.find((s) => s.value === formData.specialization) ||
                  null
                }
                onChange={(option) =>
                  setFormData({ ...formData, specialization: option?.value || "" })
                }
                placeholder="Select specialization..."
                isClearable
              />
               {formErrors.specializations && <p className="text-red-600 text-sm mt-1">{formErrors.specializations}</p>}
            </div>

            {/* Hospital */}
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Select
                options={hospitals.map((h) => ({
                  value: String(h.hosuid),
                  label: h.name,
                }))}
                value={
                  hospitals
                    .map((h) => ({ value: String(h.hosuid), label: h.name }))
                    .find((h) => h.value === formData.hospitalId) || null
                }
                onChange={(option) =>
                  setFormData({ ...formData, hospitalId: option?.value || "" })
                }
                placeholder="Select hospital..."
                isClearable
              />
              {formErrors.hospitalId && <p className="text-red-600 text-sm mt-1">{formErrors.hospitalId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Fee */}
            <div>
              <Label htmlFor="fee">Consultation Fee (Rs.)</Label>
              <Input
                id="fee"
                type="number"
                value={formData.doctorFees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    doctorFees: e.target.value,
                  })
                }
                placeholder="200"
              />
              {formErrors.doctorFees && <p className="text-red-600 text-sm mt-1">{formErrors.doctorFees}</p>}
            </div>

            <div className="pt-4">
              
              <div className="flex items-center gap-2">
                <div className="border p-2 w-32 h-12 flex items-center justify-center text-xl font-bold select-none bg-gray-100">
                  {captcha}
                </div>
                <Button onClick={generateCaptcha} size="sm">Refresh</Button>
              </div>
            </div>
            <div>
              <Label htmlFor="captcha">Enter captcha </Label>
              <Input
                id="captcha"
                value={formData.captcha || ""}
                onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                placeholder="Enter CAPTCHA"
              />


            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSubmit}>
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
