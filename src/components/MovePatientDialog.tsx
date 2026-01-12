import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Bed } from '@/types/bedManagement';
import { toast } from 'sonner';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  fetchStaffWards,
  fetchStaffRooms,
  fetchStaffBeds,
  fetchStaffDoctorOptions,
  submitStaffBedChange,
  type StaffWard,
  type StaffRoom,
  type StaffBed,
} from '@/services/SfstaffRoomService';

interface MovePatientDialogProps {
  bed: Bed & { wardId?: string; roomId?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MovePatientDialog = ({ bed, open, onOpenChange }: MovePatientDialogProps) => {
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBed, setSelectedBed] = useState('');
  const [reason, setReason] = useState('');

  const [wards, setWards] = useState<StaffWard[]>([]);
  const [rooms, setRooms] = useState<StaffRoom[]>([]);
  const [availableBeds, setAvailableBeds] = useState<StaffBed[]>([]);
  const [roomAvailableCounts, setRoomAvailableCounts] = useState<Record<string, number>>({});

  const [doctorOptions, setDoctorOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [wardRes, docRes] = await Promise.all([fetchStaffWards(), fetchStaffDoctorOptions()]);
        const wardList = wardRes?.data || [];
        setWards(wardList);
        setSelectedWard((prev) => prev || String(bed?.wardId || wardList[0]?.id || ''));
        const docs = docRes?.data || [];
        setDoctorOptions(docs);
        setSelectedDoctorId((prev) => prev || String((bed as any)?.docuid || docs[0]?.value || ''));
      } catch (e) {
        console.error('Failed to load move dialog options', e);
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!selectedWard) {
      setRooms([]);
      setRoomAvailableCounts({});
      return;
    }
    let canceled = false;
    (async () => {
      try {
        const res = await fetchStaffRooms(selectedWard);
        if (canceled) return;
        const roomList = res?.data || [];
        setRooms(roomList);
        // preselect room
        setSelectedRoom((prev) => prev || String(bed?.roomId || roomList[0]?.id || ''));
        // compute available counts
        const counts: Record<string, number> = {};
        await Promise.all(
          roomList.map(async (r) => {
            const bRes = await fetchStaffBeds(r.id);
            const blist: StaffBed[] = bRes?.data || [];
            counts[r.id] = blist.filter((b) => String(b.status).toLowerCase() === 'available').length;
          })
        );
        setRoomAvailableCounts(counts);
      } catch (e) {
        console.error('Failed to load rooms for ward', e);
        setRooms([]);
        setRoomAvailableCounts({});
      }
    })();
    return () => {
      canceled = true;
    };
  }, [selectedWard]);

  useEffect(() => {
    if (!selectedRoom) {
      setAvailableBeds([]);
      return;
    }
    let canceled = false;
    (async () => {
      try {
        const res = await fetchStaffBeds(selectedRoom);
        if (canceled) return;
        const blist: StaffBed[] = (res?.data || []).filter(
          (b) => String(b.status).toLowerCase() === 'available'
        );
        setAvailableBeds(blist);
        setSelectedBed((prev) => prev || blist[0]?.id || '');
      } catch (e) {
        console.error('Failed to load beds for room', e);
        setAvailableBeds([]);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [selectedRoom]);

  const canSubmit = useMemo(() => {
    return Boolean(
      bed?.patientId &&
        bed?.wardId &&
        bed?.roomId &&
        (bed as any)?.id &&
        selectedWard &&
        selectedRoom &&
        selectedBed
    );
  }, [bed, selectedWard, selectedRoom, selectedBed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        patientId: String(bed?.patientId || ''),
        fromWardId: String(bed?.wardId || ''),
        fromRoomId: String(bed?.roomId || ''),
        fromBedId: String((bed as any)?.id || ''),
        toWardId: String(selectedWard || ''),
        toRoomId: String(selectedRoom || ''),
        toBedId: String(selectedBed || ''),
        doctorId: String(selectedDoctorId || doctorOptions[0]?.value || ''),
        priority: 'MEDIUM',
        medicalNotes: String(reason || ''),
      };
      if (
        !payload.patientId ||
        !payload.fromWardId ||
        !payload.fromRoomId ||
        !payload.fromBedId ||
        !payload.toWardId ||
        !payload.toRoomId ||
        !payload.toBedId ||
        !payload.doctorId
      ) {
        toast.error('Missing required fields for bed change.');
        return;
      }

      const res = await submitStaffBedChange(payload);
      if (res?.success) {
        toast.success('Patient moved successfully!', {
          description: `${bed.patientName || 'Patient'} moved to the new bed`,
        });
        onOpenChange(false);
        setSelectedWard('');
        setSelectedRoom('');
        setSelectedBed('');
        setReason('');
      } else {
        toast.error('Failed to move patient', {
          description: String(res?.message || 'Unexpected error'),
        });
      }
    } catch (err: any) {
      toast.error('Failed to move patient', {
        description: String(err?.message || 'Unexpected error'),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Move Patient</DialogTitle>
          <DialogDescription>
            Transfer {bed.patientName} (ID: {bed.patientId}) to a different bed
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Current Bed Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Current Location:</strong> Bed #{bed.number}
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4 text-muted-foreground my-2">
            <div className="flex-1 border-t" />
            <ArrowRight className="h-5 w-5" />
            <div className="flex-1 border-t" />
          </div>

          {/* New Location Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ward">Select Ward *</Label>
              <Select value={selectedWard} onValueChange={setSelectedWard} required>
                <SelectTrigger id="ward">
                  <SelectValue placeholder="Choose ward" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {wards.length ? (
                    wards.map((ward) => (
                      <SelectItem key={ward.id} value={ward.id}>
                        {ward.wardName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No wards
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedWard && (
              <div className="space-y-2">
                <Label htmlFor="room">Select Room *</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom} required>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Choose room" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {rooms.length ? (
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} ({roomAvailableCounts[room.id] || 0} available)
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No rooms
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedRoom && (
              <div className="space-y-2">
                <Label htmlFor="bed">Select Bed *</Label>
                <Select value={selectedBed} onValueChange={setSelectedBed} required>
                  <SelectTrigger id="bed">
                    <SelectValue placeholder="Choose bed" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {availableBeds.length > 0 ? (
                      availableBeds.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          Bed #{b.bedNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No available beds
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Transfer</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for moving the patient..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Move Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
