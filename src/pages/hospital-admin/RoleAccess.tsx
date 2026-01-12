import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  FileText, 
  CreditCard, 
  Settings,
  Shield,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
}

interface RoleConfig {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
}

export function RoleAccess() {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<RoleConfig[]>([
    {
      id: 'doctor',
      name: 'Doctor',
      color: 'bg-blue-500',
      permissions: [
        {
          id: 'view_patients',
          name: 'View Patients',
          description: 'Access patient information and medical records',
          icon: Users,
          enabled: true
        },
        {
          id: 'manage_appointments',
          name: 'Manage Appointments',
          description: 'Schedule and modify patient appointments',
          icon: Calendar,
          enabled: true
        },
        {
          id: 'access_medical_records',
          name: 'Medical Records',
          description: 'View and edit patient medical records',
          icon: FileText,
          enabled: true
        },
        {
          id: 'view_billing',
          name: 'View Billing',
          description: 'Access billing information for patients',
          icon: CreditCard,
          enabled: false
        },
        {
          id: 'system_settings',
          name: 'System Settings',
          description: 'Modify system and profile settings',
          icon: Settings,
          enabled: false
        }
      ]
    },
    {
      id: 'staff',
      name: 'Staff',
      color: 'bg-green-500',
      permissions: [
        {
          id: 'view_patients',
          name: 'View Patients',
          description: 'Access patient information and medical records',
          icon: Users,
          enabled: true
        },
        {
          id: 'manage_appointments',
          name: 'Manage Appointments',
          description: 'Schedule and modify patient appointments',
          icon: Calendar,
          enabled: true
        },
        {
          id: 'access_medical_records',
          name: 'Medical Records',
          description: 'View patient medical records (read-only)',
          icon: FileText,
          enabled: false
        },
        {
          id: 'view_billing',
          name: 'Manage Billing',
          description: 'Handle billing and payment processing',
          icon: CreditCard,
          enabled: true
        },
        {
          id: 'system_settings',
          name: 'System Settings',
          description: 'Basic profile and notification settings',
          icon: Settings,
          enabled: true
        }
      ]
    }
  ]);

  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(prevRoles => 
      prevRoles.map(role => 
        role.id === roleId 
          ? {
              ...role,
              permissions: role.permissions.map(permission =>
                permission.id === permissionId
                  ? { ...permission, enabled: !permission.enabled }
                  : permission
              )
            }
          : role
      )
    );
  };

  const saveChanges = () => {
    toast({
      title: "Success",
      description: "Role permissions have been updated successfully.",
    });
  };

  const resetToDefault = (roleId: string) => {
    // Reset logic would go here
    toast({
      title: "Reset Complete",
      description: "Role permissions have been reset to default settings.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Role Access Control
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage permissions and access levels for different user roles in your hospital
            </p>
          </div>
          <Button onClick={saveChanges} className="bg-primary hover:bg-primary/90">
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${role.color}`} />
                    <div>
                      <CardTitle className="text-xl">{role.name}</CardTitle>
                      <CardDescription>
                        Configure access permissions for {role.name.toLowerCase()} role
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {role.permissions.filter(p => p.enabled).length} / {role.permissions.length} enabled
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {role.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          <permission.icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{permission.name}</h4>
                            {permission.enabled ? (
                              <Eye className="w-4 h-4 text-green-500" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={permission.enabled}
                        onCheckedChange={() => togglePermission(role.id, permission.id)}
                        className="mt-1"
                      />
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    Last updated: Today, 2:30 PM
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => resetToDefault(role.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Need to add more roles?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your system administrator to create additional user roles
                </p>
              </div>
              <Button variant="outline" size="sm">
                Request New Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}