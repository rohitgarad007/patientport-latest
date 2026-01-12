import { AlertCircle, Calendar, Clock, Link as LinkIcon, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAppointmentDetails, AppointmentDetailsData } from "@/services/HomeService";
import { format, parse } from "date-fns";

const AppointmentExpired = () => {
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
  const expirationDate = (() => {
    if (!appointment?.date) return "";
    const time = appointment.slot_end_time || appointment.start_time || null;
    if (!time) return `${displayDate}`;
    try {
      const dateFmt = "yyyy-MM-dd";
      const timeFmt = time.length === 8 ? "HH:mm:ss" : "HH:mm";
      const d = parse(appointment.date, dateFmt, new Date());
      const t = parse(time, timeFmt, new Date());
      d.setHours(t.getHours(), t.getMinutes(), t.getSeconds());
      return format(d, "MMM d, yyyy, hh:mm a");
    } catch { return `${displayDate}`; }
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning/5 via-background to-warning/10">
      
      
      <div className="container max-w-2xl mx-auto px-4 py-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 mb-4 animate-scale-in">
            <AlertCircle className="w-12 h-12 text-warning" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Link Expired
          </h1>
          <p className="text-muted-foreground text-lg">
            This appointment tracking link is no longer valid
          </p>
        </div>

        {/* Expired Notice Card */}
        <Card className="mb-6 border-warning/30 shadow-lg bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="bg-warning/10">
            <CardTitle className="flex items-center gap-2 text-warning">
              <LinkIcon className="w-5 h-5" />
              Expired Tracking Link
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground mb-2">
                  Why is this link expired?
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>The appointment date has already passed</li>
                  <li>This tracking link was only valid until the appointment time</li>
                  <li>Links automatically expire 1 hour after the scheduled appointment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Past Appointment Details Card */}
        <Card className="mb-6 shadow-lg opacity-75">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              Past Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Appointment Date</p>
                  <p className="font-semibold text-foreground line-through">{displayDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Time</p>
                  <p className="font-semibold text-foreground line-through">{windowText}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <LinkIcon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Token Number</p>
                <p className="font-semibold text-foreground line-through">{appointment?.token_no ?? ""}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Link Expired On</p>
                <p className="font-semibold text-foreground">{expirationDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What to do next Card */}
        <Card className="mb-6 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              What to do next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Book a New Appointment</p>
                <p className="text-sm text-muted-foreground">Schedule your next visit with our online booking system</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Contact Support</p>
                <p className="text-sm text-muted-foreground">Need help? Our support team is here to assist you</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">Check Your Email</p>
                <p className="text-sm text-muted-foreground">Look for appointment confirmations and new tracking links</p>
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
            <Calendar className="w-5 h-5 mr-2" />
            Book New Appointment
          </Button>
          
        </div>

        {/* Help Text */}
        <Card className="mt-6 bg-muted/50 border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Need assistance?</strong> Contact our support team at{" "}
              <span className="text-primary font-semibold">support@hospital.com</span> or call{" "}
              <span className="text-primary font-semibold">1-800-MEDICAL</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentExpired;
