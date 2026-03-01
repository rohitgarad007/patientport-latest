import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StaffAppSidebar } from "./StaffAppSidebar";
import Cookies from "js-cookie";
import { staffProfileService } from "@/services/StaffProfileService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import Swal from "sweetalert2";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export function StaffLayout({ children }: StaffLayoutProps) {
  // Screen Lock States
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem("staff_screen_locked") === "true";
  });
  const [pin, setPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [sleepTime, setSleepTime] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync Lock State with LocalStorage & Across Tabs
  useEffect(() => {
    if (isLocked) {
      localStorage.setItem("staff_screen_locked", "true");
    } else {
      localStorage.removeItem("staff_screen_locked");
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "staff_screen_locked") {
        setIsLocked(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isLocked]);

  // Load staff info from cookie & fetch profile for screen lock settings
  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }

    const fetchProfileSettings = async () => {
      try {
        const profile = await staffProfileService.getProfile();
        if (profile) {
          if (profile.screen_lock_pin && profile.screen_lock_pin.length >= 4) {
            setPin(profile.screen_lock_pin);
          } else {
            setPin(""); // Reset if removed
          }
          if (profile.screen_sleep_time) {
            setSleepTime(parseInt(profile.screen_sleep_time));
          } else {
            setSleepTime(null); // Reset if removed
          }
        }
      } catch (error) {
        console.error("Failed to load profile settings for screen lock", error);
      }
    };

    fetchProfileSettings();

    // Subscribe to profile updates
    const unsubscribe = staffProfileService.subscribe(fetchProfileSettings);

    return () => {
      unsubscribe();
    };
  }, []);

  // Keyboard Shortcut for Screen Lock (Ctrl + Alt + L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        if (pin && pin.length >= 4) {
          setIsLocked(true);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Screen Lock Unavailable",
            text: "Please set a screen lock PIN in your profile settings first.",
            timer: 3000,
            timerProgressBar: true,
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pin]);

  // Idle Timer Logic
  useEffect(() => {
    if (!pin || !sleepTime) return;

    const resetTimer = () => {
      if (isLocked) return;
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }

      idleTimerRef.current = setTimeout(() => {
        setIsLocked(true);
      }, sleepTime * 1000);
    };

    // Events to track activity - expanded list for full coverage
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    
    // Add listeners to window
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer start
    resetTimer();

    // Cleanup
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [pin, sleepTime, isLocked]);

  const handleUnlock = () => {
    if (enteredPin === pin) {
      setIsLocked(false);
      setEnteredPin("");
      // Reset timer will happen automatically via event listeners
    } else {
      // Professional SweetAlert2 for incorrect PIN
      Swal.fire({
        icon: "error",
        title: "Incorrect PIN",
        text: "The PIN you entered is incorrect. Please try again.",
        confirmButtonColor: "#ef4444", // red-500
        confirmButtonText: "Try Again",
        timer: 3000,
        timerProgressBar: true,
        backdrop: false,
        customClass: {
          container: "z-[200]",
        },
      });
      setEnteredPin("");
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    localStorage.removeItem("staff_screen_locked");
    window.location.href = "/login";
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="w-full sm:max-w-full max-w-[100%] mx-auto min-h-screen flex w-full bg-background xs-mbody relative">
        <StaffAppSidebar />
        <div className="w-full sm:max-w-full max-w-[100%] mx-auto flex-1 flex flex-col pt-16 sx-pagebody">
         
          <main className="w-full sm:max-w-full max-w-[100%] mx-auto flex-1 p-6 bg-gradient-to-br from-background to-muted/20 sx-col">
            {children}
          </main>
        </div>

        {/* 🔒 Screen Lock Overlay */}
        {isLocked && (
          <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Screen Locked</h2>
                {currentUser && (
                  <p className="text-muted-foreground">
                    Welcome back, {currentUser.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Enter your PIN to unlock the screen
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    placeholder="Enter PIN"
                    className="text-center text-lg tracking-widest pr-10"
                    value={enteredPin}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && val.length <= 6) {
                        setEnteredPin(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlock();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                <Button 
                  className="w-full h-11 text-lg" 
                  onClick={handleUnlock}
                  disabled={enteredPin.length < 4}
                >
                  Unlock Screen
                </Button>

                <div className="pt-2">
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}
