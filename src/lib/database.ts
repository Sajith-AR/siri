// MongoDB-based database abstraction layer for healthcare data
import mongoose from 'mongoose';
import { cache } from "./cache";
import { logger } from "./logging";
import connectToDatabase from "./mongodb";

// Import models
import Patient, { IPatient } from "./models/Patient";
import HealthRecord, { IHealthRecord } from "./models/HealthRecord";
import Appointment, { IAppointment } from "./models/Appointment";
import Doctor, { IDoctor } from "./models/Doctor";

// Type exports for compatibility (avoiding duplicate identifiers)
export type PatientType = IPatient;
export type HealthRecordType = IHealthRecord;
export type AppointmentType = IAppointment;
export type DoctorType = IDoctor;

// MongoDB-based database class
class MongoDatabase {
  constructor() {
    // Ensure database connection on instantiation
    this.ensureConnection();
  }

  private async ensureConnection(): Promise<void> {
    try {
      await connectToDatabase();
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to connect to database',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
  }

  // Patient operations
  async createPatient(patientData: Partial<IPatient>): Promise<IPatient> {
    await this.ensureConnection();
    
    try {
      const patient = new Patient(patientData);
      const savedPatient = await patient.save();
      
      // Cache the patient
      cache.set(`patient:${savedPatient._id}`, savedPatient.toObject(), 600000);
      
      await logger.log({
        level: 'info',
        message: `Patient created: ${savedPatient._id}`,
        metadata: { patientId: savedPatient._id.toString(), email: savedPatient.email }
      });
      
      return savedPatient;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to create patient',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getPatient(id: string): Promise<IPatient | null> {
    await this.ensureConnection();
    
    // Check cache first
    const cached = cache.get<IPatient>(`patient:${id}`);
    if (cached) return cached;
    
    try {
      const patient = await Patient.findById(id).exec();
      if (patient) {
        cache.set(`patient:${id}`, patient.toObject(), 600000);
      }
      return patient;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get patient: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async updatePatient(id: string, updates: Partial<IPatient>): Promise<IPatient | null> {
    await this.ensureConnection();
    
    try {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).exec();
      
      if (patient) {
        cache.set(`patient:${id}`, patient.toObject(), 600000);
        
        await logger.log({
          level: 'info',
          message: `Patient updated: ${id}`,
          metadata: { patientId: id, updates: Object.keys(updates) }
        });
      }
      
      return patient;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to update patient: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async deletePatient(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    try {
      // Soft delete by setting isActive to false
      const patient = await Patient.findByIdAndUpdate(
        id,
        { $set: { isActive: false } },
        { new: true }
      ).exec();
      
      if (patient) {
        cache.invalidate(`patient:${id}`);
        
        await logger.log({
          level: 'info',
          message: `Patient deleted (soft): ${id}`,
          metadata: { patientId: id }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to delete patient: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return false;
    }
  }

  async findPatientByEmail(email: string): Promise<IPatient | null> {
    await this.ensureConnection();
    
    try {
      const patient = await Patient.findByEmail(email);
      return patient;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to find patient by email: ${email}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  // Health record operations
  async createHealthRecord(recordData: Partial<IHealthRecord>): Promise<IHealthRecord> {
    await this.ensureConnection();
    
    try {
      const record = new HealthRecord({
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedRecord = await record.save();
      
      // Invalidate patient cache
      if (recordData.patientId) {
        cache.invalidateByPattern(new RegExp(`patient:${recordData.patientId}`));
      }
      
      await logger.log({
        level: 'info',
        message: `Health record created: ${savedRecord._id}`,
        metadata: { 
          recordId: savedRecord._id.toString(), 
          patientId: savedRecord.patientId?.toString(), 
          type: savedRecord.type 
        }
      });
      
      return savedRecord;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to create health record',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getHealthRecord(id: string): Promise<IHealthRecord | null> {
    await this.ensureConnection();
    
    try {
      const record = await HealthRecord.findById(id)
        .populate('patientId', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName specialization')
        .exec();
      
      return record;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get health record: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async getPatientHealthRecords(patientId: string, type?: string, limit: number = 50): Promise<IHealthRecord[]> {
    await this.ensureConnection();
    
    const cacheKey = `records:${patientId}:${type || 'all'}:${limit}`;
    const cached = cache.get<IHealthRecord[]>(cacheKey);
    if (cached) return cached;
    
    try {
      const records = await HealthRecord.findByPatient(
        new mongoose.Types.ObjectId(patientId),
        type,
        limit
      );
      
      cache.set(cacheKey, records.map((r: IHealthRecord) => r.toObject()), 300000);
      return records;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get patient health records: ${patientId}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  // Appointment operations
  async createAppointment(appointmentData: Partial<IAppointment>): Promise<IAppointment> {
    await this.ensureConnection();
    
    try {
      const appointment = new Appointment(appointmentData);
      const savedAppointment = await appointment.save();
      
      await logger.log({
        level: 'info',
        message: `Appointment created: ${savedAppointment._id}`,
        metadata: { 
          appointmentId: savedAppointment._id.toString(), 
          patientId: savedAppointment.patientId?.toString(), 
          doctorId: savedAppointment.doctorId?.toString(),
          dateTime: savedAppointment.dateTime
        }
      });
      
      return savedAppointment;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to create appointment',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getAppointment(id: string): Promise<IAppointment | null> {
    await this.ensureConnection();
    
    try {
      const appointment = await Appointment.findById(id)
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName specialization')
        .exec();
      
      return appointment;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get appointment: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async getPatientAppointments(patientId: string, status?: string, limit: number = 50): Promise<IAppointment[]> {
    await this.ensureConnection();
    
    try {
      const appointments = await Appointment.findByPatient(
        new mongoose.Types.ObjectId(patientId),
        status,
        limit
      );
      
      return appointments;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get patient appointments: ${patientId}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getDoctorAppointments(doctorId: string, status?: string, limit: number = 50): Promise<IAppointment[]> {
    await this.ensureConnection();
    
    try {
      const appointments = await Appointment.findByDoctor(
        new mongoose.Types.ObjectId(doctorId),
        status,
        limit
      );
      
      return appointments;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get doctor appointments: ${doctorId}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async updateAppointment(id: string, updates: Partial<IAppointment>): Promise<IAppointment | null> {
    await this.ensureConnection();
    
    try {
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      )
        .populate('patientId', 'firstName lastName email phone')
        .populate('doctorId', 'firstName lastName specialization')
        .exec();
      
      if (appointment) {
        await logger.log({
          level: 'info',
          message: `Appointment updated: ${id}`,
          metadata: { appointmentId: id, updates: Object.keys(updates) }
        });
      }
      
      return appointment;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to update appointment: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  // Doctor operations
  async createDoctor(doctorData: Partial<IDoctor>): Promise<IDoctor> {
    await this.ensureConnection();
    
    try {
      const doctor = new Doctor(doctorData);
      const savedDoctor = await doctor.save();
      
      await logger.log({
        level: 'info',
        message: `Doctor created: ${savedDoctor._id}`,
        metadata: { 
          doctorId: savedDoctor._id.toString(), 
          email: savedDoctor.email, 
          specialization: savedDoctor.specialization 
        }
      });
      
      return savedDoctor;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to create doctor',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async getDoctor(id: string): Promise<IDoctor | null> {
    await this.ensureConnection();
    
    try {
      const doctor = await Doctor.findById(id).exec();
      return doctor;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get doctor: ${id}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return null;
    }
  }

  async getDoctorsBySpecialization(specialization: string, limit: number = 20): Promise<IDoctor[]> {
    await this.ensureConnection();
    
    try {
      const doctors = await Doctor.findBySpecialization(specialization, limit);
      return doctors;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to get doctors by specialization: ${specialization}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getAllDoctors(limit: number = 100): Promise<IDoctor[]> {
    await this.ensureConnection();
    
    try {
      const doctors = await Doctor.find({ isActive: true, isVerified: true })
        .sort({ 'rating.average': -1, experience: -1 })
        .limit(limit)
        .exec();
      
      return doctors;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get all doctors',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  // Analytics and reporting
  async getPatientStats(): Promise<{
    totalPatients: number;
    newPatientsThisMonth: number;
    averageAge: number;
    genderDistribution: Record<string, number>;
    ageRange: { min: number; max: number };
  }> {
    await this.ensureConnection();
    
    try {
      const stats = await Patient.getPatientStats();
      return stats;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get patient statistics',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        totalPatients: 0,
        newPatientsThisMonth: 0,
        averageAge: 0,
        genderDistribution: {},
        ageRange: { min: 0, max: 0 }
      };
    }
  }

  async getHealthRecordStats(): Promise<{
    totalRecords: number;
    recordsByType: Record<string, number>;
    recordsBySeverity: Record<string, number>;
    recordsThisWeek: number;
    averageConfidence: number;
    confidenceRange: { min: number; max: number };
  }> {
    await this.ensureConnection();
    
    try {
      const stats = await HealthRecord.getRecordStats();
      return stats;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get health record statistics',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        totalRecords: 0,
        recordsByType: {},
        recordsBySeverity: {},
        recordsThisWeek: 0,
        averageConfidence: 0,
        confidenceRange: { min: 0, max: 0 }
      };
    }
  }

  // Additional utility methods
  async searchPatients(query: string, limit: number = 10): Promise<IPatient[]> {
    await this.ensureConnection();
    
    try {
      const patients = await Patient.searchPatients(query, limit);
      return patients;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to search patients: ${query}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async searchDoctors(query: string, limit: number = 10): Promise<IDoctor[]> {
    await this.ensureConnection();
    
    try {
      const doctors = await Doctor.searchDoctors(query, limit);
      return doctors;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: `Failed to search doctors: ${query}`,
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getUpcomingAppointments(limit: number = 50): Promise<IAppointment[]> {
    await this.ensureConnection();
    
    try {
      const appointments = await Appointment.findUpcoming(limit);
      return appointments;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get upcoming appointments',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getCriticalHealthRecords(limit: number = 20): Promise<IHealthRecord[]> {
    await this.ensureConnection();
    
    try {
      const records = await HealthRecord.findCriticalRecords(limit);
      return records;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get critical health records',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      return [];
    }
  }

  async getAppointmentStats(): Promise<{
    totalAppointments: number;
    appointmentsThisMonth: number;
    appointmentsThisWeek: number;
    upcomingAppointments: number;
    appointmentsByStatus: Record<string, number>;
    appointmentsByType: Record<string, number>;
    paymentsByStatus: Record<string, { count: number; totalAmount: number }>;
  }> {
    await this.ensureConnection();
    
    try {
      const stats = await Appointment.getAppointmentStats();
      return stats;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get appointment statistics',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        totalAppointments: 0,
        appointmentsThisMonth: 0,
        appointmentsThisWeek: 0,
        upcomingAppointments: 0,
        appointmentsByStatus: {},
        appointmentsByType: {},
        paymentsByStatus: {}
      };
    }
  }

  async getDoctorStats(): Promise<{
    totalDoctors: number;
    verifiedDoctors: number;
    specializationDistribution: Record<string, number>;
    averageExperience: number;
    experienceRange: { min: number; max: number };
    averageRating: number;
    totalRatings: number;
  }> {
    await this.ensureConnection();
    
    try {
      const stats = await Doctor.getDoctorStats();
      return stats;
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to get doctor statistics',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      return {
        totalDoctors: 0,
        verifiedDoctors: 0,
        specializationDistribution: {},
        averageExperience: 0,
        experienceRange: { min: 0, max: 0 },
        averageRating: 0,
        totalRatings: 0
      };
    }
  }

  // Data export/import for backup
  async exportData(): Promise<{
    patients: IPatient[];
    healthRecords: IHealthRecord[];
    appointments: IAppointment[];
    doctors: IDoctor[];
    exportedAt: string;
  }> {
    await this.ensureConnection();
    
    try {
      const [patients, healthRecords, appointments, doctors] = await Promise.all([
        Patient.find({ isActive: true }).exec(),
        HealthRecord.find({ status: 'active' }).exec(),
        Appointment.find().exec(),
        Doctor.find({ isActive: true }).exec()
      ]);
      
      return {
        patients: patients.map(p => p.toObject()),
        healthRecords: healthRecords.map(r => r.toObject()),
        appointments: appointments.map(a => a.toObject()),
        doctors: doctors.map(d => d.toObject()),
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to export data',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  async importData(data: {
    patients?: IPatient[];
    healthRecords?: IHealthRecord[];
    appointments?: IAppointment[];
    doctors?: IDoctor[];
  }): Promise<void> {
    await this.ensureConnection();
    
    try {
      const operations = [];
      
      if (data.patients) {
        operations.push(Patient.insertMany(data.patients, { ordered: false }));
      }
      
      if (data.healthRecords) {
        operations.push(HealthRecord.insertMany(data.healthRecords, { ordered: false }));
      }
      
      if (data.appointments) {
        operations.push(Appointment.insertMany(data.appointments, { ordered: false }));
      }
      
      if (data.doctors) {
        operations.push(Doctor.insertMany(data.doctors, { ordered: false }));
      }
      
      await Promise.allSettled(operations);
      
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
    } catch (error) {
      await logger.log({
        level: 'error',
        message: 'Failed to import data',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
}

// Global database instance
export const db = new MongoDatabase();

// Initialize with sample data
async function initializeSampleData() {
  try {
    // Check if data already exists
    const existingDoctors = await db.getAllDoctors(1);
    if (existingDoctors.length > 0) {
      await logger.log({
        level: 'info',
        message: 'Sample data already exists, skipping initialization'
      });
      return;
    }

    // Create sample doctors
    await db.createDoctor({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@healthcenter.com',
      specialization: 'Family Medicine',
      licenseNumber: 'MD123456',
      phone: '+1-555-0101',
      qualifications: ['MD', 'Board Certified Family Medicine'],
      experience: 8,
      languages: ['en', 'hi'],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }
      ],
      consultationFee: {
        inPerson: 150,
        video: 100,
        phone: 75
      },
      address: {
        street: '123 Medical Center Dr',
        city: 'Healthcare City',
        state: 'HC',
        zipCode: '12345',
        country: 'USA'
      },
      isVerified: true,
      isActive: true
    });

    await db.createDoctor({
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@healthcenter.com',
      specialization: 'Cardiology',
      licenseNumber: 'MD789012',
      phone: '+1-555-0102',
      qualifications: ['MD', 'Board Certified Cardiology', 'Fellowship in Interventional Cardiology'],
      experience: 12,
      languages: ['en'],
      availability: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '12:00', isAvailable: true }
      ],
      consultationFee: {
        inPerson: 250,
        video: 200,
        phone: 150
      },
      address: {
        street: '456 Cardiology Ave',
        city: 'Healthcare City',
        state: 'HC',
        zipCode: '12345',
        country: 'USA'
      },
      isVerified: true,
      isActive: true
    });

    // Create sample patient
    await db.createPatient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      bloodType: 'O+',
      allergies: ['Penicillin', 'Shellfish'],
      medications: ['Lisinopril 10mg'],
      medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      },
      preferences: {
        language: 'en',
        notifications: true,
        dataSharing: false
      },
      isActive: true
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

// Initialize sample data on startup (with delay to ensure connection)
setTimeout(initializeSampleData, 2000);

// Export types for compatibility
export type { PatientType as Patient, HealthRecordType as HealthRecord, AppointmentType as Appointment, DoctorType as Doctor };