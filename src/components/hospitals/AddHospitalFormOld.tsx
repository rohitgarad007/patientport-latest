import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { locationService } from "@/services/locationService";
import Select from "react-select";
import { Eye, EyeOff } from "lucide-react";

type HospitalFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any; // ✅ optional for edit
};

export default function HospitalForm({ onSubmit, onCancel, initialData }: HospitalFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    registration_number: "",
    email: "",
    password: "",
    phone: "",
    website_url: "",
    state: "21",
    city: "",
    pincode: "",
    type: "private",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Pre-fill form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        registration_number: initialData.registration_number || "",
        email: initialData.email || "",
        password: initialData.password || "",
        phone: initialData.phone || "",
        website_url: initialData.website_url || "",
        state: initialData.state || "21",
        city: initialData.city || "",
        pincode: initialData.pincode || "",
        type: initialData.type || "private",
        address: initialData.address || "",
      });
    }
  }, [initialData]);

  // Fetch states on mount
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await locationService.getStates();
        if (res.success) {
          setStates(res.data);
          // Default Maharashtra if adding new
          if (!initialData) {
            const mh = res.data.find((s: any) => s.stateId === "21");
            if (mh) setFormData((prev) => ({ ...prev, state: mh.stateId }));
          }
        }
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };
    fetchStates();
  }, [initialData]);

  // Fetch cities whenever state changes
  useEffect(() => {
    if (!formData.state) return;
    const fetchCities = async () => {
      try {
        const res = await locationService.getCitiesByState(formData.state);
        if (res.success) {
          setCities(res.data);
          if (!initialData && res.data.length > 0) {
            setFormData((prev) => ({ ...prev, city: res.data[0].cityId }));
          }
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };
    fetchCities();
  }, [formData.state, initialData]);

  const handleSubmit = () => onSubmit(formData);

  return (
    <div className="space-y-4">
      {/* Hospital Name */}
      <div>
        <Label htmlFor="name">Hospital Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter hospital name"
        />
      </div>

      {/* Registration Number + Email + Password */}
      <div className={`grid grid-cols-1 ${initialData ? "md:grid-cols-3" : "md:grid-cols-3"} gap-4`}>
        <div>
          <Label htmlFor="registration_number">Registration Number</Label>
          <Input
            id="registration_number"
            value={formData.registration_number}
            onChange={(e) =>
              setFormData({ ...formData, registration_number: e.target.value })
            }
            placeholder="Enter registration number"
          />
        </div>
        

        {!initialData && (
          <>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="hospital@email.com"
              />
            </div>
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
                  className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Phone, Website, Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0000000000"
          />
        </div>
        <div>
          <Label htmlFor="website_url">Website (Optional)</Label>
          <Input
            id="website_url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="https://www.hospital.com"
          />
        </div>
        <div>
          <Label htmlFor="type">Hospital Type</Label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full border rounded-md p-2"
          >
            <option value="private">Private</option>
            <option value="government">Government</option>
            <option value="trust">Trust</option>
            <option value="clinic">Clinic</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* State + City + Pincode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Select
            id="state"
            value={
              states
                .map((s) => ({ value: s.stateId, label: s.stateName }))
                .find((opt) => opt.value === formData.state) || null
            }
            onChange={(selected) =>
              setFormData({ ...formData, state: selected?.value || "", city: "" })
            }
            options={states.map((s) => ({ value: s.stateId, label: s.stateName }))}
            placeholder="Select state"
            isSearchable
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Select
            id="city"
            value={
              cities
                .map((c) => ({ value: c.cityId, label: c.cityName }))
                .find((opt) => opt.value === formData.city) || null
            }
            onChange={(selected) =>
              setFormData({ ...formData, city: selected?.value || "" })
            }
            options={cities.map((c) => ({ value: c.cityId, label: c.cityName }))}
            placeholder="Select city"
            isSearchable
            isDisabled={!formData.state}
          />
        </div>
        <div>
          <Label htmlFor="pincode">Pincode</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            placeholder="000000"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter complete address"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Button className="flex-1" onClick={handleSubmit}>
          {initialData ? "Update Hospital" : "Add Hospital"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
