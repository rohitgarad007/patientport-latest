
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, Users, Stethoscope, TrendingUp } from "lucide-react";
import { mockHospitals } from "@/data/mockData";

export default function SuperDashboard() {
  return (
    
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
      </div>
    </div>
    
  );
}
