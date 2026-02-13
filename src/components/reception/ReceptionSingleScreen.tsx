import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { receptionService, ReceptionDashboardData } from "@/services/ReceptionService";
import LiveScreenContainer from "./LiveScreenContainer";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ReceptionSingleScreen = () => {
  const { screenId } = useParams<{ screenId: string }>();
  const [screen, setScreen] = useState<any | null>(null);
  const [liveData, setLiveData] = useState<ReceptionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Fetch screens, settings, and stats in parallel
        const [screens, settingsResponse, data] = await Promise.all([
          receptionService.fetchReceptionScreens(),
          receptionService.fetchScreenSettings(),
          receptionService.fetchDashboardStats()
        ]);
        
        if (screens && screens.length > 0) {
           // Map all screens to get the correct structure with mock data
           const mapped = screens.map((s: any) => ({
             id: s.id,
             name: s.name,
             location: s.location,
             doctors: s.doctors.map((d: any) => ({
               id: d.id,
               name: d.name,
               specialization: d.specialization || "General",
               department: d.specialization || "General",
               specialty: d.specialization || "General",
               avatar: d.image,
               gender: d.gender,
               room: d.room_number || d.room || "101",
               avgTime: d.avg_consultation_time || d.avgTime || "10 min",
               status: d.status === "1" ? "active" : "offline"
             })),
             currentPatients: s.doctors.map((d: any, idx: number) => ({
               doctor: d,
               patient: { token: `A-00${idx + 1}` } // Mock token
             })), 
             totalQueue: 0, 
             status: s.status,
             resolution: s.resolution,
             lastUpdated: "Just now",
             layout: s.layout,
             screenType: (s.doctors && s.doctors.length > 1) ? "multi" : "single" as "single" | "multi"
           }));

           // Match by ID (string or number comparison)
           const foundScreen = mapped.find((s: any) => String(s.id) === screenId);
           
           if (!foundScreen) {
             setError("Screen not found.");
             setLoading(false);
             return;
           }

           // Merge with global settings if available
           let finalScreen = foundScreen;
           if (settingsResponse && settingsResponse.success && settingsResponse.data) {
             const globalSettings = settingsResponse.data;
             finalScreen = {
               ...foundScreen,
               ...globalSettings,
               // Prioritize global layout setting
               layout: globalSettings.screen_layout_id || foundScreen.layout || '1',
               // Preserve critical screen-specific data
               id: foundScreen.id,
               doctors: foundScreen.doctors,
               name: foundScreen.name,
               location: foundScreen.location
             };
           }
           
           setScreen(finalScreen);
        } else {
             setError("Failed to load screens.");
             setLoading(false);
             return;
        }

        setLiveData(data);
        setLoading(false);

      } catch (err) {
        console.error("Failed to initialize screen:", err);
        setError("Failed to load screen data.");
        setLoading(false);
      }
    };

    init();
  }, [screenId]);

  // Poll for live data
  useEffect(() => {
    if (!screen) return;

    const fetchData = async () => {
      try {
        const data = await receptionService.fetchDashboardStats();
        setLiveData(data);
      } catch (err) {
        console.error("Failed to update live data:", err);
      }
    };

    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [screen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
          <p>Loading screen...</p>
        </div>
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Screen not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <LiveScreenContainer screen={screen} data={liveData} />
    </div>
  );
};

export default ReceptionSingleScreen;
