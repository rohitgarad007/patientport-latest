import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockUsers, setCurrentUser } from '@/data/mockData';
import { UserRole } from '@/types';
import { Heart, Shield, Stethoscope, Users, UserCheck } from 'lucide-react';

const roleIcons = {
  super_admin: Shield,
  hospital_admin: Users,
  doctor: Stethoscope,
  staff: UserCheck,
  patient: Heart,
};

const roleLabels = {
  super_admin: 'Super Admin',
  hospital_admin: 'Hospital Admin',
  doctor: 'Doctor',
  staff: 'Staff',
  patient: 'Patient',
};

export function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = mockUsers.find(u => u.role === selectedRole);
    if (user) {
      setCurrentUser(user.id);
      navigate('/dashboard');
    }
  };

  const roleUsers = mockUsers.filter(user => user.role === selectedRole);
  const IconComponent = roleIcons[selectedRole];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light via-background to-secondary-light p-4">
      <Card className="w-full max-w-md medical-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-foreground">HealthCare Pro</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([role, label]) => {
                  const Icon = roleIcons[role as UserRole];
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {roleUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Demo User</Label>
              <div className="p-3 bg-muted rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{roleUsers[0].name}</p>
                    <p className="text-sm text-muted-foreground">{roleUsers[0].email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={roleUsers[0]?.email || ''}
              placeholder="Enter your email"
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              defaultValue="demo123"
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Demo system - Click any role to continue
          </div>
        </CardContent>
      </Card>
    </div>
  );
}