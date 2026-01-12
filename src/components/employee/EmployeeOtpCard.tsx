import { Employee } from '@/types/employee';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, Eye, EyeOff, Copy, User } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface EmployeeOtpCardProps {
  employee: Employee;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onResetOtp: (employee: Employee) => void;
  onViewDetails: (employee: Employee) => void;
}

export const EmployeeOtpCard = ({
  employee,
  isSelected,
  onToggleSelect,
  onResetOtp,
  onViewDetails,
}: EmployeeOtpCardProps) => {
  const [showOtp, setShowOtp] = useState(false);

  const copyOtp = () => {
    navigator.clipboard.writeText(employee.currentOtp);
    toast.success(`OTP copied for ${employee.name}`);
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
    return new Date(isoString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`border border-border/50 hover:shadow-card-hover transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelect(employee.id)}
            />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          </div>
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

        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-foreground">{employee.name}</h3>
          <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={getRoleColor(employee.role)}>
              {employee.role}
            </Badge>
            <span className="text-xs text-muted-foreground">{employee.department}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current OTP</span>
            <span className="text-xs text-muted-foreground">{formatTime(employee.otpGeneratedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-md bg-background font-mono text-xl tracking-[0.3em] text-center">
              {showOtp ? employee.currentOtp : '••••••'}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setShowOtp(!showOtp)}
                >
                  {showOtp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showOtp ? 'Hide OTP' : 'Show OTP'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={copyOtp}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy OTP</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onViewDetails(employee)}
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/20"
            onClick={() => onResetOtp(employee)}
          >
            <RefreshCw className="w-4 h-4" />
            Reset OTP
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
