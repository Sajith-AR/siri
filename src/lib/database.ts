// Database abstraction layer for healthcare data
import { cache } from "./cache";
import { logger } from "./logging";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: string;
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  type: 'symptom_check' | 'ai_consultation' | 'vital_signs' | 'medication' | 'appointment';
  data: any;
  timestamp: string;
  provider?: string;
  confidence?: number;
  tags: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string;
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  duration: number; // minutes
  notes?: string;
  symptoms?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  phone: string;
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
  }[];
  createdAt: string;
  updatedAt: string;
}

// In-memory database simulation (replace with real database in production)
class InMemoryDatabase {
  private patients = new Map<string, Patient>();
  private healthRecords = new Map<string, HealthRecord>();
  private appointments = new Map<string, Appointment>();
  private doctors = new Map<string, Doctor>();

  // Patient operations
  async createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const id = this.generateId('patient');
    const now = new Date().toISOString();
    
    const newPatient: Patient = {
      ...patient,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.patients.set(id, newPatient);
    cache.set(`patient:${id}`, newPatient, 600000); // 10 minutes
    
    await logger.log({
      level: 'info',
      message: `Patient created: ${id}`,
      metadata: { patientId: id, email: patient.email }
    });
    
    return newPatient;
  }

  async getPatient(id: string): Promise<Patient | null> {
    // Check cache first
    const cached = cache.get<Patient>(`patient:${id}`);
    if (cached) return cached;
    
    const patient = this.patients.get(id) || null;
    if (patient) {
      cache.set(`patient:${id}`, patient, 600000);
    }
    
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const existing = this.patients.get(id);
    if (!existing) return null;
    
    const updated: Patient = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    this.patients.set(id, updated);
    cache.set(`patient:${id}`, updated, 600000);
    
    await logger.log({
      level: 'info',
      message: `Patient updated: ${id}`,
      metadata: { patientId: id, updates: Object.keys(updates) }
    });
    
    return updated;
  }

  async deletePatient(id: string): Promise<boolean> {
    const deleted = this.patients.delete(id);
    if (deleted) {
      cache.invalidate(`patient:${id}`);
      await logger.log({
        level: 'info',
        message: `Patient deleted: ${id}`,
        metadata: { patientId: id }
      });
    }
    return deleted;
  }

  async findPatientByEmail(email: string): Promise<Patient | null> {
    for (const patient of this.patients.values()) {
      if (patient.email === email) {
        return patient;
      }
    }
    return null;
  }

  // Health record operations
  async createHealthRecord(record: Omit<HealthRecord, 'id'>): Promise<HealthRecord> {
    const id = this.generateId('record');
    const newRecord: HealthRecord = { ...record, id };
    
    this.healthRecords.set(id, newRecord);
    
    // Invalidate patient cache to ensure fresh data
    cache.invalidateByPattern(new RegExp(`patient:${record.patientId}`));
    
    await logger.log({
      level: 'info',
      message: `Health record created: ${id}`,
      metadata: { recordId: id, patientId: record.patientId, type: record.type }
    });
    
    return newRecord;
  }

  async getHealthRecord(id: string): Promise<HealthRecord | null> {
    return this.healthRecords.get(id) || null;
  }

  async getPatientHealthRecords(patientId: string, type?: string): Promise<HealthRecord[]> {
    const cacheKey = `records:${patientId}:${type || 'all'}`;
    const cached = cache.get<HealthRecord[]>(cacheKey);
    if (cached) return cached;
    
    const records = Array.from(this.healthRecords.values())
      .filter(record => {
        if (record.patientId !== patientId) return false;
        if (type && record.type !== type) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    cache.set(cacheKey, records, 300000); // 5 minutes
    return records;
  }

  // Appointment operations
  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const id = this.generateId('appointment');
    const now = new Date().toISOString();
    
    const newAppointment: Appointment = {
      ...appointment,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.appointments.set(id, newAppointment);
    
    await logger.log({
      level: 'info',
      message: `Appointment created: ${id}`,
      metadata: { 
        appointmentId: id, 
        patientId: appointment.patientId, 
        doctorId: appointment.doctorId,
        dateTime: appointment.dateTime
      }
    });
    
    return newAppointment;
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    return this.appointments.get(id) || null;
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.patientId === patientId)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  }

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.doctorId === doctorId)
      .sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const existing = this.appointments.get(id);
    if (!existing) return null;
    
    const updated: Appointment = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.appointments.set(id, updated);
    
    await logger.log({
      level: 'info',
      message: `Appointment updated: ${id}`,
      metadata: { appointmentId: id, updates: Object.keys(updates) }
    });
    
