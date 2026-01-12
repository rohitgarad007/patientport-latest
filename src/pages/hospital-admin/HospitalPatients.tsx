import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Activity,
  Stethoscope,
  UserCheck,
  Home,
  ChevronRight
} from 'lucide-react';
import { mockPatients } from '@/data/mockData';

export function HospitalPatients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === 'active';
    return matchesSearch && matchesStatus;
  });

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-100 text-red-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-100 text-purple-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-100 text-green-800',
    };
    return colors[bloodGroup as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

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
                <Users className="w-4 h-4" />
                Patient Management
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-8 h-8 text-primary" />
              </div>
              Patient Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor patient information and medical records
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <Plus className="w-4 h-4" />
                  Add New Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-primary" />
                    Add New Patient
                  </DialogTitle>
                </DialogHeader>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Enter first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Enter last name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="patient@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select>
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
                      <Select>
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
                      <Input id="emergencyContact" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="Enter full address" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Textarea id="allergies" placeholder="List any known allergies" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalHistory">Medical History</Label>
                    <Textarea id="medicalHistory" placeholder="Brief medical history" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Patient</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Patients</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-200">{mockPatients.length}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">+5.2% from last month</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-300">New This Month</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-200">24</p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">+12.5% from last month</p>
                </div>
                <div className="p-3 bg-green-500 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-300">Critical Cases</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-200">7</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">Requiring attention</p>
                </div>
                <div className="p-3 bg-red-500 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Active Treatment</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-200">42</p>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">Currently receiving care</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-full">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Controls */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Patients ({filteredPatients.length})
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent (24)
              </TabsTrigger>
              <TabsTrigger value="critical" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical (7)
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedPatients.map((patient) => (
                  <Card key={patient.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 border-2 border-primary/20">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                                {getPatientInitials(patient.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                              {patient.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              ID: #{patient.id.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Patient
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Medical Records
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove Patient
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{patient.phone}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="outline" className={`${getBloodGroupColor(patient.bloodGroup)} border-0`}>
                            <Heart className="w-3 h-3 mr-1" />
                            {patient.bloodGroup}
                          </Badge>
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                          </Badge>
                          <Badge variant="outline" className="border-primary/20 text-primary">
                            {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
                          </Badge>
                        </div>
                        
                        {patient.allergies.length > 0 && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div className="text-sm">
                              <span className="font-medium text-amber-700 dark:text-amber-300">Allergies: </span>
                              <span className="text-amber-600 dark:text-amber-400">{patient.allergies.join(', ')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Stethoscope className="w-4 h-4 mr-2" />
                          Records
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Patient</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Age/Gender</TableHead>
                        <TableHead className="font-semibold">Blood Group</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPatients.map((patient) => (
                        <TableRow key={patient.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {getPatientInitials(patient.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{patient.name}</p>
                                <p className="text-sm text-muted-foreground">ID: #{patient.id.toUpperCase()}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{patient.email}</p>
                              <p className="text-sm text-muted-foreground">{patient.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years</p>
                              <p className="text-sm text-muted-foreground capitalize">{patient.gender}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getBloodGroupColor(patient.bloodGroup)}>
                              {patient.bloodGroup}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              Active
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
                                <DropdownMenuItem onClick={() => setSelectedPatient(patient)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Patient
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Medical Records
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove Patient
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
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} patients
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                        className="w-8 h-8 p-0"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                  <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">Recent Patients</h3>
                <p className="text-muted-foreground mb-4">Patients registered in the last 30 days</p>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">24 New Patients</div>
                <p className="text-sm text-muted-foreground">View detailed list of recently admitted patients</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="critical" className="space-y-6">
            <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
              <CardContent className="p-8 text-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full w-fit mx-auto mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">Critical Patients</h3>
                <p className="text-muted-foreground mb-4">Patients requiring immediate medical attention</p>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">7 Critical Cases</div>
                <p className="text-sm text-muted-foreground">Monitor and manage high-priority patient cases</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Details Dialog */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Patient Details
              </DialogTitle>
            </DialogHeader>
            {selectedPatient && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="text-center">
                      <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-2xl">
                          {getPatientInitials(selectedPatient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-bold text-xl">{selectedPatient.name}</h3>
                      <p className="text-muted-foreground">Patient ID: #{selectedPatient.id.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-foreground">{selectedPatient.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-foreground">{selectedPatient.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-foreground">{selectedPatient.dateOfBirth}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Age</label>
                        <p className="text-foreground">{new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="text-foreground capitalize">{selectedPatient.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                        <Badge className={getBloodGroupColor(selectedPatient.bloodGroup)}>
                          {selectedPatient.bloodGroup}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Known Allergies
                    </h4>
                    {selectedPatient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.allergies.map((allergy: string, index: number) => (
                          <Badge key={index} variant="destructive" className="bg-red-100 text-red-700">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No known allergies</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      Emergency Contact
                    </h4>
                    <p className="text-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">John Doe (Spouse)</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}