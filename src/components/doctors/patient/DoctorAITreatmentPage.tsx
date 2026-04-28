
import { useState, useMemo } from "react";
import {
  Brain, Sparkles, ShieldCheck, Activity, User, Stethoscope, Heart,
  ClipboardList, FlaskConical, Search, Plus, Pencil, Trash2, ChevronDown,
  Pill, Utensils, Lightbulb, AlertTriangle, Copy, Printer, Download,
  RefreshCw, Clock, Calendar, Sun, Moon, CheckCircle2, XCircle, Apple,
  Ban, Droplets, Share2, CheckCircle, TrendingUp, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";


// ---------- Dummy data ----------
const PURPOSE_CATEGORIES = [
  { name: "Cardiac", items: ["Chest Pain", "High BP Symptoms", "Low BP Symptoms", "Palpitations"] },
  { name: "ENT", items: ["Ear Pain", "Hearing Problem", "Nose Block"] },
  { name: "Gastro", items: ["Abdominal Pain", "Nausea", "Vomiting", "Diarrhea"] },
  { name: "General", items: ["High Fever", "Fatigue", "Weight Loss", "Headache"] },
  { name: "Respiratory", items: ["Cough", "Shortness of Breath", "Wheezing"] },
];

const LAB_SUGGESTIONS = ["CBC", "Widal Test", "Blood Culture", "Urine Routine", "LFT", "KFT", "Lipid Profile", "HbA1c", "TSH"];

type Diagnosis = { id: string; name: string; notes: string; severity: "mild" | "moderate" | "severe"; icd: string; time: string };
type LabTest = { id: string; name: string; indication: string; priority: "routine" | "urgent" | "stat"; status: string; time: string };

const initialDiagnoses: Diagnosis[] = [
  { id: "d1", name: "Suspected Typhoid", notes: "Fever pattern + abdominal pain after outside food", severity: "moderate", icd: "A01.0", time: "22/04/2026, 13:11:56" },
];

const initialLabs: LabTest[] = [
  { id: "l1", name: "Widal Test", indication: "Confirm typhoid suspicion", priority: "routine", status: "ordered", time: "22/04/2026, 13:11:56" },
  { id: "l2", name: "CBC", indication: "Baseline blood evaluation", priority: "routine", status: "ordered", time: "22/04/2026, 13:11:56" },
];

// id helpers (module scope so initial-data uses are valid)
let __seq = 0;
const uid0 = (p: string) => `${p}_${++__seq}`;

type Medication = { id: string; name: string; desc: string; dose: string; timing: string; meal: string; freq: string; duration: string; warning?: string };
type FoodItem = { id: string; name: string; desc: string };
type TextItem = { id: string; text: string };

const INITIAL_MEDICATIONS: Medication[] = [
  { id: uid0("m"), name: "Azithromycin", desc: "Primary antibiotic for typhoid", dose: "250 mg", timing: "Morning", meal: "After Meal", freq: "Once daily", duration: "7 days", warning: "Complete the full course even if symptoms improve" },
  { id: uid0("m"), name: "Paracetamol", desc: "Fever and pain relief", dose: "250 mg", timing: "Morning & Evening", meal: "After Meal", freq: "Twice daily", duration: "5 days" },
  { id: uid0("m"), name: "ORS Solution", desc: "Prevent dehydration & restore electrolytes", dose: "100 ml", timing: "Throughout day", meal: "Anytime", freq: "Three times daily", duration: "7 days" },
  { id: uid0("m"), name: "Probiotic Syrup", desc: "Restore gut flora during antibiotic therapy", dose: "5 ml", timing: "Evening", meal: "After Meal", freq: "Once daily", duration: "7 days" },
];

const INITIAL_RECOMMENDED: FoodItem[] = [
  { id: uid0("rf"), name: "Boiled Rice", desc: "Easy to digest, provides energy" },
  { id: uid0("rf"), name: "Khichdi", desc: "Light, nutritious, soothing on stomach" },
  { id: uid0("rf"), name: "Boiled Potatoes", desc: "Rich in carbs, gentle on gut" },
  { id: uid0("rf"), name: "Bananas", desc: "Restores potassium, easy to digest" },
  { id: uid0("rf"), name: "Coconut Water", desc: "Natural electrolytes, hydration" },
  { id: uid0("rf"), name: "Curd / Yogurt", desc: "Probiotics support gut health" },
  { id: uid0("rf"), name: "Clear Soups", desc: "Hydration & nutrients" },
  { id: uid0("rf"), name: "Apple Sauce", desc: "Gentle fiber, vitamins" },
];

const INITIAL_AVOID: FoodItem[] = [
  { id: uid0("af"), name: "Spicy Food", desc: "Irritates inflamed gut lining" },
  { id: uid0("af"), name: "Fried & Oily Food", desc: "Hard to digest, worsens nausea" },
  { id: uid0("af"), name: "Junk Food", desc: "Low nutrition, high inflammation" },
  { id: uid0("af"), name: "Cold Drinks", desc: "May worsen stomach discomfort" },
  { id: uid0("af"), name: "Raw Vegetables", desc: "Risk of further bacterial load" },
  { id: uid0("af"), name: "Street Food", desc: "High contamination risk" },
  { id: uid0("af"), name: "Caffeine", desc: "Causes dehydration" },
  { id: uid0("af"), name: "Dairy (except curd)", desc: "May cause bloating" },
];

const INITIAL_LIFESTYLE: TextItem[] = [
  { id: uid0("ls"), text: "Complete bed rest for at least 7-10 days" },
  { id: uid0("ls"), text: "Drink 3-4 liters of boiled & cooled water daily" },
  { id: uid0("ls"), text: "Maintain strict hand hygiene, especially before meals" },
  { id: uid0("ls"), text: "Sponge bath with lukewarm water if fever exceeds 102°F" },
  { id: uid0("ls"), text: "Eat small, frequent meals (5-6 times a day)" },
  { id: uid0("ls"), text: "Avoid school/work until fever is gone for 48 hours" },
];

const INITIAL_WARNINGS: TextItem[] = [
  { id: uid0("w"), text: "Persistent high fever above 103°F" },
  { id: uid0("w"), text: "Severe abdominal pain or distension" },
  { id: uid0("w"), text: "Blood in stool or vomit" },
  { id: uid0("w"), text: "Confusion or extreme drowsiness" },
  { id: uid0("w"), text: "Signs of severe dehydration" },
];

// ---------- Helpers ----------
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).replace(",", ",");

