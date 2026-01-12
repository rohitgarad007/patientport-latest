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

export default function Dashboard() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return <div>Please log in</div>;
  }

  const renderSuperAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage all hospitals and global settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hospitals"
          value={mockHospitals.length}
          icon={Hospital}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Total Patients"
          value={mockHospitals.reduce((acc, h) => acc + h.totalPatients, 0)}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Doctors"
          value={mockHospitals.reduce((acc, h) => acc + h.totalDoctors, 0)}
          icon={Stethoscope}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Revenue"
          value="$2.4M"
          icon={TrendingUp}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Hospital Performance</CardTitle>
            <CardDescription>Top performing hospitals this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockHospitals.map((hospital) => (
              <div key={hospital.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{hospital.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {hospital.totalPatients} patients
                  </p>
                </div>
                <Badge variant="outline" className="status-active">
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <p className="text-sm">New hospital registered: Metro Medical</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">System update completed</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <p className="text-sm">Backup scheduled for tonight</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHospitalAdminDashboard = () => (
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

  const renderDoctorDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
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
          <CardContent>
            <div className="space-y-4">
              {mockAppointments.filter(apt => apt.doctorId === currentUser.id).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{appointment.time}</p>
                    <p className="text-sm text-muted-foreground">Patient #{appointment.patientId}</p>
                  </div>
                  <Badge className="status-pending">
                    {appointment.type}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View Full Schedule
              </Button>
            </div>
          </CardContent>
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

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage appointments and billing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Appointments"
          value="15"
          icon={Calendar}
        />
        <StatCard
          title="Pending Bills"
          value="8"
          icon={AlertCircle}
        />
        <StatCard
          title="Today's Revenue"
          value="$3,240"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Patients"
          value="42"
          icon={Users}
        />
      </div>
    </div>
  );

  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Patient Portal</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Upcoming Appointments"
          value="2"
          icon={Calendar}
        />
        <StatCard
          title="Pending Bills"
          value="1"
          icon={AlertCircle}
        />
        <StatCard
          title="Medical Records"
          value="12"
          icon={Users}
        />
        <StatCard
          title="Prescriptions"
          value="3"
          icon={CheckCircle}
        />
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled medical visits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAppointments.filter(apt => apt.patientId === currentUser.id).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dr. {appointment.doctorId}</p>
                  <p className="text-sm text-muted-foreground">{appointment.date} at {appointment.time}</p>
                </div>
                <Badge className="status-pending">
                  {appointment.status}
                </Badge>
              </div>
            ))}
            <Button className="w-full">
              Book New Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'super_admin':
        return renderSuperAdminDashboard();
      case 'hospital_admin':
        return renderHospitalAdminDashboard();
      case 'doctor':
        return renderDoctorDashboard();
      case 'staff':
        return renderStaffDashboard();
      case 'patient':
        return renderPatientDashboard();
      default:
        return <div>Unknown role</div>;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
}