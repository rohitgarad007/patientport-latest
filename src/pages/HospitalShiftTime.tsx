import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  fetchShiftTimes,
  addShiftTime,
  updateShiftTime,
  deleteShiftTime,
} from "@/services/HSHospitalService";
import Swal from "sweetalert2";


interface ShiftTime {
  shiftuid: string;
  name: string;
  start_time: string;
  end_time: string;
  status: "active" | "inactive";
}

export default function HospitalShiftTime() {
  const [shifts, setShifts] = useState<ShiftTime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTime | null>(null);
  const [loading, setLoading] = useState(false);

  const [workingHours, setWorkingHours] = useState<string>("");

  const timeToMinutes = (time: string, period: "AM" | "PM") => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    let hour = h % 12;
    if (period === "PM") hour += 12;
    return hour * 60 + m;
  };

  



  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    startPeriod: "AM" as "AM" | "PM",
    endTime: "",
    endPeriod: "PM" as "AM" | "PM",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = timeToMinutes(formData.startTime, formData.startPeriod);
      const end = timeToMinutes(formData.endTime, formData.endPeriod);

      let diff = end - start;
      if (diff < 0) diff += 24 * 60; // handle overnight shifts

      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;

      const formatted =
        hours > 0 && minutes > 0
          ? `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min`
          : hours > 0
          ? `${hours} hour${hours > 1 ? "s" : ""}`
          : `${minutes} min`;

      setWorkingHours(formatted);
    } else {
      setWorkingHours("");
    }
  }, [formData.startTime, formData.endTime, formData.startPeriod, formData.endPeriod]);

  /** ✅ Format backend 24-hour time → 12-hour format with AM/PM */
  const formatTo12Hour = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h.toString().padStart(2, "0")}:${minutes} ${period}`;
  };

  const convertTo12Hour = (time24: string) => {
    if (!time24) return { formattedTime: "", period: "AM" as "AM" | "PM" };
    const [hourStr, minute] = time24.split(":");
    let hour = parseInt(hourStr, 10);
    const period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const formattedTime = `${hour.toString().padStart(2, "0")}:${minute}`;
    return { formattedTime, period };
  };

  /** ✅ Format frontend input 12-hour → backend 24-hour HH:mm:ss */
  const convertTo24Hour = (time: string, period: "AM" | "PM") => {
    if (!time) return "";
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
  };

  /** ✅ Fetch shifts from API */
  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await fetchShiftTimes(searchQuery);
      if (res.success && Array.isArray(res.data)) {
        setShifts(res.data);
      } else {
        setShifts([]);
      }
    } catch (err) {
      toast({ title: "Failed to load shifts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
  }, []);

  const filteredShifts = shifts.filter((shift) => {
    const matchesSearch = shift.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || shift.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setEditingShift(null);
    setFormData({
      name: "",
      startTime: "",
      startPeriod: "AM",
      endTime: "",
      endPeriod: "PM",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (shift: ShiftTime) => {
    setEditingShift(shift);
    const [startTime, startPeriod] = formatTo12Hour(shift.start_time).split(" ");
    const [endTime, endPeriod] = formatTo12Hour(shift.end_time).split(" ");
    setFormData({
      name: shift.name,
      startTime: startTime || "",
      startPeriod: (startPeriod as "AM" | "PM") || "AM",
      endTime: endTime || "",
      endPeriod: (endPeriod as "AM" | "PM") || "PM",
      status: shift.status,
    });
    setIsDialogOpen(true);
  };

  

  const handleDelete = async (shiftuid: string) => {
    // 1️⃣ Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action will delete the shift permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await deleteShiftTime(shiftuid);
        if (res.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Shift deleted successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
          loadShifts();
        } else {
          Swal.fire({
            title: "Failed!",
            text: "Failed to delete shift.",
            icon: "error",
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting.",
          icon: "error",
        });
      }
    }
  };


  const handleSave = async () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const payload = {
      name: formData.name,
      start_time: convertTo24Hour(formData.startTime, formData.startPeriod),
      end_time: convertTo24Hour(formData.endTime, formData.endPeriod),
      status: formData.status,
    };

    try {
      let res;
      if (editingShift) {
        res = await updateShiftTime(editingShift.shiftuid, payload);
      } else {
        res = await addShiftTime(payload);
      }

      if (res.success) {
        toast({
          title: editingShift
            ? "Shift updated successfully"
            : "Shift added successfully",
        });
        setIsDialogOpen(false);
        loadShifts();
      } else {
        toast({ title: "Save failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving shift", variant: "destructive" });
    }
  };

  /** ✅ Helper function to calculate working hours */
  const getWorkingHours = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "";

    // Convert 24-hour time to minutes
    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    let start = timeToMinutes(startTime.slice(0, 5));
    let end = timeToMinutes(endTime.slice(0, 5));

    // Handle overnight shifts
    let diff = end - start;
    if (diff < 0) diff += 24 * 60;

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return hours > 0 && minutes > 0
      ? `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min`
      : hours > 0
      ? `${hours} hour${hours > 1 ? "s" : ""}`
      : `${minutes} min`;
  };


  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground pb-4">
            Manage Shift Time
          </h1>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>

        <div className="flex gap-4 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift Name</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Working Hours</TableHead> 
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.shiftuid}>
                    <TableCell className="font-medium">{shift.name}</TableCell>
                    <TableCell>{formatTo12Hour(shift.start_time)}</TableCell>
                    <TableCell>{formatTo12Hour(shift.end_time)}</TableCell>
                    <TableCell>{getWorkingHours(shift.start_time, shift.end_time)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          shift.status === "active" ? "default" : "secondary"
                        }
                      >
                        {shift.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(shift)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {/*<Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(shift.shiftuid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>*/}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No shifts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-full max-w-2xl mx-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShift ? "Edit Shift" : "Add New Shift"}
              </DialogTitle>
              <DialogDescription>
                {editingShift
                  ? "Update the shift details below"
                  : "Fill in the details to create a new shift"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Shift Name */}
              <div>
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  shiftuid="name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Morning Shift"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="flex gap-2">
                    {/* Hour */}
                    <Select
                      value={formData.startTime?.split(":")[0] || "12"}
                      onValueChange={(hour) =>
                        setFormData({
                          ...formData,
                          startTime: `${hour}:${
                            formData.startTime?.split(":")[1] || "00"
                          }`,
                        })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Minute */}
                    <Select
                      value={formData.startTime?.split(":")[1] || "00"}
                      onValueChange={(minute) =>
                        setFormData({
                          ...formData,
                          startTime: `${
                            formData.startTime?.split(":")[0] || "12"
                          }:${minute}`,
                        })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const minute = (i * 5).toString().padStart(2, "0");
                          return (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* AM/PM */}
                    <Select
                      value={formData.startPeriod || "AM"}
                      onValueChange={(value: "AM" | "PM") =>
                        setFormData({ ...formData, startPeriod: value })
                      }
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


               
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="flex gap-2">
                    {/* Hour */}
                    <Select
                      value={formData.endTime?.split(":")[0] || "12"}
                      onValueChange={(hour) =>
                        setFormData({
                          ...formData,
                          endTime: `${hour}:${
                            formData.endTime?.split(":")[1] || "00"
                          }`,
                        })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={hour} value={hour}>
                              {hour}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* Minute */}
                    <Select
                      value={formData.endTime?.split(":")[1] || "00"}
                      onValueChange={(minute) =>
                        setFormData({
                          ...formData,
                          endTime: `${
                            formData.endTime?.split(":")[0] || "12"
                          }:${minute}`,
                        })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const minute = (i * 5).toString().padStart(2, "0");
                          return (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>

                    {/* AM/PM */}
                    <Select
                      value={formData.endPeriod || "PM"}
                      onValueChange={(value: "AM" | "PM") =>
                        setFormData({ ...formData, endPeriod: value })
                      }
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div>
                {workingHours && (
                  <p className="text-sm text-gray-600 mt-2">
                    Working Hours: <strong>{workingHours}</strong>
                  </p>
                )}
                </div>

              {/* ✅ Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "active"}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingShift ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}
