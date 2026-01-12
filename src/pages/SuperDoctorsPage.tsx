  import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  GraduationCap,
  Clock,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  fetchDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  changeDoctorStatus
} from "@/services/doctorService";
import { fetchHospitals } from "@/services/masterHospitalService";
import DoctorFormDialog from "@/components/doctors/DoctorFormDialog";
import { PaIcons } from "@/components/icons/PaIcons";
import Swal from "sweetalert2";

export default function SuperDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  // Popup states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  useEffect(() => {
    loadDoctors();
    loadHospitals();
  }, [searchTerm, selectedSpecialization]);

  const loadDoctors = async () => {
    try {
      const res = await fetchDoctors(1, 50, searchTerm, selectedSpecialization);
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHospitals = async () => {
    try {
      const res = await fetchHospitals(1, 100, "");
      setHospitals(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

 

  const handleSubmitDoctor = async (formData: any) => {

    try {
      if (editingDoctor?.docuid) {
        await updateDoctor(editingDoctor.docuid, formData); // update
      } else {
        await addDoctor(formData); // add
      }
      await loadDoctors();
      setEditingDoctor(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };


  const handleStatusChange = async (id: string, newStatus: "active" | "inactive") => {
    try {
      // Convert to 0/1 for backend
      const statusValue = newStatus === "active" ? 1 : 0;

      // Call your API to change status
      await changeDoctorStatus(id, statusValue);

      // Update local state
      setDoctors((prevDoctors) =>
        prevDoctors.map((doc) =>
          doc.docuid === id ? { ...doc, status: statusValue } : doc
        )
      );
    } catch (err) {
      console.error(err);
    }
  };



  const handleDeleteDoctor = async (id: string) => {
    

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
        await deleteDoctor(id);
        loadDoctors();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Doctor has been deleted.",
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

  const specializations = [...new Set(doctors.map((doc) => doc.specialization))];

  const avgConsultationFee =
    doctors.length > 0
      ? doctors.reduce(
          (sum, doc) => sum + Number(doc.doctorFees || 0),
          0
        ) / doctors.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Doctors</h1>
          
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setEditingDoctor(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Doctors"
          value={doctors.length.toString()}
          description="Active medical professionals"
          icon={PaIcons.doctors}
          trend={{ value: 8, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Specializations"
          value={specializations.length.toString()}
          description="Medical specialties"
          icon={PaIcons.specializations}
          trend={{ value: 2, isPositive: true }}
          variant="danger"
          
        />
        <StatCard
          title="Total Experience"
          value={`${
            doctors.length > 0
              ? (() => {
                  // sum total months
                  const totalMonths = doctors.reduce(
                    (sum, doc) =>
                      sum + (Number(doc.expYear || 0) * 12 + Number(doc.expMonth || 0)),
                    0
                  );
                  const years = Math.floor(totalMonths / 12);
                  const months = totalMonths % 12;
                  return `${years} years | ${months} months`;
                })()
              : "0 years | 0 months"
          }`}
          description="Professional experience"
          icon={PaIcons.experience}
          trend={{ value: 3, isPositive: true }}
          variant="blue"
        />


        <StatCard
          title="Avg. Fee"
          value={`INR ${Math.round(avgConsultationFee)}`}
          description="Consultation fee"
          icon={PaIcons.inr}
          trend={{ value: 5, isPositive: true }}
          variant="teal"
        />
      </div>

      {/* Doctor Directory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Doctor Directory</CardTitle>
              
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <TableHead>Doctor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {doctor.doctorName
                            ? doctor.doctorName
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                            : "DR"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">
                          {doctor.doctorName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {doctor.specialization_name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        
                        <img src={PaIcons.email} alt="Email" className="w-4 h-4 " />
                        {doctor.doctorEmail}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                        {doctor.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <img src={PaIcons.experience} alt="Phone" className="w-6 h-6" />
                      {`${doctor.expYear || '0'} Years ${doctor.expMonth || '0'} Months`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {doctor.hospitalName}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <img src={PaIcons.inr} alt="Phone" className="w-6 h-6" />
                      {doctor.doctorFees}/-
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${
                        doctor.status == "1"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {doctor.status == "1" ? "Active" : "Inactive"}
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
                        {doctor.status == "1" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(doctor.docuid, "inactive")}>
                              <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(doctor.docuid, "active")}>
                              <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                            </DropdownMenuItem>
                          )}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingDoctor(doctor);
                            setIsDialogOpen(true);
                          }}
                        >
                          <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" />
                          Edit Doctor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteDoctor(doctor.docuid)}
                        >
                          <img src={PaIcons.delete} alt="Edit" className="w-4 h-4 mr-2" />
                          Remove Doctor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Doctor Add/Edit Popup */}
      <DoctorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitDoctor}
        hospitals={hospitals}
        initialData={editingDoctor}
      />
    </div>
  );
}
