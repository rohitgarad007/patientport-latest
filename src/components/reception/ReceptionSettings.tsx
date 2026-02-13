import { useState, useEffect } from "react";
import { receptionService, ReceptionDashboardData } from "@/services/ReceptionService";
import { useSearchParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Monitor,
  Users,
  Clock,
  Bell,
  Settings,
  ExternalLink,
  ChevronRight,
  Mic,
  MicOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  PhoneCall,
  UserPlus,
  Timer,
  Zap,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { multiDoctorScreens } from "@/data/multiDoctorScreens-2";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


import Screen1ClassicBlue from "@/components/reception/Screen1ClassicBlue"
import Screen2SplitView from "@/components/reception/Screen2SplitView"
import Screen3DarkTheme from "@/components/reception/Screen3DarkTheme"
import Screen4CardLayout from "@/components/reception/Screen4CardLayout"
import Screen5MinimalWhite from "@/components/reception/Screen5MinimalWhite"
import Screen6MultiCounter from "@/components/reception/Screen6MultiCounter"
import Screen7FullScreenToken from "@/components/reception/Screen7FullScreenToken"
import Screen8TimelineView from "@/components/reception/Screen8TimelineView"
import Screen9Dashboard from "@/components/reception/Screen9Dashboard"
import Screen10GradientModern from "@/components/reception/Screen10GradientModern"



const ReceptionSettings = () => {
  const [searchParams] = useSearchParams();
  const screenId = searchParams.get("screen") || "mds-001";
  const { toast } = useToast();

  const screen = multiDoctorScreens.find(s => s.id === screenId) || multiDoctorScreens[0];

  // Control states
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [repeatCount, setRepeatCount] = useState("2");
  const [selectedDoctor, setSelectedDoctor] = useState(screen.doctors[0]?.id || "");
  const [callHistory, setCallHistory] = useState<Array<{token: string; doctor: string; action: string; time: string}>>([
    { token: "A-003", doctor: "Dr. Sarah Mitchell", action: "Called", time: "09:32 AM" },
    { token: "A-002", doctor: "Dr. Sarah Mitchell", action: "Completed", time: "09:28 AM" },
    { token: "B-001", doctor: "Dr. James Wilson", action: "Called", time: "09:25 AM" },
    { token: "A-001", doctor: "Dr. Sarah Mitchell", action: "No Show", time: "09:20 AM" },
  ]);

  const currentDoctor = screen.doctors.find(d => d.id === selectedDoctor) || screen.doctors[0];
  const doctorIndex = screen.doctors.findIndex(d => d.id === selectedDoctor);
  const currentPatient = screen.currentPatients[doctorIndex];
  const waitingQueue = screen.queues[doctorIndex] || [];

  const handleCallNext = () => {
    if (waitingQueue.length > 0) {
      const nextPatient = waitingQueue[0];
      toast({
        title: "Token Called",
        description: `Now calling ${nextPatient.token} - ${nextPatient.name}`,
      });
      setCallHistory(prev => [{
        token: nextPatient.token,
        doctor: currentDoctor.name,
        action: "Called",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
    }
  };

  const handleRecall = () => {
    if (currentPatient) {
      toast({
        title: "Token Recalled",
        description: `Recalling ${currentPatient.token} - ${currentPatient.name}`,
      });
      setCallHistory(prev => [{
        token: currentPatient.token,
        doctor: currentDoctor.name,
        action: "Recalled",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
    }
  };

  const handleSkip = () => {
    if (currentPatient) {
      toast({
        title: "Patient Skipped",
        description: `${currentPatient.token} marked as no-show`,
        variant: "destructive",
      });
      setCallHistory(prev => [{
        token: currentPatient.token,
        doctor: currentDoctor.name,
        action: "Skipped",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
    }
  };

  const handleComplete = () => {
    if (currentPatient) {
      toast({
        title: "Consultation Complete",
        description: `${currentPatient.token} - ${currentPatient.name} completed`,
      });
      setCallHistory(prev => [{
        token: currentPatient.token,
        doctor: currentDoctor.name,
        action: "Completed",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }, ...prev]);
    }
  };

  const screens = [
    { id: 1, name: "Classic Blue Header", description: "Traditional hospital display with blue header", component: Screen1ClassicBlue },
    { id: 2, name: "Split View", description: "Doctor info left, queue right", component: Screen2SplitView },
    { id: 3, name: "Dark Theme", description: "Modern dark UI design", component: Screen3DarkTheme },
    { id: 4, name: "Card Layout", description: "Card-based token display", component: Screen4CardLayout },
    { id: 5, name: "Minimal White", description: "Clean and minimal design", component: Screen5MinimalWhite },
    { id: 6, name: "Multi Counter", description: "Multiple counter display", component: Screen6MultiCounter },
    { id: 7, name: "Full Screen Token", description: "Giant token display", component: Screen7FullScreenToken },
    { id: 8, name: "Timeline View", description: "Vertical timeline queue", component: Screen8TimelineView },
    { id: 9, name: "Dashboard View", description: "Comprehensive dashboard view", component: Screen9Dashboard },
    { id: 10, name: "Gradient Modern", description: "Contemporary gradient design", component: Screen10GradientModern },
  ];

  const [currentScreen, setCurrentScreen] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isFlashOnCall, setIsFlashOnCall] = useState(true);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [displayView, setDisplayView] = useState("single");
  const [displayTimer, setDisplayTimer] = useState("30");
  const [dashboardData, setDashboardData] = useState<ReceptionDashboardData | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const [settingsResponse, dataResponse] = await Promise.all([
                receptionService.fetchScreenSettings(),
                receptionService.fetchDashboardStats()
            ]);

            if (settingsResponse && settingsResponse.success && settingsResponse.data) {
                const settings = settingsResponse.data;
                
                if (settings.screen_layout_id) {
                    const index = screens.findIndex(s => s.id.toString() === settings.screen_layout_id.toString());
                    if (index !== -1) {
                        setCurrentScreen(index);
                    }
                }

                // Prioritize explicit columns from DB
                if (settings.volume !== undefined) setVolume([parseInt(settings.volume)]);
                if (settings.is_muted !== undefined) setIsMuted(settings.is_muted == 1);
                if (settings.repeat_count !== undefined) setRepeatCount(settings.repeat_count.toString());
                if (settings.is_announcing !== undefined) setIsAnnouncing(settings.is_announcing == 1);
                if (settings.is_paused !== undefined) setIsPaused(settings.is_paused == 1);
                if (settings.flash_on_call !== undefined) setIsFlashOnCall(settings.flash_on_call == 1);
                if (settings.emergency_mode !== undefined) setIsEmergencyMode(settings.emergency_mode == 1);
                if (settings.display_view !== undefined) setDisplayView(settings.display_view);
                if (settings.display_timer !== undefined) setDisplayTimer(settings.display_timer.toString());

                // Fallback to JSON blob if needed (for backward compatibility or missing columns)
                if (settings.settings && !settings.volume) {
                    const extra = typeof settings.settings === 'string' ? JSON.parse(settings.settings) : settings.settings;
                    if (extra.volume) setVolume(Array.isArray(extra.volume) ? extra.volume : [extra.volume]);
                    if (extra.isMuted !== undefined) setIsMuted(extra.isMuted);
                    if (extra.repeatCount) setRepeatCount(extra.repeatCount);
                    if (extra.isAnnouncing !== undefined) setIsAnnouncing(extra.isAnnouncing);
                    if (extra.isPaused !== undefined) setIsPaused(extra.isPaused);
                    if (extra.flashOnCall !== undefined) setIsFlashOnCall(extra.flashOnCall);
                    if (extra.emergencyMode !== undefined) setIsEmergencyMode(extra.emergencyMode);
                    if (extra.displayView !== undefined) setDisplayView(extra.displayView);
                    if (extra.displayTimer !== undefined) setDisplayTimer(extra.displayTimer);
                }
            }

            if (dataResponse) {
                setDashboardData(dataResponse);
            }
        } catch (error) {
            console.error("Failed to load settings or data", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
        const settingsToSave = {
        screen_layout_id: screens[currentScreen].id,
        settings: {
            volume: Array.isArray(volume) ? volume[0] : volume,
            isMuted,
            repeatCount,
            isAnnouncing,
            isPaused,
            flashOnCall: isFlashOnCall,
            emergencyMode: isEmergencyMode,
            displayView,
            displayTimer
        }
    };
        
        await receptionService.saveScreenSettings(settingsToSave);
        toast({
            title: "Settings Saved",
            description: "Screen layout and preferences have been saved.",
        });
    } catch (error) {
        console.error("Failed to save settings", error);
        toast({
            variant: "destructive",
            title: "Save Failed",
            description: "Could not save screen settings.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  const CurrentComponent = screens[currentScreen].component;

  const currentSettings = {
    screen_layout_id: screens[currentScreen].id,
    volume: Array.isArray(volume) ? volume[0] : volume,
    is_muted: isMuted ? 1 : 0,
    repeat_count: parseInt(repeatCount),
    is_announcing: isAnnouncing ? 1 : 0,
    is_paused: isPaused ? 1 : 0,
    flash_on_call: isFlashOnCall ? 1 : 0,
    emergency_mode: isEmergencyMode ? 1 : 0
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/manage-screens-2">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  Screen Operator
                </h1>
                <p className="text-sm text-muted-foreground">{screen.name} • {screen.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isPaused ? "secondary" : "default"} className="gap-1">
                {isPaused ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isPaused ? "Paused" : "Live"}
              </Badge>
              <Link to={`/live-screen?screen=${screenId}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Display
                </Button>
              </Link>
              <Link to={`/live-screen-split?screen=${screenId}`} target="_blank">
                <Button variant="default" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Split View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Doctor Selection & Current Token */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="max-w-7xl mx-auto">
              <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="aspect-video overflow-hidden">
                  <div className="w-full h-full overflow-auto">
                    <CurrentComponent data={dashboardData} settings={currentSettings} />
                  </div>
                </div>
              </div>
            </div>
        
            <div className="grid grid-cols-5 gap-4">
              {screens.map((screenItem, index) => (
                <button
                  key={screenItem.id}
                  onClick={() => setCurrentScreen(index)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video group ${
                    index === currentScreen
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="origin-top-left transform scale-[0.2] w-[500%] h-[500%] [&_.min-h-screen]:h-full [&_.min-h-screen]:min-h-0 [&_.h-screen]:h-full [&_.h-screen]:min-h-0">
                      <screenItem.component />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-transparent group-hover:bg-primary/5 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/90 backdrop-blur-sm border-t border-border">
                    <p className="text-xs font-medium text-center truncate">{screenItem.name}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSettings} disabled={isSaving || isLoading} className="gap-2">
                    {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {isSaving ? "Saving..." : "Save Screen Configuration"}
                </Button>
            </div>
              

          </div>

          {/* Right Panel - Settings & History */}
          <div className="space-y-6">
            {/* Audio Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Audio Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX className="h-5 w-5 text-muted-foreground" /> : <Volume2 className="h-5 w-5" />}
                    <span className="text-sm font-medium">Announcements</span>
                  </div>
                  <Switch checked={!isMuted} onCheckedChange={(checked) => setIsMuted(!checked)} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume</span>
                    <span className="text-sm font-medium">{volume[0]}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    disabled={isMuted}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Repeat Count</span>
                  <Select value={repeatCount} onValueChange={setRepeatCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 time</SelectItem>
                      <SelectItem value="2">2 times</SelectItem>
                      <SelectItem value="3">3 times</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {isAnnouncing ? <Mic className="h-5 w-5 text-success" /> : <MicOff className="h-5 w-5 text-muted-foreground" />}
                    <span className="text-sm font-medium">Voice Announce</span>
                  </div>
                  <Switch checked={isAnnouncing} onCheckedChange={setIsAnnouncing} />
                </div>
              </CardContent>
            </Card>

            {/* Display Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Display Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Display View</span>
                  <Select value={displayView} onValueChange={setDisplayView}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Screen</SelectItem>
                      <SelectItem value="split">Split Screen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Display Timer</span>
                  <Select value={displayTimer} onValueChange={setDisplayTimer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (i + 1) * 10).map((sec) => (
                        <SelectItem key={sec} value={sec.toString()}>{sec} seconds</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {isPaused ? <Pause className="h-5 w-5 text-warning" /> : <Play className="h-5 w-5 text-success" />}
                    <span className="text-sm font-medium">Display Status</span>
                  </div>
                  <Switch checked={!isPaused} onCheckedChange={(checked) => setIsPaused(!checked)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span className="text-sm font-medium">Flash on Call</span>
                  </div>
                  <Switch checked={isFlashOnCall} onCheckedChange={setIsFlashOnCall} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Emergency Mode</span>
                  </div>
                  <Switch checked={isEmergencyMode} onCheckedChange={setIsEmergencyMode} />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionSettings;
