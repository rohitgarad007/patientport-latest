import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Settings2,
  FileText,
  User,
  UserCircle,
  Stethoscope,
  Activity,
  TestTube,
  Pill,
  Building2,
  Info,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getReceiptContent, updateReceiptContent } from "@/services/receiptService";

interface ReceiptSection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  isVisible: boolean;
  isRequired: boolean;
  order: number;
  previewContent: string[];
}

const initialSections: ReceiptSection[] = [
  {
    id: "header",
    name: "Header",
    description: "Clinic logo, name, and branding elements",
    icon: Building2,
    isVisible: true,
    isRequired: false,
    order: 1,
    previewContent: [
      "Clinic Logo",
      "Clinic Name: HealthCare Plus",
      "Tagline: Your Health, Our Priority",
      "Receipt Number: RCP-2024-001234",
    ],
  },
  {
    id: "doctor_info",
    name: "Doctor Info",
    description: "Doctor's name, qualifications, registration number",
    icon: UserCircle,
    isVisible: true,
    isRequired: false,
    order: 2,
    previewContent: [
      "Dr. Sarah Johnson, MD, MBBS",
      "Specialization: General Physician",
      "Registration No: MCI-12345",
      "Contact: +1 (555) 123-4567",
    ],
  },
  {
    id: "patient_info",
    name: "Patient Info",
    description: "Patient demographics and contact details",
    icon: User,
    isVisible: true,
    isRequired: false,
    order: 3,
    previewContent: [
      "Patient Name: John Doe",
      "Age: 35 Years | Gender: Male",
      "Contact: +1 (555) 987-6543",
      "Address: 123 Main Street, City",
    ],
  },
  {
    id: "medical_history",
    name: "Patient Medical History",
    description: "Past medical conditions, allergies, surgeries",
    icon: FileText,
    isVisible: true,
    isRequired: false,
    order: 4,
    previewContent: [
      "Known Allergies: Penicillin",
      "Chronic Conditions: Hypertension",
      "Previous Surgeries: Appendectomy (2018)",
      "Current Medications: Amlodipine 5mg",
    ],
  },
  {
    id: "presenting_symptoms",
    name: "Presenting Symptoms",
    description: "Chief complaints and current symptoms",
    icon: Activity,
    isVisible: true,
    isRequired: false,
    order: 5,
    previewContent: [
      "Chief Complaint: Persistent headache",
      "Duration: 3 days",
      "Severity: Moderate (6/10)",
      "Associated: Mild fever, fatigue",
    ],
  },
  {
    id: "diagnosis",
    name: "Diagnosis",
    description: "Clinical diagnosis and findings",
    icon: Stethoscope,
    isVisible: true,
    isRequired: false,
    order: 6,
    previewContent: [
      "Primary: Viral Upper Respiratory Infection",
      "Secondary: Tension-type Headache",
      "ICD-10: J06.9, G44.2",
      "Prognosis: Good with treatment",
    ],
  },
  {
    id: "lab_tests",
    name: "Lab Tests",
    description: "Recommended laboratory investigations",
    icon: TestTube,
    isVisible: true,
    isRequired: false,
    order: 7,
    previewContent: [
      "Complete Blood Count (CBC)",
      "Liver Function Test (LFT)",
      "Random Blood Sugar",
      "Urine Routine Examination",
    ],
  },
  {
    id: "medications",
    name: "Medications",
    description: "Prescribed medicines with dosage instructions",
    icon: Pill,
    isVisible: true,
    isRequired: false,
    order: 8,
    previewContent: [
      "1. Paracetamol 500mg - 1 tab TDS x 5 days",
      "2. Cetirizine 10mg - 1 tab OD x 7 days",
      "3. Vitamin C 500mg - 1 tab BD x 10 days",
      "4. Omeprazole 20mg - 1 cap OD x 5 days",
    ],
  },
  {
    id: "footer",
    name: "Footer",
    description: "Additional notes, follow-up date, signature",
    icon: Layers,
    isVisible: true,
    isRequired: false,
    order: 9,
    previewContent: [
      "Follow-up: After 7 days",
      "Special Instructions: Rest, hydration",
      "Doctor's Signature: ____________",
      "Date: December 12, 2024",
    ],
  },
];

