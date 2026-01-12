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
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Users,
  Stethoscope,
  UserCog,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Building,
} from 'lucide-react';
import { mockHospitals } from '@/data/mockData';
import { StatCard } from '@/components/dashboard/StatCard';

export default function Hospitals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredHospitals = mockHospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = mockHospitals.reduce(
    (acc, hospital) => ({
      patients: acc.patients + hospital.totalPatients,
      doctors: acc.doctors + hospital.totalDoctors,
      staff: acc.staff + hospital.totalStaff,
    }),
    { patients: 0, doctors: 0, staff: 0 }
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hospitals</h1>
            <p className="text-muted-foreground">
              Manage all hospitals in the healthcare network
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogDescription>
                  Enter hospital details to add to the network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Hospital Name</Label>
                  <Input id="name" placeholder="Enter hospital name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="hospital@email.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+1-555-0000" />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter complete address" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Add Hospital</Button>
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
            title="Total Hospitals"
            value={mockHospitals.length.toString()}
            description="Active hospitals"
            icon={Building}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Patients"
            value={totalStats.patients.toLocaleString()}
            description="Across all hospitals"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Doctors"
            value={totalStats.doctors.toString()}
            description="Medical professionals"
            icon={Stethoscope}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Total Staff"
            value={totalStats.staff.toString()}
            description="Support staff"
            icon={UserCog}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hospital Directory</CardTitle>
                <CardDescription>
                  View and manage all hospitals in the network
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search hospitals..."
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
                  <TableHead>Hospital</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Statistics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHospitals.map((hospital) => (
                  <TableRow key={hospital.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {hospital.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {hospital.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {hospital.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {hospital.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 text-sm">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="max-w-xs truncate">{hospital.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{hospital.totalPatients} Patients</div>
                        <div>{hospital.totalDoctors} Doctors</div>
                        <div>{hospital.totalStaff} Staff</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Hospital
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Hospital
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
    </DashboardLayout>
  );
}