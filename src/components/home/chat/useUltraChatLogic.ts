// useUltraChatLogic hook
import { useState, useCallback, useEffect } from "react";
import { UltraMessage } from "./UltraChatMessage";
import { Language, getTranslation } from "@/utils/translations";
import { checkUser, registerUser, getDoctors, searchDoctor, bookAppointment, chatAssistant, fetchHomeHospital, submitHomePatient, getAvailableSlots, bookPatientAppointment, getAppointmentDetails } from "@/services/HomeService";
import { getCurrentHospitalId } from "@/services/PublicHomeService";

type ConversationState =
  | "language_selection"
  | "menu"
  | "idle"
  | "book_phone"
  | "book_patient_selection"
  | "book_user_known"
  | "book_user_register_name"
  | "book_user_register_age"
  | "book_user_register_location"
  | "book_doctor_list"
  | "book_doctor_selected"
  | "book_date_time"
  | "book_finalize"
  | "find_doctor_query";

interface BookingData {
  phone?: string;
  name?: string;
  age?: number;
  location?: string;
  doctorId?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  gender?: string;
  dob?: string;
  patientId?: number;
}

export const useUltraChatLogic = () => {
  const [messages, setMessages] = useState<UltraMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("language_selection");
  const [language, setLanguage] = useState<Language>("english");
  const [booking, setBooking] = useState<BookingData>({});
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [homeHospitalId, setHomeHospitalId] = useState<number>(() => getCurrentHospitalId() ?? 2);
  const [appointmentDayLimit, setAppointmentDayLimit] = useState<number>(7);

  const addMessage = useCallback((text: string, sender: "user" | "assistant", type?: UltraMessage["type"], data?: any) => {
    const uniqueId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const newMessage: UltraMessage = {
      id: uniqueId,
      text,
      sender,
      timestamp: new Date(),
      type,
      data,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const simulateTyping = useCallback(async (callback: () => void, delay = 600) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, delay));
    setIsTyping(false);
    callback();
  }, []);

  // Enqueue language selector on start
  useEffect(() => {
      addMessage(getTranslation(language, 'selectLanguage'), "assistant", "language_selector");
  }, []); // runs once on mount

  useEffect(() => {
    (async () => {
      // Prefer persisted hospital id if available
      const persisted = getCurrentHospitalId();
      const idToFetch = persisted && persisted > 0 ? persisted : undefined;
      
      try {
        const info = await fetchHomeHospital(idToFetch);
        setHomeHospitalId(Number(info.id || 2));
        if (info.appointment_day_limit) {
          setAppointmentDayLimit(info.appointment_day_limit);
        }
      } catch {
        if (persisted) setHomeHospitalId(persisted);
        else setHomeHospitalId(2);
      }
    })();
  }, []);
  const handleLanguageSelection = useCallback((selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setConversationState("idle");
    simulateTyping(() => {
      addMessage(getTranslation(selectedLanguage, 'welcome'), "assistant");
      // Localized menu header with only three options
      addMessage(getTranslation(selectedLanguage, 'allowedOptionsReminder'), "assistant", "menu_options");
    });
  }, [addMessage, simulateTyping]);

  const handleMenuSelection = useCallback((opt: "book_appointment" | "hospital_info" | "contact_info") => {
    if (opt === "book_appointment") {
      setBooking({});
      setConversationState("book_phone");
      simulateTyping(() => {
        addMessage(getTranslation(language, 'askingPhone'), "assistant");
      });
      return;
    }
    if (opt === "hospital_info") {
      (async () => {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'hospitalInfo')}\n${info.name}${info.short_name ? ` (${info.short_name})` : ""}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'hospitalInfo'), "assistant");
          });
        }
      })();
      return;
    }
    if (opt === "contact_info") {
      (async () => {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'contactInfo')}\n${info.name}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'contactInfo'), "assistant");
          });
        }
      })();
      return;
    }
  }, [language, addMessage, simulateTyping]);

  const handleDoctorSelection = useCallback((doctorId: string) => {
    if (doctorId === 'best') {
      const bestDoctor = availableDoctors[0];
      setBooking((prev) => ({
        ...prev,
        doctorId: bestDoctor?.id,
        doctorName: bestDoctor?.name
      }));
    } else {
      const selectedDoctor = availableDoctors.find(d => String(d.id) === String(doctorId));
      setBooking((prev) => ({
        ...prev,
        doctorId,
        doctorName: selectedDoctor?.name
      }));
    }

    setConversationState("booking_date");
    simulateTyping(() => {
      addMessage(getTranslation(language, 'selectDate'), "assistant", "date_picker", { limit: appointmentDayLimit });
    });
  }, [language, addMessage, simulateTyping, availableDoctors, appointmentDayLimit]);

  const handleDateSelection = useCallback(async (date: string) => {
    addMessage(`Selected: ${date}`, "user");
  
    // Update booking state immediately
    setBooking((prev) => ({ ...prev, date }));
  
    // Ensure we have a doctor id
    const doctorIdStr = booking.doctorId || "0";
    const doctorIdNum = Number(doctorIdStr);
    if (!doctorIdNum || Number.isNaN(doctorIdNum)) {
      simulateTyping(() => {
        addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
      });
      return;
    }
  
    try {
      const resp = await getAvailableSlots(homeHospitalId, doctorIdNum, date, booking.phone, booking.patientId);
      const slots = resp.slots || [];
  
      // If user already has an appointment for this date, show confirmation instead of slots
      if (resp.success && resp.booked && resp.appointment) {
        const d = resp.appointment;
        setConversationState("idle");
        simulateTyping(() => {
          addMessage(
            "",
            "assistant",
            "confirmation",
            {
              name: d.patient_name || booking.name,
              hospital: d.hospital_name,
              doctor: d.doctor_name || booking.doctorName,
              date: d.date || date,
              time: d.time_label || `${d.start_time || ''}${d.end_time ? ' - ' + d.end_time : ''}`,
              phone: d.phone || booking.phone,
              token_no: d.token_no,
              appointment_uid: d.appointment_uid,
            }
          );
        });
        return;
      }

      if (!resp.success || slots.length === 0) {
        setConversationState("booking_doctor");
        simulateTyping(() => {
          addMessage(
            "",
            "assistant",
            "no_slots",
            {
              doctorName: booking.doctorName,
              onTryAgain: () => {
                setConversationState("booking_doctor");
                simulateTyping(() => {
                  addMessage(
                    getTranslation(language, "selectDoctor"),
                    "assistant",
                    "doctor_list",
                    { doctors: availableDoctors }
                  );
                });
              }
            }
          );
        });
      } else {
        setConversationState("booking_time");
        simulateTyping(() => {
          addMessage(
            getTranslation(language, "selectTimeSlot"),
            "assistant",
            "time_slots",
            { slots, source: resp.source, date }
          );
        });
      }
    } catch (e) {
      setConversationState("booking_doctor");
      simulateTyping(() => {
        addMessage(
          "",
          "assistant",
          "no_slots",
          {
            doctorName: booking.doctorName,
            onTryAgain: () => {
              setConversationState("booking_doctor");
              simulateTyping(() => {
                addMessage(
                  getTranslation(language, "selectDoctor"),
                  "assistant",
                  "doctor_list",
                  { doctors: availableDoctors }
                );
              });
            }
          }
        );
      });
    }
  }, [language, addMessage, simulateTyping, booking, availableDoctors, homeHospitalId]);

  const handleTimeSlotSelection = useCallback(async (slot: any, period: string) => {
    const start = slot?.start_time ?? "";
    const end = slot?.end_time ?? "";
    const label = start && end ? `${start} - ${end}` : slot?.title ?? "Selected slot";
    addMessage(`${label}`, "user");

    // Persist selected time in booking state (for confirmation display)
    setBooking((prev) => ({ ...prev, time: label }));

    // Guards
    const doctorIdNum = Number(booking.doctorId || 0);
    const dateStr = (slot?.date as string) || booking.date || "";
    const slotIdNum = Number(slot?.id || 0);
    const patientName = booking.name || "";
    const phone = booking.phone || "";

    if (!doctorIdNum || !dateStr || !slotIdNum) {
      simulateTyping(() => {
        addMessage(
          getTranslation(language, 'allowedOptionsReminder'),
          "assistant",
          "menu_options"
        );
      });
      return;
    }

    // Attempt booking
    try {
      const resp = await bookPatientAppointment({
        hospital_id: homeHospitalId,
        doctor_id: doctorIdNum,
        date: dateStr,
        slot_id: slotIdNum,
        patient_name: patientName,
        phone,
        patient_id: booking.patientId,
        source: slot?.source,
      });

      if (resp.success) {
        // Fetch detailed appointment info to show comprehensive confirmation
        const details = await getAppointmentDetails({
          appointment_uid: resp.appointment_uid,
          appointment_id: resp.appointment_id,
        });

        setConversationState("idle");
        simulateTyping(() => {
          setBooking((currentData) => {
            const d = details.data || {};
            addMessage(
              "",
              "assistant",
              "confirmation",
              {
                name: d.patient_name || currentData.name,
                hospital: d.hospital_name,
                doctor: d.doctor_name || currentData.doctorName,
                date: d.date || dateStr,
                time: d.time_label || label,
                phone: d.phone || currentData.phone,
                token_no: d.token_no,
                appointment_uid: d.appointment_uid || resp.appointment_uid,
              }
            );
            return currentData;
          });
        });
      } else {
        simulateTyping(() => {
          addMessage(
            resp.message || getTranslation(language, 'noSlots'),
            "assistant"
          );
        });
      }
    } catch (e) {
      simulateTyping(() => {
        addMessage(getTranslation(language, 'noSlots'), "assistant");
      });
    }
  }, [addMessage, simulateTyping, booking, language, homeHospitalId]);

  const handlePatientSelection = useCallback(async (patient: any) => {
    setBooking((prev) => ({ 
      ...prev, 
      name: patient.name, 
      age: patient.age, 
      location: patient.location,
      patientId: Number(patient.id)
    }));
    setConversationState("booking_doctor");
    
    try {
        const doctorsRes = await getDoctors();
        const doctorItems = doctorsRes.items || doctorsRes.doctors || [];
        setAvailableDoctors(doctorItems);
        simulateTyping(() => {
          addMessage(getTranslation(language, 'selectDoctor'), "assistant", "doctor_list", { doctors: doctorItems });
        });
    } catch {
        // Fallback
    }
  }, [language, addMessage, simulateTyping]);

  const handleNewUserSelection = useCallback(() => {
    setBooking(prev => ({ ...prev, patientId: undefined }));
    setConversationState("book_user_register_name");
    simulateTyping(() => {
      addMessage(getTranslation(language, 'askingName'), "assistant");
    });
  }, [language, addMessage, simulateTyping]);

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage(text, "user");

    // Phone-first booking
    if (conversationState === "book_phone") {
      const phone = text.replace(/\D/g, "");
      if (!/^\d{10}$/.test(phone)) {
        simulateTyping(() => {
          addMessage(getTranslation(language, 'invalidPhone'), "assistant");
          addMessage(getTranslation(language, 'askingPhone'), "assistant");
        });
        return;
      }

      setBooking((prev) => ({ ...prev, phone }));

      try {
        const res = await checkUser(phone, homeHospitalId);
        
        // Check for multiple patients OR single patient (user always wants selection option)
        if (res.patients && res.patients.length > 0) {
            setConversationState("book_patient_selection");
            simulateTyping(() => {
                const firstPatient = res.patients![0];
                const welcomeMsg = `Welcome ${firstPatient.name}`;
                addMessage(welcomeMsg, "assistant");
                addMessage("Please select a patient or add a new one:", "assistant", "patient_list", { patients: res.patients });
            });
        } 
        // Fallback for single user if array not returned but exists is true (legacy API compat)
        else if (res.exists) {
          // Wrap single user in array to force selection screen as requested
          const singlePatient = {
             id: "0", 
             name: res.name || "Patient", 
             age: res.age, 
             location: res.location
          };
          setConversationState("book_patient_selection");
          simulateTyping(() => {
              addMessage(`Welcome ${singlePatient.name}`, "assistant");
              addMessage("Please select a patient or add a new one:", "assistant", "patient_list", { patients: [singlePatient] });
          });
        } else {
          setConversationState("book_user_register_name");
          simulateTyping(() => {
            addMessage(getTranslation(language, 'askingName'), "assistant");
          });
        }
      } catch {
        // API error → ask name
        setConversationState("book_user_register_name");
        simulateTyping(() => {
          addMessage(getTranslation(language, 'askingName'), "assistant");
        });
      }
      return;
    }

    // Collect name
    if (conversationState === "book_user_register_name") {
      setBooking((prev) => ({ ...prev, name: text.trim() }));
      setConversationState("book_user_register_dob");
      simulateTyping(() => {
        addMessage(getTranslation(language, 'askingDOB'), "assistant");
      });
      return;
    }

    // Collect DOB (YYYY-MM-DD)
    if (conversationState === "book_user_register_dob") {
      const dob = text.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        simulateTyping(() => {
          addMessage(getTranslation(language, 'invalidDOB'), "assistant");
          addMessage(getTranslation(language, 'askingDOB'), "assistant");
        });
        return;
      }
      setBooking((prev) => ({ ...prev, dob }));
      setConversationState("book_user_register_gender");
      simulateTyping(() => {
        addMessage(getTranslation(language, 'askingGender'), "assistant");
      });
      return;
    }

    // Collect Gender
    if (conversationState === "book_user_register_gender") {
      const g = text.trim().toLowerCase();
      let gender: string | null = null;
      if (["male", "m", "पुरुष", "पुरूष"].includes(g)) gender = "Male";
      else if (["female", "f", "महिला", "स्त्री"].includes(g)) gender = "Female";
      else if (["other", "o", "अन्य", "इतर"].includes(g)) gender = "Other";

      if (!gender) {
        simulateTyping(() => {
          addMessage(getTranslation(language, 'invalidGender'), "assistant");
          addMessage(getTranslation(language, 'askingGender'), "assistant");
        });
        return;
      }

      setBooking((prev) => ({ ...prev, gender }));

      // Register patient
      try {
        const payload = {
          name: booking.name || "",
          phone: booking.phone || "",
          hospital_id: homeHospitalId,
          gender,
          dob: booking.dob || "",
        };
        const reg = await submitHomePatient(payload);
        if (reg.success) {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'registrationSuccess'), "assistant");
          });

          // Re-fetch patients list to show the updated list including the new patient
          try {
            const res = await checkUser(booking.phone, homeHospitalId);
            setConversationState("book_patient_selection");
            
            simulateTyping(() => {
              if (res.patients && res.patients.length > 0) {
                addMessage("Please select a patient:", "assistant", "patient_list", { patients: res.patients });
              } else if (res.exists) {
                 // Fallback for single user if array not returned
                 const singlePatient = {
                   id: "0", 
                   name: res.name || "Patient", 
                   age: res.age, 
                   location: res.location
                 };
                 addMessage("Please select a patient:", "assistant", "patient_list", { patients: [singlePatient] });
              }
            });
          } catch (e) {
            // Fallback to doctor selection if checkUser fails, but try to keep the flow
             setBooking((prev) => ({ ...prev, patientId: reg.patient_id }));
             setConversationState("booking_doctor");
             const doctorsRes = await getDoctors();
             const doctorItems = doctorsRes.items || doctorsRes.doctors || [];
             setAvailableDoctors(doctorItems);
             simulateTyping(() => {
               addMessage(getTranslation(language, 'selectDoctor'), "assistant", "doctor_list", { doctors: doctorItems });
             });
          }
        } else {
          simulateTyping(() => {
            addMessage(reg.message || getTranslation(language, 'allowedOptionsReminder'), "assistant", "menu_options");
          });
        }
      } catch {
        simulateTyping(() => {
          addMessage(getTranslation(language, 'allowedOptionsReminder'), "assistant", "menu_options");
        });
      }
      return;
    }

    // Existing booking flow for name/phone if reached via other paths
    if (conversationState === "booking_name") {
      setBooking((prev) => ({ ...prev, name: text }));
      setConversationState("booking_doctor");
      try {
        const doctorsRes = await getDoctors();
        const doctorItems = doctorsRes.items || doctorsRes.doctors || [];
        setAvailableDoctors(doctorItems);
        simulateTyping(() => {
          addMessage(getTranslation(language, 'selectDoctor'), "assistant", "doctor_list", { doctors: doctorItems });
        });
      } catch {
        simulateTyping(() => {
          addMessage(getTranslation(language, 'allowedOptionsReminder'), "assistant", "menu_options");
        });
      }
      return;
    }

    // Intent detection with OpenAI + mock fallback
    try {
      const history = messages.slice(-6).map(m => ({ role: m.sender, content: m.text }));
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      let intent: "book_appointment" | "hospital_info" | "contact_info" | "none" = "none";

      if (apiKey) {
        const { openAIChatJSON } = await import("@/services/openAIService");
        const ai = await openAIChatJSON(text, history, { temperature: 0.0 });
        intent = ai.intent;
      } else {
        const { mockChatGPTAnalysis } = await import("@/utils/mockChatGPT");
        const mock = await mockChatGPTAnalysis({ message: text, language, conversationHistory: history });
        if (mock.intent === "book_appointment") intent = "book_appointment";
        else if (mock.intent === "hospital_info") intent = "hospital_info";
        else if (mock.intent === "general") intent = "none";
        else intent = "none"; // disallow find_doctor/emergency here
      }

      if (intent === "book_appointment") {
        setConversationState("booking_name");
        simulateTyping(() => {
          addMessage(getTranslation(language, 'askingName'), "assistant");
        });
        return;
      }

      if (intent === "hospital_info") {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'hospitalInfo')}\n${info.name}${info.short_name ? ` (${info.short_name})` : ""}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'hospitalInfo'), "assistant");
          });
        }
        return;
      }

      if (intent === "contact_info") {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'contactInfo')}\n${info.name}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'contactInfo'), "assistant");
          });
        }
        return;
      }

      // Unclear intent → re-show localized menu
      simulateTyping(() => {
        addMessage(getTranslation(language, 'allowedOptionsReminder'), "assistant", "menu_options");
      });
    } catch {
      // Heuristic fallback
      const lower = text.toLowerCase();
      if (lower.includes("book") || lower.includes("appointment")) {
        setConversationState("booking_name");
        simulateTyping(() => {
          addMessage(getTranslation(language, 'askingName'), "assistant");
        });
        return;
      }
      if (lower.includes("hospital")) {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'hospitalInfo')}\n${info.name}${info.short_name ? ` (${info.short_name})` : ""}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'hospitalInfo'), "assistant");
          });
        }
        return;
      }
      if (lower.includes("contact") || lower.includes("phone") || lower.includes("email")) {
        try {
          const info = await fetchHomeHospital();
          simulateTyping(() => {
            addMessage(`${getTranslation(language, 'contactInfo')}\n${info.name}`, "assistant");
          });
        } catch {
          simulateTyping(() => {
            addMessage(getTranslation(language, 'contactInfo'), "assistant");
          });
        }
        return;
      }
      simulateTyping(() => {
        addMessage(getTranslation(language, 'allowedOptionsReminder'), "assistant", "menu_options");
      });
    }
  }, [conversationState, language, messages, addMessage, simulateTyping, homeHospitalId, booking]);
  return {
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
  };
}
