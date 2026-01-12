import { useState, useEffect } from "react";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, X, ChevronRight, Plus, Edit2, Trash2, 
  Save, ArrowLeft, TestTube, ClipboardList, Pill,
  Stethoscope, Check, SkipForward, FileText, Pencil, Info, ChevronDown
} from "lucide-react";
import { fetchTreatmentSuggestionDetail, updateTreatmentSuggestion } from "@/services/doctorSuggestionService";
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
import type { PrescriptionItem } from "@/lib/consultation-data";
import { cn } from "@/lib/utils";

type DiagnosisItem = { id?: string | number; name: string; icd10?: string; code?: string; description?: string; icon?: string; specialty?: string; suggestedLabTests?: string[]; historyFlags?: string[]; };

interface DoctorTreatmentSuggestionEditProps {
  uid?: string;
  onBack?: () => void;
  onSave?: () => void;
}

export default function DoctorTreatmentSuggestionEdit({ uid: propUid, onBack, onSave }: DoctorTreatmentSuggestionEditProps = {}) {
  const params = useParams();
  const uid = propUid || params.uid;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisItem | null>(null);
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<(string | number)[]>([]);
  const [medications, setMedications] = useState<PrescriptionItem[]>([]);
  const [instructions, setInstructions] = useState("");

  // Suggestion/search states
  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [diagSuggestions, setDiagSuggestions] = useState<DiagnosisItem[]>([]);
  const [labSearch, setLabSearch] = useState("");
  const [labSuggestions, setLabSuggestions] = useState<{ id?: string | number; name: string; description?: string; }[]>([]);
  const [historyCategories, setHistoryCategories] = useState<{ id: string; name: string; items: { id: string; name: string; description?: string; }[] }[]>([]);
  
  // Medication helper states
  const [medicationSearch, setMedicationSearch] = useState("");
  const [medicationSuggestions, setMedicationSuggestions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [unitOptions, setUnitOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [frequencyOptions, setFrequencyOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  const [durationOptions, setDurationOptions] = useState<{ id?: string; name: string; description?: string }[]>([]);
  
  // Searchable select states
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitQuery, setUnitQuery] = useState("");
  const [frequencyOpen, setFrequencyOpen] = useState(false);
  const [frequencyQuery, setFrequencyQuery] = useState("");
  const [durationOpen, setDurationOpen] = useState(false);
  const [durationQuery, setDurationQuery] = useState("");
  const [timingOpen, setTimingOpen] = useState(false);

  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<{ id?: string; name: string; description?: string } | null>(null);
  const [dosage, setDosage] = useState("");
  const [unit, setUnit] = useState("mg");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [medInstructions, setMedInstructions] = useState("");
  const [editingMedication, setEditingMedication] = useState<PrescriptionItem | null>(null);
  
  const [timings, setTimings] = useState<string[]>([]);
  const [timingSearch, setTimingSearch] = useState("");
  const [timingSuggestions, setTimingSuggestions] = useState<{ id: string; name: string }[]>([]);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);
  const [saveConfirmDialogOpen, setSaveConfirmDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);

  const steps = [
    { id: 1, title: "Diagnosis", icon: Stethoscope, required: true },
    { id: 2, title: "Lab Tests", icon: TestTube, required: false },
    { id: 3, title: "History", icon: ClipboardList, required: false },
    { id: 4, title: "Prescription", icon: Pill, required: true },
    { id: 5, title: "Summary", icon: FileText, required: false }
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!uid) { 
        // If no UID, we might be in a create mode or error state, but for edit logic we need UID.
        // If this component is reused for creation, we can handle that, but for now assuming edit.
        return; 
      }
      const res = await fetchTreatmentSuggestionDetail(uid);
      if (!mounted) return;
      if (!res.success || !res.data) {
        toast({ title: "Failed to load suggestion", description: res.message, variant: "destructive" });
        return;
      }
      const d = res.data;
      setSelectedDiagnosis({ name: String(d.diagnosis?.name ?? d.diagnosis?.diagnosis ?? ""), icd10: String(d.diagnosis?.icd10 ?? d.diagnosis?.code ?? ""), code: String(d.diagnosis?.code ?? "") });
      setSelectedLabTests(Array.isArray(d.labTests) ? d.labTests.map((t: any) => String(t)) : []);
      setSelectedHistory(Array.isArray(d.historyItemIds) ? d.historyItemIds : []);
      setMedications(Array.isArray(d.medications) ? d.medications.map((m: any, idx: number) => ({ id: String(idx+1), name: String(m?.name ?? ""), dosage: String(m?.dosage ?? ""), unit: String(m?.unit ?? ""), frequency: String(m?.frequency ?? ""), duration: String(m?.duration ?? ""), instructions: String(m?.instructions ?? ""), timings: Array.isArray(m?.timings) ? m.timings : [] })) : []);
      setInstructions(String(d.instructions ?? ""));
      setLoaded(true);
    })();
    return () => { mounted = false; };
  }, [uid]);

  // Fetch history categories
  useEffect(() => {
    (async () => {
      try {
        const cats = await fetchPatientHistoryCategories();
        const mapped = (cats || []).map((c: any, idx: number) => ({
          id: String(c?.id ?? `cat-${idx}`),
          name: String(c?.name ?? c?.category ?? ""),
          items: Array.isArray(c?.items) ? c.items.map((it: any, i: number) => ({ id: String(it?.id ?? `item-${i}`), name: String(it?.name ?? it?.title ?? ""), description: String(it?.description ?? "") })) : [],
        }));
        setHistoryCategories(mapped);
      } catch (e) {
        setHistoryCategories([]);
      }
    })();
  }, []);

  // Search effects (Diagnosis, Lab, Meds, Timings)
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
        })).filter(i => i.name);
        setDiagSuggestions(mapped);
      } catch (e) {
        setDiagSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [diagnosisSearch]);

  useEffect(() => {
    const q = labSearch.trim();
    if (!q) { setLabSuggestions([]); return; }
    const handle = setTimeout(async () => {
      try {
        const items = await searchLabTestSuggestions(q, 1, 10);
        const mapped = (items || []).map((s: any, idx: number) => ({ id: s?.id ?? `lab-${idx}`, name: s?.name || "", description: s?.description || "" })).filter((i: any) => i.name);
        setLabSuggestions(mapped);
      } catch (e) {
        setLabSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [labSearch]);

  useEffect(() => {
    const q = medicationSearch.trim();
    if (!q) { setMedicationSuggestions([]); return; }
    const handle = setTimeout(async () => {
      try {
        const items = await searchMedicationSuggestions(q, 1, 8);
        const mapped = (items || []).map((s: any, idx: number) => ({ id: s?.id ?? `med-${idx}`, name: s?.name || "", description: s?.description || "" })).filter((i: any) => i.name);
        setMedicationSuggestions(mapped);
      } catch (e) {
        setMedicationSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [medicationSearch]);

  useEffect(() => {
      const q = timingSearch.trim();
      // Always fetch timings even if empty string to show defaults if any, or at least try
      const handle = setTimeout(async () => {
        try {
          const items = await searchMedicationTimingSuggestions(q);
          const mapped = (items || []).map((s: any) => {
            let name = s?.name;
            if (!name && typeof s === 'string') name = s;
            if (!name && typeof s === 'object') name = s.label_en || s.en || s.name || "";
            return { id: s?.id ?? name, name: String(name || "") };
          });
          setTimingSuggestions(mapped);
        } catch (e) {
          setTimingSuggestions([]);
        }
      }, 250);
      return () => clearTimeout(handle);
  }, [timingSearch]);

  // Load Unit/Frequency/Duration options once or on focus could be better, but let's load initial
  useEffect(() => {
    (async () => {
      try {
        const [u, f, d] = await Promise.all([
          searchMedicationUnitOptions("", 1, 50),
          searchMedicationFrequencyOptions("", 1, 50),
          searchMedicationDurationOptions("", 1, 50)
        ]);

        const mapFn = (x: any) => {
            let name = x.name;
            if (typeof name === 'object' && name !== null) {
                // Handle case where name is an object {id, label_en}
                name = name.label_en || name.en || name.name || "";
            }
            return { id: x.id, name: String(name || "") };
        };

        setUnitOptions(u.map(mapFn));
        setFrequencyOptions(f.map(mapFn));
        setDurationOptions(d.map(mapFn));
      } catch(e) {}
    })();
  }, []);


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
          ? { ...m, name: selectedMedicine.name, dosage, unit, frequency, duration, instructions: medInstructions, timings }
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
        instructions: medInstructions,
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
    setMedInstructions("");
    setTimings([]);
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
    setMedInstructions(medication.instructions || "");
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

  const handleSave = async () => {
    if (!uid) return;
    setLoading(true);
    const payload = {
      suggestionUid: uid,
      diagnosis: selectedDiagnosis,
      labTests: selectedLabTests,
      historyItemIds: selectedHistory,
      medications: medications,
      instructions,
    };
    const res = await updateTreatmentSuggestion(payload);
    setLoading(false);
    if (!res.success) {
      toast({ title: "Update failed", description: res.message, variant: "destructive" });
      return;
    }
    toast({ title: "Suggestion updated" });
    setSaveConfirmDialogOpen(false);
    if (onSave) {
      onSave();
    } else {
      navigate("/doctor-medication-sugg");
    }
  };

  const handleDiscardChanges = () => {
    setDiscardDialogOpen(false);
    if (onBack) {
      onBack();
    } else {
      navigate("/doctor-medication-sugg");
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

  if (!loaded) return <div className="p-6">Loading...</div>;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Top Header */}
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setDiscardDialogOpen(true)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-amber-500" />
                <h1 className="text-lg font-semibold text-slate-900">
                  {selectedDiagnosis ? `Edit ${selectedDiagnosis.name}` : "Edit Medication Suggestion"}
                </h1>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Editing Mode</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
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
                        ? "bg-amber-500 text-white shadow-md" 
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

            {/* Main Content Area */}
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
                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">Diagnosis</h2>
                          <p className="text-slate-500 text-sm">Select the primary condition or diagnosis.</p>
                        </div>
                        <div className="space-y-4">
                          <Label>Diagnosis Search</Label>
                          <Popover open={diagSuggestions.length > 0 && !!diagnosisSearch}>
                            <PopoverTrigger asChild>
                               <div className="relative">
                                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="Search for a diagnosis (e.g. Type 2 Diabetes)..."
                                    className="pl-9"
                                    value={diagnosisSearch}
                                    onChange={(e) => setDiagnosisSearch(e.target.value)}
                                  />
                               </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[500px]" align="start">
                              <Command>
                                <CommandList>
                                  <CommandGroup heading="Suggestions">
                                    {diagSuggestions.map((d) => (
                                      <CommandItem 
                                        key={d.id} 
                                        onSelect={() => {
                                          setSelectedDiagnosis(d);
                                          setDiagnosisSearch("");
                                          setDiagSuggestions([]);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="bg-blue-100 p-1 rounded">
                                            <Stethoscope className="w-4 h-4 text-blue-600" />
                                          </div>
                                          <div>
                                            <p className="font-medium">{d.name}</p>
                                            <p className="text-xs text-muted-foreground">{d.icd10 || d.code}</p>
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {selectedDiagnosis && (
                            <div className="mt-4 p-4 border rounded-lg bg-blue-50 border-blue-100 flex items-start justify-between">
                              <div className="flex gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg h-fit">
                                  <Stethoscope className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-blue-900">{selectedDiagnosis.name}</h3>
                                  <p className="text-sm text-blue-700 mt-1">
                                    ICD-10: {selectedDiagnosis.icd10 || selectedDiagnosis.code || "N/A"}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedDiagnosis(null)} className="text-blue-700 hover:text-blue-900 hover:bg-blue-100">
                                Change
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 2: Lab Tests */}
                  {currentStep === 2 && (
                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">Lab Tests</h2>
                          <p className="text-slate-500 text-sm">Add required laboratory tests.</p>
                        </div>
                        <div className="space-y-4">
                           <Label>Search & Add Lab Tests</Label>
                           <Popover open={labSuggestions.length > 0 && !!labSearch}>
                            <PopoverTrigger asChild>
                              <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search lab tests (e.g. HbA1c)..."
                                  className="pl-9"
                                  value={labSearch}
                                  onChange={(e) => setLabSearch(e.target.value)}
                                />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[500px]" align="start">
                              <Command>
                                <CommandList>
                                  <CommandGroup heading="Suggestions">
                                    {labSuggestions.map((lab) => (
                                      <CommandItem 
                                        key={lab.id} 
                                        onSelect={() => {
                                          if (!selectedLabTests.includes(lab.name)) {
                                            setSelectedLabTests([...selectedLabTests, lab.name]);
                                          }
                                          setLabSearch("");
                                          setLabSuggestions([]);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <div className="flex items-center gap-2">
                                          <TestTube className="w-4 h-4 text-slate-500" />
                                          <span>{lab.name}</span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {selectedLabTests.map((test, index) => (
                              <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                {test}
                                <button onClick={() => setSelectedLabTests(selectedLabTests.filter(t => t !== test))} className="hover:bg-slate-200 rounded-full p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                            {selectedLabTests.length === 0 && (
                              <p className="text-sm text-slate-400 italic">No lab tests added yet.</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 3: History */}
                  {currentStep === 3 && (
                     <Card>
                       <CardContent className="p-6 space-y-6">
                         <div>
                           <h2 className="text-xl font-semibold mb-1">Patient History</h2>
                           <p className="text-slate-500 text-sm">Select relevant history items.</p>
                         </div>
                         
                         {/* Selected History Badges */}
                         <div className="flex flex-wrap gap-2">
                           {historyCategories
                             .flatMap(c => c.items)
                             .filter(i => selectedHistory.includes(i.id))
                             .map((item) => (
                               <Badge key={item.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                 {item.name}
                                 <button 
                                   onClick={() => setSelectedHistory(selectedHistory.filter(id => id !== item.id))} 
                                   className="hover:bg-slate-200 rounded-full p-0.5"
                                 >
                                   <X className="h-3 w-3" />
                                 </button>
                               </Badge>
                             ))}
                             {selectedHistory.length === 0 && (
                               <p className="text-sm text-slate-400 italic">No history items selected.</p>
                             )}
                         </div>

                         <ScrollArea className="h-[400px] pr-4">
                           <Accordion type="single" collapsible className="w-full space-y-2">
                             {historyCategories.map((cat) => (
                               <AccordionItem key={cat.id} value={cat.id} className="border rounded-lg px-4 bg-white">
                                 <AccordionTrigger className="hover:no-underline py-3">
                                   <span className="font-medium text-slate-900">{cat.name}</span>
                                 </AccordionTrigger>
                                 <AccordionContent className="pt-2 pb-4">
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                     {cat.items.map((item) => {
                                       const isSelected = selectedHistory.includes(item.id);
                                       return (
                                         <div 
                                           key={item.id}
                                           className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                             isSelected ? "bg-amber-50 border-amber-200" : "hover:bg-slate-50 border-slate-200"
                                           }`}
                                           onClick={() => {
                                             if (isSelected) {
                                               setSelectedHistory(selectedHistory.filter(id => id !== item.id));
                                             } else {
                                               setSelectedHistory([...selectedHistory, item.id]);
                                             }
                                           }}
                                         >
                                           <Checkbox checked={isSelected} />
                                           <div className="space-y-1">
                                             <label className="text-sm font-medium leading-none cursor-pointer">
                                               {item.name}
                                             </label>
                                             {item.description && (
                                               <p className="text-xs text-muted-foreground">{item.description}</p>
                                             )}
                                           </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </AccordionContent>
                               </AccordionItem>
                             ))}
                           </Accordion>
                           {historyCategories.length === 0 && <p className="text-sm text-slate-500">No history categories loaded.</p>}
                         </ScrollArea>
                       </CardContent>
                     </Card>
                  )}

                  {/* Step 4: Prescription */}
                  {currentStep === 4 && (
                    <Card>
                      <CardContent className="p-6 space-y-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h2 className="text-xl font-semibold mb-1">Prescription</h2>
                            <p className="text-slate-500 text-sm">Add medications to the prescription.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                          {/* Medication Form */}
                          <div className="lg:col-span-1 space-y-4 bg-slate-50 p-6 rounded-xl border">
                             <h3 className="font-medium text-slate-900">{editingMedication ? "Edit Medication" : "Add Medication"}</h3>
                             
                             <div className="space-y-3">
                               <div className="space-y-1.5">
                                 <Label>Medicine Name</Label>
                                 <Popover open={showMedicationDropdown} onOpenChange={setShowMedicationDropdown}>
                                    <PopoverTrigger asChild>
                                      <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                          placeholder="Search medicine..." 
                                          className="pl-9"
                                          value={medicationSearch}
                                          onChange={(e) => {
                                            setMedicationSearch(e.target.value);
                                            setShowMedicationDropdown(true);
                                          }}
                                        />
                                      </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-[300px]" align="start">
                                      <Command>
                                        <CommandList>
                                          {medicationSuggestions.length > 0 ? (
                                             <CommandGroup>
                                               {medicationSuggestions.map((m) => (
                                                 <CommandItem key={m.id} onSelect={() => handleSelectMedicine(m)} className="cursor-pointer">
                                                   <Pill className="mr-2 h-4 w-4 text-slate-500" />
                                                   {m.name}
                                                 </CommandItem>
                                               ))}
                                             </CommandGroup>
                                          ) : (
                                            <CommandEmpty>No results found.</CommandEmpty>
                                          )}
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                 </Popover>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                 <div className="space-y-1.5">
                                   <Label>Dosage</Label>
                                   <Input placeholder="e.g. 500" value={dosage} onChange={(e) => setDosage(e.target.value)} />
                                 </div>
                                 <div className="space-y-1.5">
                                   <Label>Unit</Label>
                                   <Popover>
                                     <PopoverTrigger asChild>
                                       <Button variant="outline" role="combobox" className={cn("w-full justify-between", !unit && "text-muted-foreground")}>
                                         {unit || "Select unit"}
                                         <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                       </Button>
                                     </PopoverTrigger>
                                     <PopoverContent className="p-0" align="start">
                                       <Command>
                                         <CommandInput placeholder="Search unit..." />
                                         <CommandList>
                                           <CommandEmpty>No unit found.</CommandEmpty>
                                           <CommandGroup>
                                             {unitOptions.map((option) => (
                                               <CommandItem
                                                 key={option.id}
                                                 value={option.name}
                                                 onSelect={(currentValue) => {
                                                   setUnit(currentValue === unit ? "" : currentValue)
                                                 }}
                                               >
                                                 <Check className={cn("mr-2 h-4 w-4", unit === option.name ? "opacity-100" : "opacity-0")} />
                                                 {option.name}
                                               </CommandItem>
                                             ))}
                                           </CommandGroup>
                                         </CommandList>
                                       </Command>
                                     </PopoverContent>
                                   </Popover>
                                 </div>
                               </div>

                               <div className="grid grid-cols-2 gap-3">
                                 <div className="space-y-1.5">
                                   <Label>Frequency</Label>
                                   <Popover>
                                     <PopoverTrigger asChild>
                                       <Button variant="outline" role="combobox" className={cn("w-full justify-between", !frequency && "text-muted-foreground")}>
                                         {frequency || "Select frequency"}
                                         <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                       </Button>
                                     </PopoverTrigger>
                                     <PopoverContent className="p-0" align="start">
                                       <Command>
                                         <CommandInput placeholder="Search frequency..." />
                                         <CommandList>
                                           <CommandEmpty>No frequency found.</CommandEmpty>
                                           <CommandGroup>
                                             {frequencyOptions.map((option) => (
                                               <CommandItem
                                                 key={option.id}
                                                 value={option.name}
                                                 onSelect={(currentValue) => {
                                                   setFrequency(currentValue === frequency ? "" : currentValue)
                                                 }}
                                               >
                                                 <Check className={cn("mr-2 h-4 w-4", frequency === option.name ? "opacity-100" : "opacity-0")} />
                                                 {option.name}
                                               </CommandItem>
                                             ))}
                                           </CommandGroup>
                                         </CommandList>
                                       </Command>
                                     </PopoverContent>
                                   </Popover>
                                 </div>
                                 <div className="space-y-1.5">
                                   <Label>Duration</Label>
                                   <Popover>
                                     <PopoverTrigger asChild>
                                       <Button variant="outline" role="combobox" className={cn("w-full justify-between", !duration && "text-muted-foreground")}>
                                         {duration || "Select duration"}
                                         <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                       </Button>
                                     </PopoverTrigger>
                                     <PopoverContent className="p-0" align="start">
                                       <Command>
                                         <CommandInput placeholder="Search duration..." />
                                         <CommandList>
                                           <CommandEmpty>No duration found.</CommandEmpty>
                                           <CommandGroup>
                                             {durationOptions.map((option) => (
                                               <CommandItem
                                                 key={option.id}
                                                 value={option.name}
                                                 onSelect={(currentValue) => {
                                                   setDuration(currentValue === duration ? "" : currentValue)
                                                 }}
                                               >
                                                 <Check className={cn("mr-2 h-4 w-4", duration === option.name ? "opacity-100" : "opacity-0")} />
                                                 {option.name}
                                               </CommandItem>
                                             ))}
                                           </CommandGroup>
                                         </CommandList>
                                       </Command>
                                     </PopoverContent>
                                   </Popover>
                                 </div>
                               </div>
                               
                               {/* Timings */}
                               <div className="space-y-1.5">
                                <Label>Timings</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                      <Plus className="mr-2 h-4 w-4" /> Add Timings
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0 w-[250px]" align="start">
                                    <Command>
                                      <CommandInput placeholder="Search timings..." onValueChange={setTimingSearch} />
                                      <CommandList>
                                        <CommandGroup>
                                          {timingSuggestions.map((t) => (
                                            <CommandItem key={t.id} onSelect={() => handleSelectTiming(t.name)} className="cursor-pointer">
                                              <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", timings.includes(t.name) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                <Check className={cn("h-4 w-4")} />
                                              </div>
                                              {t.name}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {timings.map((t, i) => (
                                    <Badge key={i} variant="secondary" className="pl-2 pr-1 py-0.5 text-xs flex items-center gap-1">
                                      {t}
                                      <button onClick={() => handleRemoveTiming(t)} className="hover:bg-slate-200 rounded-full p-0.5"><X className="h-3 w-3" /></button>
                                    </Badge>
                                  ))}
                                </div>
                               </div>

                               <div className="space-y-1.5">
                                 <Label>Instructions</Label>
                                 <Textarea 
                                   placeholder="Special instructions..." 
                                   className="h-20 resize-none"
                                   value={medInstructions}
                                   onChange={(e) => setMedInstructions(e.target.value)}
                                 />
                               </div>

                               <div className="flex gap-2 pt-2">
                                 {editingMedication && (
                                   <Button variant="outline" className="flex-1" onClick={resetMedicationForm}>Cancel</Button>
                                 )}
                                 <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={handleAddMedication}>
                                   {editingMedication ? "Update" : "Add"} Medicine
                                 </Button>
                               </div>
                             </div>
                          </div>

                          {/* Medication List */}
                          <div className="space-y-4">
                             {medications.length > 0 ? (
                               <div className="grid gap-3">
                                 {medications.map((med) => (
                                   <div key={med.id} className="bg-white border rounded-lg p-4 flex items-start justify-between group hover:shadow-sm transition-all">
                                      <div className="flex gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg h-fit">
                                          <Pill className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-slate-900">{med.name}</h4>
                                          <p className="text-sm text-slate-500">
                                            {med.dosage} {med.unit} • {med.frequency} • {med.duration}
                                          </p>
                                          {med.timings && med.timings.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {med.timings.map((t, i) => (
                                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                                              ))}
                                            </div>
                                          )}
                                          {med.instructions && (
                                            <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded inline-block">
                                              <Info className="h-3 w-3 inline mr-1" />
                                              {med.instructions}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleEditMedication(med)}>
                                          <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { setMedicationToDelete(med.id); setDeleteDialogOpen(true); }}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                             ) : (
                               <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed">
                                 <div className="bg-white p-3 rounded-full w-fit mx-auto mb-3 shadow-sm">
                                   <Pill className="h-6 w-6 text-slate-400" />
                                 </div>
                                 <h3 className="font-medium text-slate-900 mb-1">No medications added</h3>
                                 <p className="text-sm text-slate-500">Use the form above to add medications.</p>
                               </div>
                             )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Step 5: Summary */}
                  {currentStep === 5 && (
                    <Card>
                      <CardContent className="p-6 space-y-8">
                        <div>
                          <h2 className="text-xl font-semibold mb-1">Review & Save</h2>
                          <p className="text-slate-500 text-sm">Review the treatment plan before saving.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Diagnosis & Lab Tests */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Diagnosis</h3>
                              {selectedDiagnosis ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Stethoscope className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold text-blue-900">{selectedDiagnosis.name}</span>
                                  </div>
                                  <p className="text-sm text-blue-700 pl-6">ICD-10: {selectedDiagnosis.icd10 || selectedDiagnosis.code || "N/A"}</p>
                                </div>
                              ) : <p className="text-slate-400 italic">No diagnosis selected</p>}
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Lab Tests</h3>
                              {selectedLabTests.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {selectedLabTests.map((test, i) => (
                                    <Badge key={i} variant="outline" className="bg-white">
                                      <TestTube className="h-3 w-3 mr-1 text-slate-500" />
                                      {test}
                                    </Badge>
                                  ))}
                                </div>
                              ) : <p className="text-slate-400 italic">No lab tests ordered</p>}
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">History</h3>
                               {selectedHistory.length > 0 ? (
                                 <div className="flex flex-wrap gap-2">
                                   {selectedHistory.map((hId, i) => {
                                      // Find name from categories
                                      let name = hId;
                                      for (const c of historyCategories) {
                                        const found = c.items.find(it => it.id === hId);
                                        if (found) { name = found.name; break; }
                                      }
                                      return (
                                        <Badge key={i} variant="outline" className="bg-white">
                                          <ClipboardList className="h-3 w-3 mr-1 text-slate-500" />
                                          {name}
                                        </Badge>
                                      );
                                   })}
                                 </div>
                               ) : <p className="text-slate-400 italic">No history items selected</p>}
                            </div>
                          </div>

                          {/* Medications */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Prescription</h3>
                            {medications.length > 0 ? (
                              <div className="space-y-3">
                                {medications.map((med) => (
                                  <div key={med.id} className="bg-slate-50 p-3 rounded-lg border flex items-start gap-3">
                                    <div className="bg-white p-1.5 rounded shadow-sm">
                                      <Pill className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">{med.name}</p>
                                      <p className="text-sm text-slate-600">
                                        {med.dosage} {med.unit} • {med.frequency} • {med.duration}
                                      </p>
                                      {med.timings && med.timings.length > 0 && (
                                        <p className="text-xs text-slate-500 mt-1">Timings: {med.timings.join(", ")}</p>
                                      )}
                                      {med.instructions && (
                                        <p className="text-xs text-amber-600 mt-1">{med.instructions}</p>
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

                        {/* General Instructions */}
                        <div>
                           <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">General Instructions</h3>
                           <Textarea 
                             placeholder="Add any general instructions for the patient..."
                             className="min-h-[100px]"
                             value={instructions}
                             onChange={(e) => setInstructions(e.target.value)}
                           />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-8">
                          <Button onClick={() => setSaveConfirmDialogOpen(true)} size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600">
                            <Save className="h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setDiscardDialogOpen(true)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Discard Changes
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
                    <Button onClick={handleNextStep} className="bg-amber-500 hover:bg-amber-600">
                      Next Step
                    </Button>
                  )}
                </div>
              </div>
            </main>
          </div>
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

        {/* Save Confirmation Dialog */}
        <AlertDialog open={saveConfirmDialogOpen} onOpenChange={setSaveConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Treatment Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                This will update the treatment record. Are you sure you want to save these changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Discard Changes Dialog */}
        <AlertDialog open={discardDialogOpen} onOpenChange={setDiscardDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                All unsaved changes will be lost. Are you sure you want to go back?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continue Editing</AlertDialogCancel>
              <AlertDialogAction onClick={handleDiscardChanges} className="bg-red-600 hover:bg-red-700">
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}





