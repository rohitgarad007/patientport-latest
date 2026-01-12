import { useState, useCallback, useEffect } from "react";
import { ChatMessage, ConversationContext } from "@/types/chat";
import chatFlows from "@/data/chatFlows.json";
import { fetchHomeDoctors, HomeDoctor, submitHomeAppointment, submitHomePatient, fetchHomeHospital, chatAssistant } from "@/services/HomeService";

export const useChatLogic = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      content: chatFlows.greeting.message,
      quickReplies: chatFlows.greeting.quickReplies,
      onQuickReply: handleQuickReply,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    history: [],
  });

  // Initialize hospitalId so quick replies operate with correct hospital context
  useEffect(() => {
    const initHospital = async () => {
      try {
        const info = await fetchHomeHospital();
        setContext((prev) => ({ ...prev, hospitalId: info.id || 2 }));
      } catch (e) {
        setContext((prev) => ({ ...prev, hospitalId: 2 }));
      }
    };
    initHospital();
  }, []);

  function handleQuickReply(option: string) {
    sendMessage(option);
  }

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const simulateTyping = useCallback(async (duration: number = 1000) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, duration));
    setIsTyping(false);
  }, []);

  const detectIntent = useCallback((message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("book") || lowerMessage.includes("appointment")) {
      return "appointment";
    }
    if (lowerMessage.includes("doctor") || lowerMessage.includes("find")) {
      return "find_doctor";
    }
    if (
      lowerMessage.includes("register") ||
      lowerMessage.includes("signup") ||
      lowerMessage.includes("sign up") ||
      lowerMessage.includes("patient") ||
      lowerMessage.includes("add me") ||
      lowerMessage.includes("save my info")
    ) {
      return "register_patient";
    }
    if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent")) {
      return "emergency";
    }
    if (lowerMessage.includes("info") || lowerMessage.includes("hospital") || 
        lowerMessage.includes("hours") || lowerMessage.includes("insurance")) {
      return "hospital_info";
    }
    if (lowerMessage.includes("feedback") || lowerMessage.includes("complaint")) {
      return "feedback";
    }
    
    return "general";
  }, []);

  const handleAppointmentFlow = useCallback(async (userMessage: string) => {
    const flow = chatFlows.appointmentFlow;
    const currentStep = context.currentStep || 0;
    
    if (currentStep === 0) {
      await simulateTyping();
      addMessage({
        sender: "bot",
        content: flow.steps[0].question,
      });
      setContext((prev) => ({ ...prev, currentIntent: "appointment", currentStep: 1 }));
    } else if (currentStep < flow.steps.length) {
      const stepData = flow.steps[currentStep - 1];
      const newUserData = { ...context.userData };
      
      switch (stepData.id) {
        case "name":
          newUserData.name = userMessage;
          break;
        case "phone":
          newUserData.phone = userMessage;
          break;
        case "department":
          newUserData.department = userMessage;
          break;
        case "doctor":
          newUserData.doctor = userMessage;
          break;
        case "date":
          newUserData.date = userMessage;
          break;
        case "time":
          newUserData.time = userMessage;
          break;
      }
      
      setContext((prev) => ({ ...prev, userData: newUserData }));
      
      if (currentStep < flow.steps.length) {
        await simulateTyping();
        const nextStep = flow.steps[currentStep];
        let questionText = nextStep.question;
        
        Object.entries(newUserData).forEach(([key, value]) => {
          questionText = questionText.replace(`{${key}}`, value || "");
        });
        
        const message: ChatMessage = {
          sender: "bot",
          content: questionText,
        };
        
        if (nextStep.type === "department" && nextStep.options) {
          message.quickReplies = nextStep.options;
          message.onQuickReply = handleQuickReply;
        } else if (nextStep.type === "doctor") {
          // Fetch doctors via unified chat assistant (optional department)
          const hosId = context.hospitalId ?? 2;
          let items: any[] = [];
          try {
            const resp = await chatAssistant({ intent: "find_doctor", hospital_id: hosId, payload: { department: newUserData.department } });
            items = resp.items || [];
          } catch (e) {
            items = [];
          }
          message.buttons = items.slice(0, 4).map((doctor: any) => ({
            label: `${doctor.name || "Doctor"} - ${(doctor.specialization || doctor.specialty || "General")}`,
            action: async () => {
              // Persist selection so appointment API receives doctor_id
              setContext((prev) => ({
                ...prev,
                userData: { ...(prev.userData || {}), doctor_id: doctor.id, doctor: doctor.name || "Selected Doctor" },
              }));
              // Immediately fetch upcoming slots and show date options
              try {
                const resp = await chatAssistant({ intent: "appointment_slots", hospital_id: hosId, payload: { doctor_id: doctor.id, days: 3 } });
                const days = resp.days || [];
                if (days.length > 0) {
                  const labelMap: Record<string, string> = {};
                  const options: string[] = days.map((d: any) => {
                    const dt = new Date(d.date);
                    const weekday = d.weekday || dt.toDateString().split(' ')[0];
                    const label = `${weekday}, ${dt.toLocaleString(undefined, { month: 'short' })} ${dt.getDate()} (${d.count} slots)`;
                    labelMap[label] = d.date;
                    return label;
                  });
                  // Persist mappings for time step
                  setContext((prev) => ({ ...prev, dateLabelMap: labelMap, slotsByDate: Object.fromEntries(days.map((d: any) => [d.date, d.slots || []])) }));
                  // Ask for preferred date next
                  addMessage({ sender: "bot", content: "Please choose your preferred date:", quickReplies: options, onQuickReply: handleQuickReply });
                } else {
                  // No slots available message
                  addMessage({ sender: "bot", content: "No available slots in the next 3 days for this doctor. Please pick another doctor or department.", quickReplies: chatFlows.greeting.quickReplies, onQuickReply: handleQuickReply });
                }
              } catch (err) {
                addMessage({ sender: "bot", content: "I couldn't fetch availability right now. Please try again in a moment.", quickReplies: chatFlows.greeting.quickReplies, onQuickReply: handleQuickReply });
              }
              // Continue appointment flow progression
              sendMessage(`Book with ${doctor.name || "Selected Doctor"}`);
            },
          }));
        } else if (nextStep.type === "date") {
          // Fetch next 3 days with available slots for the selected doctor
          const hosId = context.hospitalId ?? 2;
          const doctorId = (context.userData as any)?.doctor_id;
          let days: any[] = [];
          try {
            const resp = await chatAssistant({ intent: "appointment_slots", hospital_id: hosId, payload: { doctor_id: doctorId, days: 3 } });
            days = resp.days || [];
          } catch (e) {}

          if (days.length > 0) {
            // Build user-friendly labels and persist mapping
            const labelMap: Record<string, string> = {};
            const options: string[] = days.map((d: any) => {
              const dt = new Date(d.date);
              const weekday = d.weekday || dt.toDateString().split(' ')[0];
              const label = `${weekday}, ${dt.toLocaleString(undefined, { month: 'short' })} ${dt.getDate()} (${d.count} slots)`;
              labelMap[label] = d.date;
              return label;
            });
            message.quickReplies = options;
            message.onQuickReply = handleQuickReply;
            setContext((prev) => ({ ...prev, dateLabelMap: labelMap, slotsByDate: Object.fromEntries(days.map((d: any) => [d.date, d.slots || []])) }));
          } else {
            // Fallback: no available slots, keep generic question
          }
        } else if (nextStep.type === "time") {
          // Show time slots for the selected date, if we have them
          const selectedDate = (newUserData as any)?.date;
          let timeOptions: string[] | undefined;
          const dateIso = (context as any).dateLabelMap && (context as any).dateLabelMap[selectedDate] ? (context as any).dateLabelMap[selectedDate] : selectedDate;
          const slotsByDate = (context as any).slotsByDate || {};
          if (dateIso && slotsByDate[dateIso] && (slotsByDate[dateIso] as any[]).length > 0) {
            timeOptions = (slotsByDate[dateIso] as any[]).map((s: any) => {
              const st = s.start_time || '';
              const et = s.end_time || '';
              return st && et ? `${st} - ${et}` : (s.title || 'Slot');
            });
          }
          message.quickReplies = timeOptions && timeOptions.length > 0 ? timeOptions : nextStep.slots;
          message.onQuickReply = handleQuickReply;
        } else if (nextStep.type === "confirm") {
          message.quickReplies = ["Yes, Confirm", "Change Details"];
          message.onQuickReply = handleQuickReply;
        }
        
        addMessage(message);
        setContext((prev) => ({ ...prev, currentStep: currentStep + 1 }));
      } else {
        await simulateTyping();
        // Submit appointment to backend
        try {
          const hosId = context.hospitalId ?? 2;
          await chatAssistant({
            intent: "appointment",
            hospital_id: hosId,
            payload: {
              name: newUserData.name || "",
              mobile: newUserData.phone || "",
              department: newUserData.department,
              doctor_id: (context.userData as any)?.doctor_id,
              date: (context as any).dateLabelMap && (context as any).dateLabelMap[newUserData.date] ? (context as any).dateLabelMap[newUserData.date] : newUserData.date,
              time: newUserData.time,
            },
          });
        } catch (e) {
          // Ignore errors for UX; message still shows confirmation
        }

        const confirmationText = flow.confirmation
          .replace("{random}", Math.random().toString(36).substr(2, 9).toUpperCase())
          .replace("{name}", newUserData.name || "")
          .replace("{phone}", newUserData.phone || "")
          .replace("{date}", newUserData.date || "")
          .replace("{time}", newUserData.time || "");
        
        addMessage({
          sender: "bot",
          content: confirmationText,
          quickReplies: chatFlows.greeting.quickReplies,
          onQuickReply: handleQuickReply,
        });
        
        setContext({ history: [] });
      }
    }
  }, [context, addMessage, simulateTyping]);

  const handleRegisterPatient = useCallback(async (userMessage: string) => {
    const currentStep = context.currentStep || 0;
    const hosId = context.hospitalId ?? 2;
    const data: any = { ...(context.userData || {}) };

    if (currentStep === 0) {
      await simulateTyping();
      addMessage({ sender: "bot", content: "Please share your mobile number to continue." });
      setContext((prev) => ({ ...prev, currentIntent: "register_patient", currentStep: 1 }));
      return;
    }

    if (currentStep === 1) {
      data.phone = userMessage;
      setContext((prev) => ({ ...prev, userData: data }));
      await simulateTyping();
      try {
        const resp = await chatAssistant({ intent: "register_patient", hospital_id: hosId, payload: { phone: data.phone } });
        if (resp.exists) {
          const pname = resp.patient_name || "Patient";
          addMessage({
            sender: "bot",
            content: `Welcome back, ${pname}! Would you like to book an appointment now?`,
            quickReplies: ["Book Appointment", "No, Thanks"],
            onQuickReply: handleQuickReply,
          });
          setContext({ history: [] });
          return;
        }
        // Ask next required field from API
        const next = resp.next || "name";
        const prompts: Record<string, string> = {
          name: "What is your full name?",
          email: "Please provide your email address.",
          gender: "What is your gender?",
          age: "What is your age?",
        };
        addMessage({ sender: "bot", content: prompts[next] || "Please provide your details." });
        setContext((prev) => ({ ...prev, currentStep: 2, userData: data }));
        return;
      } catch (e) {
        addMessage({ sender: "bot", content: "I couldn't check your number right now. Please try again." });
        setContext({ history: [] });
        return;
      }
    }

    // Steps 2..N: progressively collect and send to API until it returns ask_appointment
    const stepOrder = ["name", "email", "gender", "age"] as const;
    const idx = currentStep - 2;
    const currentField = stepOrder[idx] || "age";
    data[currentField] = userMessage;
    setContext((prev) => ({ ...prev, userData: data }));
    await simulateTyping();
    try {
      const resp = await chatAssistant({ intent: "register_patient", hospital_id: hosId, payload: data });
      if (resp.next && resp.next !== "ask_appointment") {
        const prompts: Record<string, string> = {
          name: "What is your full name?",
          email: "Please provide your email address.",
          gender: "What is your gender?",
          age: "What is your age?",
        };
        addMessage({ sender: "bot", content: prompts[resp.next] || "Please provide your details." });
        setContext((prev) => ({ ...prev, currentStep: currentStep + 1 }));
        return;
      }
      // Completed registration
      const uid = resp.patient_uid || "PAT-XXXXXX";
      addMessage({
        sender: "bot",
        content: `Registration successful! Your ID is ${uid}. Would you like to book an appointment?`,
        quickReplies: ["Book Appointment", "No, Thanks"],
        onQuickReply: handleQuickReply,
      });
      setContext({ history: [] });
    } catch (e) {
      addMessage({ sender: "bot", content: "Sorry, I couldn't complete registration right now." });
      setContext({ history: [] });
    }
  }, [context, addMessage, simulateTyping]);

  const handleFindDoctor = useCallback(async (userMessage: string) => {
    const flow = chatFlows.findDoctorFlow;
    
    if (!context.currentIntent || context.currentStep === 0) {
      await simulateTyping();
      // Try to get dynamic prompt from API
      let prompt = flow.question;
      let initialDoctors: any[] = [];
      try {
        const hosId = context.hospitalId ?? 2;
        const resp = await chatAssistant({ intent: "find_doctor", hospital_id: hosId });
        if (resp && resp.message) prompt = resp.message;
        initialDoctors = resp.items || [];
      } catch (e) {}
      const message: ChatMessage = {
        sender: "bot",
        content: prompt,
      };
      // If API already returned doctors, show them as buttons right away
      if (initialDoctors.length > 0) {
        message.buttons = initialDoctors.map((doctor: any) => ({
          label: `👨‍⚕️ ${doctor.name || "Doctor"}\n${doctor.specialization || doctor.specialization_name || doctor.specialty || "General"} • ${doctor.experience || "10+ years"}`,
          action: () => {
            setContext((prev) => ({
              ...prev,
              userData: { ...(prev.userData || {}), doctor_id: doctor.id, doctor: doctor.name || "Selected Doctor" },
            }));
            sendMessage(`Book with ${doctor.name || "Selected Doctor"}`);
          },
        }));
      } else {
        message.quickReplies = flow.options;
        message.onQuickReply = handleQuickReply;
      }
      addMessage(message);
      setContext((prev) => ({ ...prev, currentIntent: "find_doctor", currentStep: 1 }));
    } else {
      const specialty = userMessage;
      const hosId = context.hospitalId ?? 2;
      let doctors: any[] = [];
      try {
        const resp = await chatAssistant({ intent: "find_doctor", hospital_id: hosId, payload: { department: specialty } });
        doctors = resp.items || [];
      } catch (e) {
        doctors = [];
      }
      
      await simulateTyping();
      addMessage({
        sender: "bot",
        content: flow.response.replace("{specialty}", specialty),
        buttons: doctors.map((doctor: any) => ({
          label: `👨‍⚕️ ${doctor.name || "Doctor"}\n${doctor.specialization || doctor.specialization_name || doctor.specialty || "General"} • ${doctor.experience || "10+ years"}`,
          action: () => {
            setContext((prev) => ({
              ...prev,
              userData: { ...(prev.userData || {}), doctor_id: doctor.id, doctor: doctor.name || "Selected Doctor" },
            }));
            sendMessage(`Book with ${doctor.name || "Selected Doctor"}`);
          },
        })),
      });

      setContext({ history: [] });
    }
  }, [context, addMessage, simulateTyping]);

  const handleEmergency = useCallback(async () => {
    await simulateTyping();
    const hosId = context.hospitalId ?? 2;
    let text = chatFlows.emergencyFlow.message;
    try {
      const resp = await chatAssistant({ intent: "emergency", hospital_id: hosId });
      if (resp && resp.message) text = resp.message;
    } catch (e) {}
    addMessage({
      sender: "bot",
      content: text,
      quickReplies: chatFlows.emergencyFlow.quickReplies,
      onQuickReply: handleQuickReply,
    });
    setContext({ history: [] });
  }, [addMessage, simulateTyping, context]);

  const handleHospitalInfo = useCallback(async (userMessage: string) => {
    const info = chatFlows.hospitalInfo;
    
    if (!context.currentIntent || context.currentStep === 0) {
      await simulateTyping();
      // Try to get dynamic prompt from API
      let prompt = "I can help you with hospital information. What would you like to know?";
      try {
        const hosId = context.hospitalId ?? 2;
        const resp = await chatAssistant({ intent: "hospital_info", hospital_id: hosId });
        if (resp && resp.message) prompt = resp.message;
      } catch (e) {}
      addMessage({
        sender: "bot",
        content: prompt,
        quickReplies: info.quickReplies,
        onQuickReply: handleQuickReply,
      });
      setContext((prev) => ({ ...prev, currentIntent: "hospital_info", currentStep: 1 }));
    } else {
      const topicKey = userMessage.toLowerCase().replace(/\s+/g, "_");
      await simulateTyping();
      const hosId = context.hospitalId ?? 2;
      let response = info.topics[topicKey as keyof typeof info.topics] || "I'm not sure about that.";
      try {
        const resp = await chatAssistant({ intent: "hospital_info", hospital_id: hosId, payload: { topic: topicKey } });
        if (resp && resp.message) response = resp.message;
      } catch (e) {}
      addMessage({
        sender: "bot",
        content: response,
        quickReplies: info.quickReplies,
        onQuickReply: handleQuickReply,
      });
    }
  }, [context, addMessage, simulateTyping]);

  const handleFeedback = useCallback(async () => {
    await simulateTyping();
    addMessage({
      sender: "bot",
      content: chatFlows.feedback.message,
    });
    setContext((prev) => ({ ...prev, currentIntent: "feedback", currentStep: 1 }));
  }, [addMessage, simulateTyping]);

  const sendMessage = useCallback(
    async (messageText: string, options?: { hospitalId?: number }) => {
      addMessage({
        sender: "user",
        content: messageText,
      });

      setContext((prev) => ({
        ...prev,
        history: [...prev.history, messageText],
        hospitalId: options?.hospitalId ?? prev?.hospitalId ?? 2,
      }));

      if (context.currentIntent === "appointment") {
        await handleAppointmentFlow(messageText);
        return;
      }

      if (context.currentIntent === "find_doctor") {
        await handleFindDoctor(messageText);
        return;
      }

      if (context.currentIntent === "hospital_info") {
        await handleHospitalInfo(messageText);
        return;
      }

      if (context.currentIntent === "feedback" && context.currentStep === 1) {
        await simulateTyping();
        addMessage({
          sender: "bot",
          content: chatFlows.feedback.thankYou,
          quickReplies: chatFlows.greeting.quickReplies,
          onQuickReply: handleQuickReply,
        });
        setContext({ history: [] });
        return;
      }

      const intent = detectIntent(messageText);

      switch (intent) {
        case "appointment":
          await handleAppointmentFlow(messageText);
          break;
        case "find_doctor":
          await handleFindDoctor(messageText);
          break;
        case "register_patient":
          await handleRegisterPatient(messageText);
          break;
        case "emergency":
          await handleEmergency();
          break;
        case "hospital_info":
          await handleHospitalInfo(messageText);
          break;
        case "feedback":
          await handleFeedback();
          break;
        default:
          await simulateTyping();
          addMessage({
            sender: "bot",
            content: "I'm here to help! You can ask me about:\n\n• Booking appointments\n• Finding doctors\n• Emergency services\n• Hospital information\n\nHow can I assist you today?",
            quickReplies: chatFlows.greeting.quickReplies,
            onQuickReply: handleQuickReply,
          });
          setContext({ history: [] });
      }
    },
    [
      context,
      addMessage,
      detectIntent,
      handleAppointmentFlow,
      handleFindDoctor,
      handleRegisterPatient,
      handleEmergency,
      handleHospitalInfo,
      handleFeedback,
      simulateTyping,
    ]
  );

  return {
    messages,
    sendMessage,
    isTyping,
  };
};
