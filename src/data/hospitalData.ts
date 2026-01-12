export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  experience: string;
  available: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export const doctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiology",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    experience: "15 years",
    available: ["Mon", "Wed", "Fri"]
  },
  {
    id: "2",
    name: "Dr. James Chen",
    specialty: "Neurology",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    experience: "12 years",
    available: ["Tue", "Thu", "Sat"]
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    experience: "10 years",
    available: ["Mon", "Tue", "Thu"]
  },
  {
    id: "4",
    name: "Dr. Michael Park",
    specialty: "Orthopedics",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop",
    experience: "18 years",
    available: ["Wed", "Fri", "Sat"]
  }
];

export const departments: Department[] = [
  {
    id: "1",
    name: "Cardiology",
    description: "Expert heart and cardiovascular care",
    icon: "heart"
  },
  {
    id: "2",
    name: "Neurology",
    description: "Advanced brain and nervous system treatment",
    icon: "brain"
  },
  {
    id: "3",
    name: "Pediatrics",
    description: "Comprehensive child healthcare services",
    icon: "baby"
  },
  {
    id: "4",
    name: "Orthopedics",
    description: "Specialized bone and joint treatment",
    icon: "bone"
  },
  {
    id: "5",
    name: "Emergency Care",
    description: "24/7 emergency medical services",
    icon: "ambulance"
  },
  {
    id: "6",
    name: "Laboratory",
    description: "State-of-the-art diagnostic services",
    icon: "microscope"
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "John Anderson",
    rating: 5,
    text: "The care I received was exceptional. The doctors were attentive and the facilities were top-notch. Highly recommend!",
    date: "2024-01-15"
  },
  {
    id: "2",
    name: "Maria Garcia",
    rating: 5,
    text: "From the moment I walked in, I felt cared for. The staff is incredibly professional and compassionate.",
    date: "2024-01-20"
  },
  {
    id: "3",
    name: "David Thompson",
    rating: 5,
    text: "Outstanding medical care combined with genuine concern for patient wellbeing. This hospital sets the standard.",
    date: "2024-01-25"
  },
  {
    id: "4",
    name: "Lisa Chen",
    rating: 4,
    text: "Great experience overall. The appointment scheduling was smooth and the doctors were very knowledgeable.",
    date: "2024-02-01"
  }
];

export const hospitalInfo = {
  name: "HealthCare Plus Medical Center",
  tagline: "Your Health, Our Priority",
  phone: "+1 (555) 123-4567",
  emergencyPhone: "+1 (555) 911-0000",
  email: "info@healthcareplus.com",
  address: "123 Medical Plaza, Healthcare City, HC 12345",
  hours: "24/7 Emergency Care Available",
  visitingHours: "Mon-Sun: 10:00 AM - 8:00 PM"
};
