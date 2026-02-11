import { useState } from "react";
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
import Screen7FullScreenToken from "@/components/reception/Screen7FullScreenToken"
import Screen8TimelineView from "@/components/reception/Screen8TimelineView"
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
    { id: 5, name: "Full Screen Token", description: "Giant token display", component: Screen7FullScreenToken },
    { id: 6, name: "Timeline View", description: "Vertical timeline queue", component: Screen8TimelineView },
    { id: 7, name: "Gradient Modern", description: "Contemporary gradient design", component: Screen10GradientModern },
  ];

  const [currentScreen, setCurrentScreen] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const CurrentComponent = screens[currentScreen].component;

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
                    <CurrentComponent />
                  </div>
                </div>
              </div>
            </div>
        
            <div className="grid grid-cols-5 gap-4">
              {screens.map((screen, index) => (
                <button
                  key={screen.id}
                  onClick={() => setCurrentScreen(index)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video ${
                    index === currentScreen
                      ? 'border-primary shadow-lg ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                    <div className="text-center">
                      <div className="token-number text-2xl font-bold text-primary">{screen.id}</div>
                      <p className="text-xs text-muted-foreground mt-1">{screen.name}</p>
                    </div>
                  </div>
                </button>
              ))}
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
                <div className="flex items-center justify-between">
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
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Emergency Mode</span>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Call History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {callHistory.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          item.action === "Called" ? "bg-success/10 text-success" :
                          item.action === "Completed" ? "bg-primary/10 text-primary" :
                          item.action === "Recalled" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        )}>
                          {item.action === "Called" && <PhoneCall className="h-4 w-4" />}
                          {item.action === "Completed" && <CheckCircle className="h-4 w-4" />}
                          {item.action === "Recalled" && <RotateCcw className="h-4 w-4" />}
                          {(item.action === "Skipped" || item.action === "No Show") && <XCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            <span className="font-mono text-primary">{item.token}</span>
                            {" "}{item.action.toLowerCase()}
                          </p>
                          <p className="text-muted-foreground truncate">{item.doctor}</p>
                        </div>
                        <span className="text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionSettings;
