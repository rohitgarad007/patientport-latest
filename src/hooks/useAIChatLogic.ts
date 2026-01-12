import { useState, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import chatDatabase from "@/data/chatDatabase.json";

export const useAIChatLogic = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      content: "👋 Hello! I'm your AI Health Assistant powered by **Gemini AI**.\n\nI can help you with:\n• Hospital information (from our database)\n• Health queries (using AI)\n• Appointments & Services\n\nHow can I assist you today?",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const simulateTyping = useCallback(async (duration: number = 1000) => {
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, duration));
    setIsTyping(false);
  }, []);

  // Search database for answer
  const searchDatabase = useCallback((query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    for (const faq of chatDatabase.faqs) {
      const hasKeyword = faq.keywords.some(keyword => 
        lowerQuery.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        return `📚 **From Database:**\n\n${faq.answer}`;
      }
    }
    
    return null;
  }, []);

  // Simulate Gemini API call with dummy responses
  const callGeminiAI = useCallback(async (query: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerQuery = query.toLowerCase();
    
    // Dummy Gemini responses based on query patterns
    if (lowerQuery.includes("symptom") || lowerQuery.includes("pain") || lowerQuery.includes("fever")) {
      return "🤖 **AI Response (Gemini):**\n\nBased on your symptoms, I recommend:\n\n1. Monitor your condition for 24-48 hours\n2. Stay hydrated and rest\n3. If symptoms worsen, consult a doctor immediately\n\n⚠️ *This is AI-generated advice. Please consult a healthcare professional for accurate diagnosis.*";
    }
    
    if (lowerQuery.includes("medicine") || lowerQuery.includes("medication") || lowerQuery.includes("drug")) {
      return "🤖 **AI Response (Gemini):**\n\nFor medication information:\n\n• Always consult with a licensed pharmacist\n• Check for drug interactions\n• Follow prescribed dosage strictly\n• Store medications properly\n\n💊 Would you like to speak with our pharmacy team?";
    }
    
    if (lowerQuery.includes("diet") || lowerQuery.includes("nutrition") || lowerQuery.includes("food")) {
      return "🤖 **AI Response (Gemini):**\n\nHealthy eating tips:\n\n• Eat 5 servings of fruits/vegetables daily\n• Stay hydrated (8 glasses of water)\n• Limit processed foods\n• Include lean proteins\n\n🥗 Would you like to book a nutritionist consultation?";
    }
    
    if (lowerQuery.includes("exercise") || lowerQuery.includes("workout") || lowerQuery.includes("fitness")) {
      return "🤖 **AI Response (Gemini):**\n\nExercise recommendations:\n\n• 150 minutes moderate activity per week\n• Mix cardio and strength training\n• Start slow and build gradually\n• Consult doctor before starting new routines\n\n💪 Our physiotherapy department can create a personalized plan!";
    }
    
    // Default AI response
    return `🤖 **AI Response (Gemini):**\n\nI understand you're asking about: "${query}"\n\nWhile I can provide general information, I recommend:\n\n1. Consulting with our medical staff for specific concerns\n2. Booking an appointment for detailed evaluation\n3. Calling our helpline: +1 (800) 123-4567\n\n📞 Would you like me to help you book an appointment?`;
  }, []);

  const sendMessage = useCallback(
    async (messageText: string) => {
      // Add user message
      addMessage({
        sender: "user",
        content: messageText,
      });

      await simulateTyping(500);

      // Step 1: Check database first
      const dbResult = searchDatabase(messageText);
      
      if (dbResult) {
        // Found in database
        addMessage({
          sender: "bot",
          content: dbResult,
          metadata: {
            type: "database",
            data: { source: "Local Database" }
          }
        });
      } else {
        // Not in database, show searching message
        addMessage({
          sender: "bot",
          content: "🔍 Searching database... not found.\n⏳ Consulting Gemini AI...",
        });

        await simulateTyping(1500);

        // Step 2: Call Gemini AI
        try {
          const aiResponse = await callGeminiAI(messageText);
          
          addMessage({
            sender: "bot",
            content: aiResponse,
            metadata: {
              type: "ai",
              data: { 
                source: "Gemini AI", 
                apiKey: "AIza...dummy...key123" 
              }
            }
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            content: "❌ Sorry, I couldn't process your request. Please try again or contact our support team.",
          });
        }
      }

      // Add follow-up suggestion
      setTimeout(() => {
        addMessage({
          sender: "bot",
          content: "Is there anything else I can help you with?",
          quickReplies: [
            "Book Appointment",
            "Find Doctor",
            "Emergency",
            "More Info"
          ],
          onQuickReply: (reply) => sendMessage(reply)
        });
      }, 2000);
    },
    [addMessage, simulateTyping, searchDatabase, callGeminiAI]
  );

  return {
    messages,
    sendMessage,
    isTyping,
  };
};
