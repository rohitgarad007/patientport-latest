import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Layout, 
  Palette, 
  Type, 
  Image, 
  Volume2, 
  Clock,
  Monitor,
  User,
  ListOrdered,
  MessageSquare,
  Settings2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Grid3X3,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  MoveHorizontal,
  MoveVertical,
  ZoomIn,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { screens, screenZones, doctors } from "@/data/dummyData-2";
import { useToast } from "@/hooks/use-toast";

const fontFamilies = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
];

const fontSizes = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const animations = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "pulse", label: "Pulse" },
  { value: "bounce", label: "Bounce" },
];

export default function ScreenSettings2() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("layout");
  const [selectedScreen, setSelectedScreen] = useState(screens[0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Zone settings state
  const [headerSettings, setHeaderSettings] = useState({
    showLogo: true,
    showDateTime: true,
    showDepartment: true,
    backgroundColor: "primary",
    height: 80,
    logoSize: 40,
  });

  const [doctorSettings, setDoctorSettings] = useState({
    showAvatar: true,
    avatarSize: 120,
    showName: true,
    showSpecialty: true,
    showRoom: true,
    showStatus: true,
    showAvgTime: true,
    nameSize: "large",
    layout: "vertical",
  });

  const [tokenSettings, setTokenSettings] = useState({
    fontSize: "extra-large",
    fontFamily: "inter",
    fontWeight: "bold",
    showLabel: true,
    labelText: "Now Serving",
    showPatientName: true,
    showVisitType: true,
    animation: "pulse",
    backgroundColor: "gradient",
    borderRadius: 24,
    padding: 32,
  });

  const [queueSettings, setQueueSettings] = useState({
    show: true,
    maxVisible: 5,
    showToken: true,
    showName: true,
    showTime: true,
    showVisitType: true,
    layout: "list",
    animation: "slide",
    itemSpacing: 12,
  });

  const [footerSettings, setFooterSettings] = useState({
    show: true,
    showScrollingMessage: true,
    message: "Please have your documents ready. Thank you for your patience.",
    scrollSpeed: 50,
    showEmergencyContact: true,
    emergencyNumber: "911",
    height: 60,
  });

  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "#1e40af",
    accentColor: "#14b8a6",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    fontFamily: "inter",
    borderRadius: 12,
    shadowIntensity: 50,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your screen settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to defaults.",
    });
  };

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Screen Settings</h1>
            <p className="text-muted-foreground mt-1">Fine-tune every aspect of your display screens</p>
          </div>
          <div className="flex items-center gap-3">
            <Select 
              value={selectedScreen.id} 
              onValueChange={(v) => setSelectedScreen(screens.find(s => s.id === v) || screens[0])}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select screen" />
              </SelectTrigger>
              <SelectContent>
                {screens.map((screen) => (
                  <SelectItem key={screen.id} value={screen.id}>
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      {screen.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="xl:col-span-2">
            <Card className="overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="border-b bg-muted/30 px-4">
                  <TabsList className="h-14 bg-transparent">
                    <TabsTrigger value="layout" className="gap-2 data-[state=active]:bg-background">
                      <Layout className="w-4 h-4" />
                      Layout
                    </TabsTrigger>
                    <TabsTrigger value="header" className="gap-2 data-[state=active]:bg-background">
                      <Sparkles className="w-4 h-4" />
                      Header
                    </TabsTrigger>
                    <TabsTrigger value="doctor" className="gap-2 data-[state=active]:bg-background">
                      <User className="w-4 h-4" />
                      Doctor
                    </TabsTrigger>
                    <TabsTrigger value="token" className="gap-2 data-[state=active]:bg-background">
                      <Type className="w-4 h-4" />
                      Token
                    </TabsTrigger>
                    <TabsTrigger value="queue" className="gap-2 data-[state=active]:bg-background">
                      <ListOrdered className="w-4 h-4" />
                      Queue
                    </TabsTrigger>
                    <TabsTrigger value="footer" className="gap-2 data-[state=active]:bg-background">
                      <MessageSquare className="w-4 h-4" />
                      Footer
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="gap-2 data-[state=active]:bg-background">
                      <Palette className="w-4 h-4" />
                      Theme
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    {/* Layout Tab */}
                    <TabsContent value="layout" className="m-0 space-y-6">
                      <SettingSection title="Screen Layout" description="Choose how content is arranged on the screen">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {["standard", "compact", "split", "emergency"].map((layout) => (
                            <div
                              key={layout}
                              className={cn(
                                "p-4 rounded-lg border-2 cursor-pointer transition-all text-center",
                                selectedScreen.layout === layout 
                                  ? "border-primary bg-primary/5" 
                                  : "border-muted hover:border-muted-foreground/30"
                              )}
                            >
                              <Grid3X3 className="w-6 h-6 mx-auto text-muted-foreground" />
                              <p className="text-sm font-medium mt-2 capitalize">{layout}</p>
                            </div>
                          ))}
                        </div>
                      </SettingSection>

                      <SettingSection title="Screen Dimensions" description="Configure display resolution and orientation">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Resolution</Label>
                            <Select defaultValue={selectedScreen.resolution}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1920x1080">1920×1080 (FHD)</SelectItem>
                                <SelectItem value="1280x720">1280×720 (HD)</SelectItem>
                                <SelectItem value="3840x2160">3840×2160 (4K)</SelectItem>
                                <SelectItem value="1080x1920">1080×1920 (Portrait)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Orientation</Label>
                            <Select defaultValue="landscape">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="landscape">Landscape</SelectItem>
                                <SelectItem value="portrait">Portrait</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </SettingSection>

                      <SettingSection title="Zone Visibility" description="Toggle visibility of different screen zones">
                        <div className="space-y-3">
                          {[
                            { key: "header", label: "Header Zone", icon: Sparkles },
                            { key: "doctor", label: "Doctor Info", icon: User },
                            { key: "token", label: "Token Display", icon: Type },
                            { key: "queue", label: "Queue List", icon: ListOrdered },
                            { key: "footer", label: "Footer Zone", icon: MessageSquare },
                          ].map((zone) => (
                            <div key={zone.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                <zone.icon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{zone.label}</span>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          ))}
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Header Tab */}
                    <TabsContent value="header" className="m-0 space-y-6">
                      <SettingSection title="Header Content" description="Configure what appears in the header">
                        <div className="space-y-4">
                          <SettingRow label="Show Logo" description="Display the hospital/clinic logo">
                            <Switch
                              checked={headerSettings.showLogo}
                              onCheckedChange={(v) => setHeaderSettings(s => ({ ...s, showLogo: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Date & Time" description="Display current date and time">
                            <Switch
                              checked={headerSettings.showDateTime}
                              onCheckedChange={(v) => setHeaderSettings(s => ({ ...s, showDateTime: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Department" description="Display department name">
                            <Switch
                              checked={headerSettings.showDepartment}
                              onCheckedChange={(v) => setHeaderSettings(s => ({ ...s, showDepartment: v }))}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>

                      <SettingSection title="Header Dimensions" description="Adjust header size and spacing">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Header Height</Label>
                              <span className="text-sm text-muted-foreground">{headerSettings.height}px</span>
                            </div>
                            <Slider
                              value={[headerSettings.height]}
                              onValueChange={([v]) => setHeaderSettings(s => ({ ...s, height: v }))}
                              min={40}
                              max={120}
                              step={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Logo Size</Label>
                              <span className="text-sm text-muted-foreground">{headerSettings.logoSize}px</span>
                            </div>
                            <Slider
                              value={[headerSettings.logoSize]}
                              onValueChange={([v]) => setHeaderSettings(s => ({ ...s, logoSize: v }))}
                              min={24}
                              max={80}
                              step={4}
                            />
                          </div>
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Doctor Tab */}
                    <TabsContent value="doctor" className="m-0 space-y-6">
                      <SettingSection title="Doctor Information" description="Configure doctor display settings">
                        <div className="space-y-4">
                          <SettingRow label="Show Avatar" description="Display doctor's profile photo">
                            <Switch
                              checked={doctorSettings.showAvatar}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showAvatar: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Name" description="Display doctor's full name">
                            <Switch
                              checked={doctorSettings.showName}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showName: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Specialty" description="Display medical specialty">
                            <Switch
                              checked={doctorSettings.showSpecialty}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showSpecialty: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Room Number" description="Display consultation room">
                            <Switch
                              checked={doctorSettings.showRoom}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showRoom: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Status" description="Display online/busy status">
                            <Switch
                              checked={doctorSettings.showStatus}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showStatus: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Avg. Time" description="Display average consultation time">
                            <Switch
                              checked={doctorSettings.showAvgTime}
                              onCheckedChange={(v) => setDoctorSettings(s => ({ ...s, showAvgTime: v }))}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>

                      <SettingSection title="Avatar Settings" description="Configure doctor avatar display">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Avatar Size</Label>
                              <span className="text-sm text-muted-foreground">{doctorSettings.avatarSize}px</span>
                            </div>
                            <Slider
                              value={[doctorSettings.avatarSize]}
                              onValueChange={([v]) => setDoctorSettings(s => ({ ...s, avatarSize: v }))}
                              min={60}
                              max={200}
                              step={10}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Layout</Label>
                            <Select 
                              value={doctorSettings.layout}
                              onValueChange={(v) => setDoctorSettings(s => ({ ...s, layout: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vertical">Vertical</SelectItem>
                                <SelectItem value="horizontal">Horizontal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Token Tab */}
                    <TabsContent value="token" className="m-0 space-y-6">
                      <SettingSection title="Token Display" description="Configure the main token number display">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Font Size</Label>
                            <Select 
                              value={tokenSettings.fontSize}
                              onValueChange={(v) => setTokenSettings(s => ({ ...s, fontSize: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontSizes.map((size) => (
                                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select 
                              value={tokenSettings.fontFamily}
                              onValueChange={(v) => setTokenSettings(s => ({ ...s, fontFamily: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </SettingSection>

                      <SettingSection title="Token Content" description="Configure additional token information">
                        <div className="space-y-4">
                          <SettingRow label="Show Label" description="Display 'Now Serving' label">
                            <Switch
                              checked={tokenSettings.showLabel}
                              onCheckedChange={(v) => setTokenSettings(s => ({ ...s, showLabel: v }))}
                            />
                          </SettingRow>
                          {tokenSettings.showLabel && (
                            <div className="space-y-2">
                              <Label>Label Text</Label>
                              <Input
                                value={tokenSettings.labelText}
                                onChange={(e) => setTokenSettings(s => ({ ...s, labelText: e.target.value }))}
                              />
                            </div>
                          )}
                          <SettingRow label="Show Patient Name" description="Display patient's name">
                            <Switch
                              checked={tokenSettings.showPatientName}
                              onCheckedChange={(v) => setTokenSettings(s => ({ ...s, showPatientName: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Visit Type" description="Display appointment type">
                            <Switch
                              checked={tokenSettings.showVisitType}
                              onCheckedChange={(v) => setTokenSettings(s => ({ ...s, showVisitType: v }))}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>

                      <SettingSection title="Token Animation" description="Configure token animations">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Animation Style</Label>
                            <Select 
                              value={tokenSettings.animation}
                              onValueChange={(v) => setTokenSettings(s => ({ ...s, animation: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {animations.map((anim) => (
                                  <SelectItem key={anim.value} value={anim.value}>{anim.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Border Radius</Label>
                              <span className="text-sm text-muted-foreground">{tokenSettings.borderRadius}px</span>
                            </div>
                            <Slider
                              value={[tokenSettings.borderRadius]}
                              onValueChange={([v]) => setTokenSettings(s => ({ ...s, borderRadius: v }))}
                              min={0}
                              max={48}
                              step={4}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Padding</Label>
                              <span className="text-sm text-muted-foreground">{tokenSettings.padding}px</span>
                            </div>
                            <Slider
                              value={[tokenSettings.padding]}
                              onValueChange={([v]) => setTokenSettings(s => ({ ...s, padding: v }))}
                              min={16}
                              max={64}
                              step={4}
                            />
                          </div>
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Queue Tab */}
                    <TabsContent value="queue" className="m-0 space-y-6">
                      <SettingSection title="Queue Display" description="Configure the waiting queue display">
                        <div className="space-y-4">
                          <SettingRow label="Show Queue" description="Display the waiting queue section">
                            <Switch
                              checked={queueSettings.show}
                              onCheckedChange={(v) => setQueueSettings(s => ({ ...s, show: v }))}
                            />
                          </SettingRow>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Max Visible Items</Label>
                              <span className="text-sm text-muted-foreground">{queueSettings.maxVisible}</span>
                            </div>
                            <Slider
                              value={[queueSettings.maxVisible]}
                              onValueChange={([v]) => setQueueSettings(s => ({ ...s, maxVisible: v }))}
                              min={3}
                              max={10}
                              step={1}
                            />
                          </div>
                        </div>
                      </SettingSection>

                      <SettingSection title="Queue Item Content" description="Configure what's shown for each queue item">
                        <div className="space-y-4">
                          <SettingRow label="Show Token Number">
                            <Switch
                              checked={queueSettings.showToken}
                              onCheckedChange={(v) => setQueueSettings(s => ({ ...s, showToken: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Patient Name">
                            <Switch
                              checked={queueSettings.showName}
                              onCheckedChange={(v) => setQueueSettings(s => ({ ...s, showName: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Time">
                            <Switch
                              checked={queueSettings.showTime}
                              onCheckedChange={(v) => setQueueSettings(s => ({ ...s, showTime: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Show Visit Type">
                            <Switch
                              checked={queueSettings.showVisitType}
                              onCheckedChange={(v) => setQueueSettings(s => ({ ...s, showVisitType: v }))}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>

                      <SettingSection title="Queue Layout" description="Configure queue appearance">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Layout Style</Label>
                            <Select 
                              value={queueSettings.layout}
                              onValueChange={(v) => setQueueSettings(s => ({ ...s, layout: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="list">List View</SelectItem>
                                <SelectItem value="grid">Grid View</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Animation</Label>
                            <Select 
                              value={queueSettings.animation}
                              onValueChange={(v) => setQueueSettings(s => ({ ...s, animation: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {animations.map((anim) => (
                                  <SelectItem key={anim.value} value={anim.value}>{anim.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Item Spacing</Label>
                              <span className="text-sm text-muted-foreground">{queueSettings.itemSpacing}px</span>
                            </div>
                            <Slider
                              value={[queueSettings.itemSpacing]}
                              onValueChange={([v]) => setQueueSettings(s => ({ ...s, itemSpacing: v }))}
                              min={4}
                              max={24}
                              step={2}
                            />
                          </div>
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Footer Tab */}
                    <TabsContent value="footer" className="m-0 space-y-6">
                      <SettingSection title="Footer Display" description="Configure footer content">
                        <div className="space-y-4">
                          <SettingRow label="Show Footer" description="Enable footer section">
                            <Switch
                              checked={footerSettings.show}
                              onCheckedChange={(v) => setFooterSettings(s => ({ ...s, show: v }))}
                            />
                          </SettingRow>
                          <SettingRow label="Scrolling Message" description="Enable scrolling announcements">
                            <Switch
                              checked={footerSettings.showScrollingMessage}
                              onCheckedChange={(v) => setFooterSettings(s => ({ ...s, showScrollingMessage: v }))}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>

                      {footerSettings.showScrollingMessage && (
                        <SettingSection title="Message Content" description="Configure scrolling message">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Message Text</Label>
                              <Input
                                value={footerSettings.message}
                                onChange={(e) => setFooterSettings(s => ({ ...s, message: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Scroll Speed</Label>
                                <span className="text-sm text-muted-foreground">{footerSettings.scrollSpeed}%</span>
                              </div>
                              <Slider
                                value={[footerSettings.scrollSpeed]}
                                onValueChange={([v]) => setFooterSettings(s => ({ ...s, scrollSpeed: v }))}
                                min={10}
                                max={100}
                                step={5}
                              />
                            </div>
                          </div>
                        </SettingSection>
                      )}

                      <SettingSection title="Emergency Contact" description="Configure emergency information">
                        <div className="space-y-4">
                          <SettingRow label="Show Emergency Contact">
                            <Switch
                              checked={footerSettings.showEmergencyContact}
                              onCheckedChange={(v) => setFooterSettings(s => ({ ...s, showEmergencyContact: v }))}
                            />
                          </SettingRow>
                          {footerSettings.showEmergencyContact && (
                            <div className="space-y-2">
                              <Label>Emergency Number</Label>
                              <Input
                                value={footerSettings.emergencyNumber}
                                onChange={(e) => setFooterSettings(s => ({ ...s, emergencyNumber: e.target.value }))}
                              />
                            </div>
                          )}
                        </div>
                      </SettingSection>
                    </TabsContent>

                    {/* Theme Tab */}
                    <TabsContent value="theme" className="m-0 space-y-6">
                      <SettingSection title="Color Scheme" description="Customize your screen colors">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeSettings.primaryColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, primaryColor: e.target.value }))}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={themeSettings.primaryColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, primaryColor: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Accent Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeSettings.accentColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, accentColor: e.target.value }))}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={themeSettings.accentColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, accentColor: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeSettings.backgroundColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={themeSettings.backgroundColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, backgroundColor: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Text Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={themeSettings.textColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, textColor: e.target.value }))}
                                className="w-12 h-10 p-1 cursor-pointer"
                              />
                              <Input
                                value={themeSettings.textColor}
                                onChange={(e) => setThemeSettings(s => ({ ...s, textColor: e.target.value }))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </SettingSection>

                      <SettingSection title="Typography" description="Configure fonts and text styles">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select 
                              value={themeSettings.fontFamily}
                              onValueChange={(v) => setThemeSettings(s => ({ ...s, fontFamily: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </SettingSection>

                      <SettingSection title="Effects" description="Configure visual effects">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Border Radius</Label>
                              <span className="text-sm text-muted-foreground">{themeSettings.borderRadius}px</span>
                            </div>
                            <Slider
                              value={[themeSettings.borderRadius]}
                              onValueChange={([v]) => setThemeSettings(s => ({ ...s, borderRadius: v }))}
                              min={0}
                              max={32}
                              step={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Shadow Intensity</Label>
                              <span className="text-sm text-muted-foreground">{themeSettings.shadowIntensity}%</span>
                            </div>
                            <Slider
                              value={[themeSettings.shadowIntensity]}
                              onValueChange={([v]) => setThemeSettings(s => ({ ...s, shadowIntensity: v }))}
                              min={0}
                              max={100}
                              step={5}
                            />
                          </div>
                          <SettingRow label="Dark Mode" description="Use dark theme for screen">
                            <Switch
                              checked={isDarkMode}
                              onCheckedChange={setIsDarkMode}
                            />
                          </SettingRow>
                        </div>
                      </SettingSection>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </Card>
          </div>

          {/* Preview Panel */}
          <Card className="p-4 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Sun className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mini Preview Screen */}
            <div 
              className="aspect-video rounded-lg overflow-hidden border-2 border-muted"
              style={{ backgroundColor: themeSettings.backgroundColor }}
            >
              <div className="h-full flex flex-col p-2 text-xs" style={{ color: themeSettings.textColor }}>
                {/* Header */}
                {headerSettings.showLogo && (
                  <div 
                    className="flex items-center justify-between p-2 rounded mb-2"
                    style={{ backgroundColor: `${themeSettings.primaryColor}20` }}
                  >
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: themeSettings.primaryColor }}
                      />
                      <span className="font-medium" style={{ fontSize: '8px' }}>{selectedScreen.name}</span>
                    </div>
                    {headerSettings.showDateTime && (
                      <span style={{ fontSize: '7px' }}>10:30 AM</span>
                    )}
                  </div>
                )}

                {/* Doctor Info */}
                {doctorSettings.showAvatar && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={selectedScreen.doctor.avatar} />
                      <AvatarFallback style={{ fontSize: '6px' }}>DR</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" style={{ fontSize: '7px' }}>{selectedScreen.doctor.name}</p>
                      <p style={{ fontSize: '6px', opacity: 0.7 }}>{selectedScreen.doctor.room}</p>
                    </div>
                  </div>
                )}

                {/* Token */}
                <div className="flex-1 flex items-center justify-center">
                  <div 
                    className="text-center px-4 py-2 rounded-lg"
                    style={{ 
                      backgroundColor: themeSettings.primaryColor,
                      borderRadius: `${tokenSettings.borderRadius / 4}px`
                    }}
                  >
                    {tokenSettings.showLabel && (
                      <p style={{ fontSize: '6px', color: 'white', opacity: 0.8 }}>{tokenSettings.labelText}</p>
                    )}
                    <p className="font-bold text-white" style={{ fontSize: '14px' }}>
                      {selectedScreen.currentPatient?.token || "A-001"}
                    </p>
                  </div>
                </div>

                {/* Queue */}
                {queueSettings.show && (
                  <div className="mt-2">
                    <p style={{ fontSize: '6px', opacity: 0.7 }}>Next in queue:</p>
                    <div className="flex gap-1 mt-1">
                      {["A-02", "A-03", "A-04"].slice(0, queueSettings.maxVisible).map((t) => (
                        <Badge 
                          key={t} 
                          variant="outline" 
                          className="text-[6px] px-1 py-0"
                          style={{ borderColor: themeSettings.accentColor }}
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                {footerSettings.show && (
                  <div 
                    className="mt-2 p-1 rounded text-center"
                    style={{ backgroundColor: `${themeSettings.primaryColor}10`, fontSize: '5px' }}
                  >
                    {footerSettings.message.substring(0, 40)}...
                  </div>
                )}
              </div>
            </div>

            {/* Screen Info */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Screen</span>
                <span className="font-medium">{selectedScreen.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resolution</span>
                <span className="font-medium">{selectedScreen.resolution}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Layout</span>
                <span className="font-medium capitalize">{selectedScreen.layout}</span>
              </div>
              <Separator className="my-2" />
              <Button variant="outline" className="w-full gap-2" size="sm">
                <Maximize2 className="w-4 h-4" />
                Open Full Preview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    
  );
}

function SettingSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
