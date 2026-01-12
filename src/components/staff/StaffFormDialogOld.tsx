// import React & Select as before
import { useEffect, useState } from "react";
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
import Swal from "sweetalert2";
import Select from "react-select";

import { getStaffRoles, getStaffDepartments } from "@/services/staffService";
import { fetchHospitals } from "@/services/masterHospitalService";

type StaffFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any; // for edit
};

export default function StaffFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: StaffFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: null as { label: string; value: string } | null,
    department: null as { label: string; value: string } | null,
    hospital: null as { label: string; value: string } | null,
    shift: null as { label: string; value: string } | null,
    experienceYears: null as { label: string; value: string } | null,
    experienceMonths: null as { label: string; value: string } | null,
    captcha: "",
  });

  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [departments, setDepartments] = useState<{ label: string; value: string }[]>([]);
  const [hospitals, setHospitals] = useState<{ label: string; value: string }[]>([]);
  const [captcha, setCaptcha] = useState("");

  // Generate captcha
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

  const shiftOptions = [
    { label: "Day", value: "Day" },
    { label: "Night", value: "Night" },
  ];

  // Load roles, departments, hospitals when dialog opens
  useEffect(() => {
    if (open) {
      generateCaptcha();

      getStaffRoles().then((res) => {
        if (res.success) {
          setRoles(res.data.map((r: any) => ({ label: r.roleName, value: r.roleName })));
        }
      });

      getStaffDepartments().then((res) => {
        if (res.success) {
          setDepartments(res.data.map((d: any) => ({ label: d.departmentName, value: d.departmentName })));
        }
      });

      fetchHospitals().then((res) => {
        if (res.success) {
          setHospitals(res.data.map((h: any) => ({ label: h.name, value: h.hosuid })));
        }
      });
    }
  }, [open]);

  // Handle initial data for edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role ? { label: initialData.role, value: initialData.role } : null,
        department: initialData.department ? { label: initialData.department, value: initialData.department } : null,
        hospital: initialData.hospitalId ? { label: initialData.hospitalName, value: initialData.hospitalId } : null,
        shift: initialData.shift ? { label: initialData.shift, value: initialData.shift } : null,
        experienceYears: initialData.experienceYears ? { label: `${initialData.experienceYears}`, value: `${initialData.experienceYears}` } : null,
        experienceMonths: initialData.experienceMonths ? { label: `${initialData.experienceMonths}`, value: `${initialData.experienceMonths}` } : null,
        captcha: "",
      });
    } else if (!open) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: null,
        department: null,
        hospital: null,
        shift: null,
        experienceYears: null,
        experienceMonths: null,
        captcha: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    if (!formData.captcha || formData.captcha.toUpperCase() !== captcha.toUpperCase()) {
      Swal.fire({
        icon: "error",
        title: "CAPTCHA Incorrect",
        text: "Please try again",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      generateCaptcha();
      return;
    }

    const payload = {
      ...formData,
      role: formData.role?.value || "",
      department: formData.department?.value || "",
      hospitalId: formData.hospital?.value || "",
      shift: formData.shift?.value || "",
      experienceYears: formData.experienceYears?.value || "",
      experienceMonths: formData.experienceMonths?.value || "",
    };

    
    await onSubmit(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {initialData ? "Edit Staff Member" : "Add Staff Member"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {initialData ? "Update staff details in the system" : "Enter staff details to add to the system"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@hospital.com"
              />
            </div>
          </div>

          {/* Phone & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="00000-00000"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                options={roles}
                value={formData.role}
                onChange={(val) => setFormData({ ...formData, role: val })}
                placeholder="Select role"
                isSearchable
              />
            </div>
          </div>

          {/* Department & Hospital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                options={departments}
                value={formData.department}
                onChange={(val) => setFormData({ ...formData, department: val })}
                placeholder="Select department"
                isSearchable
              />
            </div>
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Select
                options={hospitals}
                value={formData.hospital}
                onChange={(val) => setFormData({ ...formData, hospital: val })}
                placeholder="Select hospital"
                isSearchable
              />
            </div>
          </div>

          {/* Shift & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shift">Shift</Label>
              <Select
                options={shiftOptions}
                value={formData.shift}
                onChange={(val) => setFormData({ ...formData, shift: val })}
                placeholder="Select shift"
                isSearchable
              />
            </div>
            <div>
              <Label>Experience</Label>
              <div className="flex gap-2">
                <Select
                  options={yearOptions}
                  value={formData.experienceYears}
                  onChange={(val) => setFormData({ ...formData, experienceYears: val })}
                  placeholder="Years"
                  isSearchable
                />
                <Select
                  options={monthOptions}
                  value={formData.experienceMonths}
                  onChange={(val) => setFormData({ ...formData, experienceMonths: val })}
                  placeholder="Months"
                  isSearchable
                />
              </div>
            </div>
          </div>

          {/* CAPTCHA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="pt-4">
              <div className="flex items-center gap-2">
                <div className="border p-2 w-32 h-12 flex items-center justify-center text-xl font-bold select-none bg-gray-100">
                  {captcha}
                </div>
                <Button onClick={generateCaptcha} size="sm">
                  Refresh
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="captcha">Enter captcha</Label>
              <Input
                id="captcha"
                value={formData.captcha}
                onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
                placeholder="Enter CAPTCHA"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleSubmit}>
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
