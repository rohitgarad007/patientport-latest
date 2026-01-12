import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  fetchPatients,
  addPatient,
  updatePatient,
  deletePatient,
  changePatientStatus
} from "@/services/HspatientService";
import HSPatientFormDialog from "@/components/patient/HSPatientFormDialog";
import { PaIcons } from "@/components/icons/PaIcons";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

export default function HSPatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage] = useState(10);
  const [totalPatients, setTotalPatients] = useState(0);

  // Popup states
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [allowPatientCount, setAllowPatientCount] = useState("");

  useEffect(() => {
    loadPatients();
    loadHospitalsFromCookie();
  }, [searchTerm, selectedSpecialization, currentPage]);

  const loadPatients = async () => {
    try {
      const res = await fetchPatients(currentPage, itemsPerPage, searchTerm, selectedSpecialization);
      setPatients(res.data || []);
      if (res.total) {
        setTotalPatients(res.total);
        setTotalPages(Math.ceil(res.total / itemsPerPage));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-100 text-red-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-100 text-purple-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-100 text-green-800',
    };
    return colors[bloodGroup as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const loadHospitalsFromCookie = () => {
    try {
      const cookieData = Cookies.get("userInfo");
      if (cookieData) {
        const parsed = JSON.parse(cookieData);

        // if parsed.patientCount is null, undefined, empty string, or not a number -> make it 0
        const patientCount = parsed.patientCount ? Number(parsed.patientCount) : 0;

        setAllowPatientCount(patientCount);

        setHospitals([
          {
            hosuid: parsed.loguid,
            name: parsed.name,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load hospital from cookies:", err);
    }
  };


  const handleSubmitPatient = async (formData: any) => {
    try {
      if (editingPatient?.patient_uid) {
        await updatePatient(editingPatient.patient_uid, formData);
      } else {
        await addPatient(formData);
      }
      await loadPatients();
      setEditingPatient(null);
      setIsPatientDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (patient_uid: string, newStatus: "active" | "inactive") => {
    try {
      const statusValue = newStatus === "active" ? 1 : 0;
      await changePatientStatus(patient_uid, statusValue);
      setPatients((prev) =>
        prev.map((p) =>
          p.patient_uid === patient_uid ? { ...p, status: statusValue } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePatient = async (patient_uid: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deletePatient(patient_uid);
        loadPatients();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Patient has been deleted.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while deleting.",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
    }
  };

  const specializations = [...new Set(patients.map((p) => p.specialization))];

  const avgConsultationFee =
    patients.length > 0
      ? patients.reduce((sum, p) => sum + Number(p.consultationFee || 0), 0) / patients.length
      : 0;

  // Add this function somewhere at the top of your component
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} Years ${months} Months ${days} Days`;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Patient Management 
          </h1>
        </div>

        {patients.length < Number(allowPatientCount) ? (
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setEditingPatient(null);
              setIsPatientDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Button>
        ) : (
          <Button
            variant="destructive"
            disabled
            className="flex items-center gap-2 cursor-not-allowed opacity-70"
          >
            🚫 Add Patient Limit Reached
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={patients.length.toString()}
          description="Active patients"
          icon={PaIcons.doctors}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="New This Month"
          value={specializations.length.toString()}
          description="Medical specialties"
          icon={PaIcons.specializations}
          trend={{ value: 2, isPositive: true }}
          variant="danger"
        />
        <StatCard
          title="Active Treatment"
          value={`INR ${Math.round(avgConsultationFee)}`}
          description="Consultation fee"
          icon={PaIcons.inr}
          trend={{ value: 5, isPositive: true }}
          variant="teal"
        />
      </div>

      {/* Patients Directory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Patients Directory</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {patient.fullname
                            ? patient.fullname.split(" ").map((n: string) => n[0]).join("")
                            : "PT"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{patient.fullname}</div>
                        <div className="text-sm text-muted-foreground">{patient.patient_uid}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <img src={PaIcons.email} alt="Email" className="w-4 h-4" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <img src={PaIcons.age} alt="Email" className="w-6 h-6" />
                        {calculateAge(patient.dob)}
                      </div>
                      <div className="flex items-center gap-1 text-sm" style={{textTransform: 'capitalize'}}>
                        <img src={PaIcons.gender} alt="Phone" className="w-6 h-6 " />
                        {patient.gender}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    
                    <Badge className={getBloodGroupColor(patient.bloodGroup)}>
                        {patient.bloodGroup}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${patient.status == "1" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {patient.status == "1" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <img src={PaIcons.setting} alt="More" className="w-6 h-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/hs-patient-view-details/${patient.id}`)}>
                          <Eye className="w-4 h-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        {patient.status == "1" ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, "inactive")}>
                            <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, "active")}>
                            <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => { setEditingPatient(patient); setIsPatientDialogOpen(true); }}>
                          <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" /> Edit Patient
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePatient(patient.patient_uid)}>
                          <img src={PaIcons.delete} alt="Delete" className="w-4 h-4 mr-2" /> Remove Patient
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4 sm:gap-0">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing {totalPatients === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPatients)} of {totalPatients} entries
            </div>
            <div className="flex items-center space-x-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Add/Edit Popup */}
      <HSPatientFormDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onSubmit={handleSubmitPatient}
        initialData={editingPatient}
      />
    </div>
  );
}
