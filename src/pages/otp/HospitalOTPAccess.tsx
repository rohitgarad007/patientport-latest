import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, RefreshCw, Users, ArrowLeft, Shield, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Employee, EmployeeRole } from '@/types/employee';
import { initialEmployees, generateNewOtp } from '@/data/employeeData';
import { EmployeeOtpTable } from '@/components/employee/EmployeeOtpTable';
import { EmployeeOtpCard } from '@/components/employee/EmployeeOtpCard';
import { EmployeeDetailsDialog } from '@/components/employee/EmployeeDetailsDialog';

const roles: EmployeeRole[] = ['Doctor', 'Nurse', 'Staff', 'Technician', 'Receptionist', 'Pharmacist'];

const HospitalOTPAccess = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [detailsDialog, setDetailsDialog] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [resetDialog, setResetDialog] = useState<{
    open: boolean;
    type: 'single' | 'selected' | 'all';
    employee: Employee | null;
  }>({
    open: false,
    type: 'single',
    employee: null,
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !searchQuery.trim() ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, roleFilter, statusFilter]);

  const handleResetSingle = (employee: Employee) => {
    setResetDialog({ open: true, type: 'single', employee });
  };

  const handleResetSelected = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setResetDialog({ open: true, type: 'selected', employee: null });
  };

  const handleResetAll = () => {
    setResetDialog({ open: true, type: 'all', employee: null });
  };

  const confirmReset = () => {
    const { type, employee } = resetDialog;
    const newOtpData = generateNewOtp();

    if (type === 'single' && employee) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employee.id
            ? {
                ...emp,
                currentOtp: newOtpData.otp,
                otpGeneratedAt: newOtpData.generatedAt,
                otpExpiresAt: newOtpData.expiresAt,
              }
            : emp
        )
      );
      toast.success(`OTP reset for ${employee.name}`);
    } else if (type === 'selected') {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (selectedIds.includes(emp.id)) {
            const otpData = generateNewOtp();
            return {
              ...emp,
              currentOtp: otpData.otp,
              otpGeneratedAt: otpData.generatedAt,
              otpExpiresAt: otpData.expiresAt,
            };
          }
          return emp;
        })
      );
      toast.success(`OTP reset for ${selectedIds.length} employees`);
      setSelectedIds([]);
    } else if (type === 'all') {
      setEmployees((prev) =>
        prev.map((emp) => {
          const otpData = generateNewOtp();
          return {
            ...emp,
            currentOtp: otpData.otp,
            otpGeneratedAt: otpData.generatedAt,
            otpExpiresAt: otpData.expiresAt,
          };
        })
      );
      toast.success('OTP reset for all employees');
    }

    setResetDialog({ open: false, type: 'single', employee: null });
  };

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === 'Active').length,
    doctors: employees.filter((e) => e.role === 'Doctor').length,
    nurses: employees.filter((e) => e.role === 'Nurse').length,
  }), [employees]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Manage Employee OTP</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleResetSelected}
                disabled={selectedIds.length === 0}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Selected ({selectedIds.length})
              </Button>
              <Button
                onClick={handleResetAll}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset All OTP
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Employees</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.doctors}</div>
                <div className="text-sm text-muted-foreground">Doctors</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.nurses}</div>
                <div className="text-sm text-muted-foreground">Nurses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 ml-auto border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Employee View */}
        {viewMode === 'list' ? (
          <EmployeeOtpTable
            employees={filteredEmployees}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onResetOtp={handleResetSingle}
            onViewDetails={(emp) => setDetailsDialog({ open: true, employee: emp })}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((employee) => (
              <EmployeeOtpCard
                key={employee.id}
                employee={employee}
                isSelected={selectedIds.includes(employee.id)}
                onToggleSelect={(id) => {
                  if (selectedIds.includes(id)) {
                    setSelectedIds(selectedIds.filter((i) => i !== id));
                  } else {
                    setSelectedIds([...selectedIds, id]);
                  }
                }}
                onResetOtp={handleResetSingle}
                onViewDetails={(emp) => setDetailsDialog({ open: true, employee: emp })}
              />
            ))}
            {filteredEmployees.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No employees found matching your criteria.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <EmployeeDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ ...detailsDialog, open })}
        employee={detailsDialog.employee}
      />

      <AlertDialog open={resetDialog.open} onOpenChange={(open) => setResetDialog({ ...resetDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset OTP?</AlertDialogTitle>
            <AlertDialogDescription>
              {resetDialog.type === 'single' && resetDialog.employee && (
                <>
                  Are you sure you want to reset the OTP for{' '}
                  <span className="font-semibold">{resetDialog.employee.name}</span>? A new OTP will
                  be generated immediately.
                </>
              )}
              {resetDialog.type === 'selected' && (
                <>
                  Are you sure you want to reset the OTP for{' '}
                  <span className="font-semibold">{selectedIds.length} selected employees</span>?
                  New OTPs will be generated for each.
                </>
              )}
              {resetDialog.type === 'all' && (
                <>
                  Are you sure you want to reset the OTP for{' '}
                  <span className="font-semibold">all {employees.length} employees</span>? This
                  action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReset}
              className="bg-primary hover:bg-primary/90"
            >
              Reset OTP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HospitalOTPAccess;
