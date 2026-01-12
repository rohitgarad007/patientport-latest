import { useState, useEffect } from "react"; 
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Search, Plus, Mail, Phone, MapPin, Users, Stethoscope, UserCog, MoreHorizontal, Edit, Trash2, Building } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";

import {
  fetchHospitals, addHospital, updateHospital, deleteHospital, changeHospitalStatus
} from "@/services/masterHospitalService";
import AddHospitalForm from "@/components/hospitals/AddHospitalForm";
import Swal from "sweetalert2";
import { PaIcons } from "@/components/icons/PaIcons";

export default function SuperHospitalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<any | null>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load hospitals
  const loadHospitals = async () => {
    try {
      setLoading(true);

      const response = await fetchHospitals(page, limit, searchTerm);

      // ✅ map hospitals from nested structure
      const mappedHospitals = (response?.data || []).map((hospital: any) => ({
        ...hospital,
        status: hospital.status === "1" ? "active" : "inactive",
        totalPatients: Number(hospital.totalPatients) || 0,
        totalDoctors: Number(hospital.totalDoctors) || 0,
        totalStaff: Number(hospital.totalStaff) || 0,
      }));

      setHospitals(mappedHospitals);

      // ✅ set correct total from response.data.total
      setTotalCount(response?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadHospitals();
  }, [page, searchTerm]);

  /*const totalStats = hospitals.reduce(
    (acc, hospital) => ({
      patients: acc.patients + (hospital.totalPatients || 0),
      doctors: acc.doctors + (hospital.totalDoctors || 0),
      staff: acc.staff + (hospital.totalStaff || 0),
    }),
    { patients: 0, doctors: 0, staff: 0 }
  );*/

  const totalStats = hospitals.reduce(
    (acc, hospital) => ({
      patients: acc.patients + hospital.totalPatients,
      doctors: acc.doctors + hospital.totalDoctors,
      staff: acc.staff + hospital.totalStaff,
    }),
    { patients: 0, doctors: 0, staff: 0 }
  );

  /*const handleSubmitHospital = async (data: any) => {
    try {
      if (editingHospital) {
        await updateHospital(editingHospital.hosuid, data);
      } else {
        await addHospital(data);
      }
      setIsDialogOpen(false);
      setEditingHospital(null);
      loadHospitals();
    } catch (err) {
      console.error(err);
    }
  };*/

  

  const handleSubmitHospital = async (data: any) => {
    try {
      let res;
      if (editingHospital) {
        res = await updateHospital(editingHospital.hosuid, data);
      } else {
        res = await addHospital(data);
      }

      if (res?.success === false) {
        // ❌ Show error from backend
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.message || "Something went wrong",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }


      setIsDialogOpen(false);
      setEditingHospital(null);
      loadHospitals();
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Unexpected error occurred",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };



  const handleDelete = async (id: string) => {
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
        await deleteHospital(id);
        setHospitals((prev) => prev.filter((h) => h.hosuid !== id));

        Swal.fire("Deleted!", "Hospital has been deleted.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Something went wrong while deleting.", "error");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: "active" | "inactive") => {
    try {
      await changeHospitalStatus(id, newStatus);
      setHospitals((prevHospitals) =>
        prevHospitals.map((hospital) =>
          hospital.hosuid === id ? { ...hospital, status: newStatus } : hospital
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const openAddHospitalDialog = () => {
    setEditingHospital(null); // reset editing
    setIsDialogOpen(true);
  };

  const openEditHospitalDialog = (hospital: any) => {
    setEditingHospital(hospital);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Hospitals</h1>
          {/*<p className="text-muted-foreground">Manage all hospitals in the healthcare network</p>*/}
        </div>

        {/* Add/Edit Hospital Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setEditingHospital(null) }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={openAddHospitalDialog}>
              <Plus className="w-4 h-4" />
              Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl mx-auto">
            <DialogHeader>
              <DialogTitle className="text-center">{editingHospital ? "Edit Hospital" : "Add New Hospital"}</DialogTitle>
            </DialogHeader>

            <AddHospitalForm
              onSubmit={handleSubmitHospital}
              onCancel={() => setIsDialogOpen(false)}
              {...(editingHospital && { initialData: editingHospital })}
            />
          </DialogContent>
        </Dialog>
      </div>

     

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hospitals"
          value={totalCount.toString()}
          description="Active hospitals"
          icon={PaIcons.hospital}
          change={{ value: 0, type: 'increase' }}
          variant="teal"   // ✅ green style
        />
        <StatCard
          title="Total Patients"
          value={totalStats.patients.toLocaleString()}
          description="Across all hospitals"
          icon={PaIcons.patients}
          change={{ value: 0, type: 'increase' }}
          variant="warning"   // ✅ yellow style
        />
        <StatCard
          title="Total Doctors"
          value={totalStats.doctors.toString()}
          description="Medical professionals"
          icon={PaIcons.doctors}    // <-- component (LucideIcon)
          change={{ value: 0, type: "increase" }}
          variant="success"
        />
        <StatCard
          title="Total Staff"
          value={totalStats.staff.toString()}
          description="Support staff"
          icon={PaIcons.staff}
          change={{ value: 0, type: 'increase' }}
          variant="blue"   
        />
      </div>


      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            {/*<div>
              <CardTitle>Hospital Directory</CardTitle>
              <CardDescription>View and manage all hospitals in the network</CardDescription>
            </div>*/}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search hospitals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-80" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Allows</TableHead>
                  <TableHead>Statistics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitals.map((hospital) => (
                  <TableRow key={hospital.hosuid}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{hospital.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {hospital.hosuid}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <img src={PaIcons.email} alt="Email" className="w-4 h-4 " />
                          {hospital.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                          {hospital.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 text-sm">
                        <img src={PaIcons.location} alt="Location" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span className="max-w-xs truncate">{hospital.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{hospital.doctorsCount} Doctors Allows</div>
                        <div>{hospital.staffCount} Staff Allows</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{hospital.totalPatients} Patients</div>
                        <div>{hospital.totalDoctors} Doctors</div>
                        <div>{hospital.totalStaff} Staff</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          hospital.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
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
                          {hospital.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(hospital.hosuid, "inactive")}>
                              <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(hospital.hosuid, "active")}>
                              <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEditHospitalDialog(hospital)}>
                            <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" /> Edit Hospital
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(hospital.hosuid)}>
                            <img src={PaIcons.delete} alt="Delete" className="w-4 h-4 mr-2" /> Delete Hospital
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
