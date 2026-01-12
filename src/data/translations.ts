export type Language = "en" | "hi" | "mr";

export const languageLabels: Record<Language, string> = {
  en: "English",
  hi: "हिंदी",
  mr: "मराठी"
};

// Comprehensive translations for all medical terms
export const translations: Record<Language, {
  frequency: Record<string, string>;
  duration: Record<string, string>;
  timing: Record<string, string>;
  instructions: Record<string, string>;
}> = {
  en: {
    frequency: {
      "Once daily": "Once daily",
      "Twice daily": "Twice daily",
      "Three times a day": "Three times a day",
      "Four times a day": "Four times a day",
      "Every 4 hours": "Every 4 hours",
      "Every 6 hours": "Every 6 hours",
      "Every 8 hours": "Every 8 hours",
      "As needed": "As needed",
      "Before meals": "Before meals",
      "After meals": "After meals",
    },
    duration: {
      "3 Days": "3 Days",
      "5 Days": "5 Days",
      "7 Days": "7 Days",
      "10 Days": "10 Days",
      "14 Days": "14 Days",
      "1 Week": "1 Week",
      "2 Weeks": "2 Weeks",
      "1 Month": "1 Month",
      "Continue": "Continue",
    },
    timing: {
      "Morning": "Morning",
      "Afternoon": "Afternoon",
      "Evening": "Evening",
      "Night": "Night",
      "Morning, Night": "Morning, Night",
      "Morning, Afternoon, Night": "Morning, Afternoon, Night",
      "Before Meal": "Before Meal",
      "After Meal": "After Meal",
      "With Meal": "With Meal",
      "Empty Stomach": "Empty Stomach",
      "Bedtime": "Bedtime",
    },
    instructions: {
      "Take after meals": "Take after meals",
      "Take on empty stomach": "Take on empty stomach",
      "Take at bedtime": "Take at bedtime",
      "Shake well before use": "Shake well before use",
      "Take with breakfast": "Take with breakfast",
      "Take with warm water": "Take with warm water",
      "Avoid dairy products": "Avoid dairy products",
      "Complete the full course": "Complete the full course",
      "Take after food only": "Take after food only",
      "Avoid alcohol": "Avoid alcohol",
      "Take with plenty of water": "Take with plenty of water",
      "Do not crush or chew": "Do not crush or chew",
      "Store in cool place": "Store in cool place",
    }
  },
  hi: {
    frequency: {
      "Once daily": "दिन में एक बार",
      "Twice daily": "दिन में दो बार",
      "Three times a day": "दिन में तीन बार",
      "Four times a day": "दिन में चार बार",
      "Every 4 hours": "हर 4 घंटे में",
      "Every 6 hours": "हर 6 घंटे में",
      "Every 8 hours": "हर 8 घंटे में",
      "As needed": "आवश्यकतानुसार",
      "Before meals": "भोजन से पहले",
      "After meals": "भोजन के बाद",
    },
    duration: {
      "3 Days": "3 दिन",
      "5 Days": "5 दिन",
      "7 Days": "7 दिन",
      "10 Days": "10 दिन",
      "14 Days": "14 दिन",
      "1 Week": "1 सप्ताह",
      "2 Weeks": "2 सप्ताह",
      "1 Month": "1 महीना",
      "Continue": "जारी रखें",
    },
    timing: {
      "Morning": "सुबह",
      "Afternoon": "दोपहर",
      "Evening": "शाम",
      "Night": "रात",
      "Morning, Night": "सुबह, रात",
      "Morning, Afternoon, Night": "सुबह, दोपहर, रात",
      "Before Meal": "भोजन से पहले",
      "After Meal": "भोजन के बाद",
      "With Meal": "भोजन के साथ",
      "Empty Stomach": "खाली पेट",
      "Bedtime": "सोने से पहले",
    },
    instructions: {
      "Take after meals": "भोजन के बाद लें",
      "Take on empty stomach": "खाली पेट लें",
      "Take at bedtime": "सोने से पहले लें",
      "Shake well before use": "उपयोग से पहले अच्छी तरह हिलाएं",
      "Take with breakfast": "नाश्ते के साथ लें",
      "Take with warm water": "गर्म पानी के साथ लें",
      "Avoid dairy products": "डेयरी उत्पादों से बचें",
      "Complete the full course": "पूरा कोर्स पूरा करें",
      "Take after food only": "केवल भोजन के बाद लें",
      "Avoid alcohol": "शराब से बचें",
      "Take with plenty of water": "पर्याप्त पानी के साथ लें",
      "Do not crush or chew": "कुचलें या चबाएं नहीं",
      "Store in cool place": "ठंडी जगह पर रखें",
    }
  },
  mr: {
    frequency: {
      "Once daily": "दिवसातून एकदा",
      "Twice daily": "दिवसातून दोनदा",
      "Three times a day": "दिवसातून तीनदा",
      "Four times a day": "दिवसातून चारदा",
      "Every 4 hours": "दर 4 तासांनी",
      "Every 6 hours": "दर 6 तासांनी",
      "Every 8 hours": "दर 8 तासांनी",
      "As needed": "आवश्यकतेनुसार",
      "Before meals": "जेवणापूर्वी",
      "After meals": "जेवणानंतर",
    },
    duration: {
      "3 Days": "3 दिवस",
      "5 Days": "5 दिवस",
      "7 Days": "7 दिवस",
      "10 Days": "10 दिवस",
      "14 Days": "14 दिवस",
      "1 Week": "1 आठवडा",
      "2 Weeks": "2 आठवडे",
      "1 Month": "1 महिना",
      "Continue": "चालू ठेवा",
    },
    timing: {
      "Morning": "सकाळी",
      "Afternoon": "दुपारी",
      "Evening": "संध्याकाळी",
      "Night": "रात्री",
      "Morning, Night": "सकाळी, रात्री",
      "Morning, Afternoon, Night": "सकाळी, दुपारी, रात्री",
      "Before Meal": "जेवणापूर्वी",
      "After Meal": "जेवणानंतर",
      "With Meal": "जेवणासोबत",
      "Empty Stomach": "रिकाम्या पोटी",
      "Bedtime": "झोपण्यापूर्वी",
    },
    instructions: {
      "Take after meals": "जेवणानंतर घ्या",
      "Take on empty stomach": "रिकाम्या पोटी घ्या",
      "Take at bedtime": "झोपण्यापूर्वी घ्या",
      "Shake well before use": "वापरण्यापूर्वी चांगले हलवा",
      "Take with breakfast": "न्याहारीसोबत घ्या",
      "Take with warm water": "कोमट पाण्यासोबत घ्या",
      "Avoid dairy products": "दुग्धजन्य पदार्थ टाळा",
      "Complete the full course": "संपूर्ण कोर्स पूर्ण करा",
      "Take after food only": "फक्त जेवणानंतर घ्या",
      "Avoid alcohol": "मद्यपान टाळा",
      "Take with plenty of water": "भरपूर पाण्यासोबत घ्या",
      "Do not crush or chew": "चुरडू किंवा चावू नका",
      "Store in cool place": "थंड ठिकाणी ठेवा",
    }
  }
};

// Translation helper functions
export const getTranslatedFrequency = (frequency: string, lang: Language): string => {
  return translations[lang].frequency[frequency] || frequency;
};

export const getTranslatedDuration = (duration: string, lang: Language): string => {
  return translations[lang].duration[duration] || duration;
};

export const getTranslatedTiming = (timing: string, lang: Language): string => {
  return translations[lang].timing[timing] || timing;
};

export const getTranslatedInstructions = (instruction: string, lang: Language): string => {
  return translations[lang].instructions[instruction] || instruction;
};
