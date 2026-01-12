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

export default function HospitalDashboard() {
  return (
    
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hospital Dashboard</h1>
        <p className="text-muted-foreground">Manage hospital operations and staff</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="1,247"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Doctors"
          value="45"
          icon={Stethoscope}
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Today's Appointments"
          value="23"
          icon={Calendar}
          trend={{ value: -5, isPositive: false }}
        />
        <StatCard
          title="Revenue"
          value="$45,230"
          icon={TrendingUp}
          trend={{ value: 18, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Upcoming and completed appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <p className="font-medium">Patient #{appointment.patientId}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                  <Badge className={
                    appointment.status === 'completed' ? 'status-active' :
                    appointment.status === 'scheduled' ? 'status-pending' : 'status-cancelled'
                  }>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Staff Overview</CardTitle>
            <CardDescription>Current staff status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Doctors Available</span>
                <span className="font-medium">32/45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Nurses on Duty</span>
                <span className="font-medium">18/25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Support Staff</span>
                <span className="font-medium">45/50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
  );
}
