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
  MapPin,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Stethoscope,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { mockDoctors, mockHospitals } from '@/data/mockData';
import { StatCard } from '@/components/dashboard/StatCard';

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const specializations = [...new Set(mockDoctors.map(doc => doc.specialization))];

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = !selectedSpecialization || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const avgConsultationFee = mockDoctors.reduce((sum, doc) => sum + doc.consultationFee, 0) / mockDoctors.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
            <p className="text-muted-foreground">
              Manage medical professionals across all hospitals
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>
                  Enter doctor details to add to the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Dr. John Smith" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="doctor@hospital.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1-555-0000" />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
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
                <div>
                  <Label htmlFor="fee">Consultation Fee ($)</Label>
                  <Input id="fee" type="number" placeholder="200" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Add Doctor</Button>
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
            title="Total Doctors"
            value={mockDoctors.length.toString()}
            description="Active medical professionals"
            icon={Stethoscope}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Specializations"
            value={specializations.length.toString()}
            description="Medical specialties"
            icon={GraduationCap}
            trend={{ value: 2, isPositive: true }}
          />
          <StatCard
            title="Avg. Experience"
            value={`${Math.round(mockDoctors.reduce((sum, doc) => sum + doc.experience, 0) / mockDoctors.length)} years`}
            description="Professional experience"
            icon={Clock}
            trend={{ value: 3, isPositive: true }}
          />
          <StatCard
            title="Avg. Fee"
            value={`$${Math.round(avgConsultationFee)}`}
            description="Consultation fee"
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Doctor Directory</CardTitle>
                <CardDescription>
                  View and manage all doctors in the network
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedSpecialization || 'all'} onValueChange={(v) => setSelectedSpecialization(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Specializations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search doctors..."
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
                  <TableHead>Doctor</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor) => {
                  const hospital = mockHospitals.find(h => h.id === doctor.hospitalId);
                  return (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {doctor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">
                              {doctor.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {doctor.qualification}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {doctor.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {doctor.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {doctor.specialization}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {doctor.experience} years
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {hospital?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doctor.availability.length} days/week
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="w-3 h-3" />
                          {doctor.consultationFee}
                        </div>
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
                              Edit Doctor
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Doctor
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