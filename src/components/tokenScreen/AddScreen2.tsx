import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Monitor, 
  MapPin, 
  User,
  Settings2,
  Layout,
  Palette,
  Volume2,
  Wifi,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Grid3X3,
  Layers,
  Zap,
  Clock,
  Bell,
  Eye
} from "lucide-react";
import { doctors, layoutOptions } from "@/data/dummyData-2";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Basic Info", icon: Monitor, description: "Name & location" },
  { id: 2, title: "Assignment", icon: User, description: "Doctor & department" },
  { id: 3, title: "Display", icon: Layout, description: "Layout & resolution" },
  { id: 4, title: "Review", icon: CheckCircle2, description: "Confirm setup" },
];

const resolutions = [
  { value: "1920x1080", label: "Full HD (1920×1080)", aspect: "16:9" },
  { value: "1280x720", label: "HD (1280×720)", aspect: "16:9" },
  { value: "1080x1920", label: "Portrait FHD (1080×1920)", aspect: "9:16" },
  { value: "3840x2160", label: "4K UHD (3840×2160)", aspect: "16:9" },
];

const colorThemes = [
  { id: "blue", name: "Medical Blue", primary: "#1e40af", accent: "#14b8a6" },
  { id: "green", name: "Healing Green", primary: "#15803d", accent: "#22c55e" },
  { id: "purple", name: "Royal Purple", primary: "#7c3aed", accent: "#a78bfa" },
  { id: "dark", name: "Dark Mode", primary: "#1f2937", accent: "#60a5fa" },
];

