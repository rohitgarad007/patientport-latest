import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, Info } from "lucide-react";
import Cookies from "js-cookie";
import { locationService, State, City } from "@/services/LocationService";
import { hospitalService } from "@/services/HospitalService";
import { configService } from "@/services/configService";
import Swal from "sweetalert2";
import QRCode from "qrcode";

export default function HospitalProfile() {
  const userInfo = Cookies.get("userInfo");
  const currentUser = userInfo ? JSON.parse(userInfo) : null;

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    appointmentDayLimit: "",
    bookAppointmentStatus: "0",
    address: "",
    state: "",
    city: "",
    screenDefaultMessage: "",
    hospitalQrCode: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const url = await configService.getApiUrl();
      setApiUrl(url);
      
      // Handle hosuid vs loguid mismatch from login response
      const hospitalId = currentUser?.hosuid || currentUser?.loguid;

      try {
        // 1. Fetch States
        const statesData = await locationService.getStates();
        setStates(statesData);

        // 2. Fetch Hospital Profile
        if (hospitalId) {
          const profile = await hospitalService.getProfile(hospitalId);
          if (profile) {
            setProfileData({
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              address: profile.address,
              state: profile.state,
              city: profile.city,
              appointmentDayLimit: profile.appointment_day_limit || "30",
              bookAppointmentStatus: profile.book_appointment_status?.toString() || "0",
              screenDefaultMessage: profile.screen_default_message || "",
              hospitalQrCode: profile.hospital_qr_code || "",
            });
            // Fetch cities if state is already selected
            if (profile.state) {
              const citiesData = await locationService.getCities(profile.state);
              setCities(citiesData);
            }
          }
        } else {
            console.error("Hospital ID (hosuid/loguid) not found in current user data.");
            Swal.fire("Error", "Could not identify hospital account. Please login again.", "error");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        Swal.fire("Error", "Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.hosuid, currentUser?.loguid]);

  const handleGenerateQR = async () => {
    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) return;

    try {
      // Get Live_URL from config service
      const liveUrl = await configService.getLiveUrl();
      
      // Construct the full URL: Live_URL/hospital/hospital_id
      const qrData = `${liveUrl}/hospital/${hospitalId}`;
      
      // Generate QR as Data URL
      const url = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });
      setProfileData((prev) => ({ ...prev, hospitalQrCode: url }));
      Swal.fire("Success", "QR Code Generated! Please click 'Save Changes' to apply.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to generate QR Code", "error");
    }
  };

  const handleStateChange = async (value: string) => {
    setProfileData({ ...profileData, state: value, city: "" });
    const citiesData = await locationService.getCities(value);
    setCities(citiesData);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hospitalId = currentUser?.hosuid || currentUser?.loguid;

    if (!hospitalId) {
        Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
        return;
    }
    if (!profileData.name || !profileData.phone || !profileData.address || !profileData.state || !profileData.city || !profileData.appointmentDayLimit) {
        Swal.fire("Error", "Please fill in all required fields.", "error");
        return;
    }

    setLoading(true);
    try {
        const result = await hospitalService.updateProfile({
          hosuid: hospitalId,
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          state: profileData.state,
          city: profileData.city,
          appointment_day_limit: profileData.appointmentDayLimit,
          book_appointment_status: profileData.bookAppointmentStatus,
          screen_default_message: profileData.screenDefaultMessage,
          hospital_qr_code: profileData.hospitalQrCode
        });

        if (result.status) {
            Swal.fire("Success", "Profile updated successfully!", "success");
        } else {
            Swal.fire("Error", result.message || "Failed to update profile.", "error");
        }
    } catch (error) {
        Swal.fire("Error", "An error occurred while updating.", "error");
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        Swal.fire("Error", "Please fill in all password fields.", "error");
        return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire("Error", "New passwords do not match!", "error");
      return;
    }

    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) {
        Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
        return;
    }

    setLoading(true);
    try {
        const result = await hospitalService.changePassword({
            hosuid: hospitalId,
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.status) {
            Swal.fire("Success", "Password updated successfully!", "success");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } else {
            Swal.fire("Error", result.message || "Failed to update password.", "error");
        }
    } catch (error) {
        Swal.fire("Error", "An error occurred while updating password.", "error");
    } finally {
        setLoading(false);
    }
  };

  const isPasswordFormValid = 
      passwordData.currentPassword.trim() !== "" && 
      passwordData.newPassword.trim() !== "" && 
      passwordData.confirmPassword.trim() !== "";

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-4 rounded-full">
          {/* <img src={PaIcons.user1} alt="Profile" className="w-12 h-12 text-primary" /> */}
          <div className="w-12 h-12 flex items-center justify-center text-primary font-bold text-xl">HP</div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and security preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Privacy & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="appointmentDayLimit">Appointment Day Limit <span className="text-red-500">*</span></Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Appointment Booking Limit</p>
                            <p className="text-xs mt-1">• Patients can book appointments only up to the maximum allowed number of days in advance.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={profileData.appointmentDayLimit}
                      onValueChange={(value) => setProfileData({ ...profileData, appointmentDayLimit: value })}
                      required
                    >
                      <SelectTrigger id="appointmentDayLimit">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} Day{num > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="bookAppointmentStatus">Appointment Status</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-semibold">Appointment Status</p>
                            <ul className="text-xs mt-1 space-y-1">
                              <li>• Normal – Appointment is proceeding as scheduled</li>
                              <li>• Waiting – Appointment has been shifted to the waiting queue</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      value={profileData.bookAppointmentStatus}
                      onValueChange={(value) => setProfileData({ ...profileData, bookAppointmentStatus: value })}
                    >
                      <SelectTrigger id="bookAppointmentStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Normal process</SelectItem>
                        <SelectItem value="1">Shifted to waiting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Screen Default Message */}
                  <div className="space-y-2">
                    <Label htmlFor="screenDefaultMessage">Screen Default Message</Label>
                    <Textarea
                      id="screenDefaultMessage"
                      value={profileData.screenDefaultMessage}
                      onChange={(e) => setProfileData({ ...profileData, screenDefaultMessage: e.target.value })}
                      placeholder="Enter default message for screens..."
                      className="min-h-[100px]"
                    />
                  </div>

                  {/* QR Code Section */}
                  <div className="space-y-2">
                    <Label>Hospital QR Code</Label>
                    <div className="flex flex-col items-center justify-center border rounded-md p-4 bg-muted/20 min-h-[100px]">
                      {profileData.hospitalQrCode ? (
                        <div className="flex flex-col items-center gap-2">
                          <img 
                            src={profileData.hospitalQrCode.startsWith('data:') ? profileData.hospitalQrCode : `${apiUrl}${profileData.hospitalQrCode}`} 
                            alt="Hospital QR Code" 
                            className="w-32 h-32 object-contain bg-white p-2 rounded border"
                          />
                          <Button variant="outline" size="sm" type="button" onClick={handleGenerateQR}>
                            Regenerate QR
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-muted-foreground text-sm mb-2">No QR Code available</p>
                          <Button type="button" size="sm" onClick={handleGenerateQR}>
                            Generate QR Option
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
                  {/* State Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      id="state"
                      value={profileData.state}
                      onChange={handleStateChange}
                      options={states.map(s => ({ value: s.stateId, label: s.stateName }))}
                      placeholder="Select State"
                    />
                  </div>

                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <SearchableSelect
                      id="city"
                      value={profileData.city}
                      onChange={(value) => setProfileData({ ...profileData, city: value })}
                      options={cities.map(c => ({ value: c.cityId, label: c.cityName }))}
                      placeholder="Select City"
                      disabled={!profileData.state}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        <span className="sr-only">
                          {showCurrentPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">
                            {showNewPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          <span className="sr-only">
                            {showConfirmPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={!isPasswordFormValid}>Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
