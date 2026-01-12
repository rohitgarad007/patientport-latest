import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search, Calendar, Clock, User, Filter, MoreHorizontal, Edit, Trash2, Eye, Phone, CheckCircle, DollarSign, CalendarDays, Users, Home, Activity, Stethoscope } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup';
  symptoms: string;
  notes?: string;
  duration: number; // in minutes
  fee: number;
}

const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    patientName: 'Robert Davis',
    patientPhone: '+1-555-0005',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialization: 'Cardiology',
    date: '2024-01-16',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'consultation',
    symptoms: 'Chest pain, shortness of breath',
    notes: 'Regular checkup for cardiac health',
    duration: 30,
    fee: 200,
  },
  {
    id: 'a2',
    patientName: 'Lisa Thompson',
    patientPhone: '+1-555-0007',
    doctorName: 'Dr. Amanda Rodriguez',
    doctorSpecialization: 'Pediatrics',
    date: '2024-01-16',
    time: '2:00 PM',
    status: 'completed',
    type: 'follow_up',
    symptoms: 'Asthma symptoms',
    notes: 'Follow-up for asthma treatment',
    duration: 20,
    fee: 150,
  },
  {
    id: 'a3',
    patientName: 'John Wilson',
    patientPhone: '+1-555-0015',
    doctorName: 'Dr. James Wilson',
    doctorSpecialization: 'Orthopedic Surgery',
    date: '2024-01-17',
    time: '9:00 AM',
    status: 'scheduled',
    type: 'consultation',
    symptoms: 'Knee pain, difficulty walking',
    duration: 45,
    fee: 300,
  },
  {
    id: 'a4',
    patientName: 'Maria Garcia',
    patientPhone: '+1-555-0016',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialization: 'Cardiology',
    date: '2024-01-15',
    time: '3:00 PM',
    status: 'no_show',
    type: 'routine_checkup',
    symptoms: 'Routine cardiac checkup',
    duration: 30,
    fee: 200,
  },
];

export function HospitalAppointments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'follow_up': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'emergency': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'routine_checkup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || appointment.status === filterStatus;
    const matchesDoctor = !filterDoctor || appointment.doctorName === filterDoctor;
    
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const totalAppointments = mockAppointments.length;
  const scheduledAppointments = mockAppointments.filter(a => a.status === 'scheduled').length;
  const completedAppointments = mockAppointments.filter(a => a.status === 'completed').length;
  const totalRevenue = mockAppointments.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.fee, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Appointments</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">{totalAppointments}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">+15% from last month</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">Today's Schedule</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-200">{scheduledAppointments}</p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">+8% from yesterday</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Completed</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">{completedAppointments}</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">+12% from last week</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Revenue</p>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-200">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">+18% from last month</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="w-8 h-8 text-primary" />
              </div>
              Appointments Management
            </h1>
            <p className="text-muted-foreground mt-2">Schedule and manage patient appointments efficiently</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Plus className="w-4 h-4" />
                Schedule New Appointment
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1">Robert Davis</SelectItem>
                      <SelectItem value="p2">Lisa Thompson</SelectItem>
                      <SelectItem value="p3">John Wilson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d1">Dr. Michael Chen - Cardiology</SelectItem>
                      <SelectItem value="d2">Dr. Amanda Rodriguez - Pediatrics</SelectItem>
                      <SelectItem value="d3">Dr. James Wilson - Orthopedic Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="routine_checkup">Routine Checkup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" placeholder="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms/Reason</Label>
                <Textarea id="symptoms" placeholder="Describe the symptoms or reason for visit..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any additional notes..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Schedule Appointment</Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by patient or doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDoctor || 'all'} onValueChange={(v) => setFilterDoctor(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Doctors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    <SelectItem value="Dr. Michael Chen">Dr. Michael Chen</SelectItem>
                    <SelectItem value="Dr. Amanda Rodriguez">Dr. Amanda Rodriguez</SelectItem>
                    <SelectItem value="Dr. James Wilson">Dr. James Wilson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Calendar View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Appointment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appointment.patientPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appointment.doctorName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.doctorSpecialization}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{appointment.date}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(appointment.type)}>
                      {appointment.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>${appointment.fee}</TableCell>
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="w-4 h-4 mr-2" />
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel Appointment
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

        {/* Quick Actions & Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">8 appointments</div>
              <p className="text-sm text-blue-500">3 completed, 5 pending</p>
              <div className="mt-4 flex gap-2">
                <div className="h-2 bg-green-200 rounded flex-1"></div>
                <div className="h-2 bg-blue-200 rounded flex-1"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Pending Confirmations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">3 pending</div>
              <p className="text-sm text-orange-500">Require patient confirmation</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                Send Reminders
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">12 slots</div>
              <p className="text-sm text-green-500">Available for booking today</p>
              <Button variant="outline" size="sm" className="mt-3 w-full">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}