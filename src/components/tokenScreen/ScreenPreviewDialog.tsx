import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Maximize2 } from "lucide-react";
import LiveScreenContainer from "@/components/reception/LiveScreenContainer";
import { receptionService, ReceptionDashboardData } from "@/services/ReceptionService";

interface Doctor {
  id: string;
  name: string;
  department: string;
  specialty: string;
  room: string;
  avgTime: string;
  avatar: string;
  status: string;
}

interface Patient {
  id: string;
  token: string;
  name: string;
  age: number;
  gender: string;
  visitType: string;
  time: string;
  status: string;
  created_at?: string;
}

interface MultiDoctorScreen {
  id: string;
  name: string;
  location: string;
  doctors?: Doctor[];
  doctor?: Doctor;
  currentPatients?: { doctor: Doctor; patient: Patient | null }[];
  currentPatient?: Patient;
  queue?: Patient[];
  totalQueue?: number;
  status: string;
  resolution: string;
  lastUpdated: string;
  layout: string;
  screenType?: "single" | "multi";
}

interface ScreenPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: MultiDoctorScreen | null;
}

export function ScreenPreviewDialog({ open, onOpenChange, screen }: ScreenPreviewDialogProps) {
  const [liveData, setLiveData] = useState<ReceptionDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 1920, height: 1080 });
  const [mergedSettings, setMergedSettings] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreviewSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  useEffect(() => {
    if (open && screen) {
      setLoading(true);
      
      // Fetch both dashboard stats and global screen settings
      Promise.all([
        receptionService.fetchDashboardStats(),
        receptionService.fetchScreenSettings()
      ])
        .then(([statsData, settingsResponse]) => {
          setLiveData(statsData);
          
          // Merge global settings with the screen object
          // The screen object's specific layout/properties should take precedence if they exist,
          // but we want to augment it with global settings (branding, ticker, etc.)
          if (settingsResponse && settingsResponse.success && settingsResponse.data) {
             const globalSettings = settingsResponse.data;
             // We create a merged object where global settings provide defaults
             const mergedScreen = {
               ...screen,         // Spread specific screen props first
               ...globalSettings, // Spread global settings to override (since user wants global design)
               
               // Explicitly handle layout: User requested to use ms_hospitals_screen_settings (global)
               // as the source of truth for design. So we prioritize globalSettings.screen_layout_id.
               layout: globalSettings.screen_layout_id || screen.layout || '1',
               
               // Ensure we keep the ID and other critical fields from the screen object
               // (in case global settings accidentally collide with these)
               id: screen.id,
               doctors: screen.doctors,
               name: screen.name, // Keep the screen name
               location: screen.location // Keep the screen location
             };
             // Note: We can't easily update the 'screen' prop itself as it's passed from parent.
             // Instead, we'll use this merged object when rendering LiveScreenContainer
             setMergedSettings(mergedScreen);
          } else {
             setMergedSettings(screen);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch data for preview:", err);
          setLoading(false);
          setMergedSettings(screen); // Fallback to original screen object
        });
    }
  }, [open, screen]);

  // Scaling logic
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current;
      const availableWidth = parent.clientWidth;
      const availableHeight = parent.clientHeight;
      
      const targetWidth = previewSize.width;
      const targetHeight = previewSize.height;
      
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      
      const newScale = Math.min(scaleX, scaleY) * 0.95; // 0.95 to leave a small margin
      setScale(newScale);
    };

    if (open) {
      calculateScale();
      window.addEventListener('resize', calculateScale);
      // Small delay to ensure modal is rendered
      const timer = setTimeout(calculateScale, 100);
      return () => {
        window.removeEventListener('resize', calculateScale);
        clearTimeout(timer);
      };
    }
  }, [open, loading, previewSize]);

  if (!screen) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col bg-slate-950 border-slate-800">
        <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Preview: {screen.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">
                {screen.resolution} • {screen.layout}
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <div 
          ref={containerRef}
          className="flex-1 relative bg-black w-full overflow-hidden flex items-center justify-center p-4"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Loading live stream...</p>
            </div>
          ) : (
            <div 
              style={{
                width: previewSize.width,
                height: previewSize.height,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                backgroundColor: 'white'
              }}
              className="shadow-2xl overflow-hidden bg-background text-foreground"
            >
               <LiveScreenContainer screen={mergedSettings || screen} data={liveData} />
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Close Preview
          </Button>
          <Button onClick={() => window.open(`/reception-screen-live/${screen.id}`, '_blank')} className="bg-blue-600 hover:bg-blue-700">
            <Maximize2 className="w-4 h-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
