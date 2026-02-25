import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Grid, List, UserPlus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import HSPatientFormDialog from "@/components/patient/HSPatientFormDialog";
import { fetchStaffPatients, StaffPatient, addStaffPatient, updateStaffPatient, changeStaffPatientStatus } from "@/services/SfstaffPatientService";
import { PaIcons } from "@/components/icons/PaIcons";
// Swal removed as staff cannot delete patients


export default function StaffPatientList() {

  const [searchQuery, setSearchQuery] = useState('');
  // Default view: grid on mobile (<md), list on md and larger
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches ? 'list' : 'grid';
    }
    return 'list';
  });
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 10;

  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const [patients, setPatients] = useState<StaffPatient[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string | number | undefined) => {
    switch (status) {
      case 'Active':
        return 'bg-success text-success-foreground';
      case 'Critical':
        return 'bg-destructive text-destructive-foreground';
      case 'Inactive':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years} Years ${months} Months ${days} Days`;
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchStaffPatients(currentPage, patientsPerPage, searchQuery.trim());
      if (result.success) {
        setPatients(result.data);
        setTotal(result.total || result.data.length || 0);
      } else {
        setPatients([]);
        setTotal(0);
        setError('Failed to fetch patient list');
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch patient list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery]);

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      'A+': 'bg-red-100 text-red-800',
      'A-': 'bg-red-100 text-red-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B-': 'bg-blue-100 text-blue-800',
      'AB+': 'bg-purple-100 text-purple-800',
      'AB-': 'bg-purple-100 text-purple-800',
      'O+': 'bg-green-100 text-green-800',
      'O-': 'bg-green-100 text-green-800',
    };
    return colors[String(bloodGroup)] || 'bg-gray-100 text-gray-800';
  };

  const filteredPatients = useMemo(() => {
    const out = patients.filter((patient) => {
      const matchesGender = filterGender === 'all' || (patient.gender ?? '').toLowerCase() === filterGender.toLowerCase();
      const statusStr = typeof patient.status === 'number' ? String(patient.status) : String(patient.status ?? '');
      const matchesStatus = filterStatus === 'all' || statusStr.toLowerCase() === filterStatus.toLowerCase();
      return matchesGender && matchesStatus;
    });
    out.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return String(a.fullname ?? '').localeCompare(String(b.fullname ?? ''));
        case 'recent':
          // No lastVisit data in staff list; keep as alphabetical fallback
          return String(a.fullname ?? '').localeCompare(String(b.fullname ?? ''));
        case 'age':
          const aAge = Number(calculateAge(a.dob));
          const bAge = Number(calculateAge(b.dob));
          return (isNaN(aAge) ? 0 : aAge) - (isNaN(bAge) ? 0 : bAge);
        default:
          return 0;
      }
    });
    return out;
  }, [patients, filterGender, filterStatus, sortBy]);

  // Server-side pagination: backend already returns the current page items.
  // Do not slice again on the client; just display filteredPatients.
  const totalPages = Math.ceil((total || patients.length || 0) / patientsPerPage) || 1;
  const displayPatients = filteredPatients;

  const handleSubmitPatient = async (formData: any) => {
    try {
      if (editingPatient?.patient_uid) {
        await updateStaffPatient(editingPatient.patient_uid, formData);
      } else {
        await addStaffPatient(formData);
      }
      await loadPatients();
      setEditingPatient(null);
      setIsPatientDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (patient_uid: string, newStatus: 'active' | 'inactive') => {
    try {
      await changeStaffPatientStatus(patient_uid, newStatus);
      const statusValue = newStatus === 'active' ? 1 : 0;
      setPatients((prev) => prev.map((p) => p.patient_uid === patient_uid ? { ...p, status: statusValue } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Staff does not have permission to remove patients; deletion handler removed.


  return (
    
    <div className="space-y-6">
      

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div>
          <h1 className="text-base leading-6 sm:text-lg sm:leading-6 md:text-2xl md:leading-8 font-bold text-foreground pb-2 md:pb-4">
            Patient List
          </h1>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, patient ID, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="sm:w-auto" onClick={() => {
              setEditingPatient(null);
              setIsPatientDialogOpen(true);
            }} >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Patient
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort: {sortBy === 'name' ? 'A-Z' : sortBy === 'recent' ? 'Recent' : 'Age'}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('recent')}>
                  Recent Activity
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('age')}>Age</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading patients…' : `Showing ${displayPatients.length} of ${total || patients.length} patients`}
          </p>
          {error && (
            <p className="text-sm text-destructive mt-1">{error}</p>
          )}
        </div>

        {/* Patient List/Grid View */}
        {viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age/Gender</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayPatients.map((patient) => (
                    <TableRow key={patient.patient_uid} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {getInitials(String(patient.fullname ?? ''))}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{patient.fullname}</div>
                            <div className="text-sm text-muted-foreground font-mono">{patient.patient_uid}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <img src={PaIcons.email} alt="Email" className="w-4 h-4" />
                            {patient.email || '-'}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <img src={PaIcons.phone} alt="Phone" className="w-4 h-4" />
                            {patient.phone || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <img src={PaIcons.age} alt="Age" className="w-6 h-6" />
                            {calculateAge(patient.dob)}
                          </div>
                          <div className="flex items-center gap-1 text-sm" style={{ textTransform: 'capitalize' }}>
                            <img src={PaIcons.gender} alt="Gender" className="w-6 h-6" />
                            {patient.gender || '-'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBloodGroupColor(String(patient.bloodGroup || ''))}>
                          {patient.bloodGroup || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${String(patient.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {String(patient.status) === '1' ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <img src={PaIcons.setting} alt="More" className="w-6 h-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {String(patient.status) === '1' ? (
                              <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, 'inactive')}>
                                <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, 'active')}>
                                <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => { setEditingPatient(patient); setIsPatientDialogOpen(true); }}>
                              <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" /> Edit Patient
                            </DropdownMenuItem>
                            {/* Remove Patient action hidden for staff */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayPatients.map((patient) => (
              <Card key={patient.patient_uid} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                          {getInitials(String(patient.fullname ?? ''))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{patient.fullname}</h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {patient.patient_uid}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Age/Gender:</span>
                      <span className="font-medium" style={{ textTransform: 'capitalize' }}>
                        {calculateAge(patient.dob)} / {patient.gender || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{patient.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Visit:</span>
                      <span className="font-medium">—</span>
                    </div>
                  </div>

                  {/* Footer actions: status + menu moved here; View Details removed */}
                  <div className="flex items-center justify-between mt-2">
                    <Badge
                      variant="secondary"
                      className={`${String(patient.status) === '1' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {String(patient.status) === '1' ? 'Active' : 'Inactive'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <img src={PaIcons.setting} alt="More" className="w-6 h-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {String(patient.status) === '1' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, 'inactive')}>
                            <img src={PaIcons.red} alt="Inactive" className="w-3 h-3 mr-2" /> Set Inactive
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(patient.patient_uid, 'active')}>
                            <img src={PaIcons.green} alt="Active" className="w-3 h-3 mr-2" /> Set Active
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => { setEditingPatient(patient); setIsPatientDialogOpen(true); }}>
                          <img src={PaIcons.edit} alt="Edit" className="w-4 h-4 mr-2" /> Edit Patient
                        </DropdownMenuItem>
                        {/* Remove Patient action hidden for staff */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </main>


      <HSPatientFormDialog
        open={isPatientDialogOpen}
        onOpenChange={setIsPatientDialogOpen}
        onSubmit={handleSubmitPatient}
        initialData={editingPatient}
      />

    </div>
    
  );
}
