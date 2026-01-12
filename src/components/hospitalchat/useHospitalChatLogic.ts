import { useState, useCallback, useEffect } from "react";
import { UltraMessage } from "@/components/home/chat/UltraChatMessage";
import { Language, getTranslation } from "@/utils/translations";
import {
  checkUser,
  fetchHomeDoctors,
  getAvailableSlots,
  bookPatientAppointment,
  getAppointmentDetails,
  submitHomePatient,
} from "@/services/HomeService";

type ConversationState =
  | "language_selection"
  | "menu"
  | "idle"
  | "book_phone"
  | "book_patient_selection"
  | "book_user_register_name"
  | "book_user_register_dob"
  | "book_user_register_gender"
  | "booking_doctor"
  | "booking_date"
  | "booking_time";

interface BookingData {
  phone?: string;
  name?: string;
  dob?: string;
  gender?: string;
  doctorId?: string;
  doctorName?: string;
  date?: string;
  time?: string;
  patientId?: number;
  age?: number;
  location?: string;
}

export const useHospitalChatLogic = (hospitalId: number, hospitalName?: string) => {
  const [messages, setMessages] = useState<UltraMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("language_selection");
  const [language, setLanguage] = useState<Language>("english");
  const [booking, setBooking] = useState<BookingData>({});
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);

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

  // Initial language select
  useEffect(() => {
    addMessage(getTranslation(language, "selectLanguage"), "assistant", "language_selector");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLanguageSelection = useCallback((selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setConversationState("idle");
    simulateTyping(() => {
      addMessage(getTranslation(selectedLanguage, "welcome"), "assistant");
      addMessage(getTranslation(selectedLanguage, "allowedOptionsReminder"), "assistant", "menu_options");
    });
  }, [addMessage, simulateTyping]);

  const handleMenuSelection = useCallback((opt: "book_appointment" | "hospital_info" | "contact_info") => {
    if (opt === "book_appointment") {
      setConversationState("book_phone");
      simulateTyping(() => {
        addMessage(getTranslation(language, "askingPhone"), "assistant");
      });
      return;
    }
    if (opt === "hospital_info") {
      simulateTyping(() => {
        addMessage(`${getTranslation(language, "hospitalInfo")}\n${hospitalName || "Hospital"}${hospitalId ? ` (ID: ${hospitalId})` : ""}` , "assistant");
      });
      return;
    }
    if (opt === "contact_info") {
      simulateTyping(() => {
        addMessage(`${getTranslation(language, "contactInfo")}\n${hospitalName || "Hospital"}`, "assistant");
      });
      return;
    }
  }, [language, hospitalId, hospitalName, addMessage, simulateTyping]);

  const handleDoctorSelection = useCallback((doctorId: string) => {
    const selected = availableDoctors.find(d => String(d.id) === String(doctorId)) || availableDoctors[0];
    setBooking((prev) => ({ ...prev, doctorId: String(selected?.id ?? doctorId), doctorName: selected?.name }));
    setConversationState("booking_date");
    simulateTyping(() => {
      addMessage(getTranslation(language, "selectDate"), "assistant", "date_picker");
    });
  }, [availableDoctors, language, addMessage, simulateTyping]);

  const handleDateSelection = useCallback(async (date: string) => {
    addMessage(`Selected: ${date}`, "user");
    setBooking((prev) => ({ ...prev, date }));

    const doctorIdNum = Number(booking.doctorId || 0);
    if (!doctorIdNum) {
      simulateTyping(() => {
        addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
      });
      return;
    }

    try {
      const resp = await getAvailableSlots(hospitalId, doctorIdNum, date, booking.phone);
      const slots = resp.slots || [];

      if (resp.success && resp.booked && resp.appointment) {
        const d = resp.appointment;
        setConversationState("idle");
        simulateTyping(() => {
          addMessage("", "assistant", "confirmation", {
            name: d.patient_name || booking.name,
            hospital: d.hospital_name || hospitalName,
            doctor: d.doctor_name || booking.doctorName,
            date: d.date || date,
            time: d.time_label || `${d.start_time || ""}${d.end_time ? " - " + d.end_time : ""}`,
            phone: d.phone || booking.phone,
            token_no: d.token_no,
            appointment_uid: d.appointment_uid,
          });
        });
        return;
      }

      if (!resp.success || slots.length === 0) {
        setConversationState("booking_doctor");
        simulateTyping(() => {
          addMessage("", "assistant", "no_slots", {
            doctorName: booking.doctorName,
            onTryAgain: () => {
              setConversationState("booking_doctor");
              simulateTyping(() => {
                addMessage(getTranslation(language, "selectDoctor"), "assistant", "doctor_list", { doctors: availableDoctors });
              });
            }
          });
        });
      } else {
        setConversationState("booking_time");
        simulateTyping(() => {
          addMessage(getTranslation(language, "selectTimeSlot"), "assistant", "time_slots", { slots, source: resp.source });
        });
      }
    } catch (e) {
      setConversationState("booking_doctor");
      simulateTyping(() => {
        addMessage("", "assistant", "no_slots", {
          doctorName: booking.doctorName,
          onTryAgain: () => {
            setConversationState("booking_doctor");
            simulateTyping(() => {
              addMessage(getTranslation(language, "selectDoctor"), "assistant", "doctor_list", { doctors: availableDoctors });
            });
          }
        });
      });
    }
  }, [hospitalId, hospitalName, language, booking.doctorId, booking.doctorName, booking.name, booking.phone, availableDoctors, addMessage, simulateTyping]);

  const handleTimeSlotSelection = useCallback(async (slot: any, period: string) => {
    const start = slot?.start_time ?? "";
    const end = slot?.end_time ?? "";
    const label = start && end ? `${start} - ${end}` : slot?.title ?? "Selected slot";
    addMessage(`${label}`, "user");

    setBooking((prev) => ({ ...prev, time: label }));

    const doctorIdNum = Number(booking.doctorId || 0);
    const dateStr = booking.date || "";
    const slotIdNum = Number(slot?.id || 0);
    const patientName = booking.name || "";
    const phone = booking.phone || "";

    if (!doctorIdNum || !dateStr || !slotIdNum) {
      simulateTyping(() => {
        addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
      });
      return;
    }

    try {
      const resp = await bookPatientAppointment({
        hospital_id: hospitalId,
        doctor_id: doctorIdNum,
        date: dateStr,
        slot_id: slotIdNum,
        patient_name: patientName,
        phone,
        patient_id: booking.patientId,
        source: slot?.source,
      });

      if (resp.success) {
        const details = await getAppointmentDetails({
          appointment_uid: resp.appointment_uid,
          appointment_id: resp.appointment_id,
        });

        setConversationState("idle");
        simulateTyping(() => {
          const d = details.data || {};
          addMessage("", "assistant", "confirmation", {
            name: d.patient_name || booking.name,
            hospital: d.hospital_name || hospitalName,
            doctor: d.doctor_name || booking.doctorName,
            date: d.date || dateStr,
            time: d.time_label || label,
            phone: d.phone || booking.phone,
            token_no: d.token_no,
            appointment_uid: d.appointment_uid || resp.appointment_uid,
          });
        });
      } else {
        simulateTyping(() => {
          addMessage(resp.message || getTranslation(language, "noSlots"), "assistant");
        });
      }
    } catch (e) {
      simulateTyping(() => {
        addMessage(getTranslation(language, "noSlots"), "assistant");
      });
    }
  }, [hospitalId, hospitalName, booking.doctorId, booking.date, booking.name, booking.phone, language, addMessage, simulateTyping]);

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
        const doctorItems = await fetchHomeDoctors(hospitalId);
        setAvailableDoctors(doctorItems);
        simulateTyping(() => {
          addMessage(getTranslation(language, 'selectDoctor'), "assistant", "doctor_list", { doctors: doctorItems });
        });
    } catch {
        simulateTyping(() => {
          addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
        });
    }
  }, [language, addMessage, simulateTyping, hospitalId]);

  const handleNewUserSelection = useCallback(() => {
    setBooking(prev => ({ ...prev, patientId: undefined }));
    setConversationState("book_user_register_name");
    simulateTyping(() => {
      addMessage(getTranslation(language, 'askingName'), "assistant");
    });
  }, [language, addMessage, simulateTyping]);

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage(text, "user");

    if (conversationState === "book_phone") {
      const phone = text.replace(/\D/g, "");
      if (!/^\d{10}$/.test(phone)) {
        simulateTyping(() => {
          addMessage(getTranslation(language, "invalidPhone"), "assistant");
          addMessage(getTranslation(language, "askingPhone"), "assistant");
        });
        return;
      }
      setBooking((prev) => ({ ...prev, phone }));
      try {
        const res = await checkUser(phone, hospitalId);
        
        if (res.patients && res.patients.length > 0) {
            setConversationState("book_patient_selection");
            simulateTyping(() => {
                const firstPatient = res.patients![0];
                const welcomeMsg = `Welcome ${firstPatient.name}`;
                addMessage(welcomeMsg, "assistant");
                addMessage("Please select a patient or add a new one:", "assistant", "patient_list", { patients: res.patients });
            });
        } 
        else if (res.exists) {
          // Wrap single user in array to force selection screen
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
            addMessage(getTranslation(language, "askingName"), "assistant");
          });
        }
      } catch {
        setConversationState("book_user_register_name");
        simulateTyping(() => {
          addMessage(getTranslation(language, "askingName"), "assistant");
        });
      }
      return;
    }

    if (conversationState === "book_user_register_name") {
      const name = text.trim();
      if (!name || !/^[A-Za-z\s]+$/.test(name)) {
        simulateTyping(() => {
          addMessage(getTranslation(language, "invalidName"), "assistant");
          addMessage(getTranslation(language, "askingName"), "assistant");
        });
        return;
      }
      setBooking((prev) => ({ ...prev, name }));
      setConversationState("book_user_register_dob");
      simulateTyping(() => {
        addMessage(getTranslation(language, "askingDOB"), "assistant");
      });
      return;
    }

    if (conversationState === "book_user_register_dob") {
      const dob = text.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        simulateTyping(() => {
          addMessage(getTranslation(language, "invalidDOB"), "assistant");
          addMessage(getTranslation(language, "askingDOB"), "assistant");
        });
        return;
      }
      setBooking((prev) => ({ ...prev, dob }));
      setConversationState("book_user_register_gender");
      simulateTyping(() => {
        addMessage(getTranslation(language, "askingGender"), "assistant");
      });
      return;
    }

    if (conversationState === "book_user_register_gender") {
      const g = text.trim().toLowerCase();
      let gender: string | null = null;
      if (["male", "m", "पुरुष", "पुरूष"].includes(g)) gender = "Male";
      else if (["female", "f", "महिला", "स्त्री"].includes(g)) gender = "Female";
      else if (["other", "o", "अन्य", "इतर"].includes(g)) gender = "Other";

      if (!gender) {
        simulateTyping(() => {
          addMessage(getTranslation(language, "invalidGender"), "assistant");
          addMessage(getTranslation(language, "askingGender"), "assistant");
        });
        return;
      }
      setBooking((prev) => ({ ...prev, gender }));

      try {
        const payload = {
          name: booking.name || "",
          phone: booking.phone || "",
          hospital_id: hospitalId,
          gender,
          dob: booking.dob || "",
        };
        const reg = await submitHomePatient(payload);
        if (reg.success) {
          simulateTyping(() => {
            addMessage(getTranslation(language, "registrationSuccess"), "assistant");
          });

          try {
            const res = await checkUser(booking.phone!, hospitalId);
            setConversationState("book_patient_selection");
            
            simulateTyping(() => {
              if (res.patients && res.patients.length > 0) {
                addMessage("Please select a patient:", "assistant", "patient_list", { patients: res.patients });
              } else if (res.exists) {
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
             setBooking((prev) => ({ ...prev, patientId: reg.patient_id }));
             setConversationState("booking_doctor");
             try {
                const doctorItems = await fetchHomeDoctors(hospitalId);
                setAvailableDoctors(doctorItems);
                simulateTyping(() => {
                  addMessage(getTranslation(language, "selectDoctor"), "assistant", "doctor_list", { doctors: doctorItems });
                });
             } catch {
                simulateTyping(() => {
                  addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
                });
             }
          }
        } else {
          simulateTyping(() => {
            addMessage(reg.message || getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
          });
        }
      } catch {
        simulateTyping(() => {
          addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
        });
      }
      return;
    }

    // Fallback: re-show menu
    simulateTyping(() => {
      addMessage(getTranslation(language, "allowedOptionsReminder"), "assistant", "menu_options");
    });
  }, [conversationState, hospitalId, language, addMessage, simulateTyping]);

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
};
