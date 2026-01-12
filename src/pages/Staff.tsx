import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Plus,
  Search,
  Phone,
  Mail,
  UserCog,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Shield,
  Clock,
  Building,
} from 'lucide-react';
import { mockHospitals } from '@/data/mockData';
import { StatCard } from '@/components/dashboard/StatCard';

// Mock staff data since it's not in the original mockData
const mockStaff = [
  {
    id: 'st1',
    name: 'Emily Johnson',
    email: 'emily.johnson@cityhospital.com',
    phone: '+1-555-0004',
    role: 'Nurse',
    department: 'Emergency',
    hospitalId: 'h1',
    experience: 5,
    shift: 'Day',
    status: 'active',
    hireDate: '2019-03-15',
  },
  {
    id: 'st2',
    name: 'Mark Thompson',
    email: 'mark.thompson@cityhospital.com',
    phone: '+1-555-0010',
    role: 'Receptionist',
    department: 'Front Desk',
    hospitalId: 'h1',
    experience: 3,
    shift: 'Day',
    status: 'active',
    hireDate: '2021-06-20',
  },
  {
    id: 'st3',
    name: 'Sarah Davis',
    email: 'sarah.davis@metromedical.com',
    phone: '+1-555-0011',
    role: 'Lab Technician',
    department: 'Laboratory',
    hospitalId: 'h2',
    experience: 7,
    shift: 'Night',
    status: 'active',
    hireDate: '2017-09-10',
  },
  {
    id: 'st4',
    name: 'James Wilson',
    email: 'james.wilson@cityhospital.com',
    phone: '+1-555-0012',
    role: 'Pharmacist',
    department: 'Pharmacy',
    hospitalId: 'h1',
    experience: 10,
    shift: 'Day',
    status: 'active',
    hireDate: '2014-02-28',
  },
];

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const roles = [...new Set(mockStaff.map(staff => staff.role))];
  const departments = [...new Set(mockStaff.map(staff => staff.department))];

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || staff.role === selectedRole;
    const matchesHospital = !selectedHospital || staff.hospitalId === selectedHospital;
    return matchesSearch && matchesRole && matchesHospital;
  });

  const avgExperience = mockStaff.reduce((sum, staff) => sum + staff.experience, 0) / mockStaff.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">
              Manage hospital staff and support personnel
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter staff details to add to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Smith" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="staff@hospital.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1-555-0000" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="lab-technician">Lab Technician</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="admin">Admin Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="front-desk">Front Desk</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hospital">Hospital</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHospitals.map(hospital => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Add Staff Member</Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Staff"
            value={mockStaff.length.toString()}
            description="Active staff members"
            icon={UserCog}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Departments"
            value={departments.length.toString()}
            description="Hospital departments"
            icon={Building}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Avg. Experience"
            value={`${Math.round(avgExperience)} years`}
            description="Staff experience"
            icon={Clock}
            trend={{ value: 2, isPositive: true }}
          />
          <StatCard
            title="Active Today"
            value={mockStaff.filter(s => s.shift === 'Day').length.toString()}
            description="Day shift staff"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  View and manage all staff members
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedHospital || 'all'} onValueChange={(v) => setSelectedHospital(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {mockHospitals.map(hospital => (
                      <SelectItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedRole || 'all'} onValueChange={(v) => setSelectedRole(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role & Department</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => {
                  const hospital = mockHospitals.find(h => h.id === staff.hospitalId);
                  return (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {staff.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {staff.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {staff.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {staff.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary">
                            {staff.role}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {staff.department}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {hospital?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {staff.experience} years
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={staff.shift === 'Day' ? 'border-yellow-500 text-yellow-700' : 'border-blue-500 text-blue-700'}
                        >
                          {staff.shift}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={staff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {staff.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" />
                              View Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Staff
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}