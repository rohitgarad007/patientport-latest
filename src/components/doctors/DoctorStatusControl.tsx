import { useState, useEffect } from "react";
import { Wifi, WifiOff, MessageSquare, Clock, ShieldCheck, ShieldAlert, ChevronDown, Check, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { doctorProfileService } from "@/services/DoctorProfileService";
import { useToast } from "@/components/ui/use-toast";
import { addMinutes, format } from "date-fns";

const durations = [
  { label: "5 min", value: "5m" },
  { label: "15 min", value: "15m" },
  { label: "30 min", value: "30m" },
  { label: "1 hr", value: "1h" },
  { label: "2 hr", value: "2h" },
  { label: "4 hr", value: "4h" },
];

// Generate minute intervals from 5min to 4hours (240min)
const customTimeOptions = (() => {
  const options = [];
  // 5 to 55 mins in 5 min intervals
  for (let i = 5; i < 60; i += 5) {
    options.push({ label: `${i} min`, value: `${i}m` });
  }
  // 1 hour to 4 hours in 15 min intervals
  for (let i = 60; i <= 240; i += 15) {
    const hours = Math.floor(i / 60);
    const mins = i % 60;
    const label = mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
    options.push({ label, value: `${i}m` });
  }
  return options;
})();

export interface DoctorStatusControlProps {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

export function DoctorStatusControl({ isOnline, setIsOnline }: DoctorStatusControlProps) {
  const [awayMessage, setAwayMessage] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [customTimeOpen, setCustomTimeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchDetails = async () => {
      try {
        const profile = await doctorProfileService.getProfile();
        if (mounted && profile) {
          if (profile.away_message) setAwayMessage(profile.away_message);
        }
      } catch (err) {
        console.error(err);
      }
    };
    // Only fetch if offline to populate the form with current status
    if (!isOnline) {
      fetchDetails();
    }
    return () => { mounted = false; };
  }, [isOnline]);

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    try {
      let backOnlineTime = "";
      if (selectedDuration) {
        const now = new Date();
        const match = selectedDuration.match(/(\d+)([mh])/);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2];
          const minutes = unit === 'h' ? value * 60 : value;
          
          // Get current time in IST
          const istOffset = 5.5 * 60 * 60 * 1000;
          const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
          const istTime = new Date(utcTime + istOffset);
          
          const futureDate = addMinutes(istTime, minutes);
          backOnlineTime = format(futureDate, "yyyy-MM-dd HH:mm:ss");
        }
      }
      
      const response = await doctorProfileService.updateStatus({
        is_online: 0,
        away_message: awayMessage,
        back_online_time: backOnlineTime
      });

      if (response.status) {
        toast({
          title: "Status Updated",
          description: "Your availability status has been updated.",
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.message || "Could not update status."
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoOnline = async () => {
    setIsLoading(true);
    try {
      const response = await doctorProfileService.updateStatus({
        is_online: 1,
        away_message: "",
        back_online_time: ""
      });

      if (response.status) {
        setIsOnline(true);
        setAwayMessage("");
        setSelectedDuration(null);
        toast({
          title: "You are now Online",
          description: "Patients can now request consultations.",
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.message
        });
      }
    } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred."
        });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOptions = customTimeOptions.filter(option => 
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isOnline) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wifi className="w-8 h-8 text-white" />
            </div>
          </div>
          {/* Smooth breathing background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-emerald-100/50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-emerald-50/50 animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-emerald-100/60 animate-[spin_8s_linear_infinite]" />
          
          <div className="absolute -bottom-1 -right-1 bg-emerald-100 p-1.5 rounded-full border-4 border-white z-20">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-emerald-600 mb-1">You're Online</h2>
        <p className="text-sm text-slate-500 mb-6">Accepting patient requests</p>

        <button 
          onClick={() => setIsOnline(false)}
          className="group relative w-64 h-14 bg-emerald-500 rounded-full p-1.5 cursor-pointer transition-all hover:bg-emerald-600 active:scale-95 flex items-center justify-between"
        >
          <span className="ml-6 text-white font-semibold text-lg">Online</span>
          <div className="h-11 w-11 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-bold text-emerald-600">ON</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Offline Status & Settings Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center text-center pb-6 border-b border-slate-100">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center shadow-inner">
                <WifiOff className="w-8 h-8 text-slate-500" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-100 p-1.5 rounded-full border-4 border-white z-20">
              <ShieldAlert className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-600 mb-1">You're Offline</h2>
          <p className="text-sm text-slate-400 mb-6">Configure your availability</p>

          <button 
            onClick={handleGoOnline}
            disabled={isLoading}
            className={cn(
              "group relative w-64 h-14 bg-slate-100 rounded-full p-1.5 cursor-pointer transition-all hover:bg-slate-200 active:scale-95 flex items-center justify-between",
              isLoading && "opacity-70 pointer-events-none"
            )}
          >
            <span className="ml-6 text-slate-500 font-semibold text-lg">
              {isLoading ? "Going Online..." : "Offline"}
            </span>
            <div className="h-11 w-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
               {isLoading ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <span className="text-xs font-bold text-slate-400">OFF</span>}
            </div>
          </button>
        </div>

        {/* Away Message Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Away Message</h3>
              <p className="text-xs text-slate-500">Visible to your patients</p>
            </div>
          </div>

          <div className="relative">
            <Textarea 
              placeholder="e.g. I'm currently in surgery. Will be available after 3 PM..."
              className="w-full h-full min-h-[120px] resize-none bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500 p-4 rounded-xl text-slate-600 placeholder:text-slate-400"
              value={awayMessage}
              onChange={(e) => setAwayMessage(e.target.value)}
              maxLength={200}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400 font-medium">
              {awayMessage.length}/200
            </div>
          </div>
        </div>

        {/* Timer Section */}
        <div>
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-slate-900">Back online in</h3>
              </div>
            </div>
            
            <Popover open={customTimeOpen} onOpenChange={setCustomTimeOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-8 text-xs rounded-full border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50",
                    (customTimeOpen || (selectedDuration && !durations.some(d => d.value === selectedDuration))) && "bg-emerald-50 text-emerald-600 border-emerald-200"
                  )}
                >
                  {selectedDuration && !durations.some(d => d.value === selectedDuration) 
                    ? customTimeOptions.find(o => o.value === selectedDuration)?.label
                    : "Custom"}
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
                  <h4 className="font-medium text-xs text-slate-500 uppercase tracking-wider px-1">Select Duration</h4>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search..."
                      className="h-8 pl-8 text-xs bg-white border-slate-200 focus-visible:ring-emerald-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="p-1.5 grid gap-0.5">
                    {filteredOptions.length > 0 ? (
                      filteredOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSelectedDuration(option.value);
                            setCustomTimeOpen(false);
                            setSearchQuery("");
                          }}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-colors text-left",
                            selectedDuration === option.value
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          {option.label}
                          {selectedDuration === option.value && (
                            <Check className="h-4 w-4 text-emerald-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No duration found
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => setSelectedDuration(duration.value)}
                className={cn(
                  "py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                  selectedDuration === duration.value
                    ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                    : "bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Update Status Button */}
      <Button 
        className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
        onClick={handleUpdateStatus}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Updating Status...
          </>
        ) : (
          "Update Status"
        )}
      </Button>
    </div>
  );
}
