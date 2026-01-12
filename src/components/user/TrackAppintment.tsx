import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StatusBadge, AppointmentStatus } from "@/components/user/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CancelModal } from "@/components/user/CancelModal";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Hash,
  XCircle,
  CheckCircle2,
  Activity,
  Bell,
  MapPinCheck,
  Timer,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { getAppointmentDetails, AppointmentDetailsData, cancelAppointment } from "@/services/HomeService";
import { format, parse } from "date-fns";

const mockAppointment = {
  patientName: "Michael Rodriguez",
  hospitalName: "St. Mary's Medical Center",
  hospitalAddress: "456 Healthcare Avenue, Medical Plaza, Los Angeles, CA 90012",
  doctorName: "Emily Watson",
  specialization: "Cardiology",
  appointmentDate: "Nov 21, 2025",
  appointmentTime: "02:30 PM",
  tokenNumber: 28,
  currentToken: 23,
  scheduledTimeSeconds: 900, // 15 minutes
  allowedArrivalStart: "02:00 PM",
  allowedArrivalEnd: "02:30 PM",
};

const TrackAppintment = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<AppointmentStatus>("approaching");
  const [currentToken, setCurrentToken] = useState(mockAppointment.currentToken);
  const [timeRemaining, setTimeRemaining] = useState(mockAppointment.scheduledTimeSeconds);
  const [hasArrived, setHasArrived] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationTime, setCancellationTime] = useState("");

  // Fetch appointment by UID from URL when page loads
  useEffect(() => {
    (async () => {
      try {
        if (!appointmentId) {
          setLoadError("No appointment ID provided in URL.");
          setLoading(false);
          return;
        }
        const resp = await getAppointmentDetails({ appointment_uid: appointmentId });
        if (!resp.success || !resp.data) {
          setLoadError(resp.message || "Appointment not found.");
          setLoading(false);
          return;
        }
        setAppointment(resp.data);
      } catch (e: any) {
        setLoadError(e?.message || "Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [appointmentId]);

  // Helpers to display data with sensible fallbacks
  const displayPatientName = appointment?.patient_name || mockAppointment.patientName;
  const displayDoctorName = appointment?.doctor_name ? `Dr. ${appointment.doctor_name}` : `Dr. ${mockAppointment.doctorName}`;
  const displayHospitalName = appointment?.hospital_name || mockAppointment.hospitalName;
  const displayHospitalAddress = appointment?.hospital_address || mockAppointment.hospitalAddress;
  const displayDate = appointment?.date
    ? format(parse(appointment.date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")
    : mockAppointment.appointmentDate;
  const to12h = (t: string | null | undefined) => {
    if (!t) return null;
    try {
      // Support HH:mm:ss and HH:mm
      const fmt = t.length === 8 ? "HH:mm:ss" : "HH:mm";
      return format(parse(t, fmt, new Date()), "hh:mm a");
    } catch {
      return t;
    }
  };

  const displayTime = (() => {
    // Prefer slot window in 12-hour format
    const s = to12h(appointment?.slot_start_time ?? null);
    const e = to12h(appointment?.slot_end_time ?? null);
    if (s && e) return `${s} - ${e}`;
    if (appointment?.time_label && appointment.time_label.trim() !== "") return appointment.time_label;
    const st = to12h(appointment?.start_time ?? null);
    if (st) return st;
    return mockAppointment.appointmentTime;
  })();
  const allowedWindowText = (() => {
    const s = to12h(appointment?.slot_start_time ?? null);
    const e = to12h(appointment?.slot_end_time ?? null);
    if (s && e) return `${s} — ${e}`;
    if (appointment?.time_label && appointment.time_label.trim() !== "") return appointment.time_label;
    const st = to12h(appointment?.start_time ?? null);
    if (st) return st;
    return "—";
  })();
  const displayToken = appointment?.token_no ?? mockAppointment.tokenNumber;

  const tokensAhead = appointment?.queue_position ?? (mockAppointment.tokenNumber - currentToken);
  const perPatient = appointment?.duration_per_patient_minutes ?? 6;
  const estimatedWaitMinutes = appointment?.estimated_wait_minutes ?? (tokensAhead * perPatient);
  const queueProgress = (() => {
    const max = appointment?.slot_max_appointments ?? null;
    const token = appointment?.token_no ?? null;
    if (max && token) {
      return Math.min(100, Math.max(0, (token / max) * 100));
    }
    return ((mockAppointment.tokenNumber - (mockAppointment.tokenNumber - currentToken)) / mockAppointment.tokenNumber) * 100;
  })();

  useEffect(() => {
    if (isCancelled || status === "now_serving") return;

    const interval = setInterval(() => {
      setCurrentToken((prev) => {
        const next = prev + 1;
        if (next === mockAppointment.tokenNumber) {
          setStatus("now_serving");
          toast.info("🔔 Your token is being called!", {
            description: "Please proceed to consultation room 204.",
          });
        }
        return next;
      });
    }, 12000);

    return () => clearInterval(interval);
  }, [isCancelled, status]);

  useEffect(() => {
    if (isCancelled || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setStatus("now_serving");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCancelled, timeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleArrivalConfirmed = () => {
    const now = new Date();
    const canArrive = true; // Simplified for demo

    if (canArrive) {
      setHasArrived(true);
      setStatus("allowed_to_arrive");
      toast.success("✅ Arrival Confirmed!", {
        description: "Thank you! Please wait in the designated area.",
      });
    } else {
      toast.error("⏰ Too Early", {
        description: "Please arrive within 30 minutes of your scheduled time.",
      });
    }
  };

  const handleCancelConfirm = async (reason: string) => {
    try {
      const resp = await cancelAppointment({ appointment_uid: appointmentId, reason });
      if (!resp.success) {
        toast.error("Cancellation failed", { description: resp.message || "Server error" });
        return;
      }
      // Use returned data to reflect latest state
      if (resp.data) setAppointment(resp.data);
      setIsCancelled(true);
      setStatus("cancelled");
      setCancellationReason(reason);
      setCancellationTime(new Date().toLocaleTimeString());
      toast.success("Appointment Cancelled", {
        description: "Confirmation saved and synced.",
      });
    } catch (e: any) {
      toast.error("Cancellation failed", { description: e?.message || "Network error" });
    }
  };

  // Redirect to cancelled/expired pages based on backend data
  useEffect(() => {
    if (loading || loadError || !appointment) return;
    const aid = appointment.appointment_uid || appointmentId;
    const isCancelledFlag = appointment.cancelled === 1;
    const appStatus = (appointment as any).status;
    const isStatusCancelled = typeof appStatus === "string" && appStatus.toLowerCase().includes("cancel");
    if ((isCancelledFlag || isStatusCancelled) && aid) {
      navigate(`/appointment_cancelled?aid=${encodeURIComponent(aid)}`);
      return;
    }

    // Expired if appointment date is in the past
    if (appointment.date) {
      try {
        const apptDate = parse(appointment.date, "yyyy-MM-dd", new Date());
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (apptDate < todayStart && aid) {
          navigate(`/appointment_expired?aid=${encodeURIComponent(aid)}`);
          return;
        }
      } catch {}
    }
  }, [loading, loadError, appointment, appointmentId, navigate]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            <p className="text-muted-foreground">Loading appointment details...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            <p className="text-destructive">{loadError}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-destructive-light/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-destructive/30 shadow-2xl animate-scale-in">
          <CardContent className="p-8 md:p-12">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/10 rounded-full blur-3xl" />
                <div className="relative bg-destructive/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-destructive/30">
                  <XCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Appointment Cancelled
                </h1>
                <p className="text-muted-foreground text-lg">
                  Your appointment has been successfully cancelled
                </p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border space-y-4 text-left">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Patient Name</p>
                    <p className="font-semibold">{displayPatientName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-semibold">{displayDoctorName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="font-semibold">{displayDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Token Number</p>
                    <p className="font-semibold">#{displayToken}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Cancellation Reason</p>
                  <div className="bg-destructive-light p-4 rounded-xl border border-destructive/20">
                    <p className="text-foreground font-medium">{cancellationReason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">Cancelled at</span>
                  <span className="font-medium">{cancellationTime}</span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 border border-border">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-left">
                    <p className="font-medium text-foreground mb-1">Need to Reschedule?</p>
                    <p className="text-muted-foreground">
                      Contact the hospital at (555) 123-4567 or use the patient portal to book a new appointment.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full h-12"
              >
                Return to Tracker
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/20">
      {/* Glassmorphic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-card/80 border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-xl blur-lg" />
                <div className="relative bg-gradient-to-br from-primary to-primary-glow p-3 rounded-xl">
                  <Activity className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-xl text-foreground">Live Queue Tracker</h1>
                <p className="text-xs text-muted-foreground">Real-time appointment monitoring</p>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient & Appointment Details */}
            <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-foreground">Appointment Details</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                      <User className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Patient
                        </p>
                        <p className="text-base font-medium text-foreground">{displayPatientName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
                      <User className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Doctor
                        </p>
                        <p className="text-base font-medium text-foreground">{displayDoctorName}</p>
                        <p className="text-sm text-muted-foreground">{mockAppointment.specialization}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-info/5 rounded-xl border border-info/10">
                      <MapPin className="h-5 w-5 text-info mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Hospital
                        </p>
                        <p className="text-base font-medium text-foreground">{displayHospitalName}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {displayHospitalAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-4 bg-warning/5 rounded-xl border border-warning/10">
                    <Calendar className="h-5 w-5 text-warning flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{displayDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-success/5 rounded-xl border border-success/10">
                    <Clock className="h-5 w-5 text-success flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold text-foreground">{displayTime}</p>
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1 flex items-center gap-3 p-4 bg-primary/10 rounded-xl border-2 border-primary/30">
                    <Hash className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Your Token</p>
                      <p className="text-2xl font-bold text-primary">{displayToken}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Queue Progress */}
            <Card className="border-2 shadow-xl bg-gradient-to-br from-card to-primary/5 backdrop-blur-sm animate-fade-in">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">Queue Progress</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Your Position</p>
                    <p className="text-3xl font-bold text-primary" aria-live="polite">
                      #{displayToken}{appointment?.slot_max_appointments ? ` / ${appointment.slot_max_appointments}` : ''}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Queue Position</span>
                      <span className="text-sm font-bold text-primary">
                        {tokensAhead} tokens ahead
                      </span>
                    </div>
                    <Progress value={queueProgress} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="h-4 w-4 text-warning" />
                        <p className="text-xs text-muted-foreground">Estimated Wait</p>
                      </div>
                      <p className="text-2xl font-bold text-warning">
                        {estimatedWaitMinutes} <span className="text-sm">min</span>
                      </p>
                    </div>

                    <div className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-success" />
                        <p className="text-xs text-muted-foreground">Your Position</p>
                      </div>
                      <p className="text-2xl font-bold text-success">
                        #{displayToken}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4 animate-fade-in">
              {!hasArrived && status !== "now_serving" && (
                <Card className="border-2 border-success/30 shadow-lg bg-gradient-to-br from-success/5 to-success/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-success/10 rounded-xl">
                        <MapPinCheck className="h-6 w-6 text-success" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-1">Ready to Arrive?</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Allowed window: {allowedWindowText}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ⚠️ Arrive within 30 minutes of scheduled time
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleArrivalConfirmed}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold bg-success hover:bg-success/90 shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Confirm I'm Here
                    </Button>
                  </CardContent>
                </Card>
              )}

              {hasArrived && (
                <Card className="border-2 border-success shadow-lg bg-gradient-to-br from-success/10 to-success/20 animate-pulse-glow">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-success mb-2">Arrival Confirmed ✓</h3>
                    <p className="text-muted-foreground">
                      Please wait in the designated waiting area
                    </p>
                  </CardContent>
                </Card>
              )}

              <Button
                variant="outline"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full h-12 border-2 border-destructive/30 text-destructive hover:bg-destructive-light hover:border-destructive"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Cancel Appointment
              </Button>
            </div>
          </div>

          {/* Right Column - Timer & Alerts */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <Card className="border-2 shadow-2xl bg-gradient-to-br from-primary/10 via-card to-primary-glow/10 backdrop-blur-sm sticky top-24 animate-fade-in">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative">
                      <Timer className="h-12 w-12 text-primary mx-auto mb-4" />
                    </div>
                  </div>

                  {timeRemaining > 0 ? (
                    <>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                          Time Until Token
                        </p>
                        <div
                          className={`text-6xl font-bold tabular-nums mb-2 ${
                            timeRemaining <= 60
                              ? "text-destructive"
                              : timeRemaining <= 300
                              ? "text-warning"
                              : "text-success"
                          }`}
                          aria-live="polite"
                        >
                          {formatTime(timeRemaining)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {timeRemaining <= 60
                            ? "🔔 Almost there!"
                            : timeRemaining <= 300
                            ? "⏰ Get ready"
                            : "✓ Please wait"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="animate-pulse-glow">
                      <div className="text-4xl font-bold text-primary mb-2">NOW SERVING</div>
                      <p className="text-muted-foreground">Proceed to consultation room 204</p>
                    </div>
                  )}

                  <div className="pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground mb-1">Tokens Ahead</p>
                        <p className="text-2xl font-bold text-foreground">{tokensAhead}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-muted-foreground mb-1">Est. Wait</p>
                        <p className="text-2xl font-bold text-foreground">
                          {estimatedWaitMinutes}
                          <span className="text-sm">m</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-2 shadow-lg bg-gradient-to-br from-info/5 to-card animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-info" />
                  <h3 className="font-bold text-foreground">Notifications Active</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3 p-3 bg-success-light rounded-lg border border-success/20">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">24h Reminder</p>
                      <p className="text-xs text-muted-foreground">Sent successfully</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-success-light rounded-lg border border-success/20">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">2h Reminder</p>
                      <p className="text-xs text-muted-foreground">Sent successfully</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-warning-light rounded-lg border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">30min Alert</p>
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                    <Bell className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Token Called</p>
                      <p className="text-xs text-muted-foreground">Will notify</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <CancelModal
        open={isCancelModalOpen}
        onOpenChange={setIsCancelModalOpen}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
};

export default TrackAppintment;
