import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Search, X, ChevronRight, Plus, Edit2, Trash2, 
  Save, ArrowLeft, TestTube, ClipboardList, Pill,
  Stethoscope, Check, SkipForward, Info, FileText, User
} from "lucide-react";

import { PrescriptionItem } from "@/lib/consultation-data";
import { 
  searchDiagnosisSuggestions, 
  searchLabTestSuggestions, 
  fetchPatientHistoryCategories,
  searchMedicationSuggestions,
  searchMedicationUnitOptions,
  searchMedicationFrequencyOptions,
  searchMedicationDurationOptions,
  searchMedicationTimingSuggestions
} from "@/services/doctorService";
import { submitTreatmentSuggestion } from "@/services/doctorSuggestionService";
import { useEffect } from "react";

type DiagnosisItem = { id?: string | number; name: string; icd10?: string; code?: string; description?: string; icon?: string; specialty?: string; suggestedLabTests?: string[]; historyFlags?: string[]; };
type LabTestItem = { id?: string | number; name: string; description?: string; };



export default function DoctorMedicationAddSugg() {
  
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Patient dummy data
  const patient = {
    id: patientId,
    name: "John Anderson",
    age: 45,
    gender: "Male",
    bloodGroup: "O+",
    phone: "+91 98765 43210",
    lastVisit: "15 Nov 2024"
  };

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisItem | null>(null);
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [diagSuggestions, setDiagSuggestions] = useState<DiagnosisItem[]>([]);
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [labSearch, setLabSearch] = useState("");
  const [labSuggestions, setLabSuggestions] = useState<LabTestItem[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [historyCategories, setHistoryCategories] = useState<{ id: string; name: string; icon?: string; items: { id: string; name: string; description?: string; }[] }[]>([]);
  const [collapsedHistoryCats, setCollapsedHistoryCats] = useState<Set<string>>(new Set());
  const [medications, setMedications] = useState<PrescriptionItem[]>([]);
  
  // Medication form
  const [medicationSearch, setMedicationSearch] = useState("");
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<{ id?: string; name: string; description?: string } | null>(null);
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [editingMedication, setEditingMedication] = useState<PrescriptionItem | null>(null);

  // Timings
  const [timings, setTimings] = useState<string[]>([]);
  const [timingSearch, setTimingSearch] = useState("");
  const [timingSuggestions, setTimingSuggestions] = useState<{ id: string; name: string }[]>([]);
  const [showTimingDropdown, setShowTimingDropdown] = useState(false);

  // Medication dynamic suggestions
  const [medicationSuggestions, setMedicationSuggestions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [durationOptions, setDurationOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitQuery, setUnitQuery] = useState("");
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequencyQuery, setFrequencyQuery] = useState("");
  const [durationOpen, setDurationOpen] = useState(false);
  const [durationQuery, setDurationQuery] = useState("");
  const [timingOpen, setTimingOpen] = useState(false);

  // Dynamic timing suggestions
  useEffect(() => {
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationTimingSuggestions(timingSearch);
        const mapped = (items || []).map((t: any) => ({ 
          id: t.id, 
          name: t.label_en 
        }));
        setTimingSuggestions(mapped);
      } catch (e) {
        console.warn('Timing suggestions failed', e);
        setTimingSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [timingSearch]);
  
  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: "Diagnosis", icon: Stethoscope, required: true },
    { id: 2, title: "Lab Tests", icon: TestTube, required: false },
    { id: 3, title: "History", icon: ClipboardList, required: false },
    { id: 4, title: "Prescription", icon: Pill, required: true },
    { id: 5, title: "Summary", icon: FileText, required: false }
  ];

  // Dynamic suggestions (diagnosis)
  useEffect(() => {
    const q = diagnosisSearch.trim();
    if (!q) { setDiagSuggestions([]); return; }
    const handle = setTimeout(async () => {
      try {
        const items = await searchDiagnosisSuggestions(q, 1, 8);
        const mapped: DiagnosisItem[] = (items || []).map((s: any, idx: number) => ({
          id: s?.id ?? `diag-${idx}`,
          name: s?.name || "",
          icd10: s?.code || s?.icd10 || "",
          code: s?.code || "",
          description: s?.description || "",
          icon: "🩺",
          specialty: "",
          suggestedLabTests: [],
          historyFlags: [],
        })).filter(i => i.name);
        setDiagSuggestions(mapped);
      } catch (e) {
        console.warn('Diagnosis suggestions failed', e);
        setDiagSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [diagnosisSearch]);

  // Dynamic suggestions (lab tests)
  useEffect(() => {
    const q = labSearch.trim();
    if (!q) { setLabSuggestions([]); return; }
    const handle = setTimeout(async () => {
      try {
        const items = await searchLabTestSuggestions(q, 1, 10);
        const mapped: LabTestItem[] = (items || []).map((s: any, idx: number) => ({
          id: s?.id ?? `lab-${idx}`,
          name: s?.name || "",
          description: s?.description || "",
        })).filter(i => i.name);
        setLabSuggestions(mapped);
      } catch (e) {
        console.warn('Lab test suggestions failed', e);
        setLabSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [labSearch]);

  // Dynamic medication name suggestions
  useEffect(() => {
    const q = medicationSearch.trim();
    if (!q) { setMedicationSuggestions([]); return; }
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationSuggestions(q, 1, 8);
        const mapped = (items || []).map((s: any, idx: number) => ({
          id: s?.id ?? `med-${idx}`,
          name: s?.name || "",
          description: s?.description || "",
        })).filter((i: any) => i.name);
        setMedicationSuggestions(mapped);
      } catch (e) {
        console.warn('Medication suggestions failed', e);
        setMedicationSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [medicationSearch]);

  // Dynamic unit options
  useEffect(() => {
    if (!unitOpen) return;
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationUnitOptions(unitQuery, 1, 20);
        const mapped = (items || []).map((s: any, idx: number) => ({ id: s?.id ?? `unit-${idx}`, name: s?.name || "", description: s?.description || "" })).filter((i: any) => i.name);
        setUnitOptions(mapped);
      } catch (e) {
        console.warn('Unit options failed', e);
        setUnitOptions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [unitOpen, unitQuery]);

  // Dynamic frequency options
  useEffect(() => {
    if (!frequencyOpen) return;
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationFrequencyOptions(frequencyQuery, 1, 20);
        const mapped = (items || []).map((s: any, idx: number) => ({ id: s?.id ?? `freq-${idx}`, name: s?.name || "", description: s?.description || "" })).filter((i: any) => i.name);
        setFrequencyOptions(mapped);
      } catch (e) {
        console.warn('Frequency options failed', e);
        setFrequencyOptions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [frequencyOpen, frequencyQuery]);

  // Dynamic duration options
  useEffect(() => {
    if (!durationOpen) return;
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationDurationOptions(durationQuery, 1, 20);
        const mapped = (items || []).map((s: any, idx: number) => ({ id: s?.id ?? `dur-${idx}`, name: s?.name || "", description: s?.description || "" })).filter((i: any) => i.name);
        setDurationOptions(mapped);
      } catch (e) {
        console.warn('Duration options failed', e);
        setDurationOptions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [durationOpen, durationQuery]);

  // Handlers
  const handleStepClick = (stepId: number) => {
    if (stepId === 1 || selectedDiagnosis) {
      setCurrentStep(stepId);
    } else {
      toast({ title: "Please select a diagnosis first", variant: "destructive" });
    }
  };

  const handleSkipStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedDiagnosis) {
      toast({ title: "Please select a diagnosis", variant: "destructive" });
      return;
    }
    if (currentStep === 4 && medications.length === 0) {
      toast({ title: "Please add at least one medication", variant: "destructive" });
      return;
    }
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Load patient history categories once
  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchPatientHistoryCategories();
        const mapped = (cats || []).map((c: any, cIdx: number) => ({
          id: String(c?.id ?? `cat-${cIdx}`),
          name: String(c?.name ?? "Category"),
          icon: c?.icon ?? "🗒️",
          items: Array.isArray(c?.items) ? c.items.map((it: any, iIdx: number) => ({
            id: String(it?.id ?? `item-${cIdx}-${iIdx}`),
            name: String(it?.name ?? ""),
            description: String(it?.description ?? ""),
          })) : [],
        }));
        setHistoryCategories(mapped);
      } catch (e) {
        console.warn('Failed to load history categories', e);
        setHistoryCategories([]);
      }
    })();
  }, []);

  const handleSelectMedicine = (medicine: { id?: string; name: string; description?: string }) => {
    setSelectedMedicine(medicine);
    setMedicationSearch(medicine.name);
    setShowMedicationDropdown(false);
  };

  const handleSelectTiming = (timingName: string) => {
    if (timings.includes(timingName)) {
      setTimings(timings.filter(t => t !== timingName));
    } else {
      setTimings([...timings, timingName]);
    }
    // setTimingSearch(""); // Keep search for multi-select
    // setShowTimingDropdown(false); // Managed by Popover now
  };

  const handleRemoveTiming = (timingName: string) => {
    setTimings(timings.filter(t => t !== timingName));
  };

  const handleAddMedication = () => {
    if (!selectedMedicine || !dosage || !frequency || !duration) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    if (editingMedication) {
      setMedications(prev => prev.map(m => 
        m.id === editingMedication.id 
          ? { ...m, name: selectedMedicine.name, dosage, unit, frequency, duration, instructions, timings }
          : m
      ));
      toast({ title: "Medication updated" });
      setEditingMedication(null);
    } else {
      const newMedication: PrescriptionItem = {
        id: `MED_${Date.now()}`,
        name: selectedMedicine.name,
        dosage,
        unit,
        frequency,
        duration,
        instructions,
        isAISuggested: false,
        timings
      };
      setMedications(prev => [...prev, newMedication]);
      toast({ title: "Medication added" });
    }
    resetMedicationForm();
  };

  const resetMedicationForm = () => {
    setMedicationSearch("");
    setSelectedMedicine(null);
    setDosage("");
    setUnit("mg");
    setFrequency("");
    setDuration("");
    setInstructions("");
    setTimings([]);
    setTimingSearch("");
    setEditingMedication(null);
  };

  const handleEditMedication = (medication: PrescriptionItem) => {
    setEditingMedication(medication);
    setSelectedMedicine({ name: medication.name });
    setMedicationSearch(medication.name);
    setDosage(medication.dosage);
    setUnit(medication.unit);
    setFrequency(medication.frequency);
    setDuration(medication.duration);
    setInstructions(medication.instructions || "");
    setTimings(medication.timings || []);
  };

  const confirmDeleteMedication = () => {
    if (medicationToDelete) {
      setMedications(prev => prev.filter(m => m.id !== medicationToDelete));
      toast({ title: "Medication removed" });
    }
    setDeleteDialogOpen(false);
    setMedicationToDelete(null);
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({ title: "Template name is required", variant: "destructive" });
      return;
    }

    setSaveLoading(true);
    const payload = {
      diagnosis: selectedDiagnosis,
      labTests: selectedLabTests,
      historyItemIds: selectedHistory,
      medications: medications,
      instructions,
      // templateName // The API doesn't seem to take templateName directly in the main payload structure I saw earlier, but maybe I should check. 
      // Actually the controller uses `diagnosis_json` etc.
    };
    
    // Call API
    try {
      // Use the already imported submitTreatmentSuggestion from doctorSuggestionService
      const res = await submitTreatmentSuggestion(payload);
      if (res.success) {
        toast({ title: "Template saved successfully" });
        setSaveTemplateDialogOpen(false);
        navigate("/doctor-medication-sugg");
      } else {
        toast({ title: "Failed to save template", description: res.message, variant: "destructive" });
      }
    } catch (error) {
       console.error(error);
       toast({ title: "Error saving template", variant: "destructive" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleFinishConsultation = async () => {
    if (!selectedDiagnosis) {
      toast({ title: "Please select a diagnosis", variant: "destructive" });
      setCurrentStep(1);
      return;
    }
    if (medications.length === 0) {
      toast({ title: "Please add at least one medication", variant: "destructive" });
      setCurrentStep(4);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        diagnosis: selectedDiagnosis,
        labTests: selectedLabTests,
        historyItemIds: selectedHistory,
        medications: medications.map((m) => ({
          id: (m as any).id,
          name: (m as any).name,
          dosage: (m as any).dosage,
          unit: (m as any).unit,
          frequency: (m as any).frequency,
          duration: (m as any).duration,
          instructions: (m as any).instructions || "",
          timings: (m as any).timings || [],
        })),
        instructions: "",
      };

      const result = await submitTreatmentSuggestion(payload);
      if (!result.success) {
        toast({ title: "Submission failed", description: result.message || "Please try again.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      toast({ title: "Suggestion saved successfully", description: result.suggestionUid ? `Ref: ${result.suggestionUid}` : undefined });
      navigate("/doctor-medication-sugg");
    } catch (e: any) {
      console.error('Complete Consultation failed', e);
      toast({ title: "Unexpected error", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1: return selectedDiagnosis !== null;
      case 2: return selectedLabTests.length > 0;
      case 3: return selectedHistory.length > 0;
      case 4: return medications.length > 0;
      default: return false;
    }
  };


  return (
    <div className="p-6" style={{
      backgroundColor: '#f5f5f5',
      minHeight: '91vh',      // full page height
    }} >
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-bold">Add Treatment Consultation Suggestion</h1>
        </div>
      

        <div className="flex gap-6">
          {/* Left Sidebar - Steps */}
          <aside className="w-56 shrink-0">
            <nav className="sticky top-24 space-y-1">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    currentStep === step.id 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : isStepComplete(step.id)
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-white hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    currentStep === step.id 
                      ? "bg-white/20" 
                      : isStepComplete(step.id)
                        ? "bg-green-200"
                        : "bg-slate-100"
                  }`}>
                    {isStepComplete(step.id) && currentStep !== step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    {!step.required && (
                      <p className="text-xs opacity-70">Optional</p>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Step 1: Diagnosis */}
                {currentStep === 1 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">Select Diagnosis</h2>
                          <p className="text-slate-500 text-sm mt-1">Search and select the primary diagnosis for this consultation</p>
                        </div>
                      </div>

                      {selectedDiagnosis && (
                        <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{selectedDiagnosis.icon}</span>
                              <div>
                                <p className="font-semibold text-slate-900">{selectedDiagnosis.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{selectedDiagnosis.icd10}</Badge>
                                  <span className="text-xs text-slate-500">{selectedDiagnosis.specialty}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDiagnosis(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mt-4">
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-lg font-bold text-blue-600">{selectedDiagnosis?.suggestedMedications?.length ?? 0}</p>
                              <p className="text-xs text-slate-500">Medications</p>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-lg font-bold text-green-600">{selectedDiagnosis?.suggestedLabTests?.length ?? 0}</p>
                              <p className="text-xs text-slate-500">Lab Tests</p>
                            </div>
                            <div className="text-center p-2 bg-white rounded-lg">
                              <p className="text-lg font-bold text-amber-600">{selectedDiagnosis?.historyFlags?.length ?? 0}</p>
                              <p className="text-xs text-slate-500">History Flags</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search by diagnosis name or ICD-10 code..."
                          className="pl-10 h-12 bg-slate-50 border-slate-200"
                          value={diagnosisSearch}
                          onChange={(e) => setDiagnosisSearch(e.target.value)}
                        />
                      </div>

                      {diagnosisSearch && (
                        <ScrollArea className="h-80 mt-4 rounded-xl border">
                          <div className="p-2 space-y-1">
                            {diagSuggestions.map((diagnosis) => (
                              <button
                                key={diagnosis.id}
                                className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-4 ${
                                  selectedDiagnosis?.id === diagnosis.id 
                                    ? "bg-primary/10 border border-primary" 
                                    : "hover:bg-slate-50"
                                }`}
                                onClick={() => {
                                  setSelectedDiagnosis(diagnosis);
                                  setDiagnosisSearch("");
                                }}
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900">{diagnosis.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {(diagnosis.icd10 || diagnosis.code) && (
                                      <Badge variant="secondary" className="text-xs">{diagnosis.icd10 || diagnosis.code}</Badge>
                                    )}
                                    {diagnosis.specialty && (
                                      <span className="text-xs text-slate-500">{diagnosis.specialty}</span>
                                    )}
                                  </div>
                                </div>
                                {selectedDiagnosis?.id === diagnosis.id && (
                                  <Check className="h-5 w-5 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Lab Tests */}
                {currentStep === 2 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">Lab Tests</h2>
                          <p className="text-slate-500 text-sm mt-1">Select required lab tests for this diagnosis</p>
                        </div>
                        <Badge variant="outline">{selectedLabTests.length} selected</Badge>
                      </div>

                      {selectedDiagnosis && Array.isArray(selectedDiagnosis.suggestedLabTests) && selectedDiagnosis.suggestedLabTests.length > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm font-medium text-blue-700 mb-3">Recommended Tests</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedDiagnosis.suggestedLabTests.map((testName, idx) => {
                              const test = labSuggestions.find(t => t.name === testName);
                              const isSelected = selectedLabTests.includes(testName);
                              return (
                                <Badge
                                  key={idx}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer ${isSelected ? "" : "bg-white hover:bg-blue-100"}`}
                                  onClick={() => test && setSelectedLabTests(prev => 
                                    prev.includes(testName) ? prev.filter(n => n !== testName) : [...prev, testName]
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3 mr-1" />}
                                  {testName}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search lab tests..."
                          className="pl-10 bg-slate-50"
                          value={labSearch}
                          onChange={(e) => setLabSearch(e.target.value)}
                        />
                      </div>

                      <ScrollArea className="h-64">
                        <div className="grid grid-cols-2 gap-2">
                          {labSuggestions.map((test) => (
                            <button
                              key={test.id}
                              className={`p-3 rounded-lg text-left transition-all border ${
                                selectedLabTests.includes(test.name)
                                  ? "bg-primary/10 border-primary"
                                  : "bg-white border-slate-200 hover:border-slate-300"
                              }`}
                              onClick={() => setSelectedLabTests(prev =>
                                prev.includes(test.name) ? prev.filter(n => n !== test.name) : [...prev, test.name]
                              )}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-sm text-slate-900">{test.name}</p>
                                  {test.description && (<p className="text-xs text-slate-500 mt-1">{test.description}</p>)}
                                </div>
                                {selectedLabTests.includes(test.name) && (
                                  <Check className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Selected tests summary below list */}
                      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-700">Selected Tests</span>
                          <Badge variant="secondary">{selectedLabTests.length}</Badge>
                        </div>
                        {selectedLabTests.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedLabTests.map((name) => (
                              <Badge key={name} variant="secondary" className="bg-white">
                                {name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-blue-600">No tests selected</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: History */}
                {currentStep === 3 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">Patient History</h2>
                          <p className="text-slate-500 text-sm mt-1">Select relevant history items for this consultation</p>
                        </div>
                        <Badge variant="outline">{selectedHistory.length} selected</Badge>
                      </div>

                      <div className="space-y-4">
                        {historyCategories.map((category) => (
                          <div key={category.id} className="border rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b flex items-center justify-between">
                              <h3 className="font-medium text-slate-900">{category.name}</h3>
                              <button
                                className="text-slate-500 hover:text-slate-700"
                                onClick={() => setCollapsedHistoryCats(prev => {
                                  const next = new Set(prev);
                                  if (next.has(category.id)) next.delete(category.id); else next.add(category.id);
                                  return next;
                                })}
                                aria-label={collapsedHistoryCats.has(category.id) ? 'Expand' : 'Collapse'}
                              >
                                {collapsedHistoryCats.has(category.id) ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 rotate-90" />
                                )}
                              </button>
                            </div>
                            {!collapsedHistoryCats.has(category.id) && (
                              <div className="p-4 grid grid-cols-2 gap-3">
                                {category.items.map((item) => (
                                  <label
                                    key={item.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                      selectedHistory.includes(item.id)
                                        ? "bg-primary/10 border border-primary"
                                        : "bg-slate-50 border border-transparent hover:bg-slate-100"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={selectedHistory.includes(item.id)}
                                      onCheckedChange={() => setSelectedHistory(prev =>
                                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                      )}
                                    />
                                    <span className="text-sm text-slate-900 flex-1">{item.name}</span>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-4 w-4 text-slate-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs text-xs">{item.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Prescription */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Medication Form */}
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-6">
                          {editingMedication ? "Edit Medication" : "Add Medication"}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Medicine Search */}
                          <div className="col-span-2 relative">
                            <Label className="text-slate-700">Medicine Name *</Label>
                            <div className="relative mt-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Search medicine..."
                                className="pl-10 bg-slate-50"
                                value={medicationSearch}
                                onChange={(e) => {
                                  setMedicationSearch(e.target.value);
                                  setShowMedicationDropdown(true);
                                }}
                                onFocus={() => setShowMedicationDropdown(true)}
                              />
                            </div>
                            {showMedicationDropdown && medicationSearch && (
                              <div className="absolute z-10 w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-auto">
                                {medicationSuggestions.map((medicine) => (
                                  <button
                                    key={medicine.id ?? medicine.name}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex justify-between items-center"
                                    onClick={() => handleSelectMedicine(medicine)}
                                  >
                                    <span className="font-medium text-slate-900">{medicine.name}</span>
                                    {medicine.description && (
                                      <span className="text-xs text-slate-500">{medicine.description}</span>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Dosage & Unit */}
                          <div>
                            <Label className="text-slate-700">Dosage *</Label>
                            <Input
                              className="mt-1 bg-slate-50"
                              placeholder="e.g., 500"
                              value={dosage}
                              onChange={(e) => setDosage(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-slate-700">Unit *</Label>
                            <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-1 w-full justify-between bg-slate-50">
                                  {unit ? unit : "Select unit"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-[300px]">
                                <Command>
                                  <CommandInput
                                    placeholder="Search unit..."
                                    value={unitQuery}
                                    onValueChange={setUnitQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No unit found.</CommandEmpty>
                                    <CommandGroup>
                                      {unitOptions.map((u) => (
                                        <CommandItem
                                          key={(u.id ?? u.name) as string}
                                          onSelect={() => {
                                            setUnit(u.name);
                                            setUnitOpen(false);
                                          }}
                                        >
                                          {u.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Frequency & Duration */}
                          <div>
                            <Label className="text-slate-700">Frequency *</Label>
                            <Popover open={frequencyOpen} onOpenChange={setFrequencyOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-1 w-full justify-between bg-slate-50">
                                  {frequency ? frequency : "Select frequency"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-[300px]">
                                <Command>
                                  <CommandInput
                                    placeholder="Search frequency..."
                                    value={frequencyQuery}
                                    onValueChange={setFrequencyQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No frequency found.</CommandEmpty>
                                    <CommandGroup>
                                      {frequencyOptions.map((f) => (
                                        <CommandItem
                                          key={(f.id ?? f.name) as string}
                                          onSelect={() => {
                                            setFrequency(f.name);
                                            setFrequencyOpen(false);
                                          }}
                                        >
                                          {f.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label className="text-slate-700">Duration *</Label>
                            <Popover open={durationOpen} onOpenChange={setDurationOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="mt-1 w-full justify-between bg-slate-50">
                                  {duration ? duration : "Select duration"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-[300px]">
                                <Command>
                                  <CommandInput
                                    placeholder="Search duration..."
                                    value={durationQuery}
                                    onValueChange={setDurationQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No duration found.</CommandEmpty>
                                    <CommandGroup>
                                      {durationOptions.map((d) => (
                                        <CommandItem
                                          key={(d.id ?? d.name) as string}
                                          onSelect={() => {
                                            setDuration(d.name);
                                            setDurationOpen(false);
                                          }}
                                        >
                                          {d.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Instructions */}
                          <div className="col-span-2 relative">
                            <div className="flex items-center gap-2 mb-2">
                              <Label className="text-slate-700 shrink-0">Timings</Label>
                              <div className="flex flex-wrap gap-1">
                                {timings.map((t) => (
                                  <Badge key={t} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                                    {t}
                                    <button
                                      onClick={() => handleRemoveTiming(t)}
                                      className="hover:text-red-200 focus:outline-none"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Popover open={timingOpen} onOpenChange={setTimingOpen}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal bg-slate-50 text-slate-500">
                                  Select timings...
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 w-[400px]" align="start">
                                <div className="p-2 border-b">
                                  <Input
                                    placeholder="Search timing..."
                                    className="border-0 focus-visible:ring-0 px-2"
                                    value={timingSearch}
                                    onChange={(e) => setTimingSearch(e.target.value)}
                                  />
                                </div>
                                <div className="max-h-60 overflow-y-auto p-1">
                                  {timingSuggestions.map((timing) => (
                                    <button
                                      key={timing.id}
                                      className="w-full flex items-center px-2 py-2 text-sm rounded-sm hover:bg-slate-100 text-left"
                                      onClick={() => handleSelectTiming(timing.name)}
                                    >
                                      <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${timings.includes(timing.name) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"}`}>
                                        <Check className="h-3 w-3" />
                                      </div>
                                      {timing.name}
                                    </button>
                                  ))}
                                  {timingSuggestions.length === 0 && (
                                     <div className="px-4 py-2 text-sm text-slate-500 text-center">No timings found</div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Instructions */}
                          <div className="col-span-2">
                            <Label className="text-slate-700">Special Instructions</Label>
                            <Textarea
                              className="mt-1 bg-slate-50 resize-none"
                              placeholder="Any special instructions..."
                              rows={2}
                              value={instructions}
                              onChange={(e) => setInstructions(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button onClick={handleAddMedication} className="gap-2">
                            {editingMedication ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {editingMedication ? "Update Medication" : "Add Medication"}
                          </Button>
                          {editingMedication && (
                            <Button variant="outline" onClick={resetMedicationForm}>Cancel</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Medications List */}
                    {medications.length > 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Added Medications</h3>
                            <Badge>{medications.length} items</Badge>
                          </div>
                          <div className="space-y-3">
                            {medications.map((med, index) => (
                              <div
                                key={med.id}
                                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-900">{med.name}</p>
                                    <p className="text-xs text-slate-500">
                                      {med.dosage}{med.unit} • {med.frequency} • {med.duration}
                                    </p>
                                    {med.timings && med.timings.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {med.timings.map(t => (
                                          <Badge key={t} variant="outline" className="text-[10px] px-1 py-0 h-5 text-slate-500 border-slate-200">{t}</Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditMedication(med)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                      setMedicationToDelete(med.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Step 5: Summary */}
                {currentStep === 5 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-slate-900">Consultation Summary</h2>

                      <div className="space-y-6">
                        {/* Diagnosis */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Diagnosis</h3>
                          {selectedDiagnosis ? (
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{selectedDiagnosis.icon}</span>
                              <div>
                                <p className="font-semibold text-slate-900">{selectedDiagnosis.name}</p>
                                <Badge variant="outline" className="mt-1">{selectedDiagnosis.icd10}</Badge>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-400">No diagnosis selected</p>
                          )}
                        </div>

                        {/* Lab Tests */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Lab Tests ({selectedLabTests.length})</h3>
                          {selectedLabTests.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedLabTests.map((name) => (
                                <Badge key={name} variant="secondary">{name}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400">No lab tests selected</p>
                          )}
                        </div>

                        {/* History */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Patient History ({selectedHistory.length})</h3>
                          {selectedHistory.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedHistory.map((itemId) => {
const item = historyCategories.flatMap(c => c.items).find(i => i.id === itemId);
                                return item ? (
                                  <Badge key={itemId} variant="secondary">{item.name}</Badge>
                                ) : null;
                              })}
                            </div>
                          ) : (
                            <p className="text-slate-400">No history items selected</p>
                          )}
                        </div>

                        {/* Medications */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                          <h3 className="text-sm font-medium text-slate-500 mb-3">Prescription ({medications.length})</h3>
                          {medications.length > 0 ? (
                            <div className="space-y-2">
                              {medications.map((med, index) => (
                                <div key={med.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                  <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">{med.name}</p>
                                    <p className="text-xs text-slate-500">{med.dosage}{med.unit} • {med.frequency} • {med.duration}</p>
                                    {med.timings && med.timings.length > 0 && (
                                      <p className="text-xs text-slate-400 mt-0.5">
                                        Timings: {med.timings.join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400">No medications added</p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-8">
                        <Button onClick={handleFinishConsultation} size="lg" className="gap-2" disabled={isSubmitting}>
                          <Check className="h-4 w-4" />
                          Complete Consultation
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => setSaveTemplateDialogOpen(true)}
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save as Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep < 5 && !steps[currentStep - 1].required && (
                  <Button variant="ghost" onClick={handleSkipStep} className="gap-2">
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </Button>
                )}
                {currentStep < 5 && (
                  <Button onClick={handleNextStep}>
                    Next Step
                  </Button>
                )}
              </div>
            </div>
          </main>
        </div>



        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Medication?</AlertDialogTitle>
              <AlertDialogDescription>
                This medication will be removed from the prescription.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteMedication} className="bg-red-600 hover:bg-red-700">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save Template Dialog */}
        <Dialog open={saveTemplateDialogOpen} onOpenChange={setSaveTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Treatment Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g., Diabetes Type 2 - Standard Protocol"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">
                  This template will include {medications.length} medication(s) and can be quickly applied to future consultations with the same diagnosis.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} className="gap-2">
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}