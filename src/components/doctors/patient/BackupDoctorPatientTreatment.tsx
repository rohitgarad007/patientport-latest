
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Edit2, Trash2, Sparkles, FileText, Pill, TestTube, Scissors, History, Clock, Calendar, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import AISuggestionPopup from "@/components/doctors/patient/AISuggestionPopup";

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
}

interface LabTestItem {
  id: string;
  testName: string;
  reason: string;
  urgency: "routine" | "urgent" | "stat";
  status: "ordered" | "pending" | "completed";
  timestamp: string;
}

interface ProcedureItem {
  id: string;
  name: string;
  description: string;
  scheduledDate: string;
  status: "planned" | "scheduled" | "completed";
  timestamp: string;
}

const dummyDiagnosisSuggestions = [
  "Type 2 Diabetes Mellitus (E11.9) - Monitor HbA1c, lifestyle modifications recommended",
  "Essential Hypertension Stage 2 (I10) - DASH diet, regular BP monitoring, medication review",
  "Acute Upper Respiratory Infection (J06.9) - Viral etiology, symptomatic treatment",
  "Gastroesophageal Reflux Disease (K21.9) - PPI therapy, lifestyle modifications",
  "Migraine without Aura (G43.109) - Prophylactic therapy, trigger identification",
  "Osteoarthritis of Knee (M17.9) - Conservative management, physiotherapy referral"
];

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

const dummyProcedureSuggestions = [
  "ECG - Cardiac rhythm and conduction assessment",
  "X-Ray Chest PA View - Pulmonary evaluation",
  "Ultrasound Abdomen - Abdominal organ visualization",
  "Physiotherapy Session - Musculoskeletal rehabilitation",
  "Wound Dressing - Wound care and management"
];

