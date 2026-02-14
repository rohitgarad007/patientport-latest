
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Upload } from "lucide-react";
import Cookies from "js-cookie";
import { doctorProfileService, DoctorProfile } from "@/services/DoctorProfileService";
import Swal from "sweetalert2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SearchableSelect } from "@/components/ui/searchable-select";
import { fetchSpecializations } from "@/services/HSHospitalService";

export default function DoctorProfilePage() {
  const [profileData, setProfileData] = useState<DoctorProfile>({
    name: "",
    email: "",
    phone: "",
    profile_image: "",
    gender: "",
    specialization_id: "",
    specialization_name: "",
    experience_year: "0",
    experience_month: "0",
    consultation_fee: "",
    screen_default_message: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [specializations, setSpecializations] = useState<{ value: string; label: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    loadSpecializations();
  }, []);

  const loadSpecializations = async () => {
    try {
      const res = await fetchSpecializations();
      if (res.data) {
        const options = res.data.map((s: any) => ({
          value: s.id,
          label: s.name,
        }));
        setSpecializations(options);
      }
    } catch (error) {
      console.error("Failed to load specializations", error);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await doctorProfileService.getProfile();
      if (data) {
        setProfileData({
          ...data,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          profile_image: data.profile_image || "",
          gender: data.gender || "",
          specialization_id: data.specialization_id || "",
          experience_year: data.experience_year || "0",
          experience_month: data.experience_month || "0",
          consultation_fee: data.consultation_fee || "",
          screen_default_message: data.screen_default_message || "",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof DoctorProfile, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        Swal.fire("Error", "Only PNG and JPG images are allowed.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const image = new Image();
        image.src = reader.result as string;
        image.onload = () => {
            // Validate dimensions
            if (image.width > 512 || image.height > 512) {
                Swal.fire("Error", "Image dimensions must not exceed 512x512 pixels.", "error");
                return;
            }
            setSelectedImageFile(file);
            setProfileData((prev) => ({ ...prev, profile_image: reader.result as string }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await doctorProfileService.updateProfile(profileData, selectedImageFile || undefined);
      if (res.status) {
        Swal.fire("Success", "Profile updated successfully", "success");
        // Clear selected file after successful save
        setSelectedImageFile(null);
      } else {
        Swal.fire("Error", res.message || "Failed to update profile", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred", "error");
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const savePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("Error", "New passwords do not match", "error");
      return;
    }
    if (!passwordData.currentPassword) {
      Swal.fire("Error", "Current password is required", "error");
      return;
    }

    try {
      const res = await doctorProfileService.updateProfile({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      if (res.status) {
        Swal.fire("Success", "Password changed successfully", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        Swal.fire("Error", res.message || "Failed to change password", "error");
      }
    } catch (error) {
      Swal.fire("Error", "An error occurred", "error");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Privacy & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal & Professional Details</CardTitle>
              <CardDescription>Update your public profile information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={profileData.profile_image} />
                  <AvatarFallback>{profileData.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    id="profile-upload"
                    onChange={handleImageUpload}
                  />
                  <Label htmlFor="profile-upload">
                    <Button variant="outline" asChild>
                      <span><Upload className="mr-2 h-4 w-4" /> Change Photo</span>
                    </Button>
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    value={profileData.name} 
                    onChange={(e) => handleProfileChange("name", e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={profileData.phone} 
                    onChange={(e) => handleProfileChange("phone", e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select 
                    value={profileData.gender} 
                    onValueChange={(val) => handleProfileChange("gender", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <SearchableSelect
                    value={profileData.specialization_id}
                    onChange={(val) => handleProfileChange("specialization_id", val)}
                    options={specializations}
                    placeholder="Select Specialization"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={profileData.experience_year} 
                      onValueChange={(val) => handleProfileChange("experience_year", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Years" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 51 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Years</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={profileData.experience_month} 
                      onValueChange={(val) => handleProfileChange("experience_month", val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Months" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>{i} Months</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Consultation Fees</Label>
                  <Input 
                    type="number"
                    value={profileData.consultation_fee} 
                    onChange={(e) => handleProfileChange("consultation_fee", e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Screen Default Message</Label>
                <Textarea 
                  value={profileData.screen_default_message} 
                  onChange={(e) => handleProfileChange("screen_default_message", e.target.value)} 
                  placeholder="Message to display on waiting screens..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input 
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input 
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={savePassword}>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
