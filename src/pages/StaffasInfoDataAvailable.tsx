import { useState } from "react";
import { Search, BedDouble, Building2, DoorClosed, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudModal } from "@/components/shared/CrudModal";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { wards } from "@/data/wards";
import { rooms } from "@/data/rooms";
import { beds } from "@/data/beds";
import { PaIcons } from "@/components/icons/PaIcons";


type BedAction = "book" | "change" | "discharge" | "view" | null;

export default function StaffasInfoDataAvailable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [actionType, setActionType] = useState<BedAction>(null);
  const [formData, setFormData] = useState({ patientName: "", patientPhone: "", notes: "" });
  const { toast } = useToast();

  const filteredBeds = beds.filter((bed) => {
    const room = rooms.find((r) => r.id === bed.roomId);
    const ward = wards.find((w) => w.id === bed.wardId);
    
    const matchesSearch = 
      bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ward?.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room?.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bed.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleBedAction = (bed: any, action: BedAction) => {
    setSelectedBed(bed);
    setActionType(action);
    setFormData({ patientName: "", patientPhone: "", notes: "" });
  };

  const handleAction = () => {
    if (actionType === "book") {
      toast({ title: "Success", description: "Bed booked successfully for patient" });
    } else if (actionType === "change") {
      toast({ title: "Success", description: "Patient moved to new bed" });
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
                  {Math.round((beds.filter((b) => b.status === "Occupied").length / beds.length) * 100)}%
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
            </Select>
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
                              Floor {ward.floorNo} • {ward.wardType} • Capacity: {ward.capacity}
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
                                <span>Room {room.roomNumber}</span>
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
                              {/*{roomBeds.map((bed) => (
                                <Card
                                  key={bed.id}
                                  className={`cursor-pointer transition-all hover:shadow-lg border-2 ${getBedCardClass(
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
                                    </div>
                                    
                                    {bed.status === "Available" && (
                                      <Button
                                        size="sm"
                                        className="mt-2 w-full"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBedAction(bed, "book");
                                        }}
                                      >
                                        Book
                                      </Button>
                                    )}
                                    
                                    {bed.status === "Occupied" && (
                                      <div className="flex gap-1 mt-2 w-full">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="flex-1 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBedAction(bed, "change");
                                          }}
                                        >
                                          Move
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="flex-1 text-xs"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleBedAction(bed, "discharge");
                                          }}
                                        >
                                          Discharge
                                        </Button>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}*/}

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
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Bed Number</Label>
                        <p className="font-medium text-lg">{selectedBed.bedNumber}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge className="mt-1">{selectedBed.status}</Badge>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Ward</Label>
                        <p className="font-medium">
                          {wards.find((w) => w.id === selectedBed.wardId)?.wardName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Room</Label>
                        <p className="font-medium">
                          Room {rooms.find((r) => r.id === selectedBed.roomId)?.roomNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Last Cleaned</Label>
                        <p className="font-medium">{selectedBed.lastCleanedDate}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Room Type</Label>
                        <p className="font-medium">
                          {rooms.find((r) => r.id === selectedBed.roomId)?.roomType}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {actionType === "book" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        placeholder="Enter patient name"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="patientPhone">Patient Phone *</Label>
                      <Input
                        id="patientPhone"
                        placeholder="Enter phone number"
                        value={formData.patientPhone}
                        onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Medical Notes</Label>
                      <Input
                        id="notes"
                        placeholder="Add any medical notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {actionType === "change" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm text-muted-foreground">Current Patient</Label>
                      <p className="font-medium">Patient ID: {selectedBed.assignedPatientId}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newBed">Select New Bed</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose available bed" />
                        </SelectTrigger>
                        <SelectContent>
                          {beds
                            .filter((b) => b.status === "Available" && b.id !== selectedBed.id)
                            .map((bed) => (
                              <SelectItem key={bed.id} value={bed.id}>
                                Bed {bed.bedNumber} - Room {rooms.find((r) => r.id === bed.roomId)?.roomNumber}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
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
