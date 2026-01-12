import { XCircle, Calendar, User, MapPin, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAppointmentDetails, AppointmentDetailsData } from "@/services/HomeService";
import { format, parse } from "date-fns";

const AppointmentCancelled = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [appointment, setAppointment] = useState<AppointmentDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const aid = search.get("aid");
    if (!aid) { setLoadError("Missing appointment id"); setLoading(false); return; }
    (async () => {
      try {
        const resp = await getAppointmentDetails({ appointment_uid: aid });
        if (!resp.success || !resp.data) { setLoadError(resp.message || "Unable to load appointment"); }
        else { setAppointment(resp.data); }
      } catch (e: any) {
        setLoadError(e?.message || "Network error");
      } finally { setLoading(false); }
    })();
  }, [search]);

  const displayDate = appointment?.date
    ? format(parse(appointment.date, "yyyy-MM-dd", new Date()), "MMM d, yyyy")
    : "";
  const to12h = (t?: string | null) => {
    if (!t) return "";
    try {
      const fmt = t.length === 8 ? "HH:mm:ss" : "HH:mm";
      return format(parse(t, fmt, new Date()), "hh:mm a");
    } catch { return t; }
  };
  const windowText = (() => {
    const s = to12h(appointment?.slot_start_time);
    const e = to12h(appointment?.slot_end_time);
    if (s && e) return `${s} — ${e}`;
    if (appointment?.time_label) return appointment.time_label;
    return to12h(appointment?.start_time);
  })();
  const cancelledAt = appointment?.cancel_time ? format(new Date(appointment.cancel_time), "MMM d, yyyy, hh:mm a") : "";
  const cancelReason = (appointment as any)?.cancel_reason || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-destructive/5 via-background to-destructive/10">
      
      
      <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4 animate-scale-in">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Appointment Cancelled
          </h1>
          <p className="text-muted-foreground text-lg">
            Your appointment has been successfully cancelled
          </p>
        </div>

        {/* Cancellation Details Card */}
        <Card className="mb-6 border-destructive/20 shadow-lg">
          <CardHeader className="bg-destructive/5">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <FileText className="w-5 h-5" />
              Cancellation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Cancelled On</p>
                <p className="font-semibold text-foreground">{cancelledAt || ""}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Reason for Cancellation</p>
                <p className="font-medium text-foreground">{cancelReason || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Original Appointment Details Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Cancelled Appointment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-semibold text-foreground">{appointment?.patient_name || ""}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Hospital</p>
                <p className="font-semibold text-foreground">{appointment?.hospital_name || ""}</p>
                <p className="text-sm text-muted-foreground">{appointment?.hospital_address || ""}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-semibold text-foreground">{appointment?.doctor_name ? `Dr. ${appointment.doctor_name}` : ""}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold text-foreground">{displayDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold text-foreground">{windowText}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Token Number</p>
                <p className="font-semibold text-foreground text-lg">{appointment?.token_no ?? ""}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full h-12 text-base font-semibold"
            size="lg"
            onClick={() => navigate('/home')}
          >
            Book New Appointment
          </Button>
          
        </div>

        {/* Information Note */}
        <Card className="mt-6 bg-muted/50 border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              If you cancelled by mistake or need to reschedule, please contact our support team or book a new appointment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentCancelled;