export default function DoctorAITreatmentPage() {
  // Patient
  const [patient, setPatient] = useState({ name: "Aarav Sharma", age: "10", gender: "Male", weight: "32", allergies: "None known", chronic: "None" });

  // Clinical info
  const [symptoms, setSymptoms] = useState<string[]>(["High Fever", "Abdominal Pain"]);
  const [symptomQuery, setSymptomQuery] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ Cardiac: true, ENT: true });
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>(initialDiagnoses);
  const [labs, setLabs] = useState<LabTest[]>(initialLabs);
  const [notes, setNotes] = useState("Patient reports symptoms started 4 days ago after eating outside food.");

  // Section open/close state
  const [openSections, setOpenSections] = useState({ purpose: true, diagnosis: true, order: true });
  const toggleSection = (key: keyof typeof openSections) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  // Diagnosis form
  const [diagForm, setDiagForm] = useState({ name: "", icd: "", notes: "", severity: "moderate" as Diagnosis["severity"] });
  const [editingDiag, setEditingDiag] = useState<string | null>(null);

  // Lab form
  const [labForm, setLabForm] = useState({ name: "", indication: "", priority: "routine" as LabTest["priority"] });
  const [editingLab, setEditingLab] = useState<string | null>(null);
  const [labSearch, setLabSearch] = useState("");

  // Generation state
  const [generated, setGenerated] = useState(true);

  // AI Result editable state
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [recFoods, setRecFoods] = useState<FoodItem[]>(INITIAL_RECOMMENDED);
  const [avoidFoods, setAvoidFoods] = useState<FoodItem[]>(INITIAL_AVOID);
  const [lifestyle, setLifestyle] = useState<TextItem[]>(INITIAL_LIFESTYLE);
  const [warningsList, setWarningsList] = useState<TextItem[]>(INITIAL_WARNINGS);

  // Edit dialog state
  const [medDialog, setMedDialog] = useState<{ open: boolean; data: Medication | null }>({ open: false, data: null });
  const [foodDialog, setFoodDialog] = useState<{ open: boolean; kind: "rec" | "avoid"; data: FoodItem | null }>({ open: false, kind: "rec", data: null });
  const [textDialog, setTextDialog] = useState<{ open: boolean; kind: "lifestyle" | "warning"; data: TextItem | null }>({ open: false, kind: "lifestyle", data: null });

  const saveMed = (m: Medication) => {
    if (!m.name.trim()) return;
    setMedications(prev => m.id ? prev.map(x => x.id === m.id ? m : x) : [...prev, { ...m, id: uid0("m") }]);
    setMedDialog({ open: false, data: null });
  };
  const deleteMed = (id: string) => setMedications(prev => prev.filter(m => m.id !== id));

  const saveFood = (f: FoodItem, kind: "rec" | "avoid") => {
    if (!f.name.trim()) return;
    const setter = kind === "rec" ? setRecFoods : setAvoidFoods;
    setter(prev => f.id ? prev.map(x => x.id === f.id ? f : x) : [...prev, { ...f, id: uid0(kind === "rec" ? "rf" : "af") }]);
    setFoodDialog({ open: false, kind, data: null });
  };
  const deleteFood = (id: string, kind: "rec" | "avoid") => {
    const setter = kind === "rec" ? setRecFoods : setAvoidFoods;
    setter(prev => prev.filter(f => f.id !== id));
  };

  const saveText = (t: TextItem, kind: "lifestyle" | "warning") => {
    if (!t.text.trim()) return;
    const setter = kind === "lifestyle" ? setLifestyle : setWarningsList;
    setter(prev => t.id ? prev.map(x => x.id === t.id ? t : x) : [...prev, { ...t, id: uid0(kind === "lifestyle" ? "ls" : "w") }]);
    setTextDialog({ open: false, kind, data: null });
  };
  const deleteText = (id: string, kind: "lifestyle" | "warning") => {
    const setter = kind === "lifestyle" ? setLifestyle : setWarningsList;
    setter(prev => prev.filter(x => x.id !== id));
  };

  const filteredCategories = useMemo(() => {
    if (!symptomQuery) return PURPOSE_CATEGORIES;
    const q = symptomQuery.toLowerCase();
    return PURPOSE_CATEGORIES.map(c => ({ ...c, items: c.items.filter(i => i.toLowerCase().includes(q)) })).filter(c => c.items.length);
  }, [symptomQuery]);

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const removeSymptom = (s: string) => setSymptoms(prev => prev.filter(x => x !== s));

  const submitDiagnosis = () => {
    if (!diagForm.name.trim()) return;
    if (editingDiag) {
      setDiagnoses(prev => prev.map(d => d.id === editingDiag ? { ...d, ...diagForm } : d));
      setEditingDiag(null);
    } else {
      setDiagnoses(prev => [...prev, { id: uid(), ...diagForm, time: now() }]);
    }
    setDiagForm({ name: "", icd: "", notes: "", severity: "moderate" });
  };
  const editDiagnosis = (d: Diagnosis) => { setDiagForm({ name: d.name, icd: d.icd, notes: d.notes, severity: d.severity }); setEditingDiag(d.id); };
  const deleteDiagnosis = (id: string) => setDiagnoses(prev => prev.filter(d => d.id !== id));

  const submitLab = () => {
    if (!labForm.name.trim()) return;
    if (editingLab) {
      setLabs(prev => prev.map(l => l.id === editingLab ? { ...l, ...labForm } : l));
      setEditingLab(null);
    } else {
      setLabs(prev => [...prev, { id: uid(), ...labForm, status: "ordered", time: now() }]);
    }
    setLabForm({ name: "", indication: "", priority: "routine" });
  };
  const editLab = (l: LabTest) => { setLabForm({ name: l.name, indication: l.indication, priority: l.priority }); setEditingLab(l.id); };
  const deleteLab = (id: string) => setLabs(prev => prev.filter(l => l.id !== id));

  const suggestLab = () => {
    const remaining = LAB_SUGGESTIONS.filter(s => !labs.some(l => l.name.toLowerCase() === s.toLowerCase()));
    if (remaining.length) setLabForm({ name: remaining[0], indication: "AI suggested investigation", priority: "routine" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-[image:var(--gradient-header)] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center shadow-[var(--shadow-elegant)]">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
                <Sparkles className="h-2.5 w-2.5 text-success-foreground" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">AI Treatment Suggestions</h1>
                <Badge className="bg-[image:var(--gradient-primary)] text-primary-foreground border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> AI Powered
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Intelligent treatment recommendations powered by clinical AI • Always verify with medical judgment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 bg-background/60"><ShieldCheck className="h-3.5 w-3.5 text-success" /> HIPAA Compliant</Badge>
            <Badge variant="outline" className="gap-1.5 bg-background/60"><Activity className="h-3.5 w-3.5 text-info" /> Model v3.2</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Patient Information */}
          <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="bg-[image:var(--gradient-soft-blue)] px-6 py-4 flex items-center gap-3 border-b border-border">
              <div className="h-9 w-9 rounded-full bg-info/15 flex items-center justify-center">
                <User className="h-4.5 w-4.5 text-info" />
              </div>
              <h2 className="font-semibold text-foreground">Patient Information</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <Field label="Name"><Input value={patient.name} onChange={e => setPatient({ ...patient, name: e.target.value })} /></Field>
              <Field label="Age (years)"><Input value={patient.age} onChange={e => setPatient({ ...patient, age: e.target.value })} /></Field>
              <Field label="Gender">
                <Select value={patient.gender} onValueChange={v => setPatient({ ...patient, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Weight (kg)"><Input value={patient.weight} onChange={e => setPatient({ ...patient, weight: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="Known Allergies"><Input value={patient.allergies} onChange={e => setPatient({ ...patient, allergies: e.target.value })} /></Field></div>
              <div className="col-span-2"><Field label="Chronic Conditions"><Input value={patient.chronic} onChange={e => setPatient({ ...patient, chronic: e.target.value })} /></Field></div>
            </div>
          </Card>

          {/* Clinical Information - Enhanced */}
          <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
            <div className="bg-[image:var(--gradient-soft-pink)] px-6 py-4 flex items-center gap-3 border-b border-border">
              <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                <Stethoscope className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">Clinical Information</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 1. Purpose of Visit (collapsible section) */}
              <Collapsible open={openSections.purpose} onOpenChange={() => toggleSection("purpose")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Purpose of Visit</h3>
                    {symptoms.length > 0 && <Badge variant="secondary" className="h-5 text-xs">{symptoms.length}</Badge>}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", openSections.purpose && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search visit purposes..." value={symptomQuery} onChange={e => setSymptomQuery(e.target.value)} />
                  </div>
                  <div className="rounded-lg border border-border divide-y divide-border bg-background">
                    {filteredCategories.map(cat => {
                      const selected = cat.items.filter(i => symptoms.includes(i)).length;
                      const open = openCats[cat.name] ?? false;
                      return (
                        <Collapsible key={cat.name} open={open} onOpenChange={(v) => setOpenCats(p => ({ ...p, [cat.name]: v }))}>
                          <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">{cat.name}</span>
                              <Badge variant="secondary" className="text-xs h-5 px-1.5">{selected}/{cat.items.length}</Badge>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 pb-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {cat.items.map(item => (
                                <label key={item} className="flex items-center justify-between gap-2 cursor-pointer group">
                                  <div className="flex items-center gap-2">
                                    <Checkbox checked={symptoms.includes(item)} onCheckedChange={() => toggleSymptom(item)} />
                                    <span className="text-sm text-foreground">{item}</span>
                                  </div>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
                                </label>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                    {filteredCategories.length === 0 && <p className="px-4 py-6 text-sm text-muted-foreground text-center">No matches</p>}
                  </div>
                  {symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {symptoms.map(s => (
                        <Badge key={s} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 gap-1">
                          {s}
                          <button onClick={() => removeSymptom(s)}><XCircle className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* 2. Diagnosis (collapsible section) */}
              <Collapsible open={openSections.diagnosis} onOpenChange={() => toggleSection("diagnosis")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Diagnosis</h3>
                    {diagnoses.length > 0 && <Badge variant="secondary" className="h-5 text-xs">{diagnoses.length}</Badge>}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", openSections.diagnosis && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <section className="rounded-xl border border-success/30 bg-[image:var(--gradient-soft-green)] p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-success" />
                      <h3 className="font-semibold text-sm text-foreground">{editingDiag ? "Edit Diagnosis" : "Add New Diagnosis"}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2">
                      <Input placeholder="Condition name..." value={diagForm.name} onChange={e => setDiagForm({ ...diagForm, name: e.target.value })} className="bg-background" />
                      <Button variant="outline" size="icon" className="bg-background"><Search className="h-4 w-4" /></Button>
                      <Input placeholder="ICD-10 Code (e.g., E11.9)" value={diagForm.icd} onChange={e => setDiagForm({ ...diagForm, icd: e.target.value })} className="bg-background" />
                    </div>
                    <Textarea placeholder="Clinical notes and observations..." value={diagForm.notes} onChange={e => setDiagForm({ ...diagForm, notes: e.target.value })} className="bg-background" rows={2} />
                    <div className="flex items-center justify-between gap-2">
                      <Select value={diagForm.severity} onValueChange={(v: Diagnosis["severity"]) => setDiagForm({ ...diagForm, severity: v })}>
                        <SelectTrigger className="w-32 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={submitDiagnosis} className="bg-info hover:bg-info/90 text-info-foreground gap-1">
                        <Plus className="h-4 w-4" /> {editingDiag ? "Update" : "Add Diagnosis"}
                      </Button>
                    </div>
                  </section>

                  {diagnoses.length > 0 && (
                    <div className="space-y-2">
                      {diagnoses.map(d => (
                        <div key={d.id} className="rounded-lg border border-border bg-background p-3 border-l-4 border-l-primary">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{d.name}</h4>
                                {d.icd && <Badge variant="outline" className="text-xs">{d.icd}</Badge>}
                              </div>
                              {d.notes && <p className="text-sm text-muted-foreground mt-1">{d.notes}</p>}
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className={cn("capitalize font-medium", d.severity === "severe" ? "text-destructive" : d.severity === "moderate" ? "text-warning" : "text-success")}>{d.severity}</span>
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {d.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editDiagnosis(d)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteDiagnosis(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* 3. Order Test (collapsible section) */}
              <Collapsible open={openSections.order} onOpenChange={() => toggleSection("order")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Order Test</h3>
                    {labs.length > 0 && <Badge variant="secondary" className="h-5 text-xs">{labs.length}</Badge>}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", openSections.order && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  <section className="rounded-xl border border-success/30 bg-[image:var(--gradient-soft-green)] p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-success" />
                      <h3 className="font-semibold text-sm text-foreground">{editingLab ? "Edit Test" : "Order Test"}</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input placeholder="Test name..." value={labForm.name} onChange={e => setLabForm({ ...labForm, name: e.target.value })} className="bg-background" />
                      </div>
                      <Button variant="outline" size="icon" className="bg-background" onClick={() => setLabSearch(labForm.name)}><Search className="h-4 w-4" /></Button>
                    </div>
                    <Textarea placeholder="Clinical indication / reason for test..." value={labForm.indication} onChange={e => setLabForm({ ...labForm, indication: e.target.value })} className="bg-background" rows={2} />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Select value={labForm.priority} onValueChange={(v: LabTest["priority"]) => setLabForm({ ...labForm, priority: v })}>
                        <SelectTrigger className="w-32 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={suggestLab} className="bg-background gap-1"><Sparkles className="h-4 w-4 text-primary" /> Sugg Lab</Button>
                        <Button onClick={submitLab} className="bg-info hover:bg-info/90 text-info-foreground gap-1"><Plus className="h-4 w-4" /> {editingLab ? "Update" : "Order Test"}</Button>
                      </div>
                    </div>
                  </section>

                  {labs.length > 0 && (
                    <div className="space-y-2">
                      {labs.filter(l => !labSearch || l.name.toLowerCase().includes(labSearch.toLowerCase())).map(l => (
                        <div key={l.id} className="rounded-lg border border-border bg-background p-3 border-l-4 border-l-success">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FlaskConical className="h-4 w-4 text-info" />
                                <h4 className="font-semibold text-foreground">{l.name}</h4>
                                <Sparkles className="h-3.5 w-3.5 text-success" />
                              </div>
                              {l.indication && <p className="text-sm text-muted-foreground mt-1">{l.indication}</p>}
                              <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                                <Badge className="bg-success text-success-foreground hover:bg-success rounded-full text-xs h-5">{l.priority}</Badge>
                                <span className="text-info font-medium">{l.status}</span>
                                <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {l.time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editLab(l)}><Pencil className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteLab(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* 4. Additional Note */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 pt-3">
                  <Pencil className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-semibold text-foreground">Additional Note</Label>
                </div>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any additional clinical notes, observations, or context..."
                />
              </div>
            </div>
          </Card>

          {/* Generate */}
          <Button size="lg" onClick={() => setGenerated(true)} className="w-full h-14 text-base bg-[image:var(--gradient-primary)] hover:opacity-95 text-primary-foreground shadow-[var(--shadow-elegant)] gap-2">
            <Sparkles className="h-5 w-5" /> Generate AI Treatment Plan
          </Button>

          <div className="flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              <span className="font-medium">AI suggestions are advisory only.</span> Final clinical decisions remain the responsibility of the treating physician.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {generated && (
            <Card className="overflow-hidden p-0 shadow-[var(--shadow-card)]">
              {/* Result header */}
              <div className="bg-[image:var(--gradient-soft-purple)] px-6 py-5 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                      <Sparkles className="h-4 w-4" /> AI ANALYSIS RESULT
                    </div>
                    <h2 className="text-2xl font-bold mt-1 text-foreground">Typhoid Fever (Suspected)</h2>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge className="bg-warning/20 text-warning border border-warning/30 hover:bg-warning/20">Severity: Moderate</Badge>
                      <Badge className="bg-success/15 text-success border border-success/30 hover:bg-success/15 gap-1"><TrendingUp className="h-3 w-3" /> 92% Confidence</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[Copy, Printer, Download, RefreshCw].map((Icon, i) => (
                      <Button key={i} variant="outline" size="icon" className="h-9 w-9 bg-background/80"><Icon className="h-4 w-4" /></Button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  <InfoBox icon={Clock} label="Recovery Time" value="2-3 weeks with proper treatment" />
                  <InfoBox icon={Calendar} label="Follow-up" value="In 7 days" />
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="medication" className="w-full">
                <TabsList className="w-full grid grid-cols-4 rounded-none h-12 bg-muted/40 p-1 border-b border-border">
                  <TabsTrigger value="medication" className="gap-1.5 data-[state=active]:bg-background"><Pill className="h-4 w-4" /> Medication</TabsTrigger>
                  <TabsTrigger value="diet" className="gap-1.5 data-[state=active]:bg-background"><Utensils className="h-4 w-4" /> Diet</TabsTrigger>
                  <TabsTrigger value="lifestyle" className="gap-1.5 data-[state=active]:bg-background"><Lightbulb className="h-4 w-4" /> Lifestyle</TabsTrigger>
                  <TabsTrigger value="warnings" className="gap-1.5 data-[state=active]:bg-background"><AlertTriangle className="h-4 w-4" /> Warnings</TabsTrigger>
                </TabsList>

                {/* Medication */}
                <TabsContent value="medication" className="p-4 space-y-3 mt-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{medications.length} medication(s) suggested</p>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setMedDialog({ open: true, data: { id: "", name: "", desc: "", dose: "", timing: "", meal: "", freq: "", duration: "", warning: "" } })}>
                      <Plus className="h-3.5 w-3.5" /> Add
                    </Button>
                  </div>
                  {medications.map(m => (
                    <div key={m.id} className="rounded-xl border border-border bg-background p-4 border-l-4 border-l-primary">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Pill className="h-4.5 w-4.5 text-primary" /></div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-foreground">{m.name}</h4>
                            <p className="text-sm text-muted-foreground">{m.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="rounded-full">{m.dose}</Badge>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setMedDialog({ open: true, data: { ...m } })}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteMed(m.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <MetaCell icon={Sun} label="Timing" value={m.timing} />
                        <MetaCell icon={Utensils} label="Meal" value={m.meal} />
                        <MetaCell icon={RefreshCw} label="Frequency" value={m.freq} />
                        <MetaCell icon={Calendar} label="Duration" value={m.duration} />
                      </div>
                      {m.warning && (
                        <div className="mt-3 flex items-center gap-2 rounded-md bg-warning/10 border border-warning/30 px-3 py-2 text-sm text-foreground/80">
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0" /> {m.warning}
                        </div>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-11 border-dashed gap-2"><Plus className="h-4 w-4" /> Add All to Prescription</Button>
                </TabsContent>

                {/* Diet */}
                <TabsContent value="diet" className="p-4 space-y-4 mt-0">
                  <div className="rounded-xl border border-success/30 bg-[image:var(--gradient-soft-green)] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center"><Apple className="h-4 w-4 text-success" /></div>
                        <h4 className="font-semibold text-success">Recommended Foods</h4>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 bg-background/70" onClick={() => setFoodDialog({ open: true, kind: "rec", data: { id: "", name: "", desc: "" } })}>
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recFoods.map(f => (
                        <div key={f.id} className="rounded-lg bg-background border border-border px-3 py-2 flex items-start gap-2 group">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0"><div className="text-sm font-medium text-foreground">{f.name}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFoodDialog({ open: true, kind: "rec", data: { ...f } })}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFood(f.id, "rec")}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-destructive/30 bg-[image:var(--gradient-soft-red)] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-destructive/15 flex items-center justify-center"><Ban className="h-4 w-4 text-destructive" /></div>
                        <h4 className="font-semibold text-destructive">Foods to Avoid</h4>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 bg-background/70" onClick={() => setFoodDialog({ open: true, kind: "avoid", data: { id: "", name: "", desc: "" } })}>
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {avoidFoods.map(f => (
                        <div key={f.id} className="rounded-lg bg-background border border-border px-3 py-2 flex items-start gap-2 group">
                          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0"><div className="text-sm font-medium text-foreground">{f.name}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setFoodDialog({ open: true, kind: "avoid", data: { ...f } })}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteFood(f.id, "avoid")}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-info/30 bg-info/5 p-4 flex items-start gap-3">
                    <Droplets className="h-5 w-5 text-info shrink-0 mt-0.5" />
                    <div><h5 className="font-semibold text-info">Hydration Guidance</h5><p className="text-sm text-muted-foreground">Drink 3-4 liters of clean, boiled & cooled water daily. Add ORS for electrolyte balance.</p></div>
                  </div>
                </TabsContent>

                {/* Lifestyle */}
                <TabsContent value="lifestyle" className="p-4 mt-0">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-warning" />
                        <h4 className="font-semibold text-foreground">Lifestyle & Care Recommendations</h4>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setTextDialog({ open: true, kind: "lifestyle", data: { id: "", text: "" } })}>
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                    <ol className="space-y-2">
                      {lifestyle.map((item, i) => (
                        <li key={item.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 group">
                          <span className="h-7 w-7 shrink-0 rounded-full bg-warning/15 text-warning font-semibold text-sm flex items-center justify-center">{i + 1}</span>
                          <span className="flex-1 text-sm text-foreground">{item.text}</span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setTextDialog({ open: true, kind: "lifestyle", data: { ...item } })}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteText(item.id, "lifestyle")}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-4 rounded-lg border border-info/30 bg-info/5 p-3 flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-info shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-foreground text-sm">Follow-up Plan</h5>
                        <p className="text-sm text-muted-foreground">Schedule follow-up after 7 days. Repeat Widal test & CBC.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Warnings */}
                <TabsContent value="warnings" className="p-4 mt-0">
                  <div className="rounded-xl border border-destructive/30 bg-[image:var(--gradient-soft-red)] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h4 className="font-semibold text-destructive">Warning Signs - Seek Immediate Care</h4>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1 bg-background/70" onClick={() => setTextDialog({ open: true, kind: "warning", data: { id: "", text: "" } })}>
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {warningsList.map(w => (
                        <div key={w.id} className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-background px-3 py-2.5 group">
                          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                          <span className="flex-1 text-sm text-foreground">{w.text}</span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setTextDialog({ open: true, kind: "warning", data: { ...w } })}><Pencil className="h-3 w-3" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteText(w.id, "warning")}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg border border-info/30 bg-info/5 p-3">
                      <h5 className="font-semibold text-foreground text-sm">Emergency Contact</h5>
                      <p className="text-sm text-muted-foreground">If any warning sign appears, contact emergency services immediately or visit the nearest hospital.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">Generated on 22/04/2026, 13:04:44 • Model: AI Clinical v3.2</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1"><Share2 className="h-4 w-4" /> Save to Record</Button>
                  <Button className="bg-[image:var(--gradient-primary)] text-primary-foreground gap-1"><CheckCircle className="h-4 w-4" /> Apply Treatment Plan</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* ===== Edit / Add Dialogs ===== */}
      <MedDialog state={medDialog} onChange={setMedDialog} onSave={saveMed} />
      <FoodDialog state={foodDialog} onChange={setFoodDialog} onSave={saveFood} />
      <TextDialog state={textDialog} onChange={setTextDialog} onSave={saveText} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/70 border border-border px-3 py-2.5 flex items-center gap-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function MetaCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground flex items-center gap-1"><Icon className="h-3 w-3" /> {label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

// ===== Dialog Components =====
type MedDialogState = { open: boolean; data: Medication | null };
function MedDialog({ state, onChange, onSave }: { state: MedDialogState; onChange: (s: MedDialogState) => void; onSave: (m: Medication) => void }) {
  const d = state.data;
  if (!d) return null;
  const set = (patch: Partial<Medication>) => onChange({ ...state, data: { ...d, ...patch } });
  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onChange({ open: false, data: null })}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{d.id ? "Edit Medication" : "Add Medication"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label className="text-xs">Name</Label><Input value={d.name} onChange={e => set({ name: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Description</Label><Input value={d.desc} onChange={e => set({ desc: e.target.value })} /></div>
          <div><Label className="text-xs">Dose</Label><Input value={d.dose} onChange={e => set({ dose: e.target.value })} /></div>
          <div><Label className="text-xs">Timing</Label><Input value={d.timing} onChange={e => set({ timing: e.target.value })} /></div>
          <div><Label className="text-xs">Meal</Label><Input value={d.meal} onChange={e => set({ meal: e.target.value })} /></div>
          <div><Label className="text-xs">Frequency</Label><Input value={d.freq} onChange={e => set({ freq: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Duration</Label><Input value={d.duration} onChange={e => set({ duration: e.target.value })} /></div>
          <div className="col-span-2"><Label className="text-xs">Warning (optional)</Label><Textarea rows={2} value={d.warning ?? ""} onChange={e => set({ warning: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onChange({ open: false, data: null })}>Cancel</Button>
          <Button onClick={() => onSave(d)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type FoodDialogState = { open: boolean; kind: "rec" | "avoid"; data: FoodItem | null };
function FoodDialog({ state, onChange, onSave }: { state: FoodDialogState; onChange: (s: FoodDialogState) => void; onSave: (f: FoodItem, kind: "rec" | "avoid") => void }) {
  const d = state.data;
  if (!d) return null;
  const set = (patch: Partial<FoodItem>) => onChange({ ...state, data: { ...d, ...patch } });
  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onChange({ ...state, open: false, data: null })}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{d.id ? "Edit" : "Add"} {state.kind === "rec" ? "Recommended Food" : "Food to Avoid"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Name</Label><Input value={d.name} onChange={e => set({ name: e.target.value })} /></div>
          <div><Label className="text-xs">Description</Label><Textarea rows={2} value={d.desc} onChange={e => set({ desc: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onChange({ ...state, open: false, data: null })}>Cancel</Button>
          <Button onClick={() => onSave(d, state.kind)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type TextDialogState = { open: boolean; kind: "lifestyle" | "warning"; data: TextItem | null };
function TextDialog({ state, onChange, onSave }: { state: TextDialogState; onChange: (s: TextDialogState) => void; onSave: (t: TextItem, kind: "lifestyle" | "warning") => void }) {
  const d = state.data;
  if (!d) return null;
  return (
    <Dialog open={state.open} onOpenChange={(o) => !o && onChange({ ...state, open: false, data: null })}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{d.id ? "Edit" : "Add"} {state.kind === "lifestyle" ? "Lifestyle Recommendation" : "Warning Sign"}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <Label className="text-xs">{state.kind === "lifestyle" ? "Recommendation" : "Warning"}</Label>
          <Textarea rows={3} value={d.text} onChange={e => onChange({ ...state, data: { ...d, text: e.target.value } })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onChange({ ...state, open: false, data: null })}>Cancel</Button>
          <Button onClick={() => onSave(d, state.kind)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