export default function AddScreen2() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    doctorId: "",
    resolution: "1920x1080",
    layout: "standard",
    theme: "blue",
    showLogo: true,
    showDateTime: true,
    showQueue: true,
    enableAudio: true,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Screen Created Successfully!",
      description: `${formData.name} has been added to your screens.`,
    });
    navigate("/manage-screens-2");
  };

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Screen</h1>
          <p className="text-muted-foreground mt-1">Configure a new display screen for your token system</p>
        </div>

        {/* Progress Steps */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={cn(
                    "flex items-center gap-3 cursor-pointer",
                    currentStep >= step.id ? "opacity-100" : "opacity-50"
                  )}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    currentStep === step.id && "bg-primary text-primary-foreground",
                    currentStep > step.id && "bg-success text-success-foreground",
                    currentStep < step.id && "bg-muted text-muted-foreground"
                  )}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground mx-4 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 p-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Basic Information
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Enter the basic details for your screen</p>
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Screen Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Main Lobby Display"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="e.g., Building A - Ground Floor"
                        className="pl-10"
                        value={formData.location}
                        onChange={(e) => updateFormData("location", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional notes about this screen..."
                      value={formData.description}
                      onChange={(e) => updateFormData("description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>


              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Doctor Assignment
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Select which doctor this screen will display</p>
                </div>
                <Separator />
                <div className="grid gap-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        formData.doctorId === doctor.id 
                          ? "border-primary bg-primary/5" 
                          : "border-transparent bg-muted/50 hover:border-muted"
                      )}
                      onClick={() => updateFormData("doctorId", doctor.id)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={doctor.avatar} alt={doctor.name} />
                        <AvatarFallback>{doctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{doctor.name}</p>
                          <Badge 
                            variant={doctor.status === "online" ? "default" : "secondary"}
                            className={cn(
                              "text-xs",
                              doctor.status === "online" && "bg-success text-success-foreground"
                            )}
                          >
                            {doctor.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{doctor.department} • {doctor.specialty}</p>
                        <p className="text-xs text-muted-foreground mt-1">{doctor.room} • {doctor.avgTime}</p>
                      </div>
                      {formData.doctorId === doctor.id && (
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary" />
                    Display Settings
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Configure resolution and layout options</p>
                </div>
                <Separator />
                
                {/* Resolution */}
                <div className="space-y-3">
                  <Label>Screen Resolution</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {resolutions.map((res) => (
                      <div
                        key={res.value}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.resolution === res.value 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-muted-foreground/30"
                        )}
                        onClick={() => updateFormData("resolution", res.value)}
                      >
                        <div className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{res.label}</span>
                        </div>
                        <Badge variant="outline" className="mt-2 text-xs">{res.aspect}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <Label>Layout Template</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {layoutOptions.map((layout) => (
                      <div
                        key={layout.id}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all",
                          formData.layout === layout.id 
                            ? "border-primary bg-primary/5" 
                            : "border-muted hover:border-muted-foreground/30"
                        )}
                        onClick={() => updateFormData("layout", layout.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{layout.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{layout.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-4 pt-4">
                  <Label>Display Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Show Logo</span>
                      </div>
                      <Switch
                        checked={formData.showLogo}
                        onCheckedChange={(v) => updateFormData("showLogo", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Show Date & Time</span>
                      </div>
                      <Switch
                        checked={formData.showDateTime}
                        onCheckedChange={(v) => updateFormData("showDateTime", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Show Queue List</span>
                      </div>
                      <Switch
                        checked={formData.showQueue}
                        onCheckedChange={(v) => updateFormData("showQueue", v)}
                      />
                    </div>
                  </div>
                </div>

                {/* Audio & Refresh */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Audio Announcements</p>
                        <p className="text-xs text-muted-foreground">Play sound when token is called</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.enableAudio}
                      onCheckedChange={(v) => updateFormData("enableAudio", v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Auto Refresh</p>
                        <p className="text-xs text-muted-foreground">Update display every {formData.refreshInterval}s</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.autoRefresh}
                      onCheckedChange={(v) => updateFormData("autoRefresh", v)}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    Review Configuration
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Review your settings before creating the screen</p>
                </div>
                <Separator />
                
                <div className="space-y-4">
                  <ReviewSection title="Basic Information">
                    <ReviewItem label="Name" value={formData.name || "Not set"} />
                    <ReviewItem label="Location" value={formData.location || "Not set"} />
                    <ReviewItem label="Description" value={formData.description || "None"} />
                  </ReviewSection>

                  <ReviewSection title="Assignment">
                    {selectedDoctor ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedDoctor.avatar} alt={selectedDoctor.name} />
                          <AvatarFallback>{selectedDoctor.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDoctor.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedDoctor.department}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No doctor assigned</span>
                    )}
                  </ReviewSection>

                  <ReviewSection title="Display Settings">
                    <ReviewItem label="Resolution" value={formData.resolution} />
                    <ReviewItem label="Layout" value={layoutOptions.find(l => l.id === formData.layout)?.name || formData.layout} />
                  </ReviewSection>

                  <ReviewSection title="Features">
                    <div className="flex flex-wrap gap-2">
                      {formData.showLogo && <Badge variant="secondary">Logo</Badge>}
                      {formData.showDateTime && <Badge variant="secondary">Date/Time</Badge>}
                      {formData.showQueue && <Badge variant="secondary">Queue List</Badge>}
                      {formData.enableAudio && <Badge variant="secondary">Audio</Badge>}
                      {formData.autoRefresh && <Badge variant="secondary">Auto-refresh</Badge>}
                    </div>
                  </ReviewSection>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              {currentStep < steps.length ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gap-2 bg-success hover:bg-success/90">
                  <CheckCircle2 className="w-4 h-4" />
                  Create Screen
                </Button>
              )}
            </div>
          </Card>

          {/* Preview Panel */}
          <Card className="p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <Badge variant="outline" className="text-xs">
                {formData.resolution}
              </Badge>
            </div>
            
            {/* Mini Preview */}
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden border">
              <div className="h-full flex flex-col p-3 scale-[0.6] origin-top-left w-[166%]">
                {/* Header */}
                <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg mb-2">
                  {formData.showLogo && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary" />
                      <span className="text-xs font-medium">{formData.name || "Screen Name"}</span>
                    </div>
                  )}
                  {formData.showDateTime && (
                    <span className="text-xs text-muted-foreground">10:30 AM</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center text-white text-lg font-bold"
                      style={{ backgroundColor: colorThemes.find(t => t.id === formData.theme)?.primary || "#1e40af" }}
                    >
                      A-01
                    </div>
                    <p className="text-xs mt-2">Now Serving</p>
                  </div>
                </div>

                {/* Queue */}
                {formData.showQueue && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Up Next:</p>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-[10px]">A-02</Badge>
                      <Badge variant="outline" className="text-[10px]">A-03</Badge>
                      <Badge variant="outline" className="text-[10px]">A-04</Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Layout</span>
                <span className="font-medium text-foreground">
                  {layoutOptions.find(l => l.id === formData.layout)?.name || "Standard"}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Features</span>
                <span className="font-medium text-foreground">
                  {[formData.showLogo, formData.showDateTime, formData.showQueue, formData.enableAudio].filter(Boolean).length} enabled
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
      {children}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