const DoctorManageReceiptsContent = () => {
  const [sections, setSections] = useState<ReceiptSection[]>(initialSections);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [previewSection, setPreviewSection] = useState<ReceiptSection | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    const res = await getReceiptContent();
    if (res.success && res.data) {
      const data = res.data;
      const newSections = initialSections.map(section => {
        const key = `${section.id}_status`;
        if (data[key] !== undefined) {
          return { ...section, isVisible: data[key] == 1 };
        }
        return section;
      });
      setSections(newSections);
    } else {
        if (res.message) {
             toast({
                title: "Error",
                description: res.message,
                variant: "destructive",
            });
        }
    }
    setIsLoading(false);
  };

  const visibleCount = sections.filter((s) => s.isVisible).length;
  const hiddenCount = sections.filter((s) => !s.isVisible).length;

  const toggleVisibility = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section?.isRequired) {
      toast({
        title: "Required Section",
        description: "This section is required and cannot be hidden.",
        variant: "destructive",
      });
      return;
    }
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s))
    );
    setHasChanges(true);
  };


  const handleSave = async () => {
    setShowSaveDialog(false);
    
    const data: any = {};
    sections.forEach(s => {
        data[`${s.id}_status`] = s.isVisible ? 1 : 0;
    });

    const res = await updateReceiptContent(data);

    if (res.success) {
        setHasChanges(false);
        toast({
          title: "Settings Saved",
          description: "Your receipt content preferences have been updated successfully.",
        });
    } else {
        toast({
          title: "Error",
          description: res.message || "Failed to save settings",
          variant: "destructive"
        });
    }
  };

  const handleReset = () => {
    fetchContent();
    setShowResetDialog(false);
    setHasChanges(false);
    toast({
      title: "Settings Reset",
      description: "Receipt sections have been reset to saved settings.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className=" bg-card/80 backdrop-blur-xl sticky top-0 z-50 ">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <div>
                <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
                  <Settings2 className="w-6 h-6 text-primary" />
                  Manage Receipt Content
                </h1>

              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                className="hidden sm:flex"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={!hasChanges}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sections.length}</p>
                <p className="text-xs text-muted-foreground">Total Sections</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{visibleCount}</p>
                <p className="text-xs text-muted-foreground">Visible</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <EyeOff className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{hiddenCount}</p>
                <p className="text-xs text-muted-foreground">Hidden</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sections.filter((s) => s.isRequired).length}
                </p>
                <p className="text-xs text-muted-foreground">Required</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-muted-foreground" />
                  Receipt Sections
                </CardTitle>
                
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <div
                        key={section.id}
                        className={`p-4 md:p-5 transition-all duration-200 ${
                          section.isVisible
                            ? "bg-background hover:bg-muted/30"
                            : "bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`p-3 rounded-xl ${
                              section.isVisible
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">
                                {section.name}
                              </h3>
                              {section.isRequired && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-primary/10 text-primary border-primary/20"
                                    >
                                      Required
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This section cannot be hidden</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {section.description}
                            </p>
                            
                          </div>

                          {/* Toggle */}
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              checked={section.isVisible}
                              onCheckedChange={() => toggleVisibility(section.id)}
                              disabled={section.isRequired}
                              className="data-[state=checked]:bg-primary"
                            />
                            <span
                              className={`text-xs font-medium ${
                                section.isVisible
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {section.isVisible ? "Visible" : "Hidden"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these receipt content settings? This
              will apply to all future receipts generated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all sections to their default visibility and
              order. Any customizations will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive hover:bg-destructive/90"
            >
              Reset All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DoctorManageReceiptsContent;
