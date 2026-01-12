import { Employee } from '@/types/employee';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Building, Hash, Clock, Shield } from 'lucide-react';

interface EmployeeDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export const EmployeeDetailsDialog = ({
  open,
  onOpenChange,
  employee,
}: EmployeeDetailsDialogProps) => {
  if (!employee) return null;

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

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xl">{employee.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getRoleColor(employee.role)}>
                  {employee.role}
                </Badge>
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
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Employee ID</div>
                <div className="text-foreground font-mono">{employee.employeeId}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="text-foreground">{employee.email}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                <div className="text-foreground">{employee.phone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <Building className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Department</div>
                <div className="text-foreground">{employee.department}</div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Current OTP Details</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">OTP Code</div>
                  <code className="text-2xl font-mono font-bold text-primary tracking-widest">
                    {employee.currentOtp}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Generated At
                  </div>
                  <div className="text-foreground">{formatDateTime(employee.otpGeneratedAt)}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-primary/10">
                <div className="text-sm text-muted-foreground">Expires At</div>
                <div className="text-foreground">{formatDateTime(employee.otpExpiresAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
