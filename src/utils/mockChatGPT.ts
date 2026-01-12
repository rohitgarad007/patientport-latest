import { Language } from './translations';

// Mock ChatGPT integration for demo purposes
export interface ChatGPTRequest {
  message: string;
  language: Language;
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface ChatGPTResponse {
  intent: 'book_appointment' | 'find_doctor' | 'emergency' | 'hospital_info' | 'general';
  extractedData?: {
    name?: string;
    phone?: string;
    specialty?: string;
    doctorId?: string;
    date?: string;
    timeSlot?: string;
  };
  response: string;
}

// Mock ChatGPT API call
export const mockChatGPTAnalysis = async (request: ChatGPTRequest): Promise<ChatGPTResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const message = request.message.toLowerCase();
  
  // Intent detection
  if (message.includes('book') || message.includes('appointment') || message.includes('अपॉइंटमेंट') || message.includes('बुक')) {
    return {
      intent: 'book_appointment',
      response: 'I understand you want to book an appointment. Let me help you with that.',
    };
  }
  
  if (message.includes('doctor') || message.includes('specialist') || message.includes('डॉक्टर')) {
    return {
      intent: 'find_doctor',
      response: 'I can help you find the right doctor for your needs.',
    };
  }
  
  if (message.includes('emergency') || message.includes('urgent') || message.includes('आपातकालीन')) {
    return {
      intent: 'emergency',
      response: 'For immediate medical emergencies, please call our 24/7 hotline.',
    };
  }
  
  // Extract phone numbers
  const phoneMatch = message.match(/\d{10}/);
  if (phoneMatch) {
    return {
      intent: 'general',
      extractedData: { phone: phoneMatch[0] },
      response: 'Thank you for providing your contact number.',
    };
  }
  
  return {
    intent: 'general',
    response: 'How can I assist you with your healthcare needs today?',
  };
};

// Mock backend API call
export const mockBackendAPI = async (intent: string, data: any): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock responses based on intent
  switch (intent) {
    case 'book_appointment':
      return {
        success: true,
        message: 'Appointment booking initiated',
      };
    case 'find_doctor':
      return {
        success: true,
        doctors: [
          { id: '1', name: 'Dr. Amit Saini', specialty: 'Cardiology' },
          { id: '2', name: 'Dr. Priya Sharma', specialty: 'Neurology' },
        ],
      };
    default:
      return {
        success: true,
        message: 'Request processed',
      };
  }
};