    return updated;
  }

  // Doctor operations
  async createDoctor(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
    const id = this.generateId('doctor');
    const now = new Date().toISOString();
    
    const newDoctor: Doctor = {
      ...doctor,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.doctors.set(id, newDoctor);
    
    await logger.log({
      level: 'info',
      message: `Doctor created: ${id}`,
      metadata: { doctorId: id, email: doctor.email, specialization: doctor.specialization }
    });
    
    return newDoctor;
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    return this.doctors.get(id) || null;
  }

  async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    return Array.from(this.doctors.values())
      .filter(doctor => doctor.specialization.toLowerCase().includes(specialization.toLowerCase()));
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  // Analytics and reporting
  async getPatientStats(): Promise<{
    totalPatients: number;
    newPatientsThisMonth: number;
    averageAge: number;
    genderDistribution: Record<string, number>;
  }> {
    const patients = Array.from(this.patients.values());
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const newThisMonth = patients.filter(p => new Date(p.createdAt) >= thisMonth).length;
    
    const ages = patients
      .map(p => {
        const birthDate = new Date(p.dateOfBirth);
        return now.getFullYear() - birthDate.getFullYear();
      })
      .filter(age => age >= 0 && age <= 150);
    
    const averageAge = ages.length > 0 ? ages.reduce((sum, age) => sum + age, 0) / ages.length : 0;
    
    const genderDistribution: Record<string, number> = {};
    patients.forEach(p => {
      genderDistribution[p.gender] = (genderDistribution[p.gender] || 0) + 1;
    });
    
    return {
      totalPatients: patients.length,
      newPatientsThisMonth: newThisMonth,
      averageAge: Math.round(averageAge),
      genderDistribution
    };
  }

  async getHealthRecordStats(): Promise<{
    totalRecords: number;
    recordsByType: Record<string, number>;
    recordsThisWeek: number;
    averageConfidence: number;
  }> {
    const records = Array.from(this.healthRecords.values());
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recordsThisWeek = records.filter(r => new Date(r.timestamp) >= thisWeek).length;
    
    const recordsByType: Record<string, number> = {};
    records.forEach(r => {
      recordsByType[r.type] = (recordsByType[r.type] || 0) + 1;
    });
    
    const confidenceScores = records
      .map(r => r.confidence)
      .filter(c => typeof c === 'number');
    
    const averageConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length 
      : 0;
    
    return {
      totalRecords: records.length,
      recordsByType,
      recordsThisWeek,
      averageConfidence: Math.round(averageConfidence)
    };
  }

  // Utility methods
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Data export/import for backup
  async exportData(): Promise<{
    patients: Patient[];
    healthRecords: HealthRecord[];
    appointments: Appointment[];
    doctors: Doctor[];
    exportedAt: string;
  }> {
    return {
      patients: Array.from(this.patients.values()),
      healthRecords: Array.from(this.healthRecords.values()),
      appointments: Array.from(this.appointments.values()),
      doctors: Array.from(this.doctors.values()),
      exportedAt: new Date().toISOString()
    };
  }

  async importData(data: {
    patients?: Patient[];
    healthRecords?: HealthRecord[];
    appointments?: Appointment[];
    doctors?: Doctor[];
  }): Promise<void> {
    if (data.patients) {
      data.patients.forEach(patient => this.patients.set(patient.id, patient));
    }
    
    if (data.healthRecords) {
      data.healthRecords.forEach(record => this.healthRecords.set(record.id, record));
    }
    
    if (data.appointments) {
      data.appointments.forEach(appointment => this.appointments.set(appointment.id, appointment));
    }
    
    if (data.doctors) {
      data.doctors.forEach(doctor => this.doctors.set(doctor.id, doctor));
    }
    
    // Clear cache after import
    cache.clear();
    
    await logger.log({
      level: 'info',
      message: 'Data imported successfully',
      metadata: {
        patients: data.patients?.length || 0,
        healthRecords: data.healthRecords?.length || 0,
        appointments: data.appointments?.length || 0,
        doctors: data.doctors?.length || 0
      }
    });
  }
}

// Global database instance
export const db = new InMemoryDatabase();

// Initialize with sample data
async function initializeSampleData() {
  try {
    // Create sample doctors
    await db.createDoctor({
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@healthcenter.com',
      specialization: 'Family Medicine',
      licenseNumber: 'MD123456',
      phone: '+1-555-0101',
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }
      ]
    });

    await db.createDoctor({
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@healthcenter.com',
      specialization: 'Cardiology',
      licenseNumber: 'MD789012',
      phone: '+1-555-0102',
      availability: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '12:00' }
      ]
    });

    // Create sample patient
    await db.createPatient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      dateOfBirth: '1985-06-15',
      gender: 'male',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg'],
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      }
    });

    await logger.log({
      level: 'info',
      message: 'Sample data initialized successfully'
    });

  } catch (error) {
    await logger.log({
      level: 'error',
      message: 'Failed to initialize sample data',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}

// Initialize sample data on startup
initializeSampleData();

export type { Patient, HealthRecord, Appointment, Doctor };