const DoctorPatientTreatment = () => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([
    {
      id: "1",
      condition: "Type 2 Diabetes Mellitus",
      notes: "Patient presents with elevated fasting glucose. HbA1c at 7.8%. Currently on Metformin 500mg BD.",
      severity: "moderate",
      icd10: "E11.9",
      timestamp: new Date().toISOString()
    }
  ]);

  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: "1",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      duration: "30 days",
      instructions: "Take with meals to reduce GI upset",
      timestamp: new Date().toISOString()
    }
  ]);

  const [labTests, setLabTests] = useState<LabTestItem[]>([
    {
      id: "1",
      testName: "HbA1c",
      reason: "Diabetes monitoring",
      urgency: "routine",
      status: "ordered",
      timestamp: new Date().toISOString()
    }
  ]);

  const [procedures, setProcedures] = useState<ProcedureItem[]>([
    {
      id: "1",
      name: "ECG",
      description: "12-lead electrocardiogram for baseline cardiac assessment",
      scheduledDate: "2024-12-05",
      status: "scheduled",
      timestamp: new Date().toISOString()
    }
  ]);

  const [showAI, setShowAI] = useState<{ type: string; open: boolean }>({ type: "", open: false });
  const [editingId, setEditingId] = useState<{ type: string; id: string } | null>(null);

  // Diagnosis states
  const [newDiagnosis, setNewDiagnosis] = useState({ condition: "", notes: "", severity: "moderate" as const, icd10: "" });
  const [editDiagnosisData, setEditDiagnosisData] = useState<DiagnosisItem | null>(null);

  // Medication states
  const [newMedication, setNewMedication] = useState({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  const [editMedicationData, setEditMedicationData] = useState<MedicationItem | null>(null);

  // Lab Test states
  const [newLabTest, setNewLabTest] = useState({ testName: "", reason: "", urgency: "routine" as const });
  const [editLabTestData, setEditLabTestData] = useState<LabTestItem | null>(null);

  // Procedure states
  const [newProcedure, setNewProcedure] = useState({ name: "", description: "", scheduledDate: "", status: "planned" as const });
  const [editProcedureData, setEditProcedureData] = useState<ProcedureItem | null>(null);

  const handleSaveAll = () => {
    toast.success("Treatment plan saved successfully!", {
      description: "All changes recorded in patient's medical record."
    });
  };

  // Diagnosis handlers
  const handleAIDiagnosis = (suggestion: string) => {
    const parts = suggestion.split(" - ");
    const conditionPart = parts[0];
    const icd10Match = conditionPart.match(/\(([^)]+)\)/);
    const icd10 = icd10Match ? icd10Match[1] : "";
    const condition = conditionPart.replace(/\s*\([^)]+\)/, "").trim();
    const notes = parts[1] || "";
    setNewDiagnosis({ condition, notes, severity: "moderate", icd10 });
  };

  const handleAddDiagnosis = () => {
    if (!newDiagnosis.condition.trim()) return;
    setDiagnoses([...diagnoses, { ...newDiagnosis, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    setNewDiagnosis({ condition: "", notes: "", severity: "moderate", icd10: "" });
    toast.success("Diagnosis added");
  };

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
  const handleAIMedication = (suggestion: string) => {
    const parts = suggestion.split(" - ");
    const nameDosage = parts[0].split(" ");
    const name = nameDosage.slice(0, -1).join(" ");
    const dosage = nameDosage[nameDosage.length - 1];
    const instructions = parts[1] || "";
    setNewMedication({ name, dosage, frequency: "", duration: "", instructions });
  };

  const handleAddMedication = () => {
    if (!newMedication.name.trim()) return;
    setMedications([...medications, { ...newMedication, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    setNewMedication({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
    toast.success("Medication added");
  };

  const handleEditMedication = (item: MedicationItem) => {
    setEditingId({ type: "medication", id: item.id });
    setEditMedicationData({ ...item });
  };

  const handleSaveEditMedication = () => {
    if (!editMedicationData) return;
    setMedications(medications.map(m => m.id === editMedicationData.id ? editMedicationData : m));
    setEditingId(null);
    setEditMedicationData(null);
    toast.success("Medication updated");
  };

  const handleDeleteMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
    toast.success("Medication removed");
  };

  // Lab Test handlers
  const handleAILabTest = (suggestion: string) => {
    const parts = suggestion.split(" - ");
    const testName = parts[0];
    const reason = parts[1] || "";
    setNewLabTest({ testName, reason, urgency: "routine" });
  };

  const handleAddLabTest = () => {
    if (!newLabTest.testName.trim()) return;
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

  // Procedure handlers
  const handleAIProcedure = (suggestion: string) => {
    const parts = suggestion.split(" - ");
    const name = parts[0];
    const description = parts[1] || "";
    setNewProcedure({ name, description, scheduledDate: "", status: "planned" });
  };

  const handleAddProcedure = () => {
    if (!newProcedure.name.trim()) return;
    setProcedures([...procedures, { ...newProcedure, id: Date.now().toString(), timestamp: new Date().toISOString() }]);
    setNewProcedure({ name: "", description: "", scheduledDate: "", status: "planned" });
    toast.success("Procedure added");
  };

  const handleEditProcedure = (item: ProcedureItem) => {
    setEditingId({ type: "procedure", id: item.id });
    setEditProcedureData({ ...item });
  };

  const handleSaveEditProcedure = () => {
    if (!editProcedureData) return;
    setProcedures(procedures.map(p => p.id === editProcedureData.id ? editProcedureData : p));
    setEditingId(null);
    setEditProcedureData(null);
    toast.success("Procedure updated");
  };

  const handleDeleteProcedure = (id: string) => {
    setProcedures(procedures.filter(p => p.id !== id));
    toast.success("Procedure removed");
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6">
          {/* Enhanced Patient Info Header */}
          <Card className="p-4 md:p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-3 md:gap-4">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                    SD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground pb-4">Sanath Deo</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>ID: 0220920200005 • Male • 34 years</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>sanath.deo@email.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Last Visit: 15 Dec 2021</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="secondary" className="bg-info-light text-info">Type 2 Diabetes</Badge>
                    <Badge variant="secondary" className="bg-warning-light text-warning">Hypertension</Badge>
                    <Badge variant="secondary" className="bg-success-light text-success">No Allergies</Badge>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveAll} size="lg" className="gap-2 w-full lg:w-auto shadow-lg">
                <Save className="w-5 h-5" />
                Save Treatment Plan
              </Button>
            </div>
          </Card>

          {/* Treatment Tabs */}
          <Card className="p-4 md:p-6">
            <Tabs defaultValue="diagnosis" className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-auto gap-1 bg-muted p-1 mb-6">
                <TabsTrigger value="diagnosis" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Diagnosis</span>
                </TabsTrigger>
                <TabsTrigger value="prescription" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Pill className="w-4 h-4" />
                  <span className="hidden sm:inline">Medication</span>
                </TabsTrigger>
                <TabsTrigger value="labtests" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TestTube className="w-4 h-4" />
                  <span className="hidden sm:inline">Lab Tests</span>
                </TabsTrigger>
                <TabsTrigger value="procedures" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Scissors className="w-4 h-4" />
                  <span className="hidden sm:inline">Procedures</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>

              {/* Diagnosis Tab */}
              <TabsContent value="diagnosis" className="space-y-4">
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                  <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Add New Diagnosis
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Condition name..."
                          value={newDiagnosis.condition}
                          onChange={(e) => setNewDiagnosis({ ...newDiagnosis, condition: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowAI({ type: "diagnosis", open: true })}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
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
              </TabsContent>

              {/* Medication Tab */}
              <TabsContent value="prescription" className="space-y-4">
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                  <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Add New Medication
                  </h3>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Medication name..."
                          value={newMedication.name}
                          onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowAI({ type: "medication", open: true })}
                          className="hover:bg-primary hover:text-primary-foreground"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      />
                      <Input
                        placeholder="Frequency (e.g., Twice daily)"
                        value={newMedication.frequency}
                        onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                      />
                      <Input
                        placeholder="Duration (e.g., 30 days)"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                      />
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
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      {editingId?.type === "medication" && editingId.id === item.id && editMedicationData ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              value={editMedicationData.name}
                              onChange={(e) => setEditMedicationData({ ...editMedicationData, name: e.target.value })}
                              placeholder="Medication name"
                            />
                            <Input
                              value={editMedicationData.dosage}
                              onChange={(e) => setEditMedicationData({ ...editMedicationData, dosage: e.target.value })}
                              placeholder="Dosage"
                            />
                            <Input
                              value={editMedicationData.frequency}
                              onChange={(e) => setEditMedicationData({ ...editMedicationData, frequency: e.target.value })}
                              placeholder="Frequency"
                            />
                            <Input
                              value={editMedicationData.duration}
                              onChange={(e) => setEditMedicationData({ ...editMedicationData, duration: e.target.value })}
                              placeholder="Duration"
                            />
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
                                <h4 className="font-semibold text-lg">{item.name} - {item.dosage}</h4>
                                <p className="text-sm text-muted-foreground">{item.frequency} • {item.duration}</p>
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
                  <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Order Lab Test
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Test name..."
                        value={newLabTest.testName}
                        onChange={(e) => setNewLabTest({ ...newLabTest, testName: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAI({ type: "labtest", open: true })}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
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
                      <Button onClick={handleAddLabTest} className="ml-auto w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Order Test
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {labTests.map((item) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
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
                                <h4 className="font-semibold text-lg">{item.testName}</h4>
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

              {/* Procedures Tab */}
              <TabsContent value="procedures" className="space-y-4">
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                  <h3 className="text-lg font-heading font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Add Procedure
                  </h3>
                  <div className="grid gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Procedure name..."
                        value={newProcedure.name}
                        onChange={(e) => setNewProcedure({ ...newProcedure, name: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAI({ type: "procedure", open: true })}
                        className="hover:bg-primary hover:text-primary-foreground"
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Procedure description and clinical notes..."
                      value={newProcedure.description}
                      onChange={(e) => setNewProcedure({ ...newProcedure, description: e.target.value })}
                      rows={2}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="date"
                        value={newProcedure.scheduledDate}
                        onChange={(e) => setNewProcedure({ ...newProcedure, scheduledDate: e.target.value })}
                      />
                      <select
                        value={newProcedure.status}
                        onChange={(e) => setNewProcedure({ ...newProcedure, status: e.target.value as any })}
                        className="px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="planned">Planned</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <Button onClick={handleAddProcedure} className="ml-auto w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Procedure
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {procedures.map((item) => (
                    <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      {editingId?.type === "procedure" && editingId.id === item.id && editProcedureData ? (
                        <div className="space-y-3">
                          <Input
                            value={editProcedureData.name}
                            onChange={(e) => setEditProcedureData({ ...editProcedureData, name: e.target.value })}
                            placeholder="Procedure name"
                          />
                          <Textarea
                            value={editProcedureData.description}
                            onChange={(e) => setEditProcedureData({ ...editProcedureData, description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="flex gap-2 items-center justify-between">
                            <div className="flex gap-2">
                              <Input
                                type="date"
                                value={editProcedureData.scheduledDate}
                                onChange={(e) => setEditProcedureData({ ...editProcedureData, scheduledDate: e.target.value })}
                              />
                              <select
                                value={editProcedureData.status}
                                onChange={(e) => setEditProcedureData({ ...editProcedureData, status: e.target.value as any })}
                                className="px-3 py-2 border border-input rounded-md bg-background"
                              >
                                <option value="planned">Planned</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveEditProcedure} size="sm">
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                              <Button onClick={() => { setEditingId(null); setEditProcedureData(null); }} variant="outline" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 mb-2">
                              <Scissors className="w-5 h-5 text-primary mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-lg">{item.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                                <div className="flex flex-wrap gap-2 items-center">
                                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                                  {item.scheduledDate && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(item.scheduledDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(item.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditProcedure(item)} className="hover:bg-primary-light hover:text-primary">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProcedure(item.id)} className="hover:bg-destructive-light hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                <Card className="p-6">
                  <h3 className="text-xl font-heading font-bold mb-4">Treatment History</h3>
                  <div className="text-center text-muted-foreground py-8">
                    Complete treatment history with all diagnoses, medications, tests, and procedures will be displayed here.
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* AI Suggestion Popups */}
        <AISuggestionPopup
          open={showAI.type === "diagnosis" && showAI.open}
          onClose={() => setShowAI({ type: "", open: false })}
          onSelect={handleAIDiagnosis}
          suggestions={dummyDiagnosisSuggestions}
          title="Diagnosis Suggestions"
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
        <AISuggestionPopup
          open={showAI.type === "procedure" && showAI.open}
          onClose={() => setShowAI({ type: "", open: false })}
          onSelect={handleAIProcedure}
          suggestions={dummyProcedureSuggestions}
          title="Procedure Suggestions"
        />
      </main>
    </div>
  );
};

export default DoctorPatientTreatment;
