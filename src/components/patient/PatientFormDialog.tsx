// components/PatientFormDialog.tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { UserCheck } from 'lucide-react';

type PatientFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: any; // If editing, patient data can be passed
};

export default function PatientFormDialog({ isOpen, onOpenChange, patient }: PatientFormDialogProps) {
  const [formData, setFormData] = useState({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    email: patient?.email || '',
    phone: patient?.phone || '',
    dob: patient?.dob || '',
    gender: patient?.gender || '',
    bloodGroup: patient?.bloodGroup || '',
    emergencyContact: patient?.emergencyContact || '',
    address: patient?.address || '',
    allergies: patient?.allergies || '',
    medicalHistory: patient?.medicalHistory || '',
  });

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit patient:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={value => handleChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={value => handleChange('bloodGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" value={formData.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Known Allergies</Label>
            <Textarea id="allergies" value={formData.allergies} onChange={e => handleChange('allergies', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea id="medicalHistory" value={formData.medicalHistory} onChange={e => handleChange('medicalHistory', e.target.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{patient ? 'Update Patient' : 'Add Patient'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
