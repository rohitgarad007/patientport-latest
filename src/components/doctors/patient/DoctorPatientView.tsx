import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  Calendar,
  History,
  Clock,
  CheckCircle2,
  ClipboardList,
  Stethoscope,
  FlaskConical,
  Pill,
  Eye,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import { getPatientDetails, getPatientVisitHistory, getTreatment } from "@/services/patientTreatmentService";

  

interface LabTest {
  name: string;
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  status: "Completed" | "Pending";
  result?: string;
  reportUrl?: string;
}

interface Visit {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: "Completed" | "Ongoing";
  chiefComplaints: string[];
  diagnosis: string[];
  labTests: LabTest[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
}

interface PatientSummary {
  id: number;
  name: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  blood_group?: string;
  avatar?: string;
}

const emptyVisit: Visit = { id: "", date: "", time: "", doctor: "", department: "", status: "Completed", chiefComplaints: [], diagnosis: [], labTests: [], medications: [] };

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High Priority":
      return "bg-red-100 text-red-600 border-red-200";
    case "Medium Priority":
      return "bg-orange-100 text-orange-600 border-orange-200";
    case "Low Priority":
      return "bg-green-100 text-green-600 border-green-200";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function DoctorPatientView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit>(emptyVisit);
  const [loadingVisit, setLoadingVisit] = useState<boolean>(false);
  const toVisit = (it: any): Visit => ({
    id: String(it?.id ?? ""),
    date: String(it?.date ?? ""),
    time: String(it?.time ?? ""),
    doctor: String(it?.doctor ?? ""),
    department: String(it?.department ?? ""),
    status: String(it?.status ?? "Completed") as Visit["status"],
    chiefComplaints: Array.isArray(it?.chiefComplaints) ? it.chiefComplaints : [],
    diagnosis: Array.isArray(it?.diagnosis) ? it.diagnosis : [],
    labTests: Array.isArray(it?.labTests) ? it.labTests : [],
    medications: Array.isArray(it?.medications) ? it.medications : [],
  });
  const mergeVisitDetails = (base: Visit, details: any): Visit => {
    const complaints: string[] =
      Array.isArray(details?.purpose)
        ? details.purpose.map((p: any) => String(p?.name ?? p?.title ?? p?.label ?? p)).filter(Boolean)
        : Array.isArray(details?.purpose_names)
        ? details.purpose_names.map((p: any) => String(p)).filter(Boolean)
        : Array.isArray(details?.chiefComplaints)
        ? details.chiefComplaints.map((c: any) => String(c)).filter(Boolean)
        : base.chiefComplaints;

    const diagnosis: string[] =
      Array.isArray(details?.diagnosis)
        ? details.diagnosis.map((d: any) => String(d?.name ?? d?.condition ?? d)).filter(Boolean)
        : base.diagnosis;

    const labsRaw = Array.isArray(details?.labTests)
      ? details.labTests
      : Array.isArray(details?.lab_tests)
      ? details.lab_tests
      : [];

    const reportsRaw = Array.isArray(details?.lab_reports) ? details.lab_reports : [];
    const reportByTestId = new Map<string, string>();
    const reportByTestName = new Map<string, string>();
    reportsRaw.forEach((r: any) => {
      const url = String(r?.fileUrl ?? r?.url ?? r?.file_url ?? "");
      if (!url) return;
      const isCombined = !!(r?.isCombinedReport ?? r?.is_combined);
      const covered = Array.isArray(r?.coveredTestIds) ? r.coveredTestIds : Array.isArray(r?.covered_tests) ? r.covered_tests : [];
      const tid = r?.labTestId ?? r?.lab_test_id ?? r?.testId ?? r?.test_id;
      if (tid) {
        reportByTestId.set(String(tid), url);
      }
      const tname = r?.testName ?? r?.test_name;
      if (tname) {
        reportByTestName.set(String(tname).toLowerCase(), url);
      }
      if (isCombined && covered.length) {
        covered.forEach((cid: any) => {
          reportByTestId.set(String(cid), url);
        });
      }
    });

    const labTests: LabTest[] =
      labsRaw.length
        ? labsRaw.map((t: any) => {
            const id = t?.id ?? t?.testId ?? t?.labTestId;
            const name = String(t?.testName ?? t?.name ?? t);
            const pr = String(t?.priority ?? t?.urgency ?? "").toLowerCase();
            const priority: LabTest["priority"] = pr.includes("high") || pr.includes("stat")
              ? "High Priority"
              : pr.includes("medium") || pr.includes("urgent")
              ? "Medium Priority"
              : "Low Priority";
            const st = String(t?.status ?? "").toLowerCase();
            const status: LabTest["status"] = st.includes("complete") ? "Completed" : "Pending";
            const result = typeof t?.result === "string" ? t.result : undefined;
            const reportUrl =
              (id ? reportByTestId.get(String(id)) : undefined) ||
              reportByTestName.get(name.toLowerCase()) ||
              (typeof t?.reportUrl === "string" ? t.reportUrl : undefined);
            return { name, priority, status, result, reportUrl };
          })
        : base.labTests;

    const medications:
      { name: string; dosage: string; frequency: string; duration: string; instructions: string }[] =
      Array.isArray(details?.medications)
        ? details.medications.map((m: any) => ({
            name: String(m?.name ?? ""),
            dosage: String(m?.dosage ?? m?.dose ?? ""),
            frequency: String(m?.frequency ?? m?.freq ?? ""),
            duration: String(m?.duration ?? ""),
            instructions: String(m?.instructions ?? m?.notes ?? ""),
          }))
        : base.medications;

    return {
      ...base,
      chiefComplaints: complaints,
      diagnosis,
      labTests,
      medications,
    };
  };
  const loadVisitDetails = async (visit: Visit) => {
    try {
      setLoadingVisit(true);
      setSelectedVisit(visit);
      if (!visit?.id) return;
      const res = await getTreatment(visit.id);
      const details = res?.data ?? res;
      const merged = mergeVisitDetails(visit, details);
      setSelectedVisit(merged);
    } catch {
      // ignore
    } finally {
      setLoadingVisit(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!patientId) return;
      try {
        const p = await getPatientDetails(patientId);
        if (p?.success && p.data) setPatient(p.data);
        const v = await getPatientVisitHistory(patientId);
        if (v?.success && Array.isArray(v.data)) {
          const mapped: Visit[] = v.data.map(toVisit);
          setVisits(mapped);
          if (mapped.length > 0) {
            await loadVisitDetails(mapped[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load patient data:", e);
      }
    };
    load();
  }, [patientId]);

  return (
    
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src={patient?.avatar || ""} />
                <AvatarFallback>{(patient?.name || "P").split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">{patient?.name || "Patient"}</h1>
                  <Badge variant="outline">ID: {patientId}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {patient?.age ?? ""}{patient?.age ? "Y" : ""} {patient?.gender ? `/ ${patient.gender}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {patient?.phone || ""}
                  </span>
                  <span className="hidden md:flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {patient?.email || ""}
                  </span>
                </div>
              </div>
              <Badge className="bg-red-500/10 text-red-600 border-red-200">{patient?.blood_group || ""}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Visit History Sidebar */}
          <Card className="lg:h-[calc(100vh-200px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Visit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px] lg:h-[calc(100vh-280px)]">
                <div className="space-y-1 p-3">
                  {visits.map((visit) => (
                    <button
                      key={visit.id}
                      onClick={() => loadVisitDetails(visit)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedVisit.id === visit.id
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{visit.date ? new Date(visit.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                        <Badge variant={visit.status === "Completed" ? "default" : "secondary"} className="text-xs">
                          {visit.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{visit.doctor} • {visit.department}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> {visit.time}
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Visit Details - Receipt Style */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {new Date(selectedVisit.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedVisit.doctor} • {selectedVisit.department} • {selectedVisit.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedVisit.status === "Completed" ? "default" : "outline"} className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {selectedVisit.status}
                  </Badge>
                  {loadingVisit && (
                    <Badge variant="outline">Loading details</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-8">
              {/* Chief Complaints & Diagnosis Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Chief Complaints */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-lg text-amber-700">Chief Complaints</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVisit.chiefComplaints.map((complaint, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1.5 text-sm font-medium"
                      >
                        {complaint}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-blue-700">Diagnosis</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVisit.diagnosis.map((diag, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-sm font-medium"
                      >
                        {diag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommended Lab Tests */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-lg text-purple-700">Recommended Lab Tests</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedVisit.labTests.map((test, idx) => (
                      <Card key={idx} className="border-2 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col h-full">
                            <h4 className="font-medium text-sm mb-2 flex-1">{test.name}</h4>
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <Badge className={`text-xs ${getPriorityColor(test.priority)}`}>
                                {test.priority}
                              </Badge>
                              {test.reportUrl && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" disabled={loadingVisit}>
                                      <Eye className="h-3 w-3" /> View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> {test.name} Report
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="p-6 bg-muted/30 rounded-lg min-h-[400px]">
                                      <div className="border-b pb-4 mb-4">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h3 className="font-bold text-lg">{test.name}</h3>
                                            <p className="text-sm text-muted-foreground">Patient: {patient?.name || ""}</p>
                                          </div>
                                          <Badge className={getPriorityColor(test.priority)}>{test.priority}</Badge>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <p className="text-muted-foreground">Test Date</p>
                                            <p className="font-medium">{selectedVisit.date ? new Date(selectedVisit.date).toLocaleDateString() : ""}</p>
                                          </div>
                                          <div>
                                            <p className="text-muted-foreground">Doctor</p>
                                            <p className="font-medium">{selectedVisit.doctor}</p>
                                          </div>
                                        </div>
                                        <div className="p-4 bg-background rounded-lg border">
                                          <p className="text-sm text-muted-foreground mb-1">Result</p>
                                          <p className="font-semibold text-lg flex items-center gap-2">
                                            {test.result}
                                            {test.result?.includes("Elevated") && (
                                              <AlertCircle className="h-4 w-4 text-amber-500" />
                                            )}
                                          </p>
                                        </div>
                                        <div className="flex justify-center pt-4">
                                          <Button variant="outline" className="gap-2" onClick={() => test.reportUrl && window.open(test.reportUrl, "_blank")}>
                                            <Download className="h-4 w-4" /> Download PDF
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                            {test.result && (
                              <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                Result: {test.result}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

              {/* Prescribed Medications Table */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg text-green-700">Prescribed Medications</h3>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-12 text-center">#</TableHead>
                          <TableHead className="min-w-[180px]">Medicine</TableHead>
                          <TableHead>Dosage</TableHead>
                          <TableHead>Frequency</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="min-w-[150px]">Instructions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedVisit.medications.map((med, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                            <TableCell>
                              <span className="text-primary font-medium hover:underline cursor-pointer">
                                {med.name}
                              </span>
                            </TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {med.duration}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{med.instructions}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
