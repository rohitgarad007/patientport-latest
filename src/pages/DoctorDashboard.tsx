
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, AlertCircle, Scissors } from "lucide-react";
import { todaysAppointments } from "@/lib/dummy-data";
import { StatsCard } from "@/components/doctors/StatsCard";

import { WeeklyCalendar } from "@/components/doctors/calendar/WeeklyCalendar";
import { TodaysAppointments } from "@/components/doctors/patient/TodaysAppointments";
import { AttendedPatients } from "@/components/doctors/patient/AttendedPatients";
import { PatientDialog } from "@/components/doctors/patient/PatientDialog";
import { motion } from "framer-motion";

export default function DoctorDashboard() {

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);

  const handleViewPatient = (patientId: string) => {
    navigate(`/doctor-view-patient/${patientId}`);
  };

  const stats = [
    {
      title: "Total Appointments",
      value: todaysAppointments.length,
      icon: Users,
      trend: "+2 from yesterday",
      color: "bg-gradient-card"
    },
    {
      title: "Pending Patients",
      value: todaysAppointments.filter(a => a.status === "Pending").length,
      icon: Clock,
      trend: "3 remaining",
      color: "bg-gradient-card"
    },
    {
      title: "Emergency Cases",
      value: todaysAppointments.filter(a => a.type === "Emergency").length,
      icon: AlertCircle,
      trend: "1 active",
      color: "bg-gradient-card"
    },
    {
      title: "Surgeries",
      value: 2,
      icon: Scissors,
      trend: "This week",
      color: "bg-gradient-card"
    }
  ];

  // Load doctor info from cookie
  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
  }, []);


  return (
    <div className="space-y-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-1">
        <div className="flex items-center justify-between">
          {currentUser && (
            <h1 className="text-2xl font-bold text-foreground pb-4">Welcome {currentUser.name}</h1>
          )}
        </div>

      {/*
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>*/}

        <div className="mb-8">
          <WeeklyCalendar />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysAppointments onViewPatient={handleViewPatient} />
          </div>
          <div>
            <AttendedPatients />
          </div>
        </div>

      </main>
    </div>
    
  );
}
