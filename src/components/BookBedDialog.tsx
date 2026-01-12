import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bed } from '@/types/bedManagement';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';
import {
  fetchStaffDoctorOptions,
  fetchStaffEventTypeList,
  fetchStaffActivityTypeList,
  fetchStaffPatientOptions,
  fetchStaffPatientStatusOptions,
  submitStaffBedBooking,
} from '@/services/SfstaffRoomService';

interface BookBedDialogProps {
  bed: Bed & { wardId?: string; roomId?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BookBedDialog = ({ bed, open, onOpenChange }: BookBedDialogProps) => {
  const [patientSearch, setPatientSearch] = useState('');
  const [patientOptions, setPatientOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [doctorOptions, setDoctorOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [activityTypes, setActivityTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [eventTypes, setEventTypes] = useState<Array<{ value: string; label: string }>>([]);
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const [formData, setFormData] = useState({
    admissionDate: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    activityTypeId: '',
    eventTypeId: '',
  });

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [docRes, actRes, evtRes, statusRes] = await Promise.all([
          fetchStaffDoctorOptions(),
          fetchStaffActivityTypeList(),
          fetchStaffEventTypeList(),
          fetchStaffPatientStatusOptions(),
        ]);
        setDoctorOptions(docRes?.data || []);
        setActivityTypes(actRes?.data || []);
        setEventTypes(evtRes?.data || []);
        setStatusOptions(statusRes?.data || []);
      } catch (e) {
        console.error('Failed to load booking options', e);
      }
    })();
  }, [open]);

  useEffect(() => {
    const q = patientSearch.trim();
    if (!open) return;
    if (q.length < 2) {
      setPatientOptions([]);
      return;
    }
    let canceled = false;
    (async () => {
      try {
        const res = await fetchStaffPatientOptions(q);
        if (!canceled) setPatientOptions(res?.data || []);
      } catch (e) {
        if (!canceled) setPatientOptions([]);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [patientSearch, open]);

  const canSubmit = useMemo(() => {
    return Boolean(selectedPatientId && selectedDoctorId && bed?.wardId && bed?.roomId && bed?.id);
  }, [selectedPatientId, selectedDoctorId, bed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('Please fill required fields');
      return;
    }
    try {
      const res = await submitStaffBedBooking({
        patientId: selectedPatientId,
        wardId: String(bed.wardId || ''),
        roomId: String(bed.roomId || ''),
        bedId: String(bed.id || ''),
        doctorId: selectedDoctorId,
        activityTypeId: formData.activityTypeId || undefined,
        currentStatus: currentStatus || undefined,
        priority,
        medicalNotes: formData.notes || undefined,
      });
      if (res?.success) {
        toast.success('Bed booked successfully!', {
          description: `Bed #${bed.number} has been assigned`,
        });
        onOpenChange(false);
        // Optional: refresh after short delay
        setTimeout(() => {
          try { window.location.reload(); } catch {}
        }, 800);
      } else {
        throw new Error(res?.message || 'Booking failed');
      }
    } catch (err: any) {
      toast.error('Booking failed', { description: err?.message || 'Could not submit booking' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Bed #{bed.number}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient search + select */}
            <div className="sm:col-span-2 space-y-2">
              <Label>Search Patient *</Label>
              <Input
                placeholder="Type at least 2 characters..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Select Patient *</Label>
              <Select value={selectedPatientId} onValueChange={(v) => setSelectedPatientId(v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-64">
                  {patientOptions.length ? (
                    patientOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No results</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor */}
            <div className="space-y-2">
              <Label>Attending Doctor *</Label>
              <Select value={selectedDoctorId} onValueChange={(v) => setSelectedDoctorId(v)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose doctor" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-64">
                  {doctorOptions.length ? (
                    doctorOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No doctors</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type */}
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <Select value={formData.activityTypeId} onValueChange={(v) => setFormData({ ...formData, activityTypeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-64">
                  {activityTypes.length ? (
                    activityTypes.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No activities</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Status */}
            <div className="space-y-2">
              <Label>Patient Status</Label>
              <Select value={currentStatus} onValueChange={(v) => setCurrentStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50 max-h-64">
                  {statusOptions.length ? (
                    statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No options</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="URGENT">URGENT</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="LOW">LOW</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admission Date */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="admissionDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Admission Date *
              </Label>
              <Input
                id="admissionDate"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                required
              />
            </div>

            {/* Diagnosis */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                placeholder="Enter diagnosis"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>Book Bed</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
