import { useEffect, useMemo, useState,useRef  } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/StatCard';
import { BedCard } from '@/components/BedCard';
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
} from '@/services/SfstaffRoomService';

import { CrudModal } from '@/components/shared/CrudModal';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ReactSelect, { type InputActionMeta } from 'react-select';
import { useToast } from '@/hooks/use-toast';

// Helper to map service status -> BedCard status
const toBedCardStatus = (s: string): 'available' | 'occupied' | 'reserved' | 'maintenance' => {
  const v = String(s || '').toLowerCase();
  if (v === 'available') return 'available';
  if (v === 'occupied') return 'occupied';
  if (v === 'reserved') return 'reserved';
  // service may return "Cleaning"; treat as maintenance
  return 'maintenance';
};

// Action type for modal
type BedAction = 'book' | 'change' | 'discharge' | 'view' | null;

export default function StaffasManageRoomAvailable() {
  // UI state (unchanged design)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'reserved' | 'maintenance'>('all');

  // Dynamic data
  const [wards, setWards] = useState<StaffWard[]>([]);
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [beds, setBeds] = useState<StaffBed[]>([]);
  const [selectedWardId, setSelectedWardId] = useState<string>('');

  // Action modal state
  const { toast } = useToast();
  const [actionType, setActionType] = useState<BedAction>(null);
  const [selectedBedForAction, setSelectedBedForAction] = useState<StaffBed | null>(null);

  // Booking form state
  const [patientSearch, setPatientSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');

  // Change form state
  const [changeWardId, setChangeWardId] = useState<string>('');
  const [changeRoomId, setChangeRoomId] = useState<string>('');
  const [changeBedId, setChangeBedId] = useState<string>('');
  const [allowChangePatient, setAllowChangePatient] = useState<boolean>(false);

  // Common options
  const [doctors, setDoctors] = useState<Array<{ value: string; label: string }>>([]);
  const [eventTypes, setEventTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedActivityTypeId, setSelectedActivityTypeId] = useState<string>('');
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [medicalNotes, setMedicalNotes] = useState<string>('');

   const lastPatientSearchRef = useRef<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const wardRes = await fetchStaffWards();
        const wardList = wardRes?.data ?? [];
        setWards(wardList);
        const firstWardId = wardList[0]?.id || '';
        setSelectedWardId(firstWardId);

        const roomLists = await Promise.all(
          wardList.map(async (w) => {
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
      } catch (err) {
        console.error('Failed to load manage room data:', err);
      }
    };
    load();
  }, []);

  // Load dropdown options once
   useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const [drRes, evRes, actRes, stRes] = await Promise.all([
          fetchStaffDoctorOptions(),
          fetchStaffEventTypeList(),
          fetchStaffActivityTypeList(),
          fetchStaffPatientStatusOptions(),
        ]);

        /** ---------- Doctors ---------- **/
        const drRaw = (drRes?.data ?? [])
          .map((d: any) => ({
            value: d.id ?? d.docuid ?? d.value ?? '',
            label: d.doctorName ?? d.name ?? d.label ?? '',
          }))
          .filter((o: any) => o.value !== '');

        const drSeen = new Set<string>();
        const uniqueDoctors = drRaw.filter((o: any) => {
          if (drSeen.has(o.value)) return false;
          drSeen.add(o.value);
          return true;
        });

        setDoctors(uniqueDoctors);

        /** ---------- Event Types ---------- **/
        const evSource = (actRes?.data ?? actRes?.data ?? []);

        //console.log(actRes?.data);

        const evRaw = evSource
          .map((e: any) => ({
            value: String(e.id ?? e.value ?? ''),
            label:
              String(e.title ?? e.label ?? e.name ?? '').trim() ||
              String(e.id ?? e.value ?? ''),
          }))
          .filter((o: any) => o.value !== '');

        const evSeen = new Set<string>();
        const uniqueEvents = evRaw.filter((o: any) => {
          if (evSeen.has(o.value)) return false;
          evSeen.add(o.value);
          return true;
        });
        setEventTypes(uniqueEvents);

        /** ---------- Status Options ---------- **/
        const stRaw = (stRes?.data ?? [])
          .map((s: any) => ({
            value: String(s.value ?? s.id ?? ''),
            label: String(s.label ?? s.title ?? s.name ?? ''),
          }))
          .filter((o: any) => o.value !== '');

        const stSeen = new Set<string>();
        const uniqueStatuses = stRaw.filter((o: any) => {
          if (stSeen.has(o.value)) return false;
          stSeen.add(o.value);
          return true;
        });

        setStatusOptions(uniqueStatuses);

        

      } catch (e) {
        console.error("❌ Failed to load select options", e);
      }
    };

    loadSelectOptions();
  }, []);

  /** Log when state updates */
  useEffect(() => {
    if (doctors.length > 0) {
      //console.log("🩺 Doctors updated in state:", doctors);
    }
  }, [doctors]);

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



  // Patient search
  useEffect(() => {
    let cancelled = false;
    if (!patientSearch.trim()) {
      setPatientOptions([]);
      return;
    }
    (async () => {
      try {
        const res = await fetchStaffPatientOptions(patientSearch.trim());
        const src = (res?.data ?? res?.data2 ?? []);
        const rawOpts = src
          .map((p: any) => {
            const value = String(p.id ?? p.patientuid ?? p.patientId ?? p.uid ?? '');
            const name = `${String(p.fname ?? p.firstName ?? '').trim()} ${String(p.lname ?? p.lastName ?? '').trim()}`.trim();
            const label = name || String(p.email ?? p.patientuid ?? value);
            return { value, label };
          })
          .filter((o: any) => o.value !== '');
        const seen = new Set<string>();
        const opts = rawOpts.filter((o: any) => { if (seen.has(o.value)) return false; seen.add(o.value); return true; });
        if (!cancelled) setPatientOptions(opts);
      } catch (e) {
        // silent fail
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientSearch]);

  // Derived selections
  const selectedWard = useMemo(() => wards.find((w) => w.id === selectedWardId) || wards[0], [wards, selectedWardId]);
  const wardRooms = useMemo(() => rooms.filter((r) => r.wardId === (selectedWard?.id || '')), [rooms, selectedWard]);

  // Stats (keep StatCard design)
  const stats = useMemo(() => {
    const totalBeds = beds.length;
    const available = beds.filter((b) => toBedCardStatus(b.status) === 'available').length;
    const occupied = beds.filter((b) => toBedCardStatus(b.status) === 'occupied').length;
    const reserved = beds.filter((b) => toBedCardStatus(b.status) === 'reserved').length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupied / totalBeds) * 100) : 0;
    return { available, occupied, reserved, occupancyRate };
  }, [beds]);

  // Compute validity for booking form mandatory fields
  const isBookFormValid = useMemo(() => {
    const required = [
      selectedPatientId,
      selectedWardId,
      selectedRoomId,
      selectedBedId,
      selectedDoctorId,
      currentStatus,
      selectedActivityTypeId,
      priority,
    ];
    return required.every((v) => String(v ?? '').trim() !== '');
  }, [
    selectedPatientId,
    selectedWardId,
    selectedRoomId,
    selectedBedId,
    selectedDoctorId,
    currentStatus,
    selectedActivityTypeId,
    priority,
  ]);


  // Search + status filter
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredBedsByRoom = useMemo(() => {
    const mapRoomBeds: Record<string, StaffBed[]> = {};
    wardRooms.forEach((room) => {
      const roomBeds = beds.filter((b) => b.roomId === room.id);
      const filtered = roomBeds.filter((bed) => {
        const wardName = wards.find((w) => w.id === bed.wardId)?.wardName || '';
        const roomNumber = rooms.find((r) => r.id === bed.roomId)?.roomNumber || '';
        const matchesSearch =
          bed.bedNumber.toLowerCase().includes(normalizedQuery) ||
          wardName.toLowerCase().includes(normalizedQuery) ||
          roomNumber.toLowerCase().includes(normalizedQuery);
        const matchesStatus = statusFilter === 'all' || toBedCardStatus(bed.status) === statusFilter;
        return matchesSearch && matchesStatus;
      });
      mapRoomBeds[room.id] = filtered;
    });
    return mapRoomBeds;
  }, [beds, wardRooms, rooms, wards, normalizedQuery, statusFilter]);

  // Bed card action handler -> open CrudModal
  const handleBedCardAction = (action: string, bedCard: any) => {
    const actionLower = String(action || '').toLowerCase();
    const mapped: BedAction = (actionLower === 'move' ? 'change' : (actionLower as BedAction));
    const sBed = beds.find((b) => b.id === bedCard?.id) || null;
    setSelectedBedForAction(sBed);
    setActionType(mapped);

    // reset form fields
    setPatientSearch('');
    setPatientOptions([]);
    setSelectedPatientId('');
    setSelectedPatientName('');
    setSelectedDoctorId('');
    setSelectedActivityTypeId('');
    setCurrentStatus('');
    setPriority('MEDIUM');
    setMedicalNotes('');

    // preselect location
    if (sBed) {
      setSelectedWardId(sBed.wardId);
      setSelectedRoomId(sBed.roomId);
      setSelectedBedId(sBed.id);
      setChangeWardId(sBed.wardId);
      setChangeRoomId(sBed.roomId);
      setChangeBedId('');
    }
  };

  // Save action
  const handleAction = () => {
    if (actionType === 'book') {
      if (!selectedPatientId) {
        toast({ title: 'Missing patient', description: 'Please select a patient.' });
        return;
      }
      if (!selectedWardId || !selectedRoomId || !selectedBedId) {
        toast({ title: 'Missing location', description: 'Please select ward, room, and bed.' });
        return;
      }
      if (!selectedDoctorId) {
        toast({ title: 'Missing physician', description: 'Please select attending doctor.' });
        return;
      }
      (async () => {
        try {
          const { submitStaffBedBooking } = await import('@/services/SfstaffRoomService');
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
            toast({ title: 'Success', description: res?.message || 'Bed booked successfully for patient' });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error(res?.message || 'Failed to book bed');
          }
        } catch (err: any) {
          toast({ title: 'Booking failed', description: err?.message || 'Could not submit booking' });
          return;
        }
        setActionType(null);
        setSelectedBedForAction(null);
      })();
      return;
    } else if (actionType === 'change') {
      const effectivePatientId = allowChangePatient && selectedPatientId
        ? selectedPatientId
        : String(selectedBedForAction?.assignedPatientId || '');
      if (!effectivePatientId) {
        toast({ title: 'Missing patient', description: 'No current patient assigned; select a patient.' });
        return;
      }
      if (!changeWardId || !changeRoomId || !changeBedId) {
        toast({ title: 'Missing location', description: 'Please select new ward, room, and bed.' });
        return;
      }
      if (!selectedDoctorId) {
        toast({ title: 'Missing physician', description: 'Please select attending doctor.' });
        return;
      }
      (async () => {
        try {
          const { submitStaffBedChange } = await import('@/services/SfstaffRoomService');
          const res = await submitStaffBedChange({
            patientId: effectivePatientId,
            fromWardId: String(selectedBedForAction?.wardId || ''),
            fromRoomId: String(selectedBedForAction?.roomId || ''),
            fromBedId: String(selectedBedForAction?.id || ''),
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
            toast({ title: 'Success', description: res?.message || 'Patient moved to new bed' });
            setTimeout(() => window.location.reload(), 1000);
          } else {
            throw new Error(res?.message || 'Failed to change bed');
          }
        } catch (err: any) {
          toast({ title: 'Change failed', description: err?.message || 'Could not submit bed change' });
          return;
        }
        setActionType(null);
        setSelectedBedForAction(null);
      })();
      return;
    } else if (actionType === 'discharge') {
      toast({ title: 'Success', description: 'Patient discharged, bed now available' });
    }
    setActionType(null);
    setSelectedBedForAction(null);
  };

  return (
    <div className="min-h-screen bg-background p-6 sx-col">
      <div className="w-full sm:max-w-full max-w-[100%] mx-auto overflow-x-hidden space-y-6 ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Manage Bed Availability
          </h1>
        </div>

        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value={stats.available} label="Available Beds" variant="available" />
          <StatCard value={stats.occupied} label="Occupied Beds" variant="occupied" />
          <StatCard value={stats.reserved} label="Reserved Beds" variant="reserved" />
          <StatCard value={`${stats.occupancyRate}%`} label="Overall Occupancy" />
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4  w-full sm:max-w-full max-w-[100%] mx-auto overflow-x-hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search beds, rooms, or wards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ward Tabs */}
        <div className="flex gap-2 flex-wrap  w-full sm:max-w-full max-w-[100%] mx-auto overflow-x-hidden">
          {wards.map((ward) => {
            const wardBedCount = beds.filter((b) => b.wardId === ward.id).length;
            const wardAvailable = beds.filter((b) => b.wardId === ward.id && toBedCardStatus(b.status) === 'available').length;
            return (
              <Button
                key={ward.id}
                variant={selectedWardId === ward.id ? 'default' : 'outline'}
                onClick={() => setSelectedWardId(ward.id)}
                className="font-medium"
              >
                {ward.wardName}
                <span className="ml-2 text-xs opacity-75">
                  {wardAvailable}/{wardBedCount} available
                </span>
              </Button>
            );
          })}
        </div>

        {/* Bed Grid 
        <div className="bg-card rounded-lg border p-6">
          <div className="space-y-6">
            {wardRooms.map((room) => {
              const roomBeds = filteredBedsByRoom[room.id] || [];
              // Hide empty rooms when filtering by status
              if (roomBeds.length === 0 && statusFilter !== 'all' && normalizedQuery.length === 0) return null;
              return (
                <div key={room.id} className="flex gap-4">
                  
                  <div className="flex-shrink-0 w-24">
                    <div className="bg-muted rounded-lg h-16 flex items-center justify-center font-bold text-[14px] text-sm">
                      {room.roomNumber}
                    </div>
                  </div>

                  
                  <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2">
                    {roomBeds.map((bed) => {
                      const bedCardModel = {
                        id: bed.id,
                        number: bed.bedNumber,
                        status: toBedCardStatus(bed.status),
                        patientName: [bed.patientFirstName, bed.patientLastName].filter(Boolean).join(' ').trim() || undefined,
                        patientId: bed.assignedPatientId || undefined,
                        admissionDate: bed.admitDate || undefined,
                        notes: bed.medicalNotes || undefined,
                        wardId: bed.wardId,
                        roomId: bed.roomId,
                      } as any; // BedCard is structural; keep UI intact
                      return <BedCard key={bed.id} bed={bedCardModel} variant="light" onAction={handleBedCardAction} />;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>*/}

         <div className="bg-card rounded-lg border p-4 sm:p-6 w-full sm:max-w-full max-w-[100%] mx-auto overflow-x-hidden">
          <div className="space-y-6">
            {wardRooms.map((room) => {
              const roomBeds = filteredBedsByRoom[room.id] || [];
              // Hide empty rooms when filtering by status
              if (roomBeds.length === 0 && statusFilter !== "all" && normalizedQuery.length === 0) return null;

              return (
                // 👇 Block by default (mobile), flex on sm and up
                <div key={room.id} className="block sm:flex gap-4 sm:items-start">
                  
                  {/* Room Number */}
                  <div className="flex-shrink-0 sm:w-24 w-full mb-3 sm:mb-0">
                    <div className="bg-muted rounded-lg h-14 sm:h-16 flex items-center justify-center font-bold text-sm sm:text-[14px]">
                      {room.roomNumber}
                    </div>
                  </div>

                  {/* Beds Grid */}
                  <div
                    className="
                      flex-1 
                      grid 
                      grid-cols-[repeat(auto-fill,minmax(70px,1fr))] 
                      sm:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] 
                      gap-2
                      w-full sm:max-w-full max-w-[100%] mx-auto overflow-x-hidden
                    "
                  >
                    {roomBeds.map((bed) => {
                      const bedCardModel = {
                        id: bed.id,
                        number: bed.bedNumber,
                        status: toBedCardStatus(bed.status),
                        patientName: [bed.patientFirstName, bed.patientLastName].filter(Boolean).join(" ").trim() || undefined,
                        patientId: bed.assignedPatientId || undefined,
                        admissionDate: bed.admitDate || undefined,
                        notes: bed.medicalNotes || undefined,
                        wardId: bed.wardId,
                        roomId: bed.roomId,
                        permissionStatus: bed.permissionStatus ?? null,
                      };

                      return (
                        <BedCard
                          key={bed.id}
                          bed={bedCardModel}
                          variant="light"
                          onAction={handleBedCardAction}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Action Modal */}
        <CrudModal
          open={actionType !== null}
          onOpenChange={(open) => !open && setActionType(null)}
          title={
            actionType === 'book'
              ? 'Book Bed for Patient'
              : actionType === 'change'
              ? 'Change Patient Bed'
              : actionType === 'discharge'
              ? 'Discharge Patient From Bed'
              : 'View Bed Details'
          }
          mode={actionType === 'view' ? 'view' : 'add'}
          onSave={handleAction}
          saveDisabled={actionType === 'book' ? !isBookFormValid : false}
        >
          {selectedBedForAction && (
            <div className="space-y-6">
              {actionType === 'view' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Current Ward</Label>
                      <p className="font-medium">{wards.find((w) => w.id === selectedBedForAction.wardId)?.wardName}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Current Room/Bed</Label>
                      <p className="font-medium">Room {rooms.find((r) => r.id === selectedBedForAction.roomId)?.roomNumber} • Bed {selectedBedForAction.bedNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Patient Information</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Patient Name</Label>
                        <p className="font-medium">{(() => {
                          const name = `${selectedBedForAction.patientFirstName ?? ''} ${selectedBedForAction.patientLastName ?? ''}`.trim();
                          return name || '-';
                        })()}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Email</Label>
                        <p className="font-medium">{selectedBedForAction.patientEmail ?? '-'}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Phone</Label>
                        <p className="font-medium">{selectedBedForAction.patientPhone ?? '-'}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                        <p className="font-medium">{selectedBedForAction.patientDob ?? "-"}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Gender</Label>
                        <p className="font-medium">{selectedBedForAction.patientGender ?? "-"}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-xs text-muted-foreground">Blood Group</Label>
                        <p className="font-medium">{selectedBedForAction.patientBloodGroup ?? "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {actionType === 'book' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Patient Name *</Label>
                    <ReactSelect
                      isSearchable
                      placeholder="Search and select patient..."
                      onInputChange={(val: string, actionMeta: InputActionMeta) => {
                        if (actionMeta.action === 'input-change') {
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
                        const val = String(opt?.value ?? '');
                        const label = String(opt?.label ?? '');
                        setSelectedPatientId(val);
                        setSelectedPatientName(label);
                        setPatientSearch('');
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Ward</Label>
                      <Select value={selectedWardId} onValueChange={(v) => { setSelectedWardId(v); setSelectedRoomId(''); setSelectedBedId(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.filter((w) => !!w.id).map((w, i) => (
                            <SelectItem key={`${w.id}-${i}`} value={String(w.id)}>{w.wardName || String(w.id)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <Select value={selectedRoomId} onValueChange={(v) => { setSelectedRoomId(v); setSelectedBedId(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.filter((r) => !!r.id && (!selectedWardId || r.wardId === selectedWardId)).map((r, i) => (
                            <SelectItem key={`${r.id}-${i}`} value={String(r.id)}>{r.roomNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bed</Label>
                      <Select value={selectedBedId} onValueChange={setSelectedBedId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bed" />
                        </SelectTrigger>
                        <SelectContent>
                          {beds
                            .filter((b) => !!b.id && (!selectedRoomId || b.roomId === selectedRoomId) && String(b.status).toLowerCase() === 'available')
                            .map((b, i) => (
                              <SelectItem key={`${b.id}-${i}`} value={String(b.id)}>Bed {b.bedNumber}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Attending Doctor</Label>
                      <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.filter((d) => !!d.value).map((d, i) => (
                            <SelectItem key={`${d.value}-${i}`} value={d.value}>{d.label || d.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <Select value={currentStatus} onValueChange={setCurrentStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter((s) => !!s.value).map((s, i) => (
                            <SelectItem key={`${s.value}-${i}`} value={s.value}>{s.label || s.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Type </Label>
                      <Select value={selectedActivityTypeId} onValueChange={setSelectedActivityTypeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.filter((et) => !!et.value).map((et, i) => (
                            <SelectItem key={`${et.value}-${i}`} value={et.value}>{et.label || et.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Medical Notes</Label>
                    <Textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Add notes (optional)" />
                  </div>
                </div>
              )}

              {actionType === 'change' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Current Patient</Label>
                      <p className="font-medium">{(() => {
                        const name = `${selectedBedForAction.patientFirstName ?? ''} ${selectedBedForAction.patientLastName ?? ''}`.trim();
                        return name || '-';
                      })()}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-xs text-muted-foreground">Current Ward/Room/Bed</Label>
                      <p className="font-medium">{wards.find((w) => w.id === selectedBedForAction.wardId)?.wardName}</p>
                      <p className="font-medium">Room {rooms.find((r) => r.id === selectedBedForAction.roomId)?.roomNumber} • Bed {selectedBedForAction.bedNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>New Ward</Label>
                      <Select value={changeWardId} onValueChange={(v) => { setChangeWardId(v); setChangeRoomId(''); setChangeBedId(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ward" />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.filter((w) => !!w.id).map((w, i) => (
                            <SelectItem key={`${w.id}-${i}`} value={String(w.id)}>{w.wardName || String(w.id)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>New Room</Label>
                      <Select value={changeRoomId} onValueChange={(v) => { setChangeRoomId(v); setChangeBedId(''); }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.filter((r) => !!r.id && (!changeWardId || r.wardId === changeWardId)).map((r, i) => (
                            <SelectItem key={`${r.id}-${i}`} value={String(r.id)}>{r.roomNumber}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>New Bed</Label>
                      <Select value={changeBedId} onValueChange={setChangeBedId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bed" />
                        </SelectTrigger>
                        <SelectContent>
                          {beds
                            .filter((b) => !!b.id && (!changeRoomId || b.roomId === changeRoomId) && String(b.status).toLowerCase() === 'available' && b.id !== selectedBedForAction!.id)
                            .map((b, i) => (
                              <SelectItem key={`${b.id}-${i}`} value={String(b.id)}>Bed {b.bedNumber}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Attending Doctor</Label>
                      <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.filter((d) => !!d.value).map((d, i) => (
                            <SelectItem key={`${d.value}-${i}`} value={d.value}>{d.label || d.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <Select value={currentStatus} onValueChange={setCurrentStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.filter((s) => !!s.value).map((s, i) => (
                            <SelectItem key={`${s.value}-${i}`} value={s.value}>{s.label || s.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Type</Label>
                      <Select value={selectedActivityTypeId} onValueChange={setSelectedActivityTypeId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventTypes.filter((et) => !!et.value).map((et, i) => (
                            <SelectItem key={`${et.value}-${i}`} value={et.value}>{et.label || et.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Medical Notes</Label>
                    <Textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Add notes (optional)" />
                  </div>
                </div>
              )}

              {actionType === 'discharge' && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">This will mark the bed as available and close the current patient stay.</p>
                    </CardContent>
                  </Card>
                  <div className="space-y-2">
                    <Label>Discharge Notes</Label>
                    <Textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} placeholder="Add discharge notes (optional)" />
                  </div>
                </div>
              )}
            </div>
          )}
        </CrudModal>

        {/* Legend */}
        <div className="flex gap-6 items-center justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-available border-2 border-available" />
            <span>Available </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-occupied border-2 border-occupied" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-reserved border-2 border-reserved" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-maintenance border-2 border-maintenance" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
