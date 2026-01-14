import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaIcons } from "@/components/icons/PaIcons";
import { Table as UiTable } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { fetchPatients, fetchPatientShares, createPatientShare } from "@/services/HsPatientService";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, EyeOff, CheckCircle2, User, Mail, Phone, Calendar, Droplets, MapPin } from "lucide-react";

interface PatientItem {
  id: string;
  fname: string;
  lname: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  address?: string;
}

const HospitalSharePatientInfo = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<PatientItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientItem | null>(null);
  const [shareTo, setShareTo] = useState("");
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({
    name: true,
    email: true,
    phone: true,
    dob: true,
    gender: true,
    blood_group: true,
    address: true,
  });
  const [shares, setShares] = useState<any[]>([]);

  useEffect(() => {
    loadShares();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await fetchPatients(1, 10, search);
      const list = Array.isArray(res.data) ? res.data : [];
      setPatients(list);
    } catch (e: any) {
      toast({
        title: "Failed to load patients",
        description: e.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const loadShares = async () => {
    try {
      const res = await fetchPatientShares(1, 10);
      setShares(Array.isArray(res.data) ? res.data : []);
    } catch {}
  };

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onShare = async () => {
    if (!selectedPatient) {
      toast({ title: "Select a patient", variant: "destructive" });
      return;
    }
    if (!shareTo || !shareTo.includes("@")) {
      toast({ title: "Enter a valid email to share", variant: "destructive" });
      return;
    }
    const activeSections = Object.keys(selectedSections).filter((k) => selectedSections[k]);
    const fields: string[] = [];
    if (activeSections.includes("name")) {
      fields.push("fname", "lname");
    }
    if (activeSections.includes("email")) fields.push("email");
    if (activeSections.includes("phone")) fields.push("phone");
    if (activeSections.includes("dob")) fields.push("dob");
    if (activeSections.includes("gender")) fields.push("gender");
    if (activeSections.includes("blood_group")) fields.push("blood_group");
    if (activeSections.includes("address")) fields.push("address");
    try {
      const res = await createPatientShare({
        patient_id: String(selectedPatient.id),
        share_to: shareTo,
        fields,
      });
      if (res.success) {
        toast({ title: "Shared successfully" });
        setShareTo("");
        setSelectedPatient(null);
        await loadShares();
      } else {
        toast({ title: "Failed to share", description: res.message || "", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Failed to share", description: e.message || "", variant: "destructive" });
    }
  };

  const totalSections = 7;
  const visibleCount = Object.values(selectedSections).filter(Boolean).length;
  const hiddenCount = totalSections - visibleCount;

  const sectionConfig = [
    {
      id: "name",
      label: "Name",
      description: "First name and last name",
      icon: User,
    },
    {
      id: "email",
      label: "Email",
      description: "Primary contact email",
      icon: Mail,
    },
    {
      id: "phone",
      label: "Phone",
      description: "Patient phone number",
      icon: Phone,
    },
    {
      id: "dob",
      label: "Date of Birth",
      description: "Patient date of birth",
      icon: Calendar,
    },
    {
      id: "gender",
      label: "Gender",
      description: "Patient gender information",
      icon: Users,
    },
    {
      id: "blood_group",
      label: "Blood Group",
      description: "Patient blood group details",
      icon: Droplets,
    },
    {
      id: "address",
      label: "Address",
      description: "Patient address and location",
      icon: MapPin,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={PaIcons.patientEditIcon} alt="Share" className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Share Patient Info</h1>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-background via-background to-muted/30 border-0 shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSections}</p>
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
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Required</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder="Search patients"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button onClick={loadPatients}>Search</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Select</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id} className={selectedPatient?.id === p.id ? "bg-muted/40" : ""}>
                  <TableCell>{`${p.fname} ${p.lname}`}</TableCell>
                  <TableCell>{p.email || "-"}</TableCell>
                  <TableCell>{p.phone || "-"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedPatient(p)}>Select</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Share Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm">Recipient Email</div>
              <Input placeholder="name@example.com" value={shareTo} onChange={(e) => setShareTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-sm">Selected Patient</div>
              <Input readOnly value={selectedPatient ? `${selectedPatient.fname} ${selectedPatient.lname}` : ""} placeholder="No patient selected" />
            </div>
          </div>
          <div className="mt-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  Patient Info Sections
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sectionConfig.map((section) => {
                    const IconComponent = section.icon;
                    const isVisible = selectedSections[section.id];
                    return (
                      <div
                        key={section.id}
                        className={`p-4 md:p-5 transition-all duration-200 ${
                          isVisible ? "bg-background hover:bg-muted/30" : "bg-muted/20 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              isVisible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{section.label}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {section.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Switch
                              checked={isVisible}
                              onCheckedChange={() => toggleSection(section.id)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <span
                              className={`text-xs font-medium ${
                                isVisible ? "text-green-600" : "text-muted-foreground"
                              }`}
                            >
                              {isVisible ? "Visible" : "Hidden"}
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
          <div className="mt-4 flex justify-end">
            <Button onClick={onShare} disabled={!selectedPatient}>
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shared Info</CardTitle>
        </CardHeader>
        <CardContent>
          <UiTable>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shares.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.share_to}</TableCell>
                  <TableCell>{s.email || "-"}</TableCell>
                  <TableCell>{s.phone || "-"}</TableCell>
                  <TableCell>{s.status === 1 ? "Active" : "Revoked"}</TableCell>
                  <TableCell>{s.created_at || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </UiTable>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalSharePatientInfo;
