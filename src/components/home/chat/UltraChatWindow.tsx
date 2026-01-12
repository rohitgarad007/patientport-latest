import { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Globe, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import UltraChatMessage from "./UltraChatMessage";
import { useUltraChatLogic } from "./useUltraChatLogic";
import { PaIcons } from "@/components/icons/PaIcons";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface UltraChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

function UltraChatWindow({ isOpen, onClose }: UltraChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  // UltraChatWindow component
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
  } = useUltraChatLogic();

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

  // Pure validation and submission gating (no setState here)
  const [selectedGender, setSelectedGender] = useState<string>("");

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => {
    const today = new Date();
    const initialDate = inputValue ? parse(inputValue, "yyyy-MM-dd", today) : today;
    const min = new Date(1960, 0, 1);
    const max = today;
    const clamped =
      initialDate > max ? max : initialDate < min ? min : initialDate;
    return new Date(clamped.getFullYear(), clamped.getMonth(), 1);
  });
  const getErrorMsg = (state: typeof conversationState, value: string, gender: string) => {
    if (state === "book_phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return "";
      if (digits.length !== 10) return "Please enter a valid 10-digit phone number.";
      return "";
    }
    if (state === "book_user_register_name" || state === "booking_name") {
      if (value.length === 0) return "";
      if (!/^[A-Za-z\s]+$/.test(value)) return "Name should contain only letters and spaces.";
      return "";
    }
    if (state === "book_user_register_dob") {
      if (!value) return "Please select a valid date (YYYY-MM-DD).";
      return "";
    }
    if (state === "book_user_register_gender") {
      if (!gender) return "Please select gender.";
      return "";
    }
    return "";
  };

  const hasValue = (() => {
    if (conversationState === "book_phone") return inputValue.length > 0;
    if (conversationState === "book_user_register_name" || conversationState === "booking_name") return inputValue.length > 0;
    if (conversationState === "book_user_register_dob") return inputValue.length > 0;
    if (conversationState === "book_user_register_gender") return !!selectedGender;
    return inputValue.trim().length > 0;
  })();

  const errorMsg = getErrorMsg(conversationState, inputValue, selectedGender);
  const canSubmit =
    !isTyping &&
    conversationState !== "language_selection" &&
    hasValue &&
    errorMsg === "";

  // Disable free text input until assistant asks for input
  const awaitingAssistantPrompt = !(["book_phone","book_user_register_name","booking_name","book_user_register_dob","book_user_register_gender"].includes(conversationState));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    let toSend = inputValue;
    if (conversationState === "book_user_register_gender") {
      toSend = selectedGender;
    }
    handleSendMessage(toSend);
    setInputValue("");
    setSelectedGender("");
  };

  const languageFlags = {
    english: '🇬🇧',
    hindi: '🇮🇳',
    marathi: '🇮🇳'
  };

  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 w-[450px] h-[650px] bg-background border-2 shadow-2xl rounded-2xl transition-all duration-300 flex flex-col z-50",
        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src={PaIcons.hospital1} alt="Email" className="w-10 h-10 " />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Health Assistant</h3>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-background to-muted/20" ref={scrollRef}>
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
                onSelectPatient={handlePatientSelection}
                onSelectNewUser={handleNewUserSelection}
                onSelectDoctor={handleDoctorSelection}
                onSelectDate={handleDateSelection}
                onSelectTimeSlot={handleTimeSlotSelection}
              />
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2 border-2 border-primary/20">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-medium">AI is thinking...</span>
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

      {/* Input Area */}
      <div className="p-4 border-t bg-gradient-to-r from-muted/30 to-muted/50">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {conversationState === "book_phone" && (
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
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}

          {(conversationState === "book_user_register_name" || conversationState === "booking_name") && (
            <div className="flex gap-2">
              <Input
                value={inputValue}
                type="text"
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter your full name"
                disabled={isTyping}
                className="flex-1 rounded-full border-2 h-12 px-4 focus:border-primary transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!canSubmit}
                className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}

          {conversationState === "book_user_register_dob" && (
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
                  {/* Month & Year dropdowns (Jan–Dec, 1960–current) */}
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
                        {[
                          "January","February","March","April","May","June",
                          "July","August","September","October","November","December",
                        ].map((label, idx) => (
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
                        {Array.from(
                          { length: new Date().getFullYear() - 1960 + 1 },
                          (_, i) => 1960 + i
                        ).map((year) => (
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
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}

          {conversationState === "book_user_register_gender" && (
            <div className="flex gap-2">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
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
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}

          {!(["book_phone","book_user_register_name","booking_name","book_user_register_dob","book_user_register_gender"].includes(conversationState)) && (
            <div className={cn("flex gap-2", awaitingAssistantPrompt && "pointer-events-none opacity-50")} aria-disabled={awaitingAssistantPrompt}>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={conversationState === "language_selection" ? "Please select a language first..." : "Type your message..."}
                disabled={awaitingAssistantPrompt || isTyping || conversationState === "language_selection"}
                className="flex-1 rounded-full border-2 h-12 px-4 focus:border-primary transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={awaitingAssistantPrompt || !inputValue.trim() || isTyping || conversationState === "language_selection"}
                className="rounded-full h-12 w-12 bg-gradient-to-br from-primary to-secondary hover:scale-105 transition-transform"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          )}

          {hasValue && errorMsg && (
            <p className="text-xs text-red-600 mt-1 px-2">{errorMsg}</p>
          )}
        </form>
        
      </div>
    </div>
  );
};

export default UltraChatWindow;
