import { getCurrentUser, mockHospitals, mockPatients, mockDoctors, mockAppointments } from '@/data/mockData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  Calendar,
  Hospital,
  Stethoscope,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function DoctorDashboard() {
  return (
    
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Patients"
          value="12"
          icon={Users}
        />
        <StatCard
          title="Pending Appointments"
          value="8"
          icon={Clock}
        />
        <StatCard
          title="Completed Today"
          value="4"
          icon={CheckCircle}
        />
        <StatCard
          title="Urgent Cases"
          value="2"
          icon={AlertCircle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
         
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Latest consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPatients.slice(0, 3).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.bloodGroup}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Records
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
  );
}
