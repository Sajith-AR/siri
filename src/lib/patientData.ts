// Central patient data management system
export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  allergies: string[];
  medications: Medication[];
  medicalHistory: MedicalCondition[];
  vitalSigns: VitalSigns[];
  appointments: Appointment[];
  assessments: HealthAssessment[];
  messages: Message[];
  emergencyContacts: EmergencyContact[];
  preferences: PatientPreferences;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
  reminders: MedicationReminder[];
};

export type MedicationReminder = {
  id: string;
  medicationId: string;
  time: string;
  taken: boolean;
  date: string;
};

export type MedicalCondition = {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'chronic';
  notes: string;
};

export type VitalSigns = {
  id: string;
  date: string;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
  bmi: number;
  source: 'manual' | 'camera' | 'device';
};

export type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'in-person' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  prescription?: string[];
  followUp?: string;
  cost: number;
};

export type HealthAssessment = {
  id: string;
  date: string;
  symptoms: string[];
  riskLevel: 'low' | 'medium' | 'high';
  conditions: { name: string; confidence: number }[];
  recommendations: string[];
  urgency: boolean;
  aiProvider: string;
  followUpRequired: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'patient' | 'doctor' | 'nurse' | 'system';
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isPrimary: boolean;
};

export type PatientPreferences = {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    medicationReminders: boolean;
    appointmentReminders: boolean;
  };
  privacy: {
    shareDataForResearch: boolean;
    allowMarketing: boolean;
  };
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualifications: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  availability: DoctorAvailability[];
  consultationFee: number;
  bio: string;
  avatar: string;
};

export type DoctorAvailability = {
  day: string;
  slots: string[];
  booked: string[];
};

// Sample data for demonstration
export const samplePatient: Patient = {
  id: "patient-001",
  name: "John Smith",
  email: "john.smith@email.com",
  phone: "+1-555-0123",
  dateOfBirth: "1985-06-15",
  gender: "Male",
  bloodType: "O+",
  allergies: ["Penicillin", "Shellfish"],
  medications: [
    {
      id: "med-001",
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2024-01-15",
      prescribedBy: "Dr. Sarah Johnson",
      instructions: "Take with food in the morning",
      sideEffects: ["Dizziness", "Dry cough"],
      interactions: ["NSAIDs", "Potassium supplements"],
      reminders: []
    }
  ],
  medicalHistory: [
    {
      id: "cond-001",
      condition: "Hypertension",
      diagnosedDate: "2024-01-15",
      severity: "mild",
      status: "active",
      notes: "Well controlled with medication"
    }
  ],
  vitalSigns: [
    {
      id: "vital-001",
      date: "2024-12-09",
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 98.6,
      oxygenSaturation: 98,
      weight: 175,
      height: 70,
      bmi: 25.1,
      source: "camera"
    }
  ],
  appointments: [],
  assessments: [],
  messages: [],
  emergencyContacts: [
    {
      id: "emergency-001",
      name: "Jane Smith",
      relationship: "Spouse",
      phone: "+1-555-0124",
      email: "jane.smith@email.com",
      isPrimary: true
    }
  ],
  preferences: {
    language: "en",
    timezone: "America/New_York",
    notifications: {
      email: true,
      sms: true,
      push: true,
      medicationReminders: true,
      appointmentReminders: true
    },
    privacy: {
      shareDataForResearch: false,
      allowMarketing: false
    }
  }
};

export const sampleDoctors: Doctor[] = [
  {
    id: "dr-001",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    qualifications: ["MD", "Board Certified Internal Medicine"],
    experience: 15,
    rating: 4.9,
    reviewCount: 247,
    languages: ["English", "Spanish"],
    availability: [
      {
        day: "Monday",
        slots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
        booked: ["10:00 AM", "3:00 PM"]
      }
    ],
    consultationFee: 150,
    bio: "Dr. Johnson is a board-certified internal medicine physician with over 15 years of experience in primary care.",
    avatar: "👩‍⚕️"
  },
  {
    id: "dr-002",
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    qualifications: ["MD", "Board Certified Cardiology", "Fellowship in Interventional Cardiology"],
    experience: 12,
    rating: 4.8,
    reviewCount: 189,
    languages: ["English", "Mandarin"],
    availability: [
      {
        day: "Tuesday",
        slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"],
        booked: ["10:30 AM"]
      }
    ],
    consultationFee: 250,
    bio: "Dr. Chen specializes in cardiovascular diseases and interventional procedures with extensive experience in heart health.",
    avatar: "👨‍⚕️"
  }
];

// Data management functions
export class PatientDataManager {
  private static instance: PatientDataManager;
  private patient: Patient;

  private constructor() {
    this.patient = this.loadPatientData();
  }

  public static getInstance(): PatientDataManager {
    if (!PatientDataManager.instance) {
      PatientDataManager.instance = new PatientDataManager();
    }
    return PatientDataManager.instance;
  }

  private loadPatientData(): Patient {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('patientData');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return samplePatient;
  }

  private savePatientData(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('patientData', JSON.stringify(this.patient));
    }
  }

  public getPatient(): Patient {
    return this.patient;
  }

  public updatePatient(updates: Partial<Patient>): void {
    this.patient = { ...this.patient, ...updates };
    this.savePatientData();
  }

  public addVitalSigns(vitals: Omit<VitalSigns, 'id'>): void {
    const newVital: VitalSigns = {
      id: `vital-${Date.now()}`,
      ...vitals
    };
    this.patient.vitalSigns.unshift(newVital);
    this.savePatientData();
  }

  public addAssessment(assessment: Omit<HealthAssessment, 'id'>): void {
    const newAssessment: HealthAssessment = {
      id: `assessment-${Date.now()}`,
      ...assessment
    };
    this.patient.assessments.unshift(newAssessment);
    this.savePatientData();
  }

  public addAppointment(appointment: Omit<Appointment, 'id'>): void {
    const newAppointment: Appointment = {
      id: `appointment-${Date.now()}`,
      ...appointment
    };
    this.patient.appointments.unshift(newAppointment);
    this.savePatientData();
  }

  public addMessage(message: Omit<Message, 'id'>): void {
    const newMessage: Message = {
      id: `message-${Date.now()}`,
      ...message
    };
    this.patient.messages.unshift(newMessage);
    this.savePatientData();
  }

  public addMedication(medication: Omit<Medication, 'id'>): void {
    const newMedication: Medication = {
      id: `med-${Date.now()}`,
      ...medication
    };
    this.patient.medications.push(newMedication);
    this.savePatientData();
  }

  public updateMedicationReminder(medicationId: string, reminderTime: string, taken: boolean): void {
    const medication = this.patient.medications.find(m => m.id === medicationId);
    if (medication) {
      const reminder = medication.reminders.find(r => r.time === reminderTime && r.date === new Date().toDateString());
      if (reminder) {
        reminder.taken = taken;
      } else {
        medication.reminders.push({
          id: `reminder-${Date.now()}`,
          medicationId,
          time: reminderTime,
          taken,
          date: new Date().toDateString()
        });
      }
      this.savePatientData();
    }
  }

  public getRecentVitals(): VitalSigns | null {
    return this.patient.vitalSigns[0] || null;
  }

  public getLatestAssessment(): HealthAssessment | null {
    return this.patient.assessments[0] || null;
  }

  public getUpcomingAppointments(): Appointment[] {
    const now = new Date();
    return this.patient.appointments
      .filter(apt => new Date(apt.date) >= now && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  public getUnreadMessages(): Message[] {
    return this.patient.messages.filter(msg => !msg.read);
  }
}