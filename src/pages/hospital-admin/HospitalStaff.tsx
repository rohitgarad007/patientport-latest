import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail, Calendar, Building, Users, UserCheck, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { StatCard } from '@/components/dashboard/StatCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  shift: 'morning' | 'evening' | 'night';
  salary: number;
  avatar?: string;
}

const mockStaff: Staff[] = [
  {
    id: 's1',
    name: 'Emily Johnson',
    email: 'emily.johnson@cityhospital.com',
    phone: '+1-555-0004',
    department: 'Administration',
    position: 'Administrative Assistant',
    joinDate: '2023-03-15',
    status: 'active',
    shift: 'morning',
    salary: 45000,
  },
  {
    id: 's2',
    name: 'Robert Martinez',
    email: 'robert.martinez@cityhospital.com',
    phone: '+1-555-0011',
    department: 'Nursing',
    position: 'Head Nurse',
    joinDate: '2022-01-10',
    status: 'active',
    shift: 'morning',
    salary: 65000,
  },
  {
    id: 's3',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@cityhospital.com',
    phone: '+1-555-0012',
    department: 'Laboratory',
    position: 'Lab Technician',
    joinDate: '2023-06-20',
    status: 'active',
    shift: 'evening',
    salary: 55000,
  },
  {
    id: 's4',
    name: 'David Brown',
    email: 'david.brown@cityhospital.com',
    phone: '+1-555-0013',
    department: 'Pharmacy',
    position: 'Pharmacist',
    joinDate: '2021-09-05',
    status: 'on_leave',
    shift: 'morning',
    salary: 70000,
  },
  {
    id: 's5',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@cityhospital.com',
    phone: '+1-555-0014',
    department: 'Nursing',
    position: 'Staff Nurse',
    joinDate: '2023-08-12',
    status: 'active',
    shift: 'night',
    salary: 50000,
  },
];

export function HospitalStaff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredStaff = mockStaff.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || staff.department === filterDepartment;
    const matchesStatus = !filterStatus || staff.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'on_leave': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'evening': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'night': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalStaff = mockStaff.length;
  const activeStaff = mockStaff.filter(s => s.status === 'active').length;
  const departments = [...new Set(mockStaff.map(s => s.department))].length;
  const avgSalary = Math.round(mockStaff.reduce((sum, s) => sum + s.salary, 0) / totalStaff);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Staff"
          value={totalStaff}
          trend={{ value: 8, isPositive: true }}
          icon={Users}
        />
        <StatCard
          title="Active Staff"
          value={activeStaff}
          trend={{ value: 3, isPositive: true }}
          icon={UserCheck}
        />
        <StatCard
          title="Departments"
          value={departments}
          trend={{ value: 0, isPositive: true }}
          icon={Building}
        />
        <StatCard
          title="Avg Salary"
          value={`$${avgSalary.toLocaleString()}`}
          trend={{ value: 5, isPositive: true }}
          icon={DollarSign}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground">Manage hospital staff, departments, and schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john.smith@hospital.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1-555-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" placeholder="Staff Nurse" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input id="salary" type="number" placeholder="50000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input id="joinDate" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Staff Member</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search staff by name, department, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterDepartment || 'all'} onValueChange={(v) => setFilterDepartment(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Administration">Administration</SelectItem>
                <SelectItem value="Nursing">Nursing</SelectItem>
                <SelectItem value="Laboratory">Laboratory</SelectItem>
                <SelectItem value="Pharmacy">Pharmacy</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={staff.avatar} />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{staff.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>{staff.position}</TableCell>
                  <TableCell>
                    <Badge className={getShiftColor(staff.shift)}>
                      {staff.shift.charAt(0).toUpperCase() + staff.shift.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>${staff.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(staff.status)}>
                      {staff.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-4 h-4 mr-2" />
                          Manage Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}