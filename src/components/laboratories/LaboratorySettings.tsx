import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Building2, 
  User, 
  Bell, 
  Printer, 
  Shield,
  Save,
  Plus,
  Edit2,
  Trash2,
  Key,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
}

export default function LaboratorySettings() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [users, setUsers] = useState<UserData[]>([
    { id: '1', name: 'John Doe', role: 'Lab Technician', email: 'john@labflow.com', phone: '+1-555-0001', active: true },
    { id: '2', name: 'Jane Smith', role: 'Pathologist', email: 'jane@labflow.com', phone: '+1-555-0002', active: true },
    { id: '3', name: 'Mike Johnson', role: 'Receptionist', email: 'mike@labflow.com', phone: '+1-555-0003', active: true },
    { id: '4', name: 'Sarah Williams', role: 'Admin', email: 'sarah@labflow.com', phone: '+1-555-0004', active: false },
  ]);

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('User deleted successfully');
    setShowDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen">
      
      
      <div className="p-4 lg:p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" /> Lab Info
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <User className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="print" className="gap-2">
              <Printer className="h-4 w-4" /> Print
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <LabInfoSettings />
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-lg">User Management</h2>
                  <p className="text-sm text-muted-foreground">Manage lab staff accounts and permissions</p>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setShowAddUser(true)}>
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
              
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className={cn(
                      'flex items-center justify-between p-4 bg-muted/30 rounded-lg',
                      !user.active && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {!user.active && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm bg-muted px-2 py-1 rounded">{user.role}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteConfirm(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="print">
            <PrintSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <UserForm 
            onClose={() => setShowAddUser(false)} 
            onSave={(user) => {
              setUsers([...users, { ...user, id: String(users.length + 1), active: true }]);
              setShowAddUser(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm 
              user={editingUser}
              onClose={() => setEditingUser(null)} 
              onSave={(updatedUser) => {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updatedUser } : u));
                setEditingUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDeleteUser(showDeleteConfirm!)}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabInfoSettings() {
  const [labName, setLabName] = useState('LabFlow Diagnostics');
  const [regNumber, setRegNumber] = useState('NABL-12345');
  const [address, setAddress] = useState('123 Medical Center Road, Healthcare District');
  const [phone, setPhone] = useState('1800-123-4567');
  const [email, setEmail] = useState('info@labflow.com');
  const [website, setWebsite] = useState('www.labflow.com');
  const [gstNumber, setGstNumber] = useState('29ABCDE1234F1Z5');

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Laboratory Information</h2>
        <p className="text-sm text-muted-foreground">Basic details about your laboratory</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Laboratory Name</label>
          <Input value={labName} onChange={(e) => setLabName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Registration Number</label>
          <Input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Address</label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Phone</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Website</label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">GST Number</label>
          <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function UserForm({ user, onClose, onSave }: { 
  user?: UserData; 
  onClose: () => void; 
  onSave: (user: Omit<UserData, 'id' | 'active'>) => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState(user?.role || '');

  const handleSubmit = () => {
    if (!name || !email || !role) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave({ name, email, phone, role });
    toast.success(user ? 'User updated successfully' : 'User added successfully');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Full Name *</label>
        <Input 
          placeholder="Enter full name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Email *</label>
        <Input 
          type="email"
          placeholder="email@labflow.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Phone</label>
        <Input 
          placeholder="+1-555-0000" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Role *</label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Pathologist">Pathologist</SelectItem>
            <SelectItem value="Lab Technician">Lab Technician</SelectItem>
            <SelectItem value="Receptionist">Receptionist</SelectItem>
            <SelectItem value="Phlebotomist">Phlebotomist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} className="gap-2">
          <Save className="h-4 w-4" />
          {user ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState([
    { id: 'critical', label: 'Critical value alerts', description: 'Get notified immediately for critical test results', enabled: true },
    { id: 'report', label: 'Report ready notifications', description: 'Notify patients when their reports are ready', enabled: true },
    { id: 'payment', label: 'Payment reminders', description: 'Send reminders for pending payments', enabled: false },
    { id: 'tat', label: 'TAT breach alerts', description: 'Alert when turnaround time is about to breach', enabled: true },
    { id: 'sms', label: 'SMS notifications', description: 'Send SMS for important updates', enabled: true },
    { id: 'email', label: 'Email notifications', description: 'Send email for reports and updates', enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Setting updated');
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground">Configure how and when you receive notifications</p>
      </div>
      
      <div className="space-y-4">
        {settings.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch 
              checked={item.enabled} 
              onCheckedChange={() => toggleSetting(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PrintSettings() {
  const [paperSize, setPaperSize] = useState('a4');
  const [barcodeType, setBarcodeType] = useState('code128');
  const [settings, setSettings] = useState([
    { id: 'logo', label: 'Print logo on reports', enabled: true },
    { id: 'qr', label: 'Include QR code verification', enabled: true },
    { id: 'autoprint', label: 'Auto-print receipts', enabled: false },
    { id: 'header', label: 'Print header on each page', enabled: true },
    { id: 'footer', label: 'Print page numbers', enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Setting updated');
  };

  const handleSave = () => {
    toast.success('Print settings saved');
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Print Settings</h2>
        <p className="text-sm text-muted-foreground">Configure printing preferences for reports and labels</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Default Paper Size</label>
          <Select value={paperSize} onValueChange={setPaperSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="a5">A5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Barcode Type</label>
          <Select value={barcodeType} onValueChange={setBarcodeType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code128">Code 128</SelectItem>
              <SelectItem value="qrcode">QR Code</SelectItem>
              <SelectItem value="code39">Code 39</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <span className="font-medium">{item.label}</span>
            <Switch 
              checked={item.enabled}
              onCheckedChange={() => toggleSetting(item.id)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [settings, setSettings] = useState([
    { id: '2fa', label: 'Two-factor authentication', description: 'Require 2FA for all users', enabled: false },
    { id: 'timeout', label: 'Session timeout', description: 'Auto-logout after 30 minutes of inactivity', enabled: true },
    { id: 'audit', label: 'Audit logging', description: 'Log all user actions for compliance', enabled: true },
    { id: 'ip', label: 'IP whitelisting', description: 'Restrict access to specific IP addresses', enabled: false },
    { id: 'password', label: 'Strong password policy', description: 'Require complex passwords with special characters', enabled: true },
    { id: 'lockout', label: 'Account lockout', description: 'Lock account after 5 failed login attempts', enabled: true },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Security setting updated');
  };

  const handleSave = () => {
    toast.success('Security settings saved');
  };

  return (
    <div className="bg-card rounded-xl border p-6 space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Security Settings</h2>
        <p className="text-sm text-muted-foreground">Configure security and access control settings</p>
      </div>
      
      <div className="space-y-4">
        {settings.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch 
              checked={item.enabled}
              onCheckedChange={() => toggleSetting(item.id)}
            />
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Key className="h-4 w-4" />
          Password Policy
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Minimum Length</label>
            <Input type="number" defaultValue="8" min="6" max="32" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Password Expiry (days)</label>
            <Input type="number" defaultValue="90" min="30" max="365" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
