import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Eye, EyeOff, Grid3x3, Info, List, Pencil } from "lucide-react";
import Cookies from "js-cookie";
import { locationService, State, City } from "@/services/LocationService";
import { hospitalService } from "@/services/HospitalService";
import { configService } from "@/services/configService";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Sampletemplates1 from "@/components/websiteSample/Sampletemplates1";
import Sampletemplates2 from "@/components/websiteSample/Sampletemplates2";
import Sampletemplates3 from "@/components/websiteSample/Sampletemplates3";
import Sampletemplates4 from "@/components/websiteSample/Sampletemplates4";
import template01Img from "@/assets/template01.png";
import template02Img from "@/assets/template02.png";
import template03Img from "@/assets/template03.png";
import template04Img from "@/assets/template04.png";

type WebsiteBannerForm = {
  id: number;
  title: string;
  subTitle: string;
  image: string;
  status: number;
  isUploading?: boolean;
};

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

  const [websiteSettings, setWebsiteSettings] = useState<{
    aboutTitle: string;
    aboutDescription: string;
    aboutImage: string;
    template: string;
    banners: WebsiteBannerForm[];
  }>({
    aboutTitle: "",
    aboutDescription: "",
    aboutImage: "",
    template: "template_1",
    banners: [],
  });
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [aboutImagePreviewUrl, setAboutImagePreviewUrl] = useState("");

  const [addBannerOpen, setAddBannerOpen] = useState(false);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerSubTitle, setNewBannerSubTitle] = useState("");
  const [newBannerFile, setNewBannerFile] = useState<File | null>(null);
  const [newBannerPreviewUrl, setNewBannerPreviewUrl] = useState("");
  const [newBannerStatus, setNewBannerStatus] = useState<0 | 1>(1);
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [editBannerOpen, setEditBannerOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<number | null>(null);
  const [editBannerTitle, setEditBannerTitle] = useState("");
  const [editBannerSubTitle, setEditBannerSubTitle] = useState("");
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  const [editBannerPreviewUrl, setEditBannerPreviewUrl] = useState("");
  const [editBannerExistingImage, setEditBannerExistingImage] = useState("");
  const [editBannerStatus, setEditBannerStatus] = useState<0 | 1>(1);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
  const [bannerView, setBannerView] = useState<"grid" | "table">("grid");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<WebsiteBannerForm | null>(null);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [templatePreviewId, setTemplatePreviewId] = useState<1 | 2 | 3 | 4>(1);

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

          const web = await hospitalService.getWebsiteSettings(hospitalId);
          if (web) {
            if (aboutImagePreviewUrl) {
              URL.revokeObjectURL(aboutImagePreviewUrl);
              setAboutImagePreviewUrl("");
            }
            setAboutImageFile(null);
            setWebsiteSettings({
              aboutTitle: web.about_title || "",
              aboutDescription: web.about_description || "",
              aboutImage: web.about_image || "",
              template: web.website_template || "template_1",
              banners: (web.banners || []).map((b, idx) => ({
                id: Number((b as any).id ?? Date.now() + idx),
                title: b.title || "",
                subTitle: b.sub_title || "",
                image: b.image || "",
                status: Number((b as any).status ?? 1),
              })),
            });
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

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    return `${apiUrl}/${path}`;
  };

  useEffect(() => {
    if (!newBannerFile) {
      setNewBannerPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      return;
    }
    const objectUrl = URL.createObjectURL(newBannerFile);
    setNewBannerPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    return () => URL.revokeObjectURL(objectUrl);
  }, [newBannerFile]);

  useEffect(() => {
    if (!editBannerFile) {
      setEditBannerPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      return;
    }
    const objectUrl = URL.createObjectURL(editBannerFile);
    setEditBannerPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    return () => URL.revokeObjectURL(objectUrl);
  }, [editBannerFile]);

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

  const resetNewBannerForm = () => {
    setNewBannerTitle("");
    setNewBannerSubTitle("");
    setNewBannerFile(null);
    setNewBannerStatus(1);
    if (newBannerPreviewUrl) {
      URL.revokeObjectURL(newBannerPreviewUrl);
      setNewBannerPreviewUrl("");
    }
  };

  const handleAddBanner = () => {
    resetNewBannerForm();
    setAddBannerOpen(true);
  };

  const handleSubmitNewBanner = async () => {
    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) {
      Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
      return;
    }
    if (!newBannerTitle.trim()) {
      Swal.fire("Error", "Please enter banner title.", "error");
      return;
    }
    if (!newBannerFile) {
      Swal.fire("Error", "Please select banner image.", "error");
      return;
    }

    setIsAddingBanner(true);
    try {
      const res = await hospitalService.addWebsiteBanner({
        hosuid: hospitalId,
        title: newBannerTitle,
        sub_title: newBannerSubTitle,
        banner_image: newBannerFile,
        status: newBannerStatus,
      });

      if (res.status && res.banner) {
        setWebsiteSettings((prev) => ({
          ...prev,
          banners: [
            ...prev.banners,
            {
              id: Number(res.banner?.id ?? Date.now()),
              title: res.banner.title || "",
              subTitle: res.banner.sub_title || "",
              image: res.banner.image || "",
              status: Number(res.banner.status ?? newBannerStatus ?? 1),
            },
          ],
        }));
        setAddBannerOpen(false);
        resetNewBannerForm();
        Swal.fire("Success", "Banner added successfully!", "success");
      } else {
        Swal.fire("Error", res.message || "Failed to add banner.", "error");
      }
    } catch {
      Swal.fire("Error", "Failed to add banner.", "error");
    } finally {
      setIsAddingBanner(false);
    }
  };

  const resetEditBannerForm = () => {
    setEditBannerId(null);
    setEditBannerTitle("");
    setEditBannerSubTitle("");
    setEditBannerFile(null);
    setEditBannerExistingImage("");
    setEditBannerStatus(1);
    if (editBannerPreviewUrl) {
      URL.revokeObjectURL(editBannerPreviewUrl);
      setEditBannerPreviewUrl("");
    }
  };

  const openEditBanner = (banner: WebsiteBannerForm) => {
    resetEditBannerForm();
    setEditBannerId(banner.id);
    setEditBannerTitle(banner.title || "");
    setEditBannerSubTitle(banner.subTitle || "");
    setEditBannerExistingImage(banner.image || "");
    setEditBannerStatus((banner.status ?? 1) === 1 ? 1 : 0);
    setEditBannerOpen(true);
  };

  const handleSubmitEditBanner = async () => {
    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) {
      Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
      return;
    }
    if (editBannerId === null) {
      Swal.fire("Error", "Banner not found.", "error");
      return;
    }
    if (!editBannerTitle.trim()) {
      Swal.fire("Error", "Please enter banner title.", "error");
      return;
    }

    setIsUpdatingBanner(true);
    try {
      const res = await hospitalService.updateWebsiteBanner({
        hosuid: hospitalId,
        banner_id: editBannerId,
        title: editBannerTitle,
        sub_title: editBannerSubTitle,
        status: editBannerStatus,
        banner_image: editBannerFile,
      });

      if (res.status && res.banner) {
        setWebsiteSettings((prev) => ({
          ...prev,
          banners: prev.banners.map((b) =>
            b.id === editBannerId
              ? {
                  ...b,
                  title: res.banner?.title || editBannerTitle,
                  subTitle: res.banner?.sub_title || editBannerSubTitle,
                  image: res.banner?.image || b.image,
                  status: Number(res.banner?.status ?? editBannerStatus ?? 1),
                }
              : b
          ),
        }));
        setEditBannerOpen(false);
        resetEditBannerForm();
        Swal.fire("Success", "Banner updated successfully!", "success");
      } else {
        Swal.fire("Error", res.message || "Failed to update banner.", "error");
      }
    } catch {
      Swal.fire("Error", "Failed to update banner.", "error");
    } finally {
      setIsUpdatingBanner(false);
    }
  };

  const openBannerPreview = (banner: WebsiteBannerForm) => {
    setPreviewBanner(banner);
    setPreviewOpen(true);
  };

  const handleWebsiteSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) {
      Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await hospitalService.updateWebsiteSettings({
        hosuid: hospitalId,
        about_title: websiteSettings.aboutTitle,
        about_description: websiteSettings.aboutDescription,
        website_template: websiteSettings.template,
        banners: websiteSettings.banners.map((b) => ({
          id: b.id,
          title: b.title,
          sub_title: b.subTitle,
          image: b.image,
          status: b.status,
        })),
      });

      if (result.status) {
        Swal.fire("Success", "Website settings updated successfully!", "success");
      } else {
        Swal.fire("Error", result.message || "Failed to update website settings.", "error");
      }
    } catch {
      Swal.fire("Error", "An error occurred while updating website settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBannerStatusToggle = async (bannerId: number, nextStatus: 0 | 1) => {
    const hospitalId = currentUser?.hosuid || currentUser?.loguid;
    if (!hospitalId) {
      Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
      return;
    }

    const previousBanners = websiteSettings.banners;
    setWebsiteSettings((prev) => ({
      ...prev,
      banners: prev.banners.map((b) => (b.id === bannerId ? { ...b, status: nextStatus } : b)),
    }));

    const res = await hospitalService.changeWebsiteBannerStatus({
      hosuid: hospitalId,
      banner_id: bannerId,
      status: nextStatus,
    });

    if (!res.status) {
      setWebsiteSettings((prev) => ({ ...prev, banners: previousBanners }));
      Swal.fire("Error", res.message || "Failed to update banner status.", "error");
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
      <Dialog
        open={addBannerOpen}
        onOpenChange={(open) => {
          setAddBannerOpen(open);
          if (!open) resetNewBannerForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Title</Label>
              <Input value={newBannerTitle} onChange={(e) => setNewBannerTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sub Title</Label>
              <Input value={newBannerSubTitle} onChange={(e) => setNewBannerSubTitle(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/10 px-3 py-2">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Banner Status</div>
                <div className="text-xs text-muted-foreground">{newBannerStatus === 1 ? "Active" : "Inactive"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    newBannerStatus === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {newBannerStatus === 1 ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={newBannerStatus === 1} onCheckedChange={(v) => setNewBannerStatus(v ? 1 : 0)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setNewBannerFile(file);
                  e.currentTarget.value = "";
                }}
                disabled={isAddingBanner}
              />
              {newBannerPreviewUrl ? (
                <img
                  src={newBannerPreviewUrl}
                  alt="Banner preview"
                  className="w-full max-h-56 object-contain rounded border bg-white"
                />
              ) : (
                <div className="text-sm text-muted-foreground border rounded p-4 bg-muted/20">
                  No image selected
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddBannerOpen(false)} disabled={isAddingBanner}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitNewBanner} disabled={isAddingBanner}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editBannerOpen}
        onOpenChange={(open) => {
          setEditBannerOpen(open);
          if (!open) resetEditBannerForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Title</Label>
              <Input value={editBannerTitle} onChange={(e) => setEditBannerTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sub Title</Label>
              <Input value={editBannerSubTitle} onChange={(e) => setEditBannerSubTitle(e.target.value)} />
            </div>
            <div className="flex items-center justify-between rounded-md border bg-muted/10 px-3 py-2">
              <div className="space-y-0.5">
                <div className="text-sm font-medium">Banner Status</div>
                <div className="text-xs text-muted-foreground">{editBannerStatus === 1 ? "Active" : "Inactive"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={
                    editBannerStatus === 1
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {editBannerStatus === 1 ? "Active" : "Inactive"}
                </Badge>
                <Switch checked={editBannerStatus === 1} onCheckedChange={(v) => setEditBannerStatus(v ? 1 : 0)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setEditBannerFile(file);
                  e.currentTarget.value = "";
                }}
                disabled={isUpdatingBanner}
              />
              {editBannerPreviewUrl ? (
                <img
                  src={editBannerPreviewUrl}
                  alt="Banner preview"
                  className="h-[60px] w-auto max-w-full object-contain rounded border bg-white mx-auto"
                />
              ) : editBannerExistingImage ? (
                <img
                  src={getImageUrl(editBannerExistingImage)}
                  alt="Banner"
                  className="h-[60px] w-auto max-w-full object-contain rounded border bg-white mx-auto"
                />
              ) : (
                <div className="text-sm text-muted-foreground border rounded p-4 bg-muted/20">
                  No image selected
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditBannerOpen(false)} disabled={isUpdatingBanner}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitEditBanner} disabled={isUpdatingBanner}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) setPreviewBanner(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewBanner?.title || "Banner Preview"}</DialogTitle>
          </DialogHeader>
          {previewBanner?.subTitle ? (
            <div className="text-sm text-muted-foreground">{previewBanner.subTitle}</div>
          ) : null}
          {previewBanner?.image ? (
            <img
              src={getImageUrl(previewBanner.image)}
              alt={previewBanner.title || "Banner"}
              className="w-full max-h-[70vh] object-contain rounded border bg-white"
            />
          ) : (
            <div className="text-sm text-muted-foreground border rounded p-6 bg-muted/20">
              No image
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={templatePreviewOpen}
        onOpenChange={(open) => {
          setTemplatePreviewOpen(open);
        }}
      >
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Template {templatePreviewId} Preview</DialogTitle>
          </DialogHeader>
          <div className="h-[75vh] overflow-auto rounded-md border bg-muted/10 p-6">
            <div className="mx-auto w-[1280px] overflow-hidden rounded-md border bg-white shadow-sm" style={{ zoom: 0.6 } as any}>
              {templatePreviewId === 1 ? (
                <Sampletemplates1 />
              ) : templatePreviewId === 2 ? (
                <Sampletemplates2 />
              ) : templatePreviewId === 3 ? (
                <Sampletemplates3 />
              ) : (
                <Sampletemplates4 />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
        <TabsList className="grid w-full grid-cols-3 lg:w-[650px] mb-8">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Privacy & Security</TabsTrigger>
          <TabsTrigger value="website">Website Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Profile Information</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const hosuid = currentUser?.hosuid || currentUser?.loguid;
                    const rawName = String(profileData.name || currentUser?.name || "hospital").trim();
                    const slug = encodeURIComponent(rawName.replace(/\s+/g, "-"));
                    if (!hosuid) return;
                    window.open(`/live-hospital/${slug}/${encodeURIComponent(String(hosuid))}`, "_blank", "noopener,noreferrer");
                  }}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Show Website
                </Button>
              </div>
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
                            src={profileData.hospitalQrCode.startsWith('data:') ? profileData.hospitalQrCode : `${apiUrl}/${profileData.hospitalQrCode}`} 
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

        <TabsContent value="website">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Website Settings</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const hosuid = currentUser?.hosuid || currentUser?.loguid;
                    const rawName = String(profileData.name || currentUser?.name || "hospital").trim();
                    const slug = encodeURIComponent(rawName.replace(/\s+/g, "-"));
                    if (!hosuid) return;
                    window.open(`/live-hospital/${slug}/${encodeURIComponent(String(hosuid))}`, "_blank", "noopener,noreferrer");
                  }}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Live Show Website
                </Button>
              </div>
              <CardDescription>
                Manage banners, About Us content, and website template selection.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Website Template</Label>
                  <Select
                    value={websiteSettings.template}
                    onValueChange={(value) => setWebsiteSettings((prev) => ({ ...prev, template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="template_1">Template 1</SelectItem>
                      <SelectItem value="template_2">Template 2</SelectItem>
                      <SelectItem value="template_3">Template 3</SelectItem>
                      <SelectItem value="template_4">Template 4</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {([1, 2, 3, 4] as const).map((id) => {
                      const templateKey = `template_${id}`;
                      const isSelected = websiteSettings.template === templateKey;
                      const templateImg =
                        id === 1 ? template01Img : id === 2 ? template02Img : id === 3 ? template03Img : template04Img;
                      return (
                        <div
                          key={id}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setWebsiteSettings((prev) => ({ ...prev, template: templateKey }));
                            setTemplatePreviewId(id);
                            setTemplatePreviewOpen(true);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setWebsiteSettings((prev) => ({ ...prev, template: templateKey }));
                              setTemplatePreviewId(id);
                              setTemplatePreviewOpen(true);
                            }
                          }}
                          className={`cursor-pointer rounded-md border p-3 transition-colors ${
                            isSelected
                              ? "border-slate-900 bg-slate-50"
                              : "border-input bg-background hover:bg-muted/10"
                          }`}
                        >
                          <div className="h-14 overflow-hidden rounded border bg-white">
                            <img
                              src={templateImg}
                              alt={`Template ${id}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">Template {id}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {isSelected ? "Selected" : " "}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={async () => {
                        const hospitalId = currentUser?.hosuid || currentUser?.loguid;
                        if (!hospitalId) {
                          Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
                          return;
                        }
                        const map: Record<string, 1 | 2 | 3 | 4> = {
                          template_1: 1, template_2: 2, template_3: 3, template_4: 4,
                        };
                        const selected = websiteSettings.template || "template_1";
                        const template_id = map[selected] ?? 1;
                        const res = await hospitalService.updateWebsiteTemplate({ hosuid: hospitalId, template_id });
                        if (res.status) {
                          Swal.fire("Success", "Website template saved", "success");
                        } else {
                          Swal.fire("Error", res.message || "Failed to save website template", "error");
                        }
                      }}
                    >
                      Save Template
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">About Title</Label>
                    <Input
                      id="aboutTitle"
                      value={websiteSettings.aboutTitle}
                      onChange={(e) => setWebsiteSettings((prev) => ({ ...prev, aboutTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="aboutDescription">About Description</Label>
                    <Textarea
                      id="aboutDescription"
                      value={websiteSettings.aboutDescription}
                      onChange={(e) => setWebsiteSettings((prev) => ({ ...prev, aboutDescription: e.target.value }))}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>About Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setAboutImageFile(file);
                        if (aboutImagePreviewUrl) {
                          URL.revokeObjectURL(aboutImagePreviewUrl);
                          setAboutImagePreviewUrl("");
                        }
                        if (file) {
                          setAboutImagePreviewUrl(URL.createObjectURL(file));
                        }
                        e.currentTarget.value = "";
                      }}
                    />
                    {aboutImagePreviewUrl ? (
                      <img
                        src={aboutImagePreviewUrl}
                        alt="About preview"
                        className="h-[80px] w-auto max-w-full object-contain rounded border bg-white"
                      />
                    ) : websiteSettings.aboutImage ? (
                      <img
                        src={getImageUrl(websiteSettings.aboutImage)}
                        alt="About"
                        className="h-[80px] w-auto max-w-full object-contain rounded border bg-white"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground border rounded p-4 bg-muted/20">
                        No image selected
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={async () => {
                        const hospitalId = currentUser?.hosuid || currentUser?.loguid;
                        if (!hospitalId) {
                          Swal.fire("Error", "Hospital ID not found. Please login again.", "error");
                          return;
                        }
                        const res = await hospitalService.updateWebsiteAbout({
                          hosuid: hospitalId,
                          about_title: websiteSettings.aboutTitle,
                          about_description: websiteSettings.aboutDescription,
                          about_image: aboutImageFile,
                        });
                        if (res.status) {
                          if (res.about_image) {
                            setWebsiteSettings((prev) => ({ ...prev, aboutImage: res.about_image || prev.aboutImage }));
                            setAboutImageFile(null);
                            if (aboutImagePreviewUrl) {
                              URL.revokeObjectURL(aboutImagePreviewUrl);
                              setAboutImagePreviewUrl("");
                            }
                          }
                          Swal.fire("Success", "About information saved", "success");
                        } else {
                          Swal.fire("Error", res.message || "Failed to save about information", "error");
                        }
                      }}
                    >
                      Save About
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Banner Setting</div>
                      <div className="text-xs text-muted-foreground">Add and manage homepage banners.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={bannerView === "grid" ? "default" : "ghost"}
                          onClick={() => setBannerView("grid")}
                          className="h-8 px-2"
                        >
                          <Grid3x3 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={bannerView === "table" ? "default" : "ghost"}
                          onClick={() => setBannerView("table")}
                          className="h-8 px-2"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button type="button" variant="outline" onClick={handleAddBanner}>
                        Add Banner
                      </Button>
                    </div>
                  </div>

                  {websiteSettings.banners.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No banners added.</div>
                  ) : (
                    bannerView === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {websiteSettings.banners.map((banner, idx) => (
                          <div key={banner.id} className="border rounded-md overflow-hidden bg-background">
                            <div className="flex items-start justify-between gap-3 p-4">
                              <div className="min-w-0">
                                <div className="text-sm font-medium">Banner {idx + 1}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {banner.title || "Untitled"} {banner.subTitle ? `• ${banner.subTitle}` : ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={
                                    banner.status === 1
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {banner.status === 1 ? "Active" : "Inactive"}
                                </Badge>
                                <Switch
                                  checked={banner.status === 1}
                                  onCheckedChange={(checked) => handleBannerStatusToggle(banner.id, checked ? 1 : 0)}
                                />
                                <Button type="button" size="sm" variant="outline" onClick={() => openEditBanner(banner)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button type="button" size="sm" variant="outline" onClick={() => openBannerPreview(banner)}>
                                  Preview
                                </Button>
                              </div>
                            </div>
                            <div className="border-t bg-muted/10">
                              {banner.image ? (
                                <button
                                  type="button"
                                  onClick={() => openBannerPreview(banner)}
                                  className="w-full text-left"
                                >
                                  <img
                                    src={getImageUrl(banner.image)}
                                    alt={`Banner ${idx + 1}`}
                                    className="w-full h-40 object-cover"
                                  />
                                </button>
                              ) : (
                                <div className="text-sm text-muted-foreground p-6">No image</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[70px]">#</TableHead>
                              <TableHead className="w-[96px]">Image</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Sub Title</TableHead>
                              <TableHead className="w-[180px]">Status</TableHead>
                              <TableHead className="text-right w-[130px]">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {websiteSettings.banners.map((banner, idx) => (
                              <TableRow key={banner.id}>
                                <TableCell className="font-medium">{idx + 1}</TableCell>
                                <TableCell>
                                  {banner.image ? (
                                    <button
                                      type="button"
                                      onClick={() => openBannerPreview(banner)}
                                      className="h-10 w-16 overflow-hidden rounded border bg-white"
                                    >
                                      <img
                                        src={getImageUrl(banner.image)}
                                        alt={`Banner ${idx + 1}`}
                                        className="h-10 w-16 object-cover"
                                      />
                                    </button>
                                  ) : (
                                    <div className="h-10 w-16 rounded border bg-muted/20" />
                                  )}
                                </TableCell>
                                <TableCell className="max-w-[260px] truncate">{banner.title || "Untitled"}</TableCell>
                                <TableCell className="max-w-[260px] truncate">{banner.subTitle || "-"}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="secondary"
                                      className={
                                        banner.status === 1
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-gray-100 text-gray-700"
                                      }
                                    >
                                      {banner.status === 1 ? "Active" : "Inactive"}
                                    </Badge>
                                    <Switch
                                      checked={banner.status === 1}
                                      onCheckedChange={(checked) => handleBannerStatusToggle(banner.id, checked ? 1 : 0)}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={() => openEditBanner(banner)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => openBannerPreview(banner)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Preview
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
