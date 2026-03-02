import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Eye, EyeOff, Upload } from "lucide-react";
import { fetchStaffProfile, updateStaffProfile, StaffProfile } from "@/services/HsstaffService";
import { staffProfileService } from "@/services/StaffProfileService";
import Swal from "sweetalert2";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchableSelect } from "@/components/ui/searchable-select";

const sleepTimeOptions = Array.from({ length: 240 }, (_, i) => {
  const seconds = (i + 1) * 30;
  let label = "";
  if (seconds < 60) label = `${seconds} sec`;
  else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    label = secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  } else {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    label = mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return { value: seconds.toString(), label };
});

export default function StaffProfilePage() {
  const [profileData, setProfileData] = useState<StaffProfile>({
    name: "",
    email: "",
    phone: "",
    profile_image: "",
    gender: "",
    specialization: "",
    role: "",
    department: "",
    experience_years: "0",
    experience_months: "0",
    screen_lock_pin: "",
    screen_sleep_time: "30",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);



  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await fetchStaffProfile();
      if (data) {
        setProfileData({
          ...data,
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          profile_image: data.profile_image || "",
          gender: data.gender || "",
          specialization: data.specialization || "",
          role: data.role || "",
          department: data.department || "",
          experience_years: data.experience_years || "0",
          experience_months: data.experience_months || "0",
          screen_lock_pin: data.screen_lock_pin || "",
          screen_sleep_time: data.screen_sleep_time || "30",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (field: keyof StaffProfile, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (profileData.screen_lock_pin && profileData.screen_lock_pin.length > 0 && profileData.screen_lock_pin.length !== 4) {
      Swal.fire("Error", "Screen Lock PIN must be exactly 4 digits.", "error");
      return;
    }

    try {
      const res = await updateStaffProfile(profileData, selectedImageFile || undefined);
      if (res.status) {
        Swal.fire("Success", "Profile updated successfully", "success");
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
      const res = await staffProfileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
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
      <h1 className="text-3xl font-bold mb-6">Staff Profile</h1>

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
                  <Label>Experience</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={profileData.experience_years} 
                      onValueChange={(val) => handleProfileChange("experience_years", val)}
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
                      value={profileData.experience_months} 
                      onValueChange={(val) => handleProfileChange("experience_months", val)}
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
                  <Label>Screen Lock PIN (4 digits)</Label>
                  <div className="flex items-center gap-3">
                    <InputOTP
                      maxLength={4}
                      value={profileData.screen_lock_pin}
                      onChange={(val) => handleProfileChange("screen_lock_pin", val)}
                    >
                      <InputOTPGroup className="gap-3">
                        {[0, 1, 2, 3].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            isSecret={!showPin}
                            className="h-12 w-12 rounded-lg border border-sky-200 bg-sky-50 text-lg ring-offset-background focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-sky-400 first:rounded-lg last:rounded-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-muted-foreground hover:text-sky-600 hover:bg-sky-50"
                      onClick={() => setShowPin(!showPin)}
                    >
                      {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Used for unlocking the screen.</p>
                </div>

                <div className="space-y-2">
                  <Label>Screen Sleep Time</Label>
                  <SearchableSelect
                    value={profileData.screen_sleep_time}
                    onChange={(val) => handleProfileChange("screen_sleep_time", val)}
                    options={sleepTimeOptions}
                    placeholder="Select sleep time"
                  />
                  <p className="text-xs text-muted-foreground">Time before screen goes to sleep.</p>
                </div>
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
