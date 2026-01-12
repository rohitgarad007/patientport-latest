export interface TimeSlot {
  id: string;
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
}

export interface DoctorSchedule {
  doctorId: string;
  date: string;
  slots: TimeSlot[];
}

// Mock schedule data
export const mockScheduleData: DoctorSchedule[] = [
  {
    doctorId: '1',
    date: '2024-02-18',
    slots: [
      { id: 's1', time: '9:00 AM', period: 'morning', available: true },
      { id: 's2', time: '10:00 AM', period: 'morning', available: true },
      { id: 's3', time: '11:00 AM', period: 'morning', available: false },
      { id: 's4', time: '2:00 PM', period: 'afternoon', available: true },
      { id: 's5', time: '3:00 PM', period: 'afternoon', available: true },
      { id: 's6', time: '5:00 PM', period: 'evening', available: true },
    ],
  },
  {
    doctorId: '2',
    date: '2024-02-18',
    slots: [
      { id: 's7', time: '10:00 AM', period: 'morning', available: true },
      { id: 's8', time: '11:00 AM', period: 'morning', available: true },
      { id: 's9', time: '3:00 PM', period: 'afternoon', available: true },
      { id: 's10', time: '4:00 PM', period: 'afternoon', available: false },
    ],
  },
  {
    doctorId: '3',
    date: '2024-02-18',
    slots: [], // No slots available for this doctor on this date
  },
];

export const getDoctorSchedule = (doctorId: string, date: string): DoctorSchedule | undefined => {
  return mockScheduleData.find(schedule => schedule.doctorId === doctorId && schedule.date === date);
};

export const getAvailableSlots = (doctorId: string, date: string, period?: 'morning' | 'afternoon' | 'evening'): TimeSlot[] => {
  const schedule = getDoctorSchedule(doctorId, date);
  if (!schedule) return [];
  
  let slots = schedule.slots.filter(slot => slot.available);
  if (period) {
    slots = slots.filter(slot => slot.period === period);
  }
  
  return slots;
};
