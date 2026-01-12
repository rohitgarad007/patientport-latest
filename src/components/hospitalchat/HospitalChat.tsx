import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UltraChatMessage from "@/components/home/chat/UltraChatMessage";
import InvalidHospitalLink from "./InvalidHospitalLink";
import { useHospitalChatLogic } from "./useHospitalChatLogic";
import { PaIcons } from "@/components/icons/PaIcons";
import { fetchPublicHospitalInfo, setCurrentHospital, getCurrentHospitalId, getCurrentHospitalName } from "@/services/PublicHomeService";
import { Loader2, CalendarDays } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { parse, format } from "date-fns";

const HospitalChat = () => {
  const navigate = useNavigate();
  const { hospitalId: hosuidParam, hospitalName: hospitalNameParam } = useParams();

  // Resolved hospital details (from public hosuid -> backend lookup or storage)
  const [resolvedHospitalId, setResolvedHospitalId] = useState<number>(() => getCurrentHospitalId() ?? 0);
  const [resolvedHospitalName, setResolvedHospitalName] = useState<string>(() => getCurrentHospitalName() ?? (hospitalNameParam || ""));
  const [loadingHospital, setLoadingHospital] = useState<boolean>(false);
  const [invalidLink, setInvalidLink] = useState<boolean>(false);

  // On mount or when hosuid changes, fetch hospital info and persist it
  useEffect(() => {
    const hosuid = hosuidParam || "";
    if (!hosuid) { setInvalidLink(true); return; }
    setLoadingHospital(true);
    (async () => {
      try {
        const info = await fetchPublicHospitalInfo(hosuid);
        const idNum = Number(info.id || 0);
        const nameStr = String(info.name || "");
        if (!idNum || !nameStr) {
          setInvalidLink(true);
        } else {
          setResolvedHospitalId(idNum);
          setResolvedHospitalName(nameStr);
          setCurrentHospital({ id: idNum, name: nameStr });
          setInvalidLink(false);
        }
      } catch {
        // Network or backend error -> mark invalid link when hosuid provided
        setInvalidLink(true);
      } finally {
        setLoadingHospital(false);
      }
    })();
  }, [hosuidParam, hospitalNameParam]);

  const {
    messages,
    isTyping,
    language,
    conversationState,
    handleSendMessage,
    handleLanguageSelection,
    handleMenuSelection,
    handleDoctorSelection,
    handleDateSelection,
    handleTimeSlotSelection,
    handlePatientSelection,
    handleNewUserSelection,
  } = useHospitalChatLogic(resolvedHospitalId, resolvedHospitalName);

  const [inputValue, setInputValue] = useState("");
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedGender, setSelectedGender] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom with smooth behavior
    setTimeout(() => {
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    }, 100);
  }, [messages, isTyping]);

  const languageFlags: Record<string, string> = {
    english: '🇬🇧',
    hindi: '🇮🇳',
    marathi: '🇮🇳'
  };

  const getErrorMsg = (value: string) => {
    if (conversationState === "book_phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return "";
      if (digits.length !== 10) return "Please enter a valid 10-digit phone number.";
      return "";
    }
    if (conversationState === "book_user_register_name" || conversationState === "booking_name") {
      if (value.length === 0) return "";
      if (!/^[A-Za-z\s]+$/.test(value)) return "Name should contain only letters and spaces.";
      return "";
    }
    if (conversationState === "book_user_register_dob") {
      if (!value) return "Please enter date as YYYY-MM-DD.";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Please enter date as YYYY-MM-DD.";
      return "";
    }
    if (conversationState === "book_user_register_gender") {
      if (!value) return "Please enter gender (Male/Female/Other).";
      return "";
    }
    return "";
  };

  const hasValue = (() => {
    if (conversationState === "book_phone") return inputValue.length > 0;
    if (conversationState === "book_user_register_name" || conversationState === "booking_name") return inputValue.length > 0;
    if (conversationState === "book_user_register_dob") return inputValue.length > 0;
    if (conversationState === "book_user_register_gender") return inputValue.length > 0;
    return inputValue.trim().length > 0;
  })();

  const errorMsg = getErrorMsg(inputValue);
  const canSubmit = !isTyping && conversationState !== "language_selection" && hasValue && errorMsg === "";
  const awaitingAssistantPrompt = !( ["book_phone","book_user_register_name","book_user_register_dob","book_user_register_gender"].includes(conversationState) );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    let toSend = inputValue;
    if (conversationState === "book_phone") {
      toSend = inputValue.replace(/\D/g, "");
    }
    handleSendMessage(toSend);
    setInputValue("");
  };

  // If hospital link is invalid, show only the invalid-link UI
  if (invalidLink) {
    return <InvalidHospitalLink />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/30 to-muted/60">
      <div className="container max-w-3xl mx-auto p-0 flex-1 flex flex-col animate-fade-in pb-24">
        
        {/* Chat Window Card */}
        <Card className="mb-6 border-primary/20 shadow-lg flex-1 flex flex-col">
          <CardHeader className="bg-primary/5 p-0">
            <CardTitle className="flex items-center justify-between py-2 pl-2 pr-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={PaIcons.hospital1} alt="Chat" className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg px-2 py-1 truncate" style={{ maxWidth: "320px" }}>{resolvedHospitalName || hospitalNameParam || "Hospital"}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs opacity-90">Online</span>
                    {conversationState !== "language_selection" && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {languageFlags[language]} {language.charAt(0).toUpperCase() + language.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1">
            {/* Messages */}
            <ScrollArea className="h-[calc(100vh-220px)] p-0 bg-gradient-to-b from-background to-muted/20 rounded-lg" ref={scrollRef}>
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <UltraChatMessage
                      message={message}
                      language={language}
                      onSelectLanguage={handleLanguageSelection}
                      onSelectMenuOption={handleMenuSelection}
                      onSelectDoctor={handleDoctorSelection}
                      onSelectDate={handleDateSelection}
                      onSelectTimeSlot={handleTimeSlotSelection}
                      onSelectPatient={handlePatientSelection}
                      onSelectNewUser={handleNewUserSelection}
                    />
                  </div>
                ))}

                {(isTyping || loadingHospital) && (
                  <div className="flex justify-start animate-in fade-in">
                    <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2 border-2 border-primary/20">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">{loadingHospital ? "Loading hospital info..." : "AI is thinking..."}</span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input moved to fixed footer */}
          </CardContent>
        </Card>

        {/* Fixed footer input */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
          <div className="container max-w-3xl mx-auto p-3">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              {!invalidLink && conversationState === "book_phone" && (
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      setInputValue(digitsOnly);
                    }}
                    placeholder="Enter 10-digit phone number"
                    disabled={isTyping}
                    className="flex-1 rounded-full border-2 h-12 px-4 focus:border-primary transition-all"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!canSubmit}
                    className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    ➤
                  </Button>
                </div>
              )}

              {!invalidLink && conversationState === "book_user_register_dob" && (
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-full border-2 h-12 px-4 justify-between"
                        disabled={isTyping}
                      >
                        <span className="text-left">
                          {inputValue
                            ? format(parse(inputValue || "", "yyyy-MM-dd", new Date()), "MMMM d, yyyy")
                            : "Select date"}
                        </span>
                        <CalendarDays className="h-5 w-5 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-3 w-[320px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Select
                          value={String(visibleMonth.getMonth())}
                          onValueChange={(m) => {
                            const month = Number(m);
                            setVisibleMonth(new Date(visibleMonth.getFullYear(), month, 1));
                          }}
                        >
                          <SelectTrigger className="w-[160px] h-10 rounded-xl border-2 px-4">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((label, idx) => (
                              <SelectItem key={label} value={String(idx)}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={String(visibleMonth.getFullYear())}
                          onValueChange={(y) => {
                            const year = Number(y);
                            setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1));
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-10 rounded-xl border-2 px-4">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: new Date().getFullYear() - 1960 + 1 }, (_, i) => 1960 + i).map((year) => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Calendar
                        mode="single"
                        month={visibleMonth}
                        onMonthChange={setVisibleMonth}
                        selected={inputValue ? parse(inputValue, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(day) => {
                          if (day) {
                            const iso = format(day, "yyyy-MM-dd");
                            setInputValue(iso);
                            setVisibleMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                          }
                        }}
                        fromDate={new Date(1960, 0, 1)}
                        toDate={new Date()}
                        showOutsideDays
                      />
                    </PopoverContent>
                  </Popover>

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!canSubmit}
                    className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    ➤
                  </Button>
                </div>
              )}

              {!invalidLink && conversationState === "book_user_register_gender" && (
                <div className="flex gap-2">
                  <select
                    value={selectedGender}
                    onChange={(e) => {
                      setSelectedGender(e.target.value);
                      setInputValue(e.target.value);
                    }}
                    className="flex-1 rounded-full border-2 h-12 px-4 bg-background focus:border-primary transition-all"
                    disabled={isTyping}
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!canSubmit}
                    className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    ➤
                  </Button>
                </div>
              )}

              {!invalidLink && conversationState !== "book_phone" && conversationState !== "book_user_register_dob" && conversationState !== "book_user_register_gender" && (
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={awaitingAssistantPrompt ? "Please use buttons above" : "Type your message"}
                    disabled={isTyping || awaitingAssistantPrompt}
                    className="flex-1 rounded-full border-2 h-12 px-4 focus:border-primary transition-all"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!canSubmit || awaitingAssistantPrompt}
                    className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
                  >
                    ➤
                  </Button>
                </div>
              )}

              {!invalidLink && errorMsg && (
                <p className="text-xs text-destructive px-2">{errorMsg}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalChat;
