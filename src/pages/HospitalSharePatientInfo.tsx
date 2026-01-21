import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaIcons } from "@/components/icons/PaIcons";
import { Table as UiTable } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  fetchPatients,
  fetchPatientShares,
  createPatientShare,
  fetchPatientInfoContentSettings,
  updatePatientInfoContentSettings,
} from "@/services/HsPatientService";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Eye, EyeOff, CheckCircle2, User, Mail, Phone, Calendar, Droplets, MapPin, FlaskConical } from "lucide-react";

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
    loadContentSettings();
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

  const loadContentSettings = async () => {
    try {
      const res = await fetchPatientInfoContentSettings();
      if (res.success && res.data) {
        const data = res.data as any;
        setSelectedSections({
          name: data.name_status == 1,
          email: data.email_status == 1,
          phone: data.phone_status == 1,
          dob: data.dob_status == 1,
          gender: data.gender_status == 1,
          blood_group: data.blood_group_status == 1,
          address: data.address_status == 1,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveContentSettings = async (sections: Record<string, boolean>) => {
    try {
      const payload = {
        name_status: sections.name ? 1 : 0,
        email_status: sections.email ? 1 : 0,
        phone_status: sections.phone ? 1 : 0,
        dob_status: sections.dob ? 1 : 0,
        gender_status: sections.gender ? 1 : 0,
        blood_group_status: sections.blood_group ? 1 : 0,
        address_status: sections.address ? 1 : 0,
      };
      await updatePatientInfoContentSettings(payload);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSection = (key: string) => {
    setSelectedSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      void saveContentSettings(updated);
      return updated;
    });
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

      <div className="container mx-auto px-4 py-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Manage Share Patient Info</h1>
          </div>
        </div>

        <Card className="bg-gradient-to-br pt-5 from-background via-background to-muted/30 border-0 shadow-none">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalSections} <small className="text-xs text-muted-foreground">Total Sections</small></p>
                    
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{visibleCount} <small className="text-xs text-muted-foreground">Visible</small> </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <EyeOff className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{hiddenCount} <small className="text-xs text-muted-foreground">Hidden</small></p>
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </CardContent>
        </Card>


       
        <CardContent className="p-0">
          
          <div className="mt-6">
            <Card className="">
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
          
        </CardContent>
      
        </div>
      
    </div>
  );
};

export default HospitalSharePatientInfo;
