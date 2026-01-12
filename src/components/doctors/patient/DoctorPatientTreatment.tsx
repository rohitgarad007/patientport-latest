
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Save, Plus, Edit2, Trash2, Sparkles, FileText, Pill, TestTube, History, Clock, Calendar, User, Phone, Mail, Search, UserX, ClipboardList, Check, FileBarChart, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Appointment } from "@/types/appointment";
import AISuggestionPopup from "@/components/doctors/patient/AISuggestionPopup";
import SuggestedLabsModal, { Lab } from "@/components/doctors/patient/SuggestedLabsModal";
import { saveTreatment, getTreatment } from "@/services/patientTreatmentService";
import { fetchPreferredLaboratories } from "@/services/HospitalLaboratoryService";
import { 
  searchDiagnosisSuggestions, 
  searchDiagnosisAISuggestions, 
  searchMedicationAISuggestions, 
  searchLabTestAISuggestions, 
  searchMedicationSuggestions, 
  searchLabTestSuggestions, 
  searchMedicationUnitOptions, 
  searchMedicationFrequencyOptions, 
  searchMedicationDurationOptions, 
  fetchCommonComplaintsGrouped, 
  fetchTreatmentSuggestionsByDiagnosis, 
  searchMedicationTimingSuggestions,
  getLoggedInDoctorProfile
} from "@/services/doctorService";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { updateMyAppointmentStatus } from "@/services/doctorService";
import PurposeChecklist from "@/components/doctors/consultation/PurposeChecklist";
import { Checkbox } from "@/components/ui/checkbox";
import LabReportUploadSection, { UploadedReport } from "@/components/doctors/consultation/LabReportUploadSection";
import { fetchReceiptTemplates, getReceiptContent } from "@/services/receiptService";
import { PrescriptionData } from "@/data/receiptData";
import { ReceiptContentSettings } from "@/types/receipt";

import Receipt1 from "@/components/doctors/receipt/Receipt1";
import Receipt2 from "@/components/doctors/receipt/Receipt2";
import Receipt3 from "@/components/doctors/receipt/Receipt3";
import Receipt4 from "@/components/doctors/receipt/Receipt4";
import Receipt5 from "@/components/doctors/receipt/Receipt5";
import Receipt6 from "@/components/doctors/receipt/Receipt6";
import Receipt7 from "@/components/doctors/receipt/Receipt7";
import Receipt8 from "@/components/doctors/receipt/Receipt8";
import Receipt9 from "@/components/doctors/receipt/Receipt9";
import Receipt10 from "@/components/doctors/receipt/Receipt10";
import Receipt11 from "@/components/doctors/receipt/Receipt11";
import Receipt12 from "@/components/doctors/receipt/Receipt12";

interface DiagnosisItem {
  id: string;
  condition: string;
  notes: string;
  severity: "mild" | "moderate" | "severe";
  icd10: string;
  timestamp: string;
}

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  timestamp: string;
  isAutoSuggested?: boolean;
  timings?: string[];
}

interface LabTestItem {
  id: string;
  testName: string;
  reason: string;
  urgency: "routine" | "urgent" | "stat";
  status: "ordered" | "pending" | "completed";
  timestamp: string;
  isAutoSuggested?: boolean;
}



// Dynamic suggestions will be loaded from API; keep dummy only for fallback if needed (not used)
const dummyDiagnosisSuggestions: string[] = [];

const dummyMedicationSuggestions = [
  "Metformin 500mg - Twice daily with meals, for glycemic control",
  "Amlodipine 5mg - Once daily in morning, for blood pressure control",
  "Omeprazole 20mg - Once daily before breakfast, for acid suppression",
  "Paracetamol 500mg - Every 6 hours as needed, for pain/fever relief",
  "Amoxicillin 500mg - Three times daily for 7 days, complete full course"
];

const dummyLabTestSuggestions = [
  "HbA1c - Glycemic control assessment for diabetes management",
  "Lipid Profile - Cardiovascular risk assessment",
  "Complete Blood Count (CBC) - General health screening",
  "Liver Function Test (LFT) - Hepatic function evaluation",
  "Renal Function Test (RFT) - Kidney function monitoring",
  "Thyroid Function Test (TFT) - Thyroid status evaluation"
];



