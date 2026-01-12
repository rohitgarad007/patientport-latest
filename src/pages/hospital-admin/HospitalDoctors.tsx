import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail, Calendar, MapPin, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/dashboard/StatCard';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  qualification: string;
  availability: string[];
  consultationFee: number;
  status: 'active' | 'inactive' | 'on_leave';
  patientsCount: number;
  rating: number;
  nextAvailable: string;
  avatar?: string;
}

const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@cityhospital.com',
    phone: '+1-555-0003',
    specialization: 'Cardiology',
    experience: 12,
    qualification: 'MD, FACC',
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    consultationFee: 200,
    status: 'active',
    patientsCount: 156,
    rating: 4.8,
    nextAvailable: '2024-01-16 10:00 AM',
  },
  {
    id: 'd2',
    name: 'Dr. Amanda Rodriguez',
    email: 'amanda.rodriguez@cityhospital.com',
    phone: '+1-555-0009',
    specialization: 'Pediatrics',
    experience: 8,
    qualification: 'MD, AAP',
    availability: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    consultationFee: 150,
    status: 'active',
    patientsCount: 203,
    rating: 4.9,
    nextAvailable: '2024-01-16 2:00 PM',
  },
  {
    id: 'd3',
    name: 'Dr. James Wilson',
    email: 'james.wilson@cityhospital.com',
    phone: '+1-555-0010',
    specialization: 'Orthopedic Surgery',
    experience: 15,
    qualification: 'MD, FAAOS',
    availability: ['Tuesday', 'Thursday', 'Saturday'],
    consultationFee: 300,
    status: 'on_leave',
    patientsCount: 89,
    rating: 4.7,
    nextAvailable: '2024-01-20 9:00 AM',
  },
];

export function HospitalDoctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !filterSpecialization || doctor.specialization === filterSpecialization;
    const matchesStatus = !filterStatus || doctor.status === filterStatus;
    
    return matchesSearch && matchesSpecialization && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'on_leave': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalDoctors = mockDoctors.length;
  const activeDoctors = mockDoctors.filter(d => d.status === 'active').length;
  const avgRating = (mockDoctors.reduce((sum, d) => sum + d.rating, 0) / totalDoctors).toFixed(1);
  const totalPatients = mockDoctors.reduce((sum, d) => sum + d.patientsCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Doctors"
          value={totalDoctors}
          trend={{ value: 12, isPositive: true }}
          icon={Users}
        />
        <StatCard
          title="Active Doctors"
          value={activeDoctors}
          trend={{ value: 5, isPositive: true }}
          icon={Users}
        />
        <StatCard
          title="Average Rating"
          value={avgRating}
          trend={{ value: 0.2, isPositive: true }}
          icon={Users}
        />
        <StatCard
          title="Total Patients"
          value={totalPatients}
          trend={{ value: 8, isPositive: true }}
          icon={Heart}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors Management</h1>
          <p className="text-muted-foreground">Manage hospital doctors, schedules, and availability</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Dr. John Smith" />
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
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedic">Orthopedic Surgery</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input id="experience" type="number" placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation Fee</Label>
                  <Input id="fee" type="number" placeholder="150" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" placeholder="MD, FACC" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Textarea id="availability" placeholder="Monday, Wednesday, Friday - 9 AM to 5 PM" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Doctor</Button>
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
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterSpecialization || 'all'} onValueChange={(v) => setFilterSpecialization(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="Cardiology">Cardiology</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                <SelectItem value="Orthopedic Surgery">Orthopedic Surgery</SelectItem>
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

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={doctor.avatar} />
                    <AvatarFallback>{doctor.name.charAt(3) + doctor.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{doctor.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                  </div>
                </div>
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
                      Remove Doctor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(doctor.status)}>
                  {doctor.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>⭐</span>
                  <span>{doctor.rating}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.experience} years experience</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">{doctor.patientsCount}</p>
                  <p className="text-xs text-muted-foreground">Patients</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground">${doctor.consultationFee}</p>
                  <p className="text-xs text-muted-foreground">Consultation</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Next Available</p>
                  <p className="text-xs font-medium">{doctor.nextAvailable}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}