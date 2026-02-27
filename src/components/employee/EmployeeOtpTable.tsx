import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { RefreshCw, Eye, EyeOff, Copy, User } from 'lucide-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface EmployeeOtpTableProps {
  employees: Employee[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onResetOtp: (employee: Employee) => void;
  onViewDetails: (employee: Employee) => void;
  onToggle2FA: (employee: Employee, status: number) => void;
}

export const EmployeeOtpTable = ({
  employees,
  selectedIds,
  onSelectionChange,
  onResetOtp,
  onViewDetails,
  onToggle2FA,
}: EmployeeOtpTableProps) => {
  const [visibleOtps, setVisibleOtps] = useState<Set<string>>(new Set());

  const toggleOtpVisibility = (id: string) => {
    setVisibleOtps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyOtp = (otp: string, name: string) => {
    navigator.clipboard.writeText(otp);
    toast.success(`OTP copied for ${name}`);
  };

  const toggleAll = () => {
    if (selectedIds.length === employees.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(employees.map((e) => e.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      Doctor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Nurse: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      Staff: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      Technician: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Receptionist: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Pharmacist: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === employees.length && employees.length > 0}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead className="font-semibold">Employee</TableHead>
            <TableHead className="font-semibold">Role</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            <TableHead className="font-semibold">Current OTP</TableHead>
            <TableHead className="font-semibold">Generated At</TableHead>
            <TableHead className="font-semibold">OTP Expired</TableHead>
            <TableHead className="font-semibold">Two-Factor</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-muted/20">
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(employee.id)}
                  onCheckedChange={() => toggleOne(employee.id)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getRoleColor(employee.role)}>
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{employee.department}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-1.5 rounded-lg bg-muted font-mono text-lg tracking-widest">
                    {visibleOtps.has(employee.id) ? employee.currentOtp : '••••••'}
                  </code>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleOtpVisibility(employee.id)}
                      >
                        {visibleOtps.has(employee.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {visibleOtps.has(employee.id) ? 'Hide OTP' : 'Show OTP'}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyOtp(employee.currentOtp, employee.name)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy OTP</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(employee.otpGeneratedAt)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatTime(employee.otpExpiresAt)}
              </TableCell>
              <TableCell>
                <Switch
                  checked={employee.twoFactorAuth === 1}
                  onCheckedChange={(checked) => onToggle2FA(employee, checked ? 1 : 0)}
                />
              </TableCell>
              <TableCell>
                <Badge
                  variant={employee.status === 'Active' ? 'default' : 'secondary'}
                  className={
                    employee.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }
                >
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onViewDetails(employee)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Details</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-amber-600"
                        onClick={() => onResetOtp(employee)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset OTP</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {employees.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                No employees found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
