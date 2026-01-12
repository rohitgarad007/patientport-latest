import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  Calendar,
  MapPin,
  Droplets,
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
  AlertCircle
} from "lucide-react";

import { getPatientDetails, getPatientVisitHistory, getTreatment } from "@/services/HspatientService";

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

interface PatientDetails {
  id: string;
  patient_uid: string;
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  address: string;
  status: string;
  hospitalName: string;
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

export default function HSPatientView() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Visit History State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit>(emptyVisit);
  const [loadingVisit, setLoadingVisit] = useState<boolean>(false);

  const toVisit = (it: any): Visit => ({
    id: String(it?.id ?? ""),
    date: String(it?.date ?? ""),
    time: String(it?.time ?? it?.start_time ?? ""),
    doctor: String(it?.doctor_name ?? it?.doctor ?? ""),
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
    if (patientId) {
      loadPatientDetails(patientId);
      loadVisitHistory(patientId);
    }
  }, [patientId]);

  const loadPatientDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatientDetails(id);
      if (res.success && res.data) {
        setPatient(res.data);
      } else {
        setError(res.message || "Failed to load patient details");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching patient details");
    } finally {
      setLoading(false);
    }
  };

  const loadVisitHistory = async (id: string) => {
    try {
      const v = await getPatientVisitHistory(id);
      if (v?.success && Array.isArray(v.data)) {
        const mapped: Visit[] = v.data.map(toVisit);
        setVisits(mapped);
        if (mapped.length > 0) {
          loadVisitDetails(mapped[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load visit history", e);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years;
  };

  if (loading) {
    return <div className="p-8 text-center">Loading patient details...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95">
      {/* Header with Back Button */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Patient Profile</h1>
            <Badge variant="outline" className="text-xs font-normal">
              {patient?.patient_uid}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Patient Header Card */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {patient?.fullname
                  ? patient.fullname.split(" ").map((n) => n[0]).join("")
                  : "PT"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {patient?.fullname}
                  <Badge variant={patient?.status === "1" ? "default" : "secondary"}>
                    {patient?.status === "1" ? "Active" : "Inactive"}
                  </Badge>
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> 
                    {calculateAge(patient?.dob || "")} Years / {patient?.gender}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="h-4 w-4" /> 
                    Blood Group: {patient?.bloodGroup || "N/A"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{patient?.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{patient?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{patient?.address || "N/A"}</p>
                  </div>
                </div>

                 <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="font-medium">{patient?.emergencyContact || "N/A"}</p>
                  </div>
                </div>

                 <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{patient?.dob || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visit History & Details */}
        <div className="grid lg:grid-cols-[300px_1fr] gap-6">
          {/* Visit History Sidebar */}
          <Card className="lg:h-[calc(100vh-200px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Visit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] lg:h-[calc(100vh-280px)]">
                <div className="space-y-1 p-3">
                  {visits.length === 0 && (
                     <p className="text-sm text-muted-foreground text-center py-4">No visits found.</p>
                  )}
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
          {selectedVisit.id ? (
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
                    {selectedVisit.chiefComplaints.length > 0 ? (
                      selectedVisit.chiefComplaints.map((complaint, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1.5 text-sm font-medium"
                        >
                          {complaint}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">No chief complaints recorded.</span>
                    )}
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg text-blue-700">Diagnosis</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVisit.diagnosis.length > 0 ? (
                      selectedVisit.diagnosis.map((diag, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-sm font-medium"
                        >
                          {diag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm italic">No diagnosis recorded.</span>
                    )}
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
                    {selectedVisit.labTests.length > 0 ? (
                      selectedVisit.labTests.map((test, idx) => (
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
                                              <p className="text-sm text-muted-foreground">Patient: {patient?.fullname || ""}</p>
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
                      ))
                    ) : (
                       <span className="text-muted-foreground text-sm italic">No lab tests recommended.</span>
                    )}
                  </div>
                </div>

              {/* Prescribed Medications Table */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Pill className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg text-green-700">Prescribed Medications</h3>
                </div>
                
                {selectedVisit.medications.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                          <th className="p-3">Medicine Name</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedVisit.medications.map((med, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-3 font-medium">{med.name}</td>
                            <td className="p-3">{med.dosage}</td>
                            <td className="p-3">{med.frequency}</td>
                            <td className="p-3">{med.duration}</td>
                            <td className="p-3 text-muted-foreground">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm italic">No medications prescribed.</span>
                )}
              </div>
            </CardContent>
          </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
                <div className="text-center text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Select a visit to view details</p>
                </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
