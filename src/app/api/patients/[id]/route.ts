import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { patientProfileSchema, createValidator } from "@/lib/validation";
import { db } from "@/lib/database";
import { performanceMonitor } from "@/lib/healthMonitor";

const validatePatientUpdate = createValidator(patientProfileSchema.partial());

// GET /api/patients/[id] - Get specific patient
export const GET = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const url = new URL(req.url);
      const patientId = url.pathname.split('/').pop();
      
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID is required", code: "MISSING_PATIENT_ID" },
          { status: 400 }
        );
      }
      
      const patient = await db.getPatient(patientId);
      
      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found", code: "PATIENT_NOT_FOUND" },
          { status: 404 }
        );
      }
      
      // Get patient's health records
      const healthRecords = await db.getPatientHealthRecords(patientId);
      
      // Get patient's appointments
      const appointments = await db.getPatientAppointments(patientId);
      
      performanceMonitor.recordMetric('patient_get_time', Date.now() - startTime);
      
      return NextResponse.json({
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          medications: patient.medications,
          medicalHistory: patient.medicalHistory,
          emergencyContact: patient.emergencyContact,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt
        },
        healthRecords: healthRecords.slice(0, 10), // Last 10 records
        appointments: appointments.filter(apt => new Date(apt.dateTime) >= new Date()), // Upcoming appointments
        metadata: {
          totalHealthRecords: healthRecords.length,
          totalAppointments: appointments.length,
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      performanceMonitor.recordMetric('patient_get_errors', 1);
      console.error("Patient get error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to retrieve patient",
          code: "PATIENT_GET_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 100, windowMs: 60000 }
  }
);

// PUT /api/patients/[id] - Update patient
export const PUT = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const url = new URL(req.url);
      const patientId = url.pathname.split('/').pop();
      
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID is required", code: "MISSING_PATIENT_ID" },
          { status: 400 }
        );
      }
      
      const body = await req.json();
      const validation = validatePatientUpdate(body);
      
      if (!validation.isValid) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.errors,
            code: "VALIDATION_ERROR"
          },
          { status: 400 }
        );
      }
      
      const updates = validation.data!;
      
      // Check if patient exists
      const existingPatient = await db.getPatient(patientId);
      if (!existingPatient) {
        return NextResponse.json(
          { error: "Patient not found", code: "PATIENT_NOT_FOUND" },
          { status: 404 }
        );
      }
      
      // If email is being updated, check for duplicates
      if (updates.email && updates.email !== existingPatient.email) {
        const duplicatePatient = await db.findPatientByEmail(updates.email);
        if (duplicatePatient && duplicatePatient.id !== patientId) {
          return NextResponse.json(
            {
              error: "Patient with this email already exists",
              code: "DUPLICATE_EMAIL"
            },
            { status: 409 }
          );
        }
      }
      
      // Update patient
      const updatedPatient = await db.updatePatient(patientId, updates);
      
      if (!updatedPatient) {
        return NextResponse.json(
          { error: "Failed to update patient", code: "UPDATE_FAILED" },
          { status: 500 }
        );
      }
      
      performanceMonitor.recordMetric('patient_update_time', Date.now() - startTime);
      performanceMonitor.recordMetric('patients_updated', 1);
      
      return NextResponse.json({
        patient: {
          id: updatedPatient.id,
          firstName: updatedPatient.firstName,
          lastName: updatedPatient.lastName,
          email: updatedPatient.email,
          phone: updatedPatient.phone,
          dateOfBirth: updatedPatient.dateOfBirth,
          gender: updatedPatient.gender,
          bloodType: updatedPatient.bloodType,
          allergies: updatedPatient.allergies,
          medications: updatedPatient.medications,
          medicalHistory: updatedPatient.medicalHistory,
          emergencyContact: updatedPatient.emergencyContact,
          createdAt: updatedPatient.createdAt,
          updatedAt: updatedPatient.updatedAt
        },
        message: "Patient updated successfully",
        metadata: {
          updatedFields: Object.keys(updates),
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      performanceMonitor.recordMetric('patient_update_errors', 1);
      console.error("Patient update error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to update patient",
          code: "PATIENT_UPDATE_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 20, windowMs: 60000 },
    validateInput: (data) => validatePatientUpdate(data)
  }
);

// DELETE /api/patients/[id] - Delete patient
export const DELETE = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const url = new URL(req.url);
      const patientId = url.pathname.split('/').pop();
      
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID is required", code: "MISSING_PATIENT_ID" },
          { status: 400 }
        );
      }
      
      // Check if patient exists
      const existingPatient = await db.getPatient(patientId);
      if (!existingPatient) {
        return NextResponse.json(
          { error: "Patient not found", code: "PATIENT_NOT_FOUND" },
          { status: 404 }
        );
      }
      
      // In a real system, you might want to soft delete or archive instead
      const deleted = await db.deletePatient(patientId);
      
      if (!deleted) {
        return NextResponse.json(
          { error: "Failed to delete patient", code: "DELETE_FAILED" },
          { status: 500 }
        );
      }
      
      performanceMonitor.recordMetric('patient_delete_time', Date.now() - startTime);
      performanceMonitor.recordMetric('patients_deleted', 1);
      
      return NextResponse.json({
        message: "Patient deleted successfully",
        patientId,
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      performanceMonitor.recordMetric('patient_delete_errors', 1);
      console.error("Patient delete error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to delete patient",
          code: "PATIENT_DELETE_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 }
  }
);