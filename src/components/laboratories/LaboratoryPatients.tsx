import { useState } from 'react';
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  MapPin,
  User,
  Calendar,
  FileText,
  Edit2,
  Trash2,
  History,
  Download,
  Eye,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { patients, orders, Patient } from '@/data/dummyData';
import { StatusBadge } from '@/components/ui/status-badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LaboratoryPatients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingHistory, setViewingHistory] = useState<Patient | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePatient = (patientId: string) => {
    toast.success('Patient deleted successfully');
    setShowDeleteConfirm(null);
  };

  const handleExport = () => {
    toast.success('Export started', {
      description: 'Patient data will be downloaded as CSV'
    });
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-primary">{patients.length}</p>
            <p className="text-xs text-muted-foreground">Total Patients</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-success">
              {patients.filter(p => orders.some(o => o.patientId === p.id)).length}
            </p>
            <p className="text-xs text-muted-foreground">Active Patients</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-warning">
              {patients.filter(p => p.gender === 'Male').length}
            </p>
            <p className="text-xs text-muted-foreground">Male</p>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <p className="text-2xl font-bold text-info">
              {patients.filter(p => p.gender === 'Female').length}
            </p>
            <p className="text-xs text-muted-foreground">Female</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search patients by name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <PatientForm onClose={() => setShowAddPatient(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => {
            const patientOrders = orders.filter(o => o.patientId === patient.id);
            
            return (
              <div key={patient.id} className="bg-card rounded-xl border p-4 hover:shadow-lg transition-shadow group">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} years / {patient.gender}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => setEditingPatient(patient)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-destructive"
                      onClick={() => setShowDeleteConfirm(patient.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{patientOrders.length} orders</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewingHistory(patient)}
                  >
                    <History className="h-4 w-4 mr-1" />
                    View History
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredPatients.length === 0 && (
          <div className="bg-card rounded-xl border p-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No patients found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search query</p>
          </div>
        )}
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={!!editingPatient} onOpenChange={() => setEditingPatient(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Patient - {editingPatient?.name}</DialogTitle>
          </DialogHeader>
          {editingPatient && <PatientForm patient={editingPatient} onClose={() => setEditingPatient(null)} />}
        </DialogContent>
      </Dialog>

      {/* Patient History Dialog */}
      <Dialog open={!!viewingHistory} onOpenChange={() => setViewingHistory(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient History - {viewingHistory?.name}</DialogTitle>
          </DialogHeader>
          {viewingHistory && <PatientHistory patient={viewingHistory} />}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this patient? This action cannot be undone and will also delete all associated records.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeletePatient(showDeleteConfirm!)}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PatientForm({ patient, onClose }: { patient?: Patient; onClose: () => void }) {
  const [name, setName] = useState(patient?.name || '');
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState(patient?.email || '');
  const [age, setAge] = useState(patient?.age?.toString() || '');
  const [gender, setGender] = useState(patient?.gender || '');
  const [address, setAddress] = useState(patient?.address || '');

  const handleSave = () => {
    if (!name.trim() || !phone.trim() || !age || !gender) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(patient ? 'Patient updated successfully' : 'Patient added successfully');
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium mb-2 block">Full Name *</label>
          <Input 
            placeholder="Enter full name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Phone *</label>
          <Input 
            placeholder="+1-555-0000" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input 
            placeholder="email@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Age *</label>
          <Input 
            type="number" 
            placeholder="25" 
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Gender *</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Address</label>
        <Input 
          placeholder="Enter address" 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          {patient ? 'Update Patient' : 'Add Patient'}
        </Button>
      </div>
    </div>
  );
}

function PatientHistory({ patient }: { patient: Patient }) {
  const patientOrders = orders.filter(o => o.patientId === patient.id);

  return (
    <div className="space-y-4">
      {/* Patient Info Summary */}
      <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Age/Gender</p>
          <p className="font-medium">{patient.age} years / {patient.gender}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Phone</p>
          <p className="font-medium">{patient.phone}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{patient.email}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Orders</p>
          <p className="font-medium">{patientOrders.length}</p>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h4 className="font-medium mb-3">Order History</h4>
        {patientOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No orders found for this patient</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientOrders.map(order => (
              <div key={order.id} className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary font-medium">{order.orderId}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.doctor.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalAmount}</p>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {order.tests.map((test, idx) => (
                    <span key={idx} className="text-xs bg-background px-2 py-1 rounded">
                      {test.testName}
                    </span>
                  ))}
                </div>
                {order.tests.some(t => t.results?.some(r => r.flag !== 'Normal')) && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium text-warning mb-2">Abnormal Results:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.tests.flatMap(t => 
                        t.results?.filter(r => r.flag !== 'Normal').map((r, idx) => (
                          <span 
                            key={idx} 
                            className={cn(
                              'text-xs px-2 py-1 rounded',
                              r.flag === 'Critical' && 'bg-critical/10 text-critical',
                              r.flag === 'High' && 'bg-warning/10 text-warning',
                              r.flag === 'Low' && 'bg-info/10 text-info'
                            )}
                          >
                            {r.parameterName}: {r.value} {r.unit} ({r.flag})
                          </span>
                        )) || []
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
