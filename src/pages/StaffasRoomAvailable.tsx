import { useState, useEffect, useRef } from "react";
import { Search, BedDouble, Building2, DoorClosed, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudModal } from "@/components/shared/CrudModal";
import { Label } from "@/components/ui/label";
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Select, { type InputActionMeta } from "react-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
// Remove mock data imports and use dynamic services
// import { wards } from "@/data/wards";
// import { rooms } from "@/data/rooms";
// import { beds } from "@/data/beds";
import { PaIcons } from "@/components/icons/PaIcons";
import {
  fetchStaffWards,
  fetchStaffRooms,
  fetchStaffBeds,
  fetchStaffDoctorOptions,
  fetchStaffEventTypeList,
  fetchStaffActivityTypeList,
  fetchStaffPatientOptions,
  fetchStaffPatientStatusOptions,
  type StaffWard,
  type StaffRoom,
  type StaffBed,
} from "@/services/SfstaffRoomService";


type BedAction = "book" | "change" | "discharge" | "view" | null;

export default function StaffasRoomAvailable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [actionType, setActionType] = useState<BedAction>(null);
  // Booking form states
  const [patientSearch, setPatientSearch] = useState("");
  const [patientOptions, setPatientOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedPatientName, setSelectedPatientName] = useState<string>("");
  // Ward Type removed from booking popup; rely on Ward select only
  const [selectedWardId, setSelectedWardId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedBedId, setSelectedBedId] = useState<string>("");
  const [doctors, setDoctors] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [eventTypes, setEventTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("MEDIUM");
  const [medicalNotes, setMedicalNotes] = useState<string>("");
  // Change-bed specific states
  const [changeWardId, setChangeWardId] = useState<string>("");
  const [changeRoomId, setChangeRoomId] = useState<string>("");
  const [changeBedId, setChangeBedId] = useState<string>("");
  const [allowChangePatient, setAllowChangePatient] = useState<boolean>(false);
  const { toast } = useToast();

  // Dynamic data states
  const [wards, setWards] = useState<StaffWard[]>([]);
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [beds, setBeds] = useState<StaffBed[]>([]);
  const lastPatientSearchRef = useRef<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const wardRes = await fetchStaffWards();
        const wardsData = wardRes?.data ?? [];
        setWards(wardsData);

        const roomLists = await Promise.all(
          wardsData.map(async (w) => {
            const res = await fetchStaffRooms(w.id);
            return res?.data ?? [];
          })
        );
        const allRooms = roomLists.flat();
        setRooms(allRooms);

        const bedLists = await Promise.all(
          allRooms.map(async (r) => {
            const res = await fetchStaffBeds(r.id);
            return res?.data ?? [];
          })
        );
        setBeds(bedLists.flat());
      } catch (err: any) {
        console.error("Failed to load ward/room/bed data:", err);
        toast({ title: "Error", description: err?.message || "Failed to load room availability" });
      }
    };

    loadData();
  }, []);

  // Load lookup lists: doctor options, event types, patient status
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [docRes, evtRes, statusRes] = await Promise.all([
          fetchStaffDoctorOptions(),
          fetchStaffActivityTypeList(),
          fetchStaffPatientStatusOptions(),
        ]);
        setDoctors(docRes?.data || []);
        setEventTypes(evtRes?.data || []);
        setStatusOptions(statusRes?.data || []);
      } catch (err: any) {
        console.warn("Failed to load lookups:", err?.message);
      }
    };
    loadLookups();
  }, []);

  // Debounced patient search
  useEffect(() => {
    const h = setTimeout(async () => {
      try {
        const q = patientSearch.trim();
        if (q.length < 2) {
          setPatientOptions([]);
          lastPatientSearchRef.current = q;
          return;
        }
        if (q === lastPatientSearchRef.current) {
          // Avoid duplicate calls (e.g., React StrictMode re-runs)
          return;
        }
        lastPatientSearchRef.current = q;
        const res = await fetchStaffPatientOptions(q, 1, 8);
        const arr = Array.isArray(res?.data) ? res.data : [];
        setPatientOptions(arr);
      } catch (err: any) {
        console.warn("Patient search failed:", err?.message);
      }
    }, 300);
    return () => clearTimeout(h);
  }, [patientSearch]);

  // Prefill dependent selects when opening booking modal
  useEffect(() => {
    if (actionType === "book" && selectedBed) {
      // Prefill Ward/Room/Bed selections from the clicked bed card
      setSelectedWardId(selectedBed.wardId ?? "");
      setSelectedRoomId(selectedBed.roomId ?? "");
      setSelectedBedId(selectedBed.id ?? "");
    }
    if (actionType === "change" && selectedBed) {
      // Prefill for change: start from current ward/room, and choose a different available bed
      setChangeWardId(selectedBed.wardId ?? "");
      setChangeRoomId(selectedBed.roomId ?? "");
      setChangeBedId("");
      setAllowChangePatient(false);
      // Prefill physician/status/activity/priority from selected bed details
      setSelectedDoctorId(String(selectedBed.docuid ?? ""));
      setCurrentStatus(String(selectedBed.currentStatus ?? ""));
      setSelectedActivityTypeId(String(selectedBed.activityType ?? ""));
      setPriority(String((selectedBed.priority ?? "MEDIUM")).toUpperCase());
    }
    if (!selectedBed || actionType !== "book") {
      // Reset booking form when closing/not booking
      setPatientSearch("");
      setPatientOptions([]);
      setSelectedPatientId("");
      setSelectedPatientName("");
      setSelectedWardId("");
      setSelectedRoomId("");
      setSelectedBedId("");
      setSelectedDoctorId("");
      setSelectedActivityTypeId("");
      setCurrentStatus("");
      setPriority("MEDIUM");
      setMedicalNotes("");
    }
    if (!selectedBed || actionType !== "change") {
      // Reset change form when closing/not changing
      setChangeWardId("");
      setChangeRoomId("");
      setChangeBedId("");
      setAllowChangePatient(false);
    }
  }, [actionType, selectedBed, wards]);

  // Ensure change modal selects match option values (handles label vs id mismatches)
  useEffect(() => {
    if (!(actionType === "change" && selectedBed)) return;

    const normalize = (s: any) => String(s ?? "").trim().toLowerCase().replace(/[_-]/g, " ");

    // Doctor: prefer exact id match; keep raw id if not found
    const rawDocId = String(selectedBed.docuid ?? "");
    if (rawDocId) {
      const docOpt = doctors.find((d) => String(d.value) === rawDocId);
      setSelectedDoctorId(docOpt ? String(docOpt.value) : rawDocId);
    }

    // Status: match by value or label, case-insensitive
    const rawStatus = String(selectedBed.currentStatus ?? "");
    if (rawStatus) {
      const statusOpt = statusOptions.find(
        (s) => normalize(s.value) === normalize(rawStatus) || normalize(s.label) === normalize(rawStatus)
      );
      setCurrentStatus(statusOpt ? String(statusOpt.value) : rawStatus);
    }

    // Activity Type: match id or label name
    const rawActivity = String(selectedBed.activityType ?? "");
    if (rawActivity) {
      const activityOpt = eventTypes.find(
        (et) => String(et.value) === rawActivity || normalize(et.label) === normalize(rawActivity)
      );
      setSelectedActivityTypeId(activityOpt ? String(activityOpt.value) : rawActivity);
    }
  }, [actionType, selectedBed, doctors, eventTypes, statusOptions]);

  const filteredBeds = beds.filter((bed) => {
    const room = rooms.find((r) => r.id === bed.roomId);
    const ward = wards.find((w) => w.id === bed.wardId);
    
    const matchesSearch = 
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ward?.wardName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room?.roomNumber || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bed.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleBedAction = (bed: any, action: BedAction) => {
    setSelectedBed(bed);
    setActionType(action);
    // Reset form fields on open
    setPatientSearch("");
    setPatientOptions([]);
    setSelectedPatientId("");
    setSelectedPatientName("");
    setSelectedDoctorId("");
    setSelectedActivityTypeId("");
    setCurrentStatus("");
    setPriority("MEDIUM");
    setMedicalNotes("");
  };

  const handleAction = () => {
    if (actionType === "book") {
      // Basic validation
      if (!selectedPatientId) {
        toast({ title: "Missing patient", description: "Please select a patient." });
        return;
      }
      if (!selectedWardId || !selectedRoomId || !selectedBedId) {
        toast({ title: "Missing location", description: "Please select ward, room, and bed." });
        return;
      }
      if (!selectedDoctorId) {
        toast({ title: "Missing physician", description: "Please select attending doctor." });
        return;
      }
      // Submit booking via service
      (async () => {
        try {
          const { submitStaffBedBooking } = await import("@/services/SfstaffRoomService");
          const res = await submitStaffBedBooking({
            patientId: selectedPatientId,
            wardId: selectedWardId,
            roomId: selectedRoomId,
            bedId: selectedBedId,
            doctorId: selectedDoctorId,
            activityTypeId: selectedActivityTypeId,
            currentStatus,
            priority,
            medicalNotes,
          });

          if (res?.success) {
            toast({ title: "Success", description: res?.message || "Bed booked successfully for patient" });

            setTimeout(() => {
              window.location.reload();
            }, 1000);

          } else {
            throw new Error(res?.message || "Failed to book bed");
          }
        } catch (err: any) {
          toast({ title: "Booking failed", description: err?.message || "Could not submit booking" });
          return; // keep modal open on error
        }
        // Close modal only after success
        setActionType(null);
        setSelectedBed(null);
      })();
      return; // avoid closing immediately; handled inside async
    } else if (actionType === "change") {
      // Validate change form
      const effectivePatientId = allowChangePatient && selectedPatientId
        ? selectedPatientId
        : String(selectedBed?.assignedPatientId || "");

      if (!effectivePatientId) {
        toast({ title: "Missing patient", description: "No current patient assigned; select a patient." });
        return;
      }
      if (!changeWardId || !changeRoomId || !changeBedId) {
        toast({ title: "Missing location", description: "Please select new ward, room, and bed." });
        return;
      }
      if (!selectedDoctorId) {
        toast({ title: "Missing physician", description: "Please select attending doctor." });
        return;
      }

      (async () => {
        try {
          const { submitStaffBedChange } = await import("@/services/SfstaffRoomService");
          const res = await submitStaffBedChange({
            patientId: effectivePatientId,
            fromWardId: String(selectedBed?.wardId || ""),
            fromRoomId: String(selectedBed?.roomId || ""),
            fromBedId: String(selectedBed?.id || ""),
            toWardId: changeWardId,
            toRoomId: changeRoomId,
            toBedId: changeBedId,
            doctorId: selectedDoctorId,
            activityTypeId: selectedActivityTypeId,
            currentStatus,
            priority,
            medicalNotes,
          });

          if (res?.success) {
            toast({ title: "Success", description: res?.message || "Patient moved to new bed" });

            setTimeout(() => {
              window.location.reload();
            }, 1000);
            
          } else {
            throw new Error(res?.message || "Failed to change bed");
          }
        } catch (err: any) {
          toast({ title: "Change failed", description: err?.message || "Could not submit bed change" });
          return; // keep modal open on error
        }
        // Close modal only after success
        setActionType(null);
        setSelectedBed(null);
      })();
      return; // handled asynchronously
    } else if (actionType === "discharge") {
      toast({ title: "Success", description: "Patient discharged, bed now available" });
    }
    setActionType(null);
    setSelectedBed(null);
  };

  const getBedCardClass = (status: string) => {
    switch (status) {
      case "Available":
        return "border-green-500 bg-green-500/10";
      case "Occupied":
        return "border-blue-500 bg-blue-500/10";
      case "Reserved":
        return "border-yellow-500 bg-yellow-500/10";
      case "Cleaning":
        return "border-gray-500 bg-gray-500/10";
      default:
        return "border-border bg-muted";
    }
  };

  const getWardStats = (wardId: string) => {
    const wardBeds = beds.filter((b) => b.wardId === wardId);
    const available = wardBeds.filter((b) => b.status === "Available").length;
    const occupied = wardBeds.filter((b) => b.status === "Occupied").length;
    const total = wardBeds.length;
    
    return { available, occupied, total, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  };

  return (

    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1 doc-calendar">

        <h1 className="text-2xl font-bold text-foreground pb-4">Manage Bed Availability</h1>
       
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-500">
                  {beds.filter((b) => b.status === "Available").length}
                </div>
                <p className="text-sm text-muted-foreground">Available Beds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-500">
                  {beds.filter((b) => b.status === "Occupied").length}
                </div>
                <p className="text-sm text-muted-foreground">Occupied Beds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-500">
                  {beds.filter((b) => b.status === "Reserved").length}
                </div>
                <p className="text-sm text-muted-foreground">Reserved Beds</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {beds.length > 0 ? Math.round((beds.filter((b) => b.status === "Occupied").length / beds.length) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Occupancy</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search beds, rooms, or wards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <RadixSelect value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Occupied">Occupied</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
              </SelectContent>
            </RadixSelect>
          </div>

          {/* Ward Tabs */}
          <Tabs defaultValue={wards[0]?.id} className="w-full mt-4 mb-4">
            <TabsList className="w-full justify-start">
              {wards.map((ward) => {
                const stats = getWardStats(ward.id);
                return (
                  <TabsTrigger key={ward.id} value={ward.id} className="flex-col items-start gap-1">
                    <span>{ward.wardName}</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.available}/{stats.total} available
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {wards.map((ward) => {
              const wardRooms = rooms.filter((r) => r.wardId === ward.id);
              const stats = getWardStats(ward.id);
              
              return (
                <TabsContent key={ward.id} value={ward.id} className="space-y-4">
                  {/* Ward Info */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Building2 className="w-8 h-8 text-primary" />
                          <div>
                            <h3 className="text-xl font-bold">{ward.wardName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Floor {ward.floorNo} • {ward.wardType} • Capacity: {ward.capacity ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{stats.available}</div>
                            <div className="text-xs text-muted-foreground">Available</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">{stats.occupied}</div>
                            <div className="text-xs text-muted-foreground">Occupied</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                            <div className="text-xs text-muted-foreground">Occupancy</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rooms Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                    {wardRooms.map((room) => {
                      const roomBeds = filteredBeds.filter((b) => b.roomId === room.id);
                      
                      if (roomBeds.length === 0 && statusFilter !== "all") return null;
                      
                      return (
                        <Card key={room.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <DoorClosed className="w-5 h-5" />
                                <span>{room.roomNumber}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary">{room.roomType}</Badge>
                                <Badge variant={room.status === "Available" ? "default" : "outline"}>
                                  {room.status}
                                </Badge>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-8 gap-3">
                              {roomBeds.map((bed) => (
                                <Card
                                  key={bed.id}
                                  className={`cursor-pointer transition-all hover:shadow-lg border border-dashed ${getBedCardClass(
                                    bed.status
                                  )}`}
                                  onClick={() => handleBedAction(bed, "view")}
                                >
                                  <CardContent className="p-4 flex flex-col items-center gap-2">
                                    <div className="text-center">
                                      <div className="font-bold text-sm">{bed.bedNumber}</div>
                                      <Badge variant="outline" className="mt-1 text-xs">
                                        {bed.status}
                                      </Badge>
                                      {bed.status === "Occupied" && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          {((bed.patientFirstName || bed.patientLastName)
                                            ? `${bed.patientFirstName ?? ""} ${bed.patientLastName ?? ""}`.trim()
                                            : (bed.assignedPatientId ? `ID: ${bed.assignedPatientId}` : ""))}
                                        </div>
                                      )}
                                    </div>

                                    {/* 🛏️ Available → Show Book Button */}
                                    {bed.status === "Available" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="mt-2 w-full flex items-center justify-center gap-2 hover:bg-green-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBedAction(bed, "book");
                                        }}
                                      >
                                        <img
                                          src={PaIcons.bookIcon}
                                          alt="book-icon"
                                          className="w-6 h-6 object-contain"
                                        />
                                      </Button>
                                    )}

                                    {/* 🧍‍♂️ Occupied → Show Move + Discharge Buttons */}
                                    {bed.status === "Occupied" && (
                                      <div className="flex gap-2 mt-2 w-full">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 flex items-center justify-center hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBedAction(bed, "change");
                                          }}
                                        >
                                          <img
                                            src={PaIcons.moveIcon}
                                            alt="move-icon"
                                            className="w-6 h-6 object-contain"
                                          />
                                        </Button>

                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 flex items-center justify-center hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBedAction(bed, "discharge");
                                          }}
                                        >
                                          <img
                                            src={PaIcons.dischargeIcon}
                                            alt="discharge-icon"
                                            className="w-6 h-6 object-contain"
                                          />
                                        </Button>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}

                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>

          {/* Action Modal */}
          <CrudModal
            open={actionType !== null}
            onOpenChange={(open) => !open && setActionType(null)}
            title={
              actionType === "book"
                ? "Book Bed for Patient"
                : actionType === "change"
                ? "Change Patient Bed"
                : actionType === "discharge"
                ? "Discharge Patient"
                : "Bed Details"
            }
            mode={actionType === "view" ? "view" : "add"}
            onSave={handleAction}
          >
            {selectedBed && (
              <div className="space-y-4">
               

                {actionType === "view" && (
                  <div className="space-y-6">
                    {/* Current assignment overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/*<div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Current Patient</Label>
                        <p className="font-medium">{String(selectedBed.assignedPatientId || "-")}</p>
                      </div>*/}
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Current Ward</Label>
                        <p className="font-medium">{wards.find((w) => w.id === selectedBed.wardId)?.wardName}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Current Room/Bed</Label>
                        <p className="font-medium">Room {rooms.find((r) => r.id === selectedBed.roomId)?.roomNumber} • Bed {selectedBed.bedNumber}</p>
                      </div>
                    </div>

                    {/* Patient Basic Info */}
                    <div className="space-y-2">
                      <Label className="text-sm">Patient Information</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/*<div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Patient ID</Label>
                          <p className="font-medium">{String(selectedBed.assignedPatientId || "-")}</p>
                        </div>*/}
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Patient Name</Label>
                          <p className="font-medium">{(() => {
                            const name = `${selectedBed.patientFirstName ?? ""} ${selectedBed.patientLastName ?? ""}`.trim();
                            return name || "-";
                          })()}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Email</Label>
                          <p className="font-medium">{selectedBed.patientEmail ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Phone</Label>
                          <p className="font-medium">{selectedBed.patientPhone ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                          <p className="font-medium">{selectedBed.patientDob ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Gender</Label>
                          <p className="font-medium">{selectedBed.patientGender ?? "-"}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <Label className="text-xs text-muted-foreground">Blood Group</Label>
                          <p className="font-medium">{selectedBed.patientBloodGroup ?? "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {actionType === "book" && (
                  <div className="space-y-6">
                    {/* Patient search-select */}
                    <div className="space-y-2">
                      <Label>Patient Name *</Label>
                      <Select
                        isSearchable
                        placeholder="Search and select patient..."
                        onInputChange={(val: string, actionMeta: InputActionMeta) => {
                          // Only update on actual input changes, not blur/menu-close resets
                          if (actionMeta.action === "input-change") {
                            setPatientSearch(val);
                          }
                        }}
                        options={patientOptions}
                        value={
                          selectedPatientId
                            ? (patientOptions.find((o) => o.value === selectedPatientId) || {
                                value: selectedPatientId,
                                label: selectedPatientName,
                              })
                            : null
                        }
                        onChange={(opt: any) => {
                          const val = String(opt?.value ?? "");
                          const label = String(opt?.label ?? "");
                          setSelectedPatientId(val);
                          setSelectedPatientName(label);
                          // Clear search text so the selected value displays cleanly
                          setPatientSearch("");
                        }}
                      />
                    </div>

                    {/* Ward, Room, Bed dependent selects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ward</Label>
                        <RadixSelect
                          value={selectedWardId}
                          onValueChange={(v) => {
                            setSelectedWardId(v);
                            setSelectedRoomId("");
                            setSelectedBedId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.wardName}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Room</Label>
                        <RadixSelect
                          value={selectedRoomId}
                          onValueChange={(v) => {
                            setSelectedRoomId(v);
                            setSelectedBedId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms
                              .filter((r) => !selectedWardId || r.wardId === selectedWardId)
                              .map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.roomNumber}</SelectItem>
                              ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Bed</Label>
                        <RadixSelect value={selectedBedId} onValueChange={setSelectedBedId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed" />
                          </SelectTrigger>
                          <SelectContent>
                            {beds
                              .filter((b) => (!selectedRoomId || b.roomId === selectedRoomId) && b.status === "Available")
                              .map((b) => (
                                <SelectItem key={b.id} value={b.id}>Bed {b.bedNumber}</SelectItem>
                              ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                    </div>

                    {/* Physician, Status, Activity, Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Attending Doctor</Label>
                        <RadixSelect value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Current Status</Label>
                        <RadixSelect value={currentStatus} onValueChange={setCurrentStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Activity Type</Label>
                        <RadixSelect value={selectedActivityTypeId} onValueChange={setSelectedActivityTypeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((et) => (
                              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <RadixSelect value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "URGENT",
                              "HIGH",
                              "MEDIUM",
                              "LOW",
                            ].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                    </div>

                    {/* Medical Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="medicalNotes">Medical Notes</Label>
                      <Textarea
                        id="medicalNotes"
                        placeholder="Add medical notes..."
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {actionType === "change" && (
                  <div className="space-y-6">
                    {/* Current assignment overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Current Patient</Label>
                        
                        <p className="font-medium">{(() => {
                            const name = `${selectedBed.patientFirstName ?? ""} ${selectedBed.patientLastName ?? ""}`.trim();
                            return name || "-";
                          })()}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Current Ward/Room/Bed</Label>
                        <p className="font-medium">{wards.find((w) => w.id === selectedBed.wardId)?.wardName}</p>
                        <p className="font-medium">Room {rooms.find((r) => r.id === selectedBed.roomId)?.roomNumber} • Bed {selectedBed.bedNumber}</p>
                      </div>
                    </div>

                   

                   

                    {/* New Ward, Room, Bed dependent selects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>New Ward</Label>
                        <RadixSelect
                          value={changeWardId}
                          onValueChange={(v) => {
                            setChangeWardId(v);
                            setChangeRoomId("");
                            setChangeBedId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select ward" />
                          </SelectTrigger>
                          <SelectContent>
                            {wards.map((w) => (
                              <SelectItem key={w.id} value={w.id}>{w.wardName}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>New Room</Label>
                        <RadixSelect
                          value={changeRoomId}
                          onValueChange={(v) => {
                            setChangeRoomId(v);
                            setChangeBedId("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                          <SelectContent>
                            {rooms
                              .filter((r) => !changeWardId || r.wardId === changeWardId)
                              .map((r) => (
                                <SelectItem key={r.id} value={r.id}>{r.roomNumber}</SelectItem>
                              ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>New Bed</Label>
                        <RadixSelect value={changeBedId} onValueChange={setChangeBedId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bed" />
                          </SelectTrigger>
                          <SelectContent>
                            {beds
                              .filter((b) => (!changeRoomId || b.roomId === changeRoomId) && b.status === "Available" && b.id !== selectedBed.id)
                              .map((b) => (
                                <SelectItem key={b.id} value={b.id}>Bed {b.bedNumber}</SelectItem>
                              ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                    </div>

                    {/* Physician, Status, Activity, Priority */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Attending Doctor</Label>
                        <RadixSelect value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctors.map((d) => (
                              <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Current Status</Label>
                        <RadixSelect value={currentStatus} onValueChange={setCurrentStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Activity Type</Label>
                        <RadixSelect value={selectedActivityTypeId} onValueChange={setSelectedActivityTypeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((et) => (
                              <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <RadixSelect value={priority} onValueChange={setPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </RadixSelect>
                      </div>
                    </div>

                    {/* Medical Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="changeMedicalNotes">Medical Notes</Label>
                      <Textarea
                        id="changeMedicalNotes"
                        placeholder="Add medical notes..."
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {actionType === "discharge" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm">
                        This will discharge the patient and make the bed available for new admissions.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dischargeNotes">Discharge Notes</Label>
                      <Input
                        id="dischargeNotes"
                        placeholder="Add discharge summary..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CrudModal>
       
      </main>
    </div>
  );
}
