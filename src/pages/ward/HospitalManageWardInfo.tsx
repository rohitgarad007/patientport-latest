import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Building2, DoorOpen, Bed as BedIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/SearchBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ActionButtons } from "@/components/shared/ActionButtons";
import { CrudModal } from "@/components/shared/CrudModal";
import { DeleteDialog } from "@/components/shared/DeleteDialog";
import { RoomStatusBadge } from "@/components/shared/RoomStatusBadge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Ward as HSWard,
  Room as HSRoom,
  BedType as HSBed,
  WardType, HospitalAmenity,
  fetchWards, addWard, updateWard, deleteWard,
  fetchRooms, addRoom, updateRoom, deleteRoom,
  fetchBeds, addBed, updateBed, deleteBed,
  fetchWardTypes, fetchRoomTypes,  fetchHospitalAmenities
} from "@/services/HSHospitalService";

import { PaIcons } from "@/components/icons/PaIcons";

import { useToast } from "@/hooks/use-toast";

const HospitalManageWardInfo = () => {
  
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedWards, setExpandedWards] = useState<Set<string>>(new Set());
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());

  // Dynamic data state
  const [wardsList, setWardsList] = useState<HSWard[]>([]);
  const [roomsList, setRoomsList] = useState<HSRoom[]>([]);
  const [bedsList, setBedsList] = useState<HSBed[]>([]);
  const [wardTypes, setWardTypes] = useState<WardType[]>([]);
  const [roomAmenities, setRoomAmenities] = useState<HospitalAmenity[]>([]);
  const [roomTypesList, setRoomTypesList] = useState<{ id: string; title: string; status: "active" | "inactive" }[]>([]);

  const floorOptions = [
    "UG2",            
    "UG1",
    "Ground Floor",
    "1st Floor",
    "2nd Floor",
    "3rd Floor",
    "4th Floor",
    "5th Floor",
    "6th Floor",
    "7th Floor",
    "8th Floor",
    "9th Floor",
    "10th Floor",
    "11th Floor",
    "12th Floor",
    "13th Floor",
    "14th Floor",
    "15th Floor"
  ];





  // Ward state
  const [wardModalOpen, setWardModalOpen] = useState(false);
  const [wardModalMode, setWardModalMode] = useState<"view" | "add" | "edit">("view");
  const [selectedWard, setSelectedWard] = useState<HSWard | null>(null);
  const [deleteWardDialogOpen, setDeleteWardDialogOpen] = useState(false);
  const [wardForm, setWardForm] = useState<{ ward_name: string; ward_type: string; floor_no: string; status: "active" | "inactive" } | null>(null);

  // Room state
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState<"view" | "add" | "edit">("view");
  const [selectedRoom, setSelectedRoom] = useState<HSRoom | null>(null);
  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = useState(false);
  const [roomWardId, setRoomWardId] = useState<string>("");
  const [roomForm, setRoomForm] = useState<{ room_name: string; room_type: string; bed_count: string; amenities: string[]; status: string } | null>(null);

  // Bed state
  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [bedModalMode, setBedModalMode] = useState<"view" | "add" | "edit">("view");
  const [selectedBed, setSelectedBed] = useState<HSBed | null>(null);
  const [deleteBedDialogOpen, setDeleteBedDialogOpen] = useState(false);
  const [bedRoomId, setBedRoomId] = useState<string>("");
  const [bedForm, setBedForm] = useState<{ status: string; bed_number: string } | null>(null);

  

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wardsRes, wardTypesRes, roomTypesRes, roomAmenitiesRes] = await Promise.all([
          fetchWards(),
          fetchWardTypes(),
          fetchRoomTypes(),
          fetchHospitalAmenities(),
        ]);

        const wards = wardsRes?.data || [];
        setWardsList(wards);

        // Fetch rooms for each ward (parent-aware)
        const roomPromises = wards.map((w) => fetchRooms(w.id));
        const roomResults = roomPromises.length ? await Promise.all(roomPromises) : [];
        const rooms = roomResults.flatMap((r) => r?.data || []);
        setRoomsList(rooms);

        // Fetch beds for each room (parent-aware)
        const bedPromises = rooms.map((rm) => fetchBeds(rm.id));
        const bedResults = bedPromises.length ? await Promise.all(bedPromises) : [];
        const beds = bedResults.flatMap((b) => b?.data || []);
        setBedsList(beds);

        const activeWardTypes = (wardTypesRes?.data || []).filter(
          (wt: WardType) => wt.status === "active"
        );
        

        setWardTypes(activeWardTypes);

        const activeRoomTypes = (roomTypesRes?.data || []).filter(
          (rt: any) => rt.status === "active"
        );

        
        setRoomTypesList(activeRoomTypes);

        const activeRoomAmenities = (roomAmenitiesRes?.data || []).filter(
          (ra: any) => ra.status === "active"
        );

        setRoomAmenities(activeRoomAmenities);
        console.log(activeRoomAmenities);

      } catch (err: any) {
        toast({
          title: "Failed to load ward/room/bed data",
          description: err?.message,
          variant: "destructive",
        });
      }
    };

    loadData();
  }, []);


  // Toggle ward expansion
  const toggleWard = (wardId: string) => {
    const newExpanded = new Set(expandedWards);
    if (newExpanded.has(wardId)) {
      newExpanded.delete(wardId);
    } else {
      newExpanded.add(wardId);
    }
    setExpandedWards(newExpanded);
  };

  // Toggle room expansion
  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  // Ward handlers
  const handleViewWard = (ward: HSWard) => {
    setSelectedWard(ward);
    setWardForm({ ward_name: ward.ward_name, ward_type: ward.ward_type, floor_no: ward.floor_no, status: ward.status });
    setWardModalMode("view");
    setWardModalOpen(true);
  };

  const handleEditWard = (ward: HSWard) => {
    setSelectedWard(ward);
    setWardForm({ ward_name: ward.ward_name, ward_type: ward.ward_type, floor_no: ward.floor_no, status: ward.status });
    setWardModalMode("edit");
    setWardModalOpen(true);
  };

  const handleDeleteWard = (ward: HSWard) => {
    setSelectedWard(ward);
    setDeleteWardDialogOpen(true);
  };

  const handleAddWard = () => {
    setSelectedWard(null);
    setWardForm({ ward_name: "", ward_type: wardTypes[0]?.title || "General", floor_no: "1", status: "active" });
    setWardModalMode("add");
    setWardModalOpen(true);
  };

  const confirmDeleteWard = async () => {
    try {
      if (selectedWard) {
        await deleteWard(selectedWard.id);
        setWardsList((prev) => prev.filter((w) => w.id !== selectedWard.id));
        toast({ title: "Ward deleted successfully" });
      }
    } catch (err: any) {
      toast({ title: "Failed to delete ward", description: err?.message, variant: "destructive" });
    } finally {
      setDeleteWardDialogOpen(false);
    }
  };

  // Room handlers
  const handleViewRoom = (room: HSRoom) => {
    setSelectedRoom(room);
    setRoomForm({ room_name: room.room_name, room_type: room.room_type, bed_count: room.bed_count, amenities: room.amenities || [], status: room.status });
    setRoomModalMode("view");
    setRoomModalOpen(true);
  };

  const handleEditRoom = (room: HSRoom) => {
    setSelectedRoom(room);
    setRoomForm({ room_name: room.room_name, room_type: room.room_type, bed_count: room.bed_count, amenities: room.amenities || [], status: room.status });
    setRoomModalMode("edit");
    setRoomModalOpen(true);
  };

  const handleDeleteRoom = (room: HSRoom) => {
    setSelectedRoom(room);
    setDeleteRoomDialogOpen(true);
  };

  const handleAddRoom = (wardId: string) => {
    setRoomWardId(wardId);
    setSelectedRoom(null);
    setRoomForm({ room_name: "", room_type: roomTypesList[0]?.title || "General", bed_count: "1", amenities: [], status: "Available" });
    setRoomModalMode("add");
    setRoomModalOpen(true);
  };

  const confirmDeleteRoom = async () => {
    try {
      if (selectedRoom) {
        await deleteRoom(selectedRoom.id);
        setRoomsList((prev) => prev.filter((r) => r.id !== selectedRoom.id));
        toast({ title: "Room deleted successfully" });
      }
    } catch (err: any) {
      toast({ title: "Failed to delete room", description: err?.message, variant: "destructive" });
    } finally {
      setDeleteRoomDialogOpen(false);
    }
  };

  // Bed handlers
  const handleViewBed = (bed: HSBed) => {
    setSelectedBed(bed);
    setBedRoomId(bed.room_id);
    setBedForm({ status: String(
      bed.status === "Available" ? "1" :
      bed.status === "Occupied" ? "2" :
      bed.status === "Cleaning" ? "3" :
      bed.status === "Maintenance" ? "4" :
      bed.status
    ), bed_number : bed.bed_number  });
    setBedModalMode("view");
    setBedModalOpen(true);
  };

  const handleEditBed = (bed: HSBed) => {
    setSelectedBed(bed);
    setBedRoomId(bed.room_id);
    setBedForm({ status: String(
      bed.status === "Available" ? "1" :
      bed.status === "Occupied" ? "2" :
      bed.status === "Cleaning" ? "3" :
      bed.status === "Maintenance" ? "4" :
      bed.status
    ), bed_number : bed.bed_number });
    setBedModalMode("edit");
    setBedModalOpen(true);
  };

  const handleDeleteBed = (bed: HSBed) => {
    setSelectedBed(bed);
    setBedRoomId(bed.room_id);
    setDeleteBedDialogOpen(true);
  };

  const handleAddBed = (roomId: string) => {
    setBedRoomId(roomId);
    setSelectedBed(null);
    const wardIdForRoom = roomsList.find((r) => r.id === roomId)?.ward_id || "";
    setBedForm({ status: "1", bed_number: "" });
    setBedModalMode("add");
    setBedModalOpen(true);
  };

  const confirmDeleteBed = async () => {
    try {
      if (selectedBed) {
        await deleteBed(selectedBed.id);
        const refreshRoomId = selectedBed.room_id || bedRoomId;
        if (refreshRoomId) {
          const bedsRes = await fetchBeds(refreshRoomId);
          setBedsList((prev) => {
            const others = prev.filter((b) => b.room_id !== refreshRoomId);
            return [...others, ...(bedsRes?.data || [])];
          });
        } else {
          setBedsList((prev) => prev.filter((b) => b.id !== selectedBed.id));
        }
        toast({ title: "Bed deleted successfully" });
      }
    } catch (err: any) {
      toast({ title: "Failed to delete bed", description: err?.message, variant: "destructive" });
    } finally {
      setDeleteBedDialogOpen(false);
    }
  };

  // Helpers: case-insensitive includes
  const includesCI = (value: any, query: string) => {
    const s = String(value ?? "").toLowerCase();
    return s.includes(query);
  };

  const getAmenityName = (id: string) => roomAmenities.find((a) => a.id === id)?.name || id;

  // Status helpers (hoisted above matchers to avoid ReferenceError)
  function getStatusLabel(value: string | number) {
    switch (value) {
      case "1":
      case 1:
        return "Available";
      case "2":
      case 2:
        return "Occupied";
      case "3":
      case 3:
        return "Cleaning";
      case "4":
      case 4:
        return "Maintenance";
      default:
        return typeof value === "string" && value.trim() ? String(value) : "Unknown";
    }
  }

  function getRoomStatusVariant(value: string | number) {
    switch (value) {
      case "1":
      case 1:
        return "positive"; // Available → Green
      case "2":
      case 2:
        return "negative"; // Occupied → Red
      case "3":
      case 3:
        return "pending"; // Cleaning → Yellow
      case "4":
      case 4:
        return "inactive"; // Maintenance → Gray
      default:
        return "inactive";
    }
  }

  // Matchers for search
  const matchWard = (ward: HSWard, q: string) =>
    includesCI(ward.ward_name, q) ||
    includesCI(ward.ward_type, q) ||
    includesCI(ward.floor_no, q) ||
    includesCI(ward.status, q);

  const matchRoom = (room: HSRoom, q: string) =>
    includesCI(room.room_name, q) ||
    includesCI(room.room_type, q) ||
    includesCI(room.bed_count, q) ||
    includesCI(getStatusLabel(room.status), q) ||
    (room.amenities || []).some((id) => includesCI(getAmenityName(id), q));

  const matchBed = (bed: HSBed, q: string) =>
    includesCI(bed.bed_number, q) ||
    includesCI(getStatusLabel(bed.status), q) ||
    includesCI(bed.patient_fname, q) ||
    includesCI(bed.patient_lname, q) ||
    includesCI(bed.assigned_patient_id, q);

  // Filter wards by search (ward/room/bed level)
  const q = searchQuery.trim().toLowerCase();
  const isSearching = q.length > 0;
  const filteredWards = wardsList.filter((ward) => {
    if (!isSearching) return true;
    if (matchWard(ward, q)) return true;
    const wardRooms = roomsList.filter((r) => r.ward_id === ward.id);
    if (wardRooms.some((r) => matchRoom(r, q))) return true;
    const wardBeds = bedsList.filter((b) => b.ward_id === ward.id);
    if (wardBeds.some((b) => matchBed(b, q))) return true;
    return false;
  });

  const getStatusVariant = (status: string): "active" | "inactive" | "pending" | "positive" | "negative" => {
    if (status === "active" || status === "Available") return "positive";
    if (status === "Occupied") return "negative";
    if (status === "Reserved" || status === "Cleaning") return "pending";
    return "inactive";
  };


  


  const getOccupancyRate = (wardId: string) => {
    const wardBeds = bedsList.filter((b) => b.ward_id === wardId);
    const occupiedBeds = wardBeds.filter((b) => getStatusLabel(b.status) === "Occupied").length;
    const totalBeds = wardBeds.length;
    return totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1 doc-calendar">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground pb-4">Ward Management</h1>
          <Button onClick={handleAddWard}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ward
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search wards, rooms, or beds..."
          />
        </div>


        <div className="space-y-4 pt-4">
          {filteredWards.map((ward) => {
            const wardRoomsAll = roomsList.filter((r) => r.ward_id === ward.id);
            const wardRooms = isSearching
              ? wardRoomsAll.filter((r) => matchRoom(r, q) || bedsList.some((b) => b.room_id === r.id && matchBed(b, q)))
              : wardRoomsAll;
            const occupancyRate = getOccupancyRate(ward.id);
            const isExpanded = expandedWards.has(ward.id);

            return (
              <Collapsible key={ward.id} open={isExpanded} onOpenChange={() => toggleWard(ward.id)}>
                <div className="border rounded-lg bg-card">
                  {/* Ward Header */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="p-0 h-auto">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 mr-1" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-1" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{ward.ward_name}</h3>
                            <StatusBadge
                              status={ward.status}
                              variant={getStatusVariant(ward.status)}
                            />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Type: {ward.ward_type}</span>
                            <span>Floor: {ward.floor_no}</span>
                            <span>Rooms: {wardRooms.length}</span>
                            <span className={occupancyRate > 80 ? "text-destructive font-medium" : ""}>
                              Occupancy: {occupancyRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddRoom(ward.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Room
                        </Button>
                        <ActionButtons
                          onView={() => handleViewWard(ward)}
                          onEdit={() => handleEditWard(ward)}
                          //onDelete={() => handleDeleteWard(ward)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rooms Section */}
                  <CollapsibleContent>
                    <div className="border-t bg-muted/30">
                      {wardRooms.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          No rooms in this ward. Click "Add Room" to create one.
                        </div>
                      ) : (
                        <div className="p-4 space-y-3">
                          {wardRooms.map((room) => {
                            const roomBedsAll = bedsList.filter((b) => b.room_id === room.id);
                            const roomBeds = isSearching ? roomBedsAll.filter((b) => matchBed(b, q)) : roomBedsAll;
                            const isRoomExpanded = expandedRooms.has(room.id);

                            return (
                              <Collapsible key={room.id} open={isRoomExpanded} onOpenChange={() => toggleRoom(room.id)}>
                                <div className="rounded-md border bg-card">
                                  <div className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <CollapsibleTrigger asChild>
                                        <Button variant="ghost" className="p-0 h-auto">
                                          {isRoomExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4" />
                                          )}
                                        </Button>
                                      </CollapsibleTrigger>
                                      <div className="w-8 h-8 rounded-lg bg-accent/50 flex items-center justify-center">
                                        <DoorOpen className="w-4 h-4 text-accent-foreground" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium">{room.room_name}</h4>
                                          

                                          <RoomStatusBadge
                                            status={getStatusLabel(room.status)}
                                            variant={getRoomStatusVariant(room.status)}
                                          />


                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                          <span>{room.room_type}</span>
                                          <span>Beds: {room.bed_count}</span>
                                          <span>
                                            Amenities: {(room.amenities || [])
                                              .map((id) => roomAmenities.find((a) => a.id === id)?.name || id)
                                              .join(", ")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {roomBedsAll.length < Number(room.bed_count || 0) && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleAddBed(room.id)}
                                          className="h-8 text-xs"
                                        >
                                          <Plus className="w-3 h-3 mr-1" />
                                          Add Bed
                                        </Button>
                                      )}
                                      <ActionButtons
                                        onView={() => handleViewRoom(room)}
                                        onEdit={() => handleEditRoom(room)}
                                       // onDelete={() => handleDeleteRoom(room)}
                                      />
                                    </div>
                                  </div>

                                  {/* Beds Section */}
                                  <CollapsibleContent>
                                    <div className="border-t bg-muted/20">
                                      {roomBeds.length === 0 ? (
                                        <div className="p-6 text-center text-muted-foreground text-sm">No beds in this room</div>
                                      ) : (
                                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                          {roomBeds.map((bed) => (
                                            <div key={bed.id} className="rounded border bg-card p-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  
                                                  <div className="text-center">
                                                    <div className="font-medium text-sm">{bed.bed_number}</div>
                                                    <RoomStatusBadge
                                                      status={getStatusLabel(bed.status)}
                                                      variant={getRoomStatusVariant(bed.status)}
                                                    />
                                                  </div>
                                                </div>
                                                <ActionButtons
                                                  onView={() => handleViewBed(bed)}
                                                  onEdit={() => handleEditBed(bed)}
                                                  //onDelete={() => handleDeleteBed(bed)}
                                                />
                                              </div>
                                              {bed.assigned_patient_id && bed.patient_fname && (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                  Patient: {bed.patient_fname} {bed.patient_lname}
                                                </div>
                                              )}
                                              {bed.last_cleaned_date && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                  Last Cleaned: {new Date(bed.last_cleaned_date).toLocaleDateString()}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>

        {/* Ward Modal */}
        <CrudModal
          open={wardModalOpen}
          onOpenChange={setWardModalOpen}
          title={
            wardModalMode === "add"
              ? "Add Ward"
              : wardModalMode === "edit"
              ? "Edit Ward"
              : "View Ward"
          }
          mode={wardModalMode}
          onSave={async () => {
            try {
              if (!wardForm) return;
              if (wardModalMode === "add") {
                await addWard({
                  ward_name: wardForm.ward_name,
                  ward_type: wardForm.ward_type,
                  floor_no: wardForm.floor_no,
                  status: wardForm.status === "active" ? "1" : "0",
                });
                const wardsRes = await fetchWards();
                setWardsList((prev) => {
                  const fetched = wardsRes?.data || [];
                  const fetchedIds = new Set(fetched.map((w) => w.id));
                  const others = prev.filter((w) => !fetchedIds.has(w.id));
                  return [...others, ...fetched];
                });
                toast({ title: "Ward added successfully" });
              } else if (selectedWard) {
                await updateWard(selectedWard.id, {
                  ward_name: wardForm.ward_name,
                  ward_type: wardForm.ward_type,
                  floor_no: wardForm.floor_no,
                  status: wardForm.status === "active" ? "1" : "0",
                });
                const wardsRes = await fetchWards();
                setWardsList((prev) => {
                  const fetched = wardsRes?.data || [];
                  const fetchedIds = new Set(fetched.map((w) => w.id));
                  const others = prev.filter((w) => !fetchedIds.has(w.id));
                  return [...others, ...fetched];
                });
                toast({ title: "Ward updated successfully" });
              }
              setWardModalOpen(false);
            } catch (err: any) {
              toast({ title: "Failed to save ward", description: err?.message, variant: "destructive" });
            }
          }}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Ward Name</Label>
              <Input value={wardForm?.ward_name ?? ""} onChange={(e) => setWardForm((prev) => prev ? { ...prev, ward_name: e.target.value } : prev)} disabled={wardModalMode === "view"} />
            </div>
            <div className="grid gap-2">
              <Label>Ward Type</Label>
              <Select value={wardForm?.ward_type ?? ""} onValueChange={(v) => setWardForm((prev) => prev ? { ...prev, ward_type: v } : prev)} disabled={wardModalMode === "view"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wardTypes.map((wt) => (
                    <SelectItem key={wt.id} value={wt.title}>{wt.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Floor Number</Label>
                <Select
                  value={wardForm?.floor_no ?? ""}
                  onValueChange={(v) => setWardForm((prev) => prev ? { ...prev, floor_no: v } : prev)}
                  disabled={wardModalMode === "view"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {floorOptions.map((floor) => (
                      <SelectItem key={floor} value={floor}>{floor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity not available from API; computed via beds */}
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={wardForm?.status ?? "active"} onValueChange={(v) => setWardForm((prev) => prev ? { ...prev, status: v as any } : prev)} disabled={wardModalMode === "view"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CrudModal>

        {/* Room Modal */}
        <CrudModal
          open={roomModalOpen}
          onOpenChange={setRoomModalOpen}
          title={
            roomModalMode === "add"
              ? "Add Room"
              : roomModalMode === "edit"
              ? "Edit Room"
              : "View Room"
          }
          mode={roomModalMode}
          onSave={async () => {
            try {
              if (!roomForm) return;
              if (roomModalMode === "add") {
                await addRoom({
                  ward_id: roomWardId,
                  room_name: roomForm.room_name,
                  room_type: roomForm.room_type,
                  bed_count: roomForm.bed_count,
                  amenities: roomForm.amenities,
                  status: roomForm.status,
                });
                const roomsRes = await fetchRooms(roomWardId);
                setRoomsList((prev) => {
                  const others = prev.filter((r) => r.ward_id !== roomWardId);
                  return [...others, ...(roomsRes?.data || [])];
                });
                toast({ title: "Room added successfully" });
              } else if (selectedRoom) {
                await updateRoom(selectedRoom.id, {
                  ward_id: selectedRoom.ward_id,
                  room_name: roomForm.room_name,
                  room_type: roomForm.room_type,
                  bed_count: roomForm.bed_count,
                  amenities: roomForm.amenities,
                  status: roomForm.status,
                });
                const roomsRes = await fetchRooms(selectedRoom.ward_id);
                setRoomsList((prev) => {
                  const others = prev.filter((r) => r.ward_id !== selectedRoom.ward_id);
                  return [...others, ...(roomsRes?.data || [])];
                });
                toast({ title: "Room updated successfully" });
              }
              setRoomModalOpen(false);
            } catch (err: any) {
              toast({ title: "Failed to save room", description: err?.message, variant: "destructive" });
            }
          }}
        >
          <div className="grid gap-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="">
                <Label>Room Number</Label>
                <Input value={roomForm?.room_name ?? ""} onChange={(e) => setRoomForm((prev) => prev ? { ...prev, room_name: e.target.value } : prev)} disabled={roomModalMode === "view"} />
              </div>
              <div>
                <Label>Room Type </Label>
                <Select value={roomForm?.room_type ?? ""} onValueChange={(v) => setRoomForm((prev) => prev ? { ...prev, room_type: v } : prev)} disabled={roomModalMode === "view"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypesList.map((rt) => (
                      <SelectItem key={rt.id} value={rt.title}>{rt.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              
              

              <div className="">
                <Label>Bed Count</Label>
                <Input type="number" value={roomForm?.bed_count ?? ""} onChange={(e) => setRoomForm((prev) => prev ? { ...prev, bed_count: e.target.value } : prev)} disabled={roomModalMode === "view"} />
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={roomForm?.status ?? "Available"} onValueChange={(v) => setRoomForm((prev) => prev ? { ...prev, status: v } : prev)} disabled={roomModalMode === "view"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Available</SelectItem>
                    <SelectItem value="2">Occupied</SelectItem>
                    <SelectItem value="3">Cleaning</SelectItem>
                    <SelectItem value="4">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* ✅ Room Amenities Section */}
            <div>
              <Label>Room Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {roomAmenities.map((am) => {
                  const isChecked = roomForm?.amenities?.includes(am.id);
                  const IconSrc = PaIcons[am.icon as keyof typeof PaIcons]; // ✅ Dynamically get icon image

                  return (
                    <label
                      key={am.id}
                      className={`flex items-center space-x-2 p-2 rounded-lg  cursor-pointer transition ${
                        isChecked
                          ? "bg-green-50 border-green-400"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={roomModalMode === "view"}
                        onChange={() =>
                          setRoomForm((prev) => {
                            if (!prev) return prev;
                            const updatedAmenities = isChecked
                              ? prev.amenities.filter((a) => a !== am.id)
                              : [...(prev.amenities || []), am.id];
                            return { ...prev, amenities: updatedAmenities };
                          })
                        }
                      />

                      {/* ✅ Display Icon + Name */}
                      <div className="flex items-center gap-2">
                        {IconSrc && (
                          <img
                            src={IconSrc}
                            alt={am.name}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span className="text-sm font-medium">{am.name}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>



          </div>
        </CrudModal>

        {/* Bed Modal */}
        <CrudModal
          open={bedModalOpen}
          onOpenChange={setBedModalOpen}
          title={
            bedModalMode === "add"
              ? "Add Bed"
              : bedModalMode === "edit"
              ? "Edit Bed"
              : "View Bed"
          }
          mode={bedModalMode}
          onSave={async () => {
            try {
              if (!bedForm) return;
              const wardIdForRoom =
                roomsList.find((r) => r.id === bedRoomId)?.ward_id ||
                selectedBed?.ward_id ||
                "";

              const payload = {
                ward_id: wardIdForRoom,
                room_id: bedRoomId || selectedBed?.room_id || "",
                bed_number: bedForm.bed_number,
                //status: bedForm.status,
                //assigned_patient_id: bedForm.assigned_patient_id || null,
              };

              if (bedModalMode === "add") {
                /*await addBed(payload);
                toast({ title: "Bed added successfully" });*/

                const res = await addBed(payload);
                if (res?.success) {
                  toast({
                    title: res.message || "Bed added successfully",
                    description: "The bed has been created and saved successfully.",
                    variant: "success",
                  });
                } else {
                  toast({
                    title: "Action failed",
                    description: res?.message || "Unable to add bed. Please try again.",
                    variant: "destructive",
                  });
                }

              } else if (selectedBed) {
                //await updateBed(selectedBed.id, payload);
                //toast({ title: "Bed updated successfully" });

                const res = await updateBed(selectedBed.id, payload)
                if (res?.success) {
                  toast({
                    title: res.message || "Bed updated successfully",
                    description: "The bed has been created and saved successfully.",
                    variant: "success",
                  });
                } else {
                  toast({
                    title: "Action failed",
                    description: res?.message || "Unable to update bed. Please try again.",
                    variant: "destructive",
                  });
                }

              }

              const refreshRoomId = selectedBed?.room_id || bedRoomId;
              const bedsRes = await fetchBeds(refreshRoomId);
              setBedsList((prev) => {
                const others = prev.filter((b) => b.room_id !== refreshRoomId);
                return [...others, ...(bedsRes?.data || [])];
              });
              setBedModalOpen(false);
            } catch (err: any) {
              toast({
                title: "Failed to save bed",
                description: err?.message,
                variant: "destructive",
              });
            }
          }}
        >
          <div className="grid gap-4">
            {/* Bed Number Field */}
            <div className="grid gap-2">
              <Label>Bed Number</Label>
              <Input
                value={bedForm?.bed_number ?? ""}
                onChange={(e) =>
                  setBedForm((prev) =>
                    prev ? { ...prev, bed_number: e.target.value } : prev
                  )
                }
                disabled={bedModalMode === "view"}
                placeholder="Enter bed number"
              />
            </div>

            {/* Bed Status 
            <div className="grid gap-2">
              <Label>Bed Status</Label>
              <Select
                value={String(bedForm?.status ?? "1")} // 🔹 ensure it's string
                onValueChange={(v) =>
                  setBedForm((prev) => (prev ? { ...prev, status: v } : prev))
                }
                disabled={bedModalMode === "view"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="1">Available</SelectItem>
                  <SelectItem value="2">Occupied</SelectItem>
                  <SelectItem value="3">Cleaning</SelectItem>
                  <SelectItem value="4">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>*/}


          </div>
        </CrudModal>

        {/* Delete Dialogs */}
        <DeleteDialog
          open={deleteWardDialogOpen}
          onOpenChange={setDeleteWardDialogOpen}
          onConfirm={confirmDeleteWard}
          title="Delete Ward?"
          description="This will permanently delete this ward and all associated rooms and beds. This action cannot be undone."
        />

        <DeleteDialog
          open={deleteRoomDialogOpen}
          onOpenChange={setDeleteRoomDialogOpen}
          onConfirm={confirmDeleteRoom}
          title="Delete Room?"
          description="This will permanently delete this room and all associated beds. This action cannot be undone."
        />

        <DeleteDialog
          open={deleteBedDialogOpen}
          onOpenChange={setDeleteBedDialogOpen}
          onConfirm={confirmDeleteBed}
          title="Delete Bed?"
          description="This will permanently delete this bed. This action cannot be undone."
        />







      </main>
    </div>
  );
};

export default HospitalManageWardInfo;