const DoctorPatientTreatment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appointment = (location.state as any)?.appointment as Appointment | undefined;
  const patient = appointment?.patient;
  const tokenNumber = appointment?.tokenNumber;
  const slot = appointment?.timeSlot;
  const aptDate = appointment?.date;
  const selectedDateStr = String(aptDate || "").slice(0, 10);
  
  const [defaultReceiptId, setDefaultReceiptId] = useState<number | null>(null);
  const [contentSettings, setContentSettings] = useState<ReceiptContentSettings>({});

  const [showSuggestedLabs, setShowSuggestedLabs] = useState(false);
  const [suggestedLabs, setSuggestedLabs] = useState<Lab[]>([]);
  const [suggestedLabsLoading, setSuggestedLabsLoading] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);

  useEffect(() => {
    const loadDefaultReceipt = async () => {
      try {
        const res = await fetchReceiptTemplates();
        if (res.success && res.default_receipt_id) {
          setDefaultReceiptId(Number(res.default_receipt_id));
          console.log("Default receipt ID:", res.default_receipt_id);
        }
      } catch (error) {
        console.error("Failed to load default receipt", error);
      }
    };
    const loadContentSettings = async () => {
        try {
            const res = await getReceiptContent();
            if (res.success && res.data) {
                setContentSettings(res.data);
            }
        } catch (error) {
            console.error("Failed to load receipt content settings", error);
        }
    };
    loadDefaultReceipt();
    loadContentSettings();
  }, []);

  const handleFetchSuggestedLabs = async () => {
    setShowSuggestedLabs(true);
    setSuggestedLabsLoading(true);
    try {
      const res = await fetchPreferredLaboratories();
      if (res.success && res.data) {
        setSuggestedLabs(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch preferred laboratories", error);
      toast.error("Failed to load preferred laboratories");
    } finally {
      setSuggestedLabsLoading(false);
    }
  };

  const getReceiptData = (): PrescriptionData => {
    const symptomsList = purposeSelectedIds.map(id => {
        for (const cat of purposeCategories) {
            const found = cat.items.find(item => item.id === id);
            if (found) return found.name;
        }
        return id;
    });

    return {
      receiptNo: appointment?.appointment_uid || `RX-${Date.now().toString().slice(-6)}`,
      date: appointment?.date || new Date().toLocaleDateString(),
      patient: {
        name: patient?.name || "Unknown",
        age: patient?.age || 0,
        gender: "Male", // Placeholder
        phone: patient?.phone || "",
        address: "Not Provided", // Placeholder
        patientId: patient?.id || "",
        bloodGroup: "O+", // Placeholder
        weight: "70 kg", // Placeholder
        height: "170 cm" // Placeholder
      },
      doctor: {
        name: doctorProfile?.name || appointment?.doctor?.name || "Unknown Doctor",
        qualification: "MBBS, MD", // Placeholder
        specialization: doctorProfile?.specialization || appointment?.doctor?.specialty || "General Physician",
        registrationNo: doctorProfile?.hospital_reg_no || "REG-12345",
        hospital: doctorProfile?.hospital_name || "City Care Hospital",
        address: doctorProfile?.hospital_address || "City Center",
        phone: doctorProfile?.phone || "+91 1234567890",
        email: doctorProfile?.email || "doctor@hospital.com"
      },
      symptoms: symptomsList,
      diagnosis: diagnoses.map(d => d.condition),
      patientHistory: [],
      labTests: labTests.map(t => ({
        name: t.testName,
        priority: t.urgency === 'stat' ? 'High' : t.urgency === 'urgent' ? 'Medium' : 'Low'
      })),
      medications: medications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
        timing: m.timings?.join(", ") || "As prescribed"
      })),
      followUpDate: "Review after 7 days",
      notes: "",
      appointmentId: appointment?.id
    };
  };

  const renderReceipt = () => {
    const receiptData = getReceiptData();
    const isLocked = !treatmentId;
    switch (defaultReceiptId) {
      case 1: return <Receipt1 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 2: return <Receipt2 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 3: return <Receipt3 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 4: return <Receipt4 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 5: return <Receipt5 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 6: return <Receipt6 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 7: return <Receipt7 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 8: return <Receipt8 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 9: return <Receipt9 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 10: return <Receipt10 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 11: return <Receipt11 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      case 12: return <Receipt12 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />;
      default: return <Receipt12 data={receiptData} disabled={isLocked} contentSettings={contentSettings} />; // Fallback to Receipt12 or any default
    }
  };
  const patientInitials = (patient?.name || "Patient")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([
    
  ]);

  const [medications, setMedications] = useState<MedicationItem[]>([
    
  ]);

  const [labTests, setLabTests] = useState<LabTestItem[]>([
    
  ]);



  const [uploadedReports, setUploadedReports] = useState<UploadedReport[]>([]);

  // Purpose of Visit (Common Complaints)
  type ComplaintItem = { id: string; name: string; description?: string };
  type ComplaintCategory = { category: string; items: ComplaintItem[] };
  const [purposeCategories, setPurposeCategories] = useState<ComplaintCategory[]>([]);
  const [purposeSelectedIds, setPurposeSelectedIds] = useState<string[]>([]);
  const [purposeLoading, setPurposeLoading] = useState<boolean>(false);

  const [showAI, setShowAI] = useState<{ type: string; open: boolean }>({ type: "", open: false });
  const [editingId, setEditingId] = useState<{ type: string; id: string } | null>(null);
  const [showSug, setShowSug] = useState({ diagnosis: false, medication: false, labtest: false });
  const [showAISug, setShowAISug] = useState({ diagnosis: false, medication: false, labtest: false });

  // Diagnosis dynamic suggestions state
  type SuggestionItem = { name: string; description?: string; code?: string };
  const [diagSuggestions, setDiagSuggestions] = useState<SuggestionItem[]>([]);
  const [diagAISuggestions, setDiagAISuggestions] = useState<SuggestionItem[]>([]);
  const [diagLoading, setDiagLoading] = useState<boolean>(false);
  const [diagAILoading, setDiagAILoading] = useState<boolean>(false);
  // Medication/Lab suggestions (non-AI + AI)
  const [medSuggestions, setMedSuggestions] = useState<SuggestionItem[]>([]);
  const [medAISuggestions, setMedAISuggestions] = useState<SuggestionItem[]>([]);
  const [medLoading, setMedLoading] = useState<boolean>(false);
  const [medAILoading, setMedAILoading] = useState<boolean>(false);

  const [labSuggestions, setLabSuggestions] = useState<SuggestionItem[]>([]);
  const [labAISuggestions, setLabAISuggestions] = useState<SuggestionItem[]>([]);
  const [labLoading, setLabLoading] = useState<boolean>(false);
  const [labAILoading, setLabAILoading] = useState<boolean>(false);

  const [treatmentId, setTreatmentId] = useState<number | null>(null);
  const [loadingTreatment, setLoadingTreatment] = useState<boolean>(false);
  const [treatmentStatus, setTreatmentStatus] = useState<string>("");
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    getLoggedInDoctorProfile().then(profile => {
      if (profile) setDoctorProfile(profile);
    }).catch(err => console.error("Error fetching doctor profile:", err));
  }, []);

  useEffect(() => {
    if (appointment?.id) {
        setLoadingTreatment(true);
        getTreatment(appointment.id)
            .then((res: any) => {
                if (res.success && res.data) {
                    const data = res.data;
                    // Ensure treatmentId is set. Use data.id if available.
                    if (data.id) {
                        setTreatmentId(data.id);
                    } else {
                        // Fallback: if we have data, we assume treatment exists. 
                        // Use a dummy ID or derived ID to unlock the UI.
                        // Backend updates by appointment_id anyway.
                        console.warn("Treatment loaded but ID missing, using fallback");
                        setTreatmentId(999999);
                    }
                    
                    if (data.status) setTreatmentStatus(data.status);
                    // Handle purpose selection (IDs)
                    if (data.purpose_ids && Array.isArray(data.purpose_ids)) {
                        setPurposeSelectedIds(data.purpose_ids.map(String));
                    } else if (data.purpose && Array.isArray(data.purpose)) {
                        // Fallback mapping
                        const mapped = data.purpose.map((p: any) => {
                            if (typeof p === 'object' && p !== null) return String(p.item_id || p.id);
                            return String(p);
                        });
                        setPurposeSelectedIds(mapped);
                    }

                    if (data.diagnosis) setDiagnoses(data.diagnosis);
                    if (data.medications) setMedications(data.medications);
                    if (data.lab_tests) setLabTests(data.lab_tests);
                    if (data.selected_lab_details) setSelectedLab(data.selected_lab_details);
                    if (data.lab_reports) {
                        const mappedReports = data.lab_reports.map((r: any) => {
                            let type: "pdf" | "image" | "doc" | "other" = "other";
                            const ext = (r.fileType || "").toLowerCase();
                            if (ext.includes("pdf")) type = "pdf";
                            else if (ext.match(/jpe?g|png|gif|webp/)) type = "image";
                            else if (ext.match(/doc|docx/)) type = "doc";
                            
                            const createdRaw = r.createdAt || r.created_at || r.uploaded_at || r.date;
                            const createdAt = createdRaw ? new Date(createdRaw) : new Date();
                            return {
                                ...r,
                                fileType: type,
                                createdAt
                            };
                        });
                        setUploadedReports(mappedReports);
                    }
                }
            })
            .catch((err: any) => {
                console.error("Failed to load treatment", err);
            })
            .finally(() => {
                setLoadingTreatment(false);
            });
    }
  }, [appointment?.id]);


  // Diagnosis-based auto suggestions (lab + medication)
  const [dxMedSuggestions, setDxMedSuggestions] = useState<SuggestionItem[]>([]);
  const [dxLabSuggestions, setDxLabSuggestions] = useState<SuggestionItem[]>([]);
  const [dxSuggLoading, setDxSuggLoading] = useState<boolean>(false);
  const [dxTerm, setDxTerm] = useState<string>("");
  const [dxSelectedMedNames, setDxSelectedMedNames] = useState<string[]>([]);
  const [dxSelectedLabNames, setDxSelectedLabNames] = useState<string[]>([]);
  // Treatment control loading states
  const [continuing, setContinuing] = useState<boolean>(false);
  const [finishing, setFinishing] = useState<boolean>(false);

  const handleFinishTreatment = async () => {
    if (!appointment?.id || !patient?.id) {
         toast.error("Missing appointment information");
         return;
    }
    
    try {
      setFinishing(true);
      // Map selected IDs to full objects
      const purposeObjects = purposeSelectedIds.map(id => {
          for (const cat of purposeCategories) {
              const found = cat.items.find(item => item.id === id);
              if (found) return { id: found.id, name: found.name, description: found.description };
          }
          return { id, name: "", description: "" };
      });

      const payload = {
      appointment_id: appointment.id,
      patient_id: patient.id,
      purpose: purposeObjects,
      diagnosis: diagnoses,
      lab_tests: labTests,
      lab_reports: uploadedReports,
      medications: medications,
      sugg_lab: selectedLab ? selectedLab.id : null,
      status: 'completed'
    };

      const res = await saveTreatment(payload);
      if (res.success) {
          setTreatmentStatus('completed');
          toast.success("Treatment finished", {
            description: "Patient appointment marked as completed."
          });
          navigate("/doctor-today-visit");
      } else {
          toast.error(res.message || "Failed to finish treatment");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to finish treatment");
    } finally {
      setFinishing(false);
    }
  };

  // Load Purpose of Visit master (grouped complaints)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setPurposeLoading(true);
        const grouped = await fetchCommonComplaintsGrouped();
        if (!mounted) return;
        // Normalize to expected shape
        const mapped: ComplaintCategory[] = Array.isArray(grouped)
          ? grouped.map((g: any) => ({
              category: g?.category || g?.name || "General",
              items: (g?.items || g?.children || []).map((i: any, idx: number) => ({
                id: String(i?.id ?? `${g?.category ?? 'cat'}-${idx}`),
                name: i?.name || i?.title || "",
                description: i?.description || "",
              })).filter((x: ComplaintItem) => x.name)
            }))
          : [];
        setPurposeCategories(mapped);
      } catch (e) {
        console.warn("Failed to load complaints master", e);
        setPurposeCategories([]);
      } finally {
        setPurposeLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Medication meta options (Unit/Frequency/Duration) for select boxes
  type SelectOption = { value: string; label: string };

  // If appointment context is missing, show an empty-state message
  if (!appointment || !appointment.id) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <UserX className="w-12 h-12 text-muted-foreground" />
            <h2 className="text-xl font-bold">Patient not selected</h2>
            <p className="text-muted-foreground max-w-md">
              Start a consultation from Today's Appointments to load patient details.
            </p>
            <Button className="mt-2" onClick={() => navigate("/doctor-today-visit")}>Go to Today's Appointments</Button>
          </div>
        </Card>
      </div>
    );
  }
  const [medUnitOptions, setMedUnitOptions] = useState<SelectOption[]>([]);
  const [medFreqOptions, setMedFreqOptions] = useState<SelectOption[]>([]);
  const [medDurOptions, setMedDurOptions] = useState<SelectOption[]>([]);
  const [medMetaLoading, setMedMetaLoading] = useState<boolean>(false);
  const [selectedDosageUnitId, setSelectedDosageUnitId] = useState<string>("");
  const [selectedFrequencyId, setSelectedFrequencyId] = useState<string>("");
  const [selectedDurationId, setSelectedDurationId] = useState<string>("");
  const [newMedicationDosageValue, setNewMedicationDosageValue] = useState<string>("");
  const [editMedicationDosageValue, setEditMedicationDosageValue] = useState<string>("");
  const [editMedicationDosageUnitId, setEditMedicationDosageUnitId] = useState<string>("");

  const parseSuggestion = (s: string) => {
    const [head, tail] = s.split(" - ");
    const codeMatch = head.match(/\(([^)]+)\)/);
    return {
      primary: head.replace(/\s*\([^)]+\)/, "").trim(),
      code: codeMatch ? codeMatch[1] : "",
      secondary: tail || "",
    };
  };

  const SuggestionDropdown = ({
    items,
    onSelect,
    onFetchAI,
    aiItems,
    showAI,
    loading,
    aiLoading,
    onFetchMore,
  }: {
    items: (string | SuggestionItem)[];
    onSelect: (s: string | SuggestionItem) => void;
    onFetchAI?: (q: string) => void;
    aiItems?: (string | SuggestionItem)[];
    showAI?: boolean;
    loading?: boolean;
    aiLoading?: boolean;
    onFetchMore?: () => void;
  }) => {
    const [q, setQ] = useState("");
    const toObj = (s: string | SuggestionItem): SuggestionItem =>
      typeof s === "string" ? { name: s } : s;
    const normalized = (v?: string) => (v || "").toLowerCase();
    const base = (items || []).map(toObj);
    const filtered = base.filter(i => {
      const n = normalized(i.name);
      const d = normalized(i.description);
      const qq = normalized(q);
      return !qq || n.includes(qq) || d.includes(qq);
    });
    const baseAI = (aiItems || []).map(toObj);
    const filteredAI = baseAI.filter(i => {
      const n = normalized(i.name);
      const d = normalized(i.description);
      const qq = normalized(q);
      return !qq || n.includes(qq) || d.includes(qq);
    });
    return (
      <div className="absolute top-full right-0 z-50 mt-1 w-[420px] min-w-[300px] rounded-lg border border-border bg-background shadow-lg overflow-hidden">
        {/* Top control bar: mini search + AI button */}
        <div className="flex items-center gap-2 p-2 border-b bg-muted/20">
          <input
            type="text"
            placeholder="Type to filter…"
            className="flex-1 px-2 py-1 text-sm rounded-md border bg-background"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {onFetchAI && (
            <button
              type="button"
              className="px-2 py-1 text-sm rounded-md border hover:bg-primary hover:text-primary-foreground flex items-center gap-1"
              onClick={() => onFetchAI((q || "").trim())}
              disabled={!!aiLoading}
            >
              <Sparkles className="w-3 h-3" />
              AI Search
            </button>
          )}
          {onFetchMore && (
            <button
              type="button"
              className="px-2 py-1 text-sm rounded-md border hover:bg-muted flex items-center gap-1"
              onClick={onFetchMore}
            >
              More
            </button>
          )}
        </div>

        {/* Results list with auto-height scrollbar */}
        <div className="max-h-72 overflow-auto">
          {filtered.map((item, idx) => (
            <button
              key={`${item.name}-${idx}`}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 hover:bg-muted/40 border-b last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
                <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
              </div>
              {item.description && (
                <div className="pl-4 mt-1">
                  <span className="text-xs text-muted-foreground truncate block">{item.description}</span>
                </div>
              )}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">No matches. Try AI for alternatives.</div>
          )}
        </div>

        {/* Optional AI section below */}
        {showAI && aiItems && (
          <div className="border-t">
            {filteredAI.map((item, idx) => (
              <button
                key={`ai-${item.name}-${idx}`}
                type="button"
                onClick={() => onSelect(item)}
                className="w-full text-left p-3 hover:bg-muted/40 border-b last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">AI</span>
                </div>
                {item.description && (
                  <div className="pl-4 mt-1">
                    <span className="text-xs text-muted-foreground truncate block">{item.description}</span>
                  </div>
                )}
              </button>
            ))}
            {filteredAI.length === 0 && (
              <div className="p-3 text-xs text-muted-foreground">No AI matches for current query.</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Diagnosis states
  const [newDiagnosis, setNewDiagnosis] = useState({ condition: "", notes: "", severity: "moderate" as const, icd10: "" });
  const [editDiagnosisData, setEditDiagnosisData] = useState<DiagnosisItem | null>(null);

  // Medication states
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  const [editMedicationData, setEditMedicationData] = useState<MedicationItem | null>(null);

  // Timing states
  const [medTimings, setMedTimings] = useState<string[]>([]);
  const [medTimingSearch, setMedTimingSearch] = useState("");
  const [medTimingSuggestions, setMedTimingSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [medTimingOpen, setMedTimingOpen] = useState(false);

  // Lab Test states
  const [newLabTest, setNewLabTest] = useState({ testName: "", reason: "", urgency: "routine" as const });
  const [editLabTestData, setEditLabTestData] = useState<LabTestItem | null>(null);



  const handleSaveAll = async () => {
    if (!appointment?.id || !patient?.id) {
        toast.error("Missing appointment or patient information");
        return;
    }
    
    // Map selected IDs to full objects
    const purposeObjects = purposeSelectedIds.map(id => {
        for (const cat of purposeCategories) {
            const found = cat.items.find(item => item.id === id);
            if (found) return { id: found.id, name: found.name, description: found.description };
        }
        return { id, name: "", description: "" };
    });
    
    const payload = {
        appointment_id: appointment.id,
        patient_id: patient.id,
        purpose: purposeObjects,
        diagnosis: diagnoses,
        lab_tests: labTests,
        lab_reports: uploadedReports,
        medications: medications,
        sugg_lab: selectedLab ? selectedLab.id : null,
        status: 'draft'
    };

    try {
        const res = await saveTreatment(payload);
        if (res.success) {
            setTreatmentId(res.id);
            toast.success("Treatment plan saved successfully!", {
                description: "All changes recorded in patient's medical record."
            });
        } else {
            toast.error(res.message || "Failed to save treatment");
        }
    } catch (e: any) {
        toast.error(e.message || "Failed to save treatment");
    }
  };

  // Diagnosis handlers
  const handleSelectDiagnosisItem = (item: SuggestionItem | string) => {
    if (typeof item === 'string') {
      // Fallback: parse legacy string shape "Name (CODE) - description"
      const parts = item.split(" - ");
      const conditionPart = parts[0];
      const icd10Match = conditionPart.match(/\(([^)]+)\)/);
      const icd10 = icd10Match ? icd10Match[1] : "";
      const condition = conditionPart.replace(/\s*\([^)]+\)/, "").trim();
      const notes = parts[1] || "";
      setNewDiagnosis({ condition, notes, severity: "moderate", icd10 });
      return;
    }
    const condition = item.name;
    const notes = item.description || "";
    const icd10 = item.code || "";
    setNewDiagnosis({ condition, notes, severity: "moderate", icd10 });
  };

  const handleAddDiagnosis = () => {
    if (!newDiagnosis.condition.trim()) return;
    setDiagnoses([...diagnoses, { ...newDiagnosis, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    // Trigger diagnosis-based suggestions load for lab tests & medications
    loadDxSuggestions(newDiagnosis.condition);
    setNewDiagnosis({ condition: "", notes: "", severity: "moderate", icd10: "" });
    toast.success("Diagnosis added");
  };

  const loadDxSuggestions = async (diagnosisText: string) => {
    const q = (diagnosisText || "").trim();
    if (!q) return;
    setDxSuggLoading(true);
    try {
      const data = await fetchTreatmentSuggestionsByDiagnosis(q, 8, 8);
      
      // Process Medications
      const newMeds: MedicationItem[] = (data?.medications || []).map((m: any) => ({
        id: m.id || `auto_med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: m.name || "",
        dosage: m.dosage || "",
        frequency: m.frequency || "",
        duration: m.duration || "",
        instructions: m.instructions || m.description || "",
        timestamp: new Date().toISOString(),
        isAutoSuggested: true
      }));

      // Process Lab Tests
      const newLabs: LabTestItem[] = (data?.labTests || []).map((l: any) => {
        const testName = typeof l === 'string' ? l : (l.name || l.testName || "");
        const reason = typeof l === 'string' ? "" : (l.description || l.reason || "");
        return {
          id: (typeof l === 'object' && l.id) ? l.id : `auto_lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          testName: testName,
          reason: reason,
          urgency: "routine",
          status: "ordered",
          timestamp: new Date().toISOString(),
          isAutoSuggested: true
        };
      });

      if (newMeds.length > 0) {
        setMedications(prev => [...prev, ...newMeds]);
      }
      if (newLabs.length > 0) {
        setLabTests(prev => {
          const uniqueNewLabs = newLabs.filter(n => 
            !prev.some(p => p.testName.toLowerCase().trim() === n.testName.toLowerCase().trim())
          );
          return [...prev, ...uniqueNewLabs];
        });
      }

      setDxTerm(q);
      setDxMedSuggestions([]);
      setDxLabSuggestions([]);
      setDxSelectedMedNames([]);
      setDxSelectedLabNames([]);
    } catch (e) {
      console.warn("Failed to fetch dx-based suggestions", e);
      setDxMedSuggestions([]);
      setDxLabSuggestions([]);
    } finally {
      setDxSuggLoading(false);
    }
  };

  const addMedicationFromSuggestion = (s: SuggestionItem) => {
    handleAIMedication(s);
    handleAddMedication();
  };

  const addLabTestFromSuggestion = (s: SuggestionItem) => {
    handleAILabTest(s);
    handleAddLabTest();
  };

  const addSelectedDxMedications = () => {
    const sel = new Set(dxSelectedMedNames);
    dxMedSuggestions.filter(s => sel.has(s.name)).forEach(addMedicationFromSuggestion);
    setDxSelectedMedNames([]);
  };

  const addSelectedDxLabTests = () => {
    const sel = new Set(dxSelectedLabNames);
    dxLabSuggestions.filter(s => sel.has(s.name)).forEach(addLabTestFromSuggestion);
    setDxSelectedLabNames([]);
  };

  // Run diagnosis search from API
  const runDiagnosisSearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newDiagnosis.condition;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a condition name to search");
      return;
    }
    setDiagLoading(true);
    try {
      const items = await searchDiagnosisSuggestions(q, 1, 8);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || "",
        description: s?.description || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setDiagSuggestions(mapped);
      setShowSug({ ...showSug, diagnosis: true });
      setShowAISug({ ...showAISug, diagnosis: false });
    } catch (e) {
      console.warn("Diagnosis search failed", e);
      toast.error("Failed to fetch diagnosis suggestions");
      setDiagSuggestions([]);
    } finally {
      setDiagLoading(false);
    }
  };

  // Run AI diagnosis search via backend
  const runDiagnosisAISearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newDiagnosis.condition;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a condition name to search with AI");
      return;
    }
    setDiagAILoading(true);
    try {
      const items = await searchDiagnosisAISuggestions(q);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || "",
        description: s?.description || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setDiagAISuggestions(mapped);
      setShowAISug({ ...showAISug, diagnosis: true });
    } catch (e) {
      console.warn("AI diagnosis search failed", e);
      toast.error("Failed to fetch AI suggestions");
      setDiagAISuggestions([]);
    } finally {
      setDiagAILoading(false);
    }
  };
  // Run AI medication search via backend
  const runMedicationAISearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newMedication.name;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a medication name to search with AI");
      return;
    }
    setMedAILoading(true);
    try {
      const items = await searchMedicationAISuggestions(q);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || "",
        description: s?.description || s?.instructions || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setMedAISuggestions(mapped);
      setShowAISug({ ...showAISug, medication: true });
    } catch (e) {
      console.warn("AI medication search failed", e);
      toast.error("Failed to fetch AI medication suggestions");
      setMedAISuggestions([]);
    } finally {
      setMedAILoading(false);
    }
  };

  // Run medication search from API (non-AI)
  const runMedicationSearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newMedication.name;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a medication name to search");
      return;
    }
    setMedLoading(true);
    try {
      const items = await searchMedicationSuggestions(q, 1, 8);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || s?.medication_name || "",
        description: s?.description || s?.instructions || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setMedSuggestions(mapped);
      setShowSug({ ...showSug, medication: true });
      setShowAISug({ ...showAISug, medication: false });
    } catch (e) {
      console.warn("Medication search failed", e);
      toast.error("Failed to fetch medication suggestions");
      setMedSuggestions([]);
    } finally {
      setMedLoading(false);
    }
  };

  // Run AI lab test search via backend
  const runLabTestAISearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newLabTest.testName;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a lab test name to search with AI");
      return;
    }
    setLabAILoading(true);
    try {
      const items = await searchLabTestAISuggestions(q);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || s?.testName || "",
        description: s?.description || s?.reason || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setLabAISuggestions(mapped);
      setShowAISug({ ...showAISug, labtest: true });
    } catch (e) {
      console.warn("AI lab test search failed", e);
      toast.error("Failed to fetch AI lab test suggestions");
      setLabAISuggestions([]);
    } finally {
      setLabAILoading(false);
    }
  };

  // Run lab test search from API (non-AI)
  const runLabTestSearch = async (query?: string) => {
    const qRaw = typeof query === 'string' ? query : newLabTest.testName;
    const q = (qRaw ?? '').toString().trim();
    if (!q) {
      toast.error("Enter a lab test name to search");
      return;
    }
    setLabLoading(true);
    try {
      const items = await searchLabTestSuggestions(q, 1, 8);
      const mapped = (items || []).map((s: any) => ({
        name: s?.name || s?.testName || s?.test_name || "",
        description: s?.description || s?.reason || "",
        code: s?.code || "",
      })).filter(i => i.name);
      setLabSuggestions(mapped);
      setShowSug({ ...showSug, labtest: true });
      setShowAISug({ ...showAISug, labtest: false });
    } catch (e) {
      console.warn("Lab test search failed", e);
      toast.error("Failed to fetch lab test suggestions");
      setLabSuggestions([]);
    } finally {
      setLabLoading(false);
    }
  };



  // Load medication meta options (unit, frequency, duration) for selects
  const loadMedicationMetaOptions = async () => {
    try {
      setMedMetaLoading(true);
      const [units, freqs, durs] = await Promise.all([
        searchMedicationUnitOptions("", 1, 50),
        searchMedicationFrequencyOptions("", 1, 50),
        searchMedicationDurationOptions("", 1, 50),
      ]);
      setMedUnitOptions((units || []).map((u: any) => ({ value: String(u.id || ""), label: String(u.name || "") })));
      setMedFreqOptions((freqs || []).map((f: any) => ({ value: String(f.id || ""), label: String(f.name || "") })));
      setMedDurOptions((durs || []).map((d: any) => ({ value: String(d.id || ""), label: String(d.name || "") })));
    } catch (err) {
      console.warn("Failed to load medication meta options", err);
      toast.error("Failed to load medication options");
    } finally {
      setMedMetaLoading(false);
    }
  };

  useEffect(() => {
    loadMedicationMetaOptions();
  }, []);



  const handleEditDiagnosis = (item: DiagnosisItem) => {
    setEditingId({ type: "diagnosis", id: item.id });
    setEditDiagnosisData({ ...item });
  };

  const handleSaveEditDiagnosis = () => {
    if (!editDiagnosisData) return;
    setDiagnoses(diagnoses.map(d => d.id === editDiagnosisData.id ? editDiagnosisData : d));
    setEditingId(null);
    setEditDiagnosisData(null);
    toast.success("Diagnosis updated");
  };

  const handleDeleteDiagnosis = (id: string) => {
    setDiagnoses(diagnoses.filter(d => d.id !== id));
    toast.success("Diagnosis removed");
  };

  // Medication handlers
  const handleAIMedication = (suggestion: string | SuggestionItem) => {
    if (typeof suggestion !== "string") {
      const name = suggestion.name || "";
      const instructions = suggestion.description || "";
      const nameParts = (name || "").trim().split(" ");
      const last = nameParts[nameParts.length - 1] || "";
      const dosageGuess = /\d+(mg|mcg|g|ml)/i.test(last) ? last : "";
      const medName = dosageGuess ? nameParts.slice(0, -1).join(" ") : name;
      setNewMedication({ name: medName, dosage: dosageGuess, frequency: "", duration: "", instructions });
      return;
    }
    const parts = suggestion.split(" - ");
    const nameDosage = parts[0].split(" ");
    const name = nameDosage.slice(0, -1).join(" ");
    const dosage = nameDosage[nameDosage.length - 1];
    const instructions = parts[1] || "";
    setNewMedication({ name, dosage, frequency: "", duration: "", instructions });
  };

  // Load timing suggestions
  useEffect(() => {
    let mounted = true;
    const fetchTimings = async () => {
        try {
            const results = await searchMedicationTimingSuggestions(medTimingSearch);
            if (mounted) {
                const mapped = results.map((t: any) => ({
                    id: String(t.id),
                    name: t.label_en || t.name
                }));
                setMedTimingSuggestions(mapped);
            }
        } catch (e) {
            console.error("Failed to fetch timings", e);
        }
    };
    const timer = setTimeout(fetchTimings, 300);
    return () => {
        mounted = false;
        clearTimeout(timer);
    };
  }, [medTimingSearch]);

  const handleSelectTiming = (timingName: string) => {
    if (medTimings.includes(timingName)) {
      setMedTimings(medTimings.filter(t => t !== timingName));
    } else {
      setMedTimings([...medTimings, timingName]);
    }
  };

  const handleRemoveTiming = (timingName: string) => {
    setMedTimings(medTimings.filter(t => t !== timingName));
  };

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) return;
    const unitLabel = medUnitOptions.find(o => o.value === selectedDosageUnitId)?.label || "";
    const finalDosage = newMedicationDosageValue ? `${newMedicationDosageValue}${unitLabel}` : (newMedication.dosage || "");
    const finalFrequency = selectedFrequencyId ? (medFreqOptions.find(o => o.value === selectedFrequencyId)?.label || "") : (newMedication.frequency || "");
    const finalDuration = selectedDurationId ? (medDurOptions.find(o => o.value === selectedDurationId)?.label || "") : (newMedication.duration || "");

    const payload = { ...newMedication, dosage: finalDosage, frequency: finalFrequency, duration: finalDuration, timings: medTimings };
    setMedications([...medications, { ...payload, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    setNewMedication({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    setNewMedicationDosageValue("");
    setSelectedDosageUnitId("");
    setSelectedFrequencyId("");
    setSelectedDurationId("");
    setMedTimings([]);
    toast.success("Medication added");
  };

  const handleEditMedication = (item: MedicationItem) => {
    setEditingId({ type: "medication", id: item.id });
    setEditMedicationData({ ...item });
    setMedTimings(item.timings || []);

    const dosage = item.dosage || "";
    const match = dosage.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
    if (match) {
      setEditMedicationDosageValue(match[1]);
      const unitLabel = match[2];
      const unitOption = medUnitOptions.find(o => o.label.toLowerCase() === unitLabel.toLowerCase());
      setEditMedicationDosageUnitId(unitOption ? unitOption.value : "");
    } else {
      setEditMedicationDosageValue(dosage);
      setEditMedicationDosageUnitId("");
    }
  };

  const handleSaveEditMedication = () => {
    if (!editMedicationData) return;

    const unitLabel = medUnitOptions.find(o => o.value === editMedicationDosageUnitId)?.label || "";
    let finalDosage = editMedicationDosageValue;
    if (unitLabel && editMedicationDosageValue) {
       finalDosage = `${editMedicationDosageValue}${unitLabel}`;
    }

    const updated = { ...editMedicationData, dosage: finalDosage, timings: medTimings };
    setMedications(medications.map(m => m.id === updated.id ? updated : m));
    setEditingId(null);
    setEditMedicationData(null);
    setEditMedicationDosageValue("");
    setEditMedicationDosageUnitId("");
    setMedTimings([]);
    toast.success("Medication updated");
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
    toast.success("Medication removed");
  };

  // Lab Test handlers
  const handleAILabTest = (suggestion: string | SuggestionItem) => {
    if (typeof suggestion !== "string") {
      const testName = suggestion.name || "";
      const reason = suggestion.description || "";
      setNewLabTest({ testName, reason, urgency: "routine" });
      return;
    }
    const parts = suggestion.split(" - ");
    const testName = parts[0];
    const reason = parts[1] || "";
    setNewLabTest({ testName, reason, urgency: "routine" });
  };

  const handleAddLabTest = () => {
    if (!newLabTest.testName.trim()) return;

    // Check for duplicates
    const isDuplicate = labTests.some(test => 
      test.testName.toLowerCase().trim() === newLabTest.testName.toLowerCase().trim()
    );

    if (isDuplicate) {
      toast.error(`"${newLabTest.testName}" is already added.`);
      return;
    }

    setLabTests([...labTests, { ...newLabTest, id: Date.now().toString(), status: "ordered", timestamp: new Date().toISOString() }]);
    setNewLabTest({ testName: "", reason: "", urgency: "routine" });
    toast.success("Lab test ordered");
  };

  const handleEditLabTest = (item: LabTestItem) => {
    setEditingId({ type: "labtest", id: item.id });
    setEditLabTestData({ ...item });
  };

  const handleSaveEditLabTest = () => {
    if (!editLabTestData) return;
    setLabTests(labTests.map(l => l.id === editLabTestData.id ? editLabTestData : l));
    setEditingId(null);
    setEditLabTestData(null);
    toast.success("Lab test updated");
  };

  const handleDeleteLabTest = (id: string) => {
    setLabTests(labTests.filter(l => l.id !== id));
    toast.success("Lab test removed");
  };



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-success-light text-success";
      case "moderate": return "bg-warning-light text-warning";
      case "severe": return "bg-destructive-light text-destructive";
      default: return "bg-secondary";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "routine": return "bg-secondary text-secondary-foreground";
      case "urgent": return "bg-warning-light text-warning";
      case "stat": return "bg-destructive-light text-destructive";
      default: return "bg-secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered": return "bg-info-light text-info";
      case "pending": return "bg-warning-light text-warning";
      case "completed": return "bg-success-light text-success";
      case "planned": return "bg-secondary text-secondary-foreground";
      case "scheduled": return "bg-info-light text-info";
      default: return "bg-secondary";
    }
  };

  return (
   <div className="space-y-6">
      <main className="max-w-8xl mx-auto px-4 sm:px-2 lg:px-2 py-6 pt-1">
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {/* Enhanced Patient Info Header */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                    {patientInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground pb-4">{patient?.name || "Patient"}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>ID: {patient?.id || "-"}{tokenNumber ? ` • Token #${tokenNumber}` : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{patient?.phone || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{/* email not in model; leave blank or show '-' */}-</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {aptDate && slot
                          ? `Appointment: ${aptDate} • ${slot.startTime?.slice(0,5)} - ${slot.endTime?.slice(0,5)}`
                          : "Appointment: -"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="bg-info-light text-info">Type 2 Diabetes</Badge>
                    <Badge variant="secondary" className="bg-warning-light text-warning">Hypertension</Badge>
                    <Badge variant="secondary" className="bg-success-light text-success">No Allergies</Badge>
                  </div>
                </div>
              </div>
              {/*<Button onClick={handleSaveAll} size="lg" className="gap-2 w-full lg:w-auto shadow-lg">
                <Save className="w-5 h-5" />
                Save Treatment Plan
              </Button>*/}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={handleSaveAll} className="sm:w-auto w-full gap-2 border-primary text-primary hover:bg-primary/10">
                  <Save className="w-4 h-4" />
                  Save as Draft
                </Button>
                <Button variant="destructive" onClick={handleFinishTreatment} disabled={finishing} className="sm:w-auto w-full">
                  {finishing ? "Finishing..." : "Finish Treatment"}
                </Button>
              </div>

            </div>
          </Card>

          {/* Treatment Controls 
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={handleSaveAll} className="sm:w-auto w-full gap-2 border-primary text-primary hover:bg-primary/10">
                <Save className="w-4 h-4" />
                Save as Draft
              </Button>
              <Button variant="destructive" onClick={handleFinishTreatment} disabled={finishing} className="sm:w-auto w-full">
                {finishing ? "Finishing..." : "Finish Treatment"}
              </Button>
            </div>
          </Card>*/}

          {/* Treatment Tabs */}
          <div className="w-full flex flex-col md:flex-row gap-4">

            <div className="w-full md:w-[55%]">
              <Card className="p-4 md:p-6">
                <Tabs defaultValue="purpose" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 h-auto gap-1 bg-muted p-1 mb-6">
                    <TabsTrigger value="purpose" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <ClipboardList className="w-4 h-4" />
                      <span className="hidden sm:inline">Purpose</span>
                    </TabsTrigger>
                    <TabsTrigger value="diagnosis" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">Diagnosis</span>
                    </TabsTrigger>
                    <TabsTrigger value="labtests" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <TestTube className="w-4 h-4" />
                      <span className="hidden sm:inline">Tests</span>
                    </TabsTrigger>
                    <TabsTrigger value="labreports" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <FileBarChart className="w-4 h-4" />
                      <span className="hidden sm:inline">Reports</span>
                    </TabsTrigger>
                    <TabsTrigger value="prescription" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Pill className="w-4 h-4" />
                      <span className="hidden sm:inline">Medication</span>
                    </TabsTrigger>

                    <TabsTrigger value="history" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline">History</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Purpose Tab */}
                  <TabsContent value="purpose" className="space-y-4">
                    <PurposeChecklist
                      categories={purposeCategories}
                      selectedItemIds={purposeSelectedIds}
                      onToggleItem={(id) => {
                        setPurposeSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                      }}
                      title="Purpose of Visit"
                    />
                  </TabsContent>

                  {/* Diagnosis Tab */}
                  <TabsContent value="diagnosis" className="space-y-4">
                    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Add New Diagnosis
                      </h3>
                        <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative flex gap-2">
                            <Input
                              placeholder="Condition name..."
                              value={newDiagnosis.condition}
                              onChange={(e) => setNewDiagnosis({ ...newDiagnosis, condition: e.target.value })}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => runDiagnosisSearch()}
                              className="hover:bg-primary hover:text-primary-foreground"
                              disabled={diagLoading}
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                            {showSug.diagnosis && (
                              <SuggestionDropdown
                                items={diagSuggestions}
                                onSelect={(item) => { handleSelectDiagnosisItem(item); setShowSug({ ...showSug, diagnosis: false }); }}
                                onFetchAI={(q) => runDiagnosisAISearch(q)}
                                aiItems={diagAISuggestions}
                                showAI={showAISug.diagnosis}
                                loading={diagLoading}
                                aiLoading={diagAILoading}
                              />
                            )}
                          </div>
                          <Input
                            placeholder="ICD-10 Code (e.g., E11.9)"
                            value={newDiagnosis.icd10}
                            onChange={(e) => setNewDiagnosis({ ...newDiagnosis, icd10: e.target.value })}
                          />
                        </div>
                        <Textarea
                          placeholder="Clinical notes and observations..."
                          value={newDiagnosis.notes}
                          onChange={(e) => setNewDiagnosis({ ...newDiagnosis, notes: e.target.value })}
                          rows={3}
                        />
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <select
                            value={newDiagnosis.severity}
                            onChange={(e) => setNewDiagnosis({ ...newDiagnosis, severity: e.target.value as any })}
                            className="px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                          <Button onClick={handleAddDiagnosis} className="ml-auto w-full sm:w-auto">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Diagnosis
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {diagnoses.map((item) => (
                        <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                          {editingId?.type === "diagnosis" && editingId.id === item.id && editDiagnosisData ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  value={editDiagnosisData.condition}
                                  onChange={(e) => setEditDiagnosisData({ ...editDiagnosisData, condition: e.target.value })}
                                  placeholder="Condition"
                                />
                                <Input
                                  value={editDiagnosisData.icd10}
                                  onChange={(e) => setEditDiagnosisData({ ...editDiagnosisData, icd10: e.target.value })}
                                  placeholder="ICD-10 Code"
                                />
                              </div>
                              <Textarea
                                value={editDiagnosisData.notes}
                                onChange={(e) => setEditDiagnosisData({ ...editDiagnosisData, notes: e.target.value })}
                                rows={3}
                              />
                              <div className="flex gap-2 items-center justify-between">
                                <select
                                  value={editDiagnosisData.severity}
                                  onChange={(e) => setEditDiagnosisData({ ...editDiagnosisData, severity: e.target.value as any })}
                                  className="px-3 py-2 border border-input rounded-md bg-background"
                                >
                                  <option value="mild">Mild</option>
                                  <option value="moderate">Moderate</option>
                                  <option value="severe">Severe</option>
                                </select>
                                <div className="flex gap-2">
                                  <Button onClick={handleSaveEditDiagnosis} size="sm">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button onClick={() => { setEditingId(null); setEditDiagnosisData(null); }} variant="outline" size="sm">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-2 mb-2">
                                  <h4 className="font-semibold text-lg">{item.condition}</h4>
                                  {item.icd10 && <Badge variant="outline" className="text-xs">{item.icd10}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{item.notes}</p>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditDiagnosis(item)} className="hover:bg-primary-light hover:text-primary">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteDiagnosis(item.id)} className="hover:bg-destructive-light hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>

                    {/* Auto Suggestions moved into respective tabs per diagnosis */}
                  </TabsContent>

                  {/* Medication Tab */}
                  <TabsContent value="prescription" className="space-y-4">
                    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                      {/* Suggested Medications (placed before title) */}
                      
                      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Add New Medication
                      </h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="relative flex gap-2">
                            <Input
                              placeholder="Medication name..."
                              value={newMedication.name}
                              onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => runMedicationSearch()}
                              className="hover:bg-primary hover:text-primary-foreground"
                              disabled={medLoading}
                            >
                              <Search className="w-4 h-4" />
                            </Button>
                            {showSug.medication && (
                              <SuggestionDropdown
                                items={medSuggestions}
                                onSelect={(s) => { handleAIMedication(s); setShowSug({ ...showSug, medication: false }); }}
                                onFetchAI={(q) => runMedicationAISearch(q)}
                                aiItems={medAISuggestions}
                                showAI={showAISug.medication}
                                loading={medLoading}
                                aiLoading={medAILoading}
                              />
                            )}
                          </div>
                          {/* Dosage: split value + unit select */}
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Dosage value (e.g., 500)"
                              value={newMedicationDosageValue}
                              onChange={(e) => setNewMedicationDosageValue(e.target.value)}
                            />
                            <SearchableSelect
                              options={medUnitOptions}
                              value={selectedDosageUnitId}
                              onChange={setSelectedDosageUnitId}
                              placeholder={medMetaLoading ? "Loading units..." : "Select unit"}
                              emptyMessage="No units"
                            />
                          </div>
                          {/* Frequency: selectable */}
                          <SearchableSelect
                            options={medFreqOptions}
                            value={selectedFrequencyId}
                            onChange={(val) => {
                              setSelectedFrequencyId(val);
                              const label = medFreqOptions.find(o => o.value === val)?.label || "";
                              setNewMedication({ ...newMedication, frequency: label });
                            }}
                            placeholder={medMetaLoading ? "Loading frequency..." : "Select frequency"}
                            emptyMessage="No frequency options"
                          />
                          {/* Duration: selectable */}
                          <SearchableSelect
                            options={medDurOptions}
                            value={selectedDurationId}
                            onChange={(val) => {
                              setSelectedDurationId(val);
                              const label = medDurOptions.find(o => o.value === val)?.label || "";
                              setNewMedication({ ...newMedication, duration: label });
                            }}
                            placeholder={medMetaLoading ? "Loading duration..." : "Select duration"}
                            emptyMessage="No duration options"
                          />
                        </div>

                        {/* Timings Selection */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-muted-foreground">Timings</label>
                          <div className="flex flex-wrap gap-2 items-center">
                            {medTimings.map((t, i) => (
                              <Badge key={i} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                                {t}
                                <button
                                  onClick={() => handleRemoveTiming(t)}
                                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                            <Popover open={medTimingOpen} onOpenChange={setMedTimingOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed gap-1 text-xs">
                                  <Plus className="w-3 h-3" />
                                  Add Timing
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-2 w-64" align="start">
                                <div className="space-y-2">
                                  <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                    <Input
                                      placeholder="Search timings (e.g. 8:00 AM)..."
                                      value={medTimingSearch}
                                      onChange={(e) => setMedTimingSearch(e.target.value)}
                                      className="h-8 pl-7 text-xs"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 max-h-[200px] overflow-y-auto">
                                    {medTimingSuggestions.map((s, i) => (
                                      <Button
                                        key={i}
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start h-auto py-1 px-2 text-xs font-normal"
                                        onClick={() => handleSelectTiming(s)}
                                      >
                                        {s}
                                      </Button>
                                    ))}
                                    {medTimingSuggestions.length === 0 && (
                                      <div className="col-span-2 text-center py-2 text-xs text-muted-foreground">
                                        No suggestions found
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <Textarea
                          placeholder="Special instructions..."
                          value={newMedication.instructions}
                          onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                          rows={2}
                        />
                        <Button onClick={handleAddMedication} className="ml-auto w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Medication
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {medications.map((item) => (
                        <Card key={item.id} className={`p-4 hover:shadow-md transition-shadow border-l-4 ${item.isAutoSuggested ? "border-l-green-500" : "border-l-primary"}`}>
                          {editingId?.type === "medication" && editingId.id === item.id && editMedicationData ? (
                            <div className="grid gap-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Input
                                  value={editMedicationData.name}
                                  onChange={(e) => setEditMedicationData({ ...editMedicationData, name: e.target.value })}
                                  placeholder="Medication name"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Dosage value (e.g., 500)"
                                    value={editMedicationDosageValue}
                                    onChange={(e) => setEditMedicationDosageValue(e.target.value)}
                                  />
                                  <SearchableSelect
                                    options={medUnitOptions}
                                    value={editMedicationDosageUnitId}
                                    onChange={setEditMedicationDosageUnitId}
                                    placeholder={medMetaLoading ? "Loading units..." : "Select unit"}
                                    emptyMessage="No units"
                                  />
                                </div>
                                <SearchableSelect
                                  options={medFreqOptions}
                                  value={medFreqOptions.find(o => o.label === editMedicationData.frequency)?.value || ""}
                                  onChange={(val) => {
                                    const label = medFreqOptions.find(o => o.value === val)?.label || "";
                                    setEditMedicationData({ ...editMedicationData, frequency: label });
                                  }}
                                  placeholder={medMetaLoading ? "Loading frequency..." : "Select frequency"}
                                />
                                <SearchableSelect
                                  options={medDurOptions}
                                  value={medDurOptions.find(o => o.label === editMedicationData.duration)?.value || ""}
                                  onChange={(val) => {
                                    const label = medDurOptions.find(o => o.value === val)?.label || "";
                                    setEditMedicationData({ ...editMedicationData, duration: label });
                                  }}
                                  placeholder={medMetaLoading ? "Loading duration..." : "Select duration"}
                                />
                              </div>

                              <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-muted-foreground">Timings</label>
                                <div className="flex flex-wrap gap-2 items-center">
                                  {medTimings.map((t, i) => (
                                    <Badge key={i} variant="secondary" className="gap-1 pl-2 pr-1 py-1">
                                      {t}
                                      <button
                                        onClick={() => handleRemoveTiming(t)}
                                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                  <Popover open={medTimingOpen} onOpenChange={setMedTimingOpen}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-8 border-dashed gap-1 text-xs">
                                        <Plus className="w-3 h-3" />
                                        Add Timing
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-2 w-64" align="start">
                                      <div className="space-y-2">
                                        <div className="relative">
                                          <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                                          <Input
                                            placeholder="Search timings (e.g. 8:00 AM)..."
                                            value={medTimingSearch}
                                            onChange={(e) => setMedTimingSearch(e.target.value)}
                                            className="h-8 pl-7 text-xs"
                                          />
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 max-h-[200px] overflow-y-auto">
                                          {medTimingSuggestions.map((s, i) => (
                                            <Button
                                              key={i}
                                              variant="ghost"
                                              size="sm"
                                              className="justify-start h-auto py-1 px-2 text-xs font-normal"
                                              onClick={() => handleSelectTiming(s)}
                                            >
                                              {s}
                                            </Button>
                                          ))}
                                          {medTimingSuggestions.length === 0 && (
                                            <div className="col-span-2 text-center py-2 text-xs text-muted-foreground">
                                              No suggestions found
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              <Textarea
                                value={editMedicationData.instructions}
                                onChange={(e) => setEditMedicationData({ ...editMedicationData, instructions: e.target.value })}
                                placeholder="Instructions"
                                rows={2}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button onClick={handleSaveEditMedication} size="sm">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                                <Button onClick={() => { setEditingId(null); setEditMedicationData(null); }} variant="outline" size="sm">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-2 mb-2">
                                  <Pill className="w-5 h-5 text-primary mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-lg">{item.name} - {item.dosage}</h4>
                                      {item.isAutoSuggested && <Sparkles className="w-4 h-4 text-green-500" title="Auto-suggested" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.frequency} • {item.duration}</p>
                                    {item.timings && item.timings.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {item.timings.map((t, i) => (
                                          <Badge key={i} variant="outline" className="text-[10px] px-1 py-0 h-4">
                                            {t}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    {item.instructions && <p className="text-sm mt-1 text-foreground/80 italic">{item.instructions}</p>}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                                      <Clock className="w-3 h-3" />
                                      {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditMedication(item)} className="hover:bg-primary-light hover:text-primary">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteMedication(item.id)} className="hover:bg-destructive-light hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Lab Tests Tab */}
                  <TabsContent value="labtests" className="space-y-4">
                    <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                      {/* Suggested Lab Tests (placed before title) */}
                      
                      <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Order Test
                      </h3>
                      <div className="grid gap-4">
                        <div className="relative flex gap-2">
                          <Input
                            placeholder="Test name..."
                            value={newLabTest.testName}
                            onChange={(e) => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => runLabTestSearch()}
                            className="hover:bg-primary hover:text-primary-foreground"
                            disabled={labLoading}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                          {showSug.labtest && (
                            <SuggestionDropdown
                              items={labSuggestions}
                              onSelect={(s) => { handleAILabTest(s); setShowSug({ ...showSug, labtest: false }); }}
                              onFetchAI={(q) => runLabTestAISearch(q)}
                              aiItems={labAISuggestions}
                              showAI={showAISug.labtest}
                              loading={labLoading}
                              aiLoading={labAILoading}
                            />
                          )}
                        </div>
                        <Textarea
                          placeholder="Clinical indication / reason for test..."
                          value={newLabTest.reason}
                          onChange={(e) => setNewLabTest({ ...newLabTest, reason: e.target.value })}
                          rows={2}
                        />
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <select
                            value={newLabTest.urgency}
                            onChange={(e) => setNewLabTest({ ...newLabTest, urgency: e.target.value as any })}
                            className="px-3 py-2 border border-input rounded-md bg-background"
                          >
                            <option value="routine">Routine</option>
                            <option value="urgent">Urgent</option>
                            <option value="stat">STAT</option>
                          </select>
                          <div className="ml-auto flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={handleFetchSuggestedLabs} 
                              className="w-full sm:w-auto"
                              disabled={labTests.length === 0}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Sugg Lab
                            </Button>
                            <Button onClick={handleAddLabTest} className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                Order Test
                            </Button>
                          </div>
                        </div>
                        
                        {selectedLab && (
                          <Card className="p-4 border-l-4 border-l-primary bg-secondary/10">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-base">{selectedLab.name}</h4>
                                  <Badge variant="outline" className="text-xs">Selected Lab</Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span>{selectedLab.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span>{selectedLab.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2 mt-1">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    <span>{selectedLab.address}</span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedLab(null)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8"
                              >
                                <X className="w-4 h-4 mr-1.5" />
                                Remove
                              </Button>
                            </div>
                          </Card>
                        )}

                      </div>
                    </div>

                    <div className="space-y-3">
                      {labTests.map((item) => (
                        <Card key={item.id} className={`p-4 hover:shadow-md transition-shadow border-l-4 ${item.isAutoSuggested ? "border-l-green-500" : "border-l-primary"}`}>
                          {editingId?.type === "labtest" && editingId.id === item.id && editLabTestData ? (
                            <div className="space-y-3">
                              <Input
                                value={editLabTestData.testName}
                                onChange={(e) => setEditLabTestData({ ...editLabTestData, testName: e.target.value })}
                                placeholder="Test name"
                              />
                              <Textarea
                                value={editLabTestData.reason}
                                onChange={(e) => setEditLabTestData({ ...editLabTestData, reason: e.target.value })}
                                placeholder="Reason"
                                rows={2}
                              />
                              <div className="flex gap-2 items-center justify-between">
                                <div className="flex gap-2">
                                  <select
                                    value={editLabTestData.urgency}
                                    onChange={(e) => setEditLabTestData({ ...editLabTestData, urgency: e.target.value as any })}
                                    className="px-3 py-2 border border-input rounded-md bg-background"
                                  >
                                    <option value="routine">Routine</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="stat">STAT</option>
                                  </select>
                                  <select
                                    value={editLabTestData.status}
                                    onChange={(e) => setEditLabTestData({ ...editLabTestData, status: e.target.value as any })}
                                    className="px-3 py-2 border border-input rounded-md bg-background"
                                  >
                                    <option value="ordered">Ordered</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                  </select>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={handleSaveEditLabTest} size="sm">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                  </Button>
                                  <Button onClick={() => { setEditingId(null); setEditLabTestData(null); }} variant="outline" size="sm">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-start gap-2 mb-2">
                                  <TestTube className="w-5 h-5 text-primary mt-0.5" />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold text-lg">{item.testName}</h4>
                                      {item.isAutoSuggested && <Sparkles className="w-4 h-4 text-green-500" title="Auto-suggested" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      <Badge className={getUrgencyColor(item.urgency)}>{item.urgency}</Badge>
                                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(item.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditLabTest(item)} className="hover:bg-primary-light hover:text-primary">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteLabTest(item.id)} className="hover:bg-destructive-light hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Lab Reports Tab */}
                  <TabsContent value="labreports">
                    <LabReportUploadSection
                      patientId={patient?.id || ""}
                      treatmentId={String(treatmentId ?? "")}
                      selectedLabTests={labTests.map(t => t.id)}
                      labTestOptions={labTests.map(t => ({
                        id: t.id,
                        name: t.testName,
                        category: "Ordered"
                      }))}
                      uploadedReports={uploadedReports}
                      onReportsChange={setUploadedReports}
                    />
                  </TabsContent>



                  {/* History Tab */}
                  <TabsContent value="history">
                    <Card className="p-6">
                      <h3 className="text-xl font-heading font-bold mb-4">Treatment History</h3>
                      <div className="text-center text-muted-foreground py-8">
                        Complete treatment history with all diagnoses, medications, and tests will be displayed here.
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
            <div className="w-full md:w-[45%]">
              {renderReceipt()}
            </div>
          </div>
        </div>

        {/* AI Suggestion Popups */}
        <AISuggestionPopup
          open={showAI.type === "diagnosis" && showAI.open}
          onClose={() => setShowAI({ type: "", open: false })}
          onSelect={handleSelectDiagnosisItem}
          suggestions={dummyDiagnosisSuggestions}
          title="Diagnosis Suggestions"
        />
        
        <SuggestedLabsModal
            open={showSuggestedLabs}
            onClose={() => setShowSuggestedLabs(false)}
            onSelect={(lab) => {
                setSelectedLab(lab);
            }}
            labs={suggestedLabs}
            loading={suggestedLabsLoading}
        />
        <AISuggestionPopup
          open={showAI.type === "medication" && showAI.open}
          onClose={() => setShowAI({ type: "", open: false })}
          onSelect={handleAIMedication}
          suggestions={dummyMedicationSuggestions}
          title="Medication Suggestions"
        />
        <AISuggestionPopup
          open={showAI.type === "labtest" && showAI.open}
          onClose={() => setShowAI({ type: "", open: false })}
          onSelect={handleAILabTest}
          suggestions={dummyLabTestSuggestions}
          title="Lab Test Suggestions"
        />

      </main>
    </div>
  );
};

export default DoctorPatientTreatment;
