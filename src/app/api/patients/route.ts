import { NextRequest, NextResponse } from "next/server";
import { withMiddleware } from "@/lib/middleware";
import { patientProfileSchema, createValidator } from "@/lib/validation";
import { db } from "@/lib/database";
import { performanceMonitor } from "@/lib/healthMonitor";

const validatePatient = createValidator(patientProfileSchema);

// GET /api/patients - List patients (with pagination and filtering)
export const GET = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const search = url.searchParams.get('search');
      
      // In a real implementation, this would query the database with pagination
      const allPatients = await db.exportData().then(data => data.patients);
      
      let filteredPatients = allPatients;
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPatients = allPatients.filter(patient =>
          patient.firstName.toLowerCase().includes(searchLower) ||
          patient.lastName.toLowerCase().includes(searchLower) ||
          patient.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);
      
      // Remove sensitive information
      const sanitizedPatients = paginatedPatients.map(patient => ({
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      }));
      
      const totalPages = Math.ceil(filteredPatients.length / limit);
      
      performanceMonitor.recordMetric('patients_list_time', Date.now() - startTime);
      
      return NextResponse.json({
        patients: sanitizedPatients,
        pagination: {
          page,
          limit,
          total: filteredPatients.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        metadata: {
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      performanceMonitor.recordMetric('patients_list_errors', 1);
      console.error("Patients list error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to retrieve patients",
          code: "PATIENTS_LIST_ERROR",
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

// POST /api/patients - Create new patient
export const POST = withMiddleware(
  async ({ req }) => {
    const startTime = Date.now();
    
    try {
      const body = await req.json();
      const validation = validatePatient(body);
      
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
      
      const patientData = validation.data!;
      
      // Check if patient with email already exists
      const existingPatient = await db.findPatientByEmail(patientData.email);
      if (existingPatient) {
        return NextResponse.json(
          {
            error: "Patient with this email already exists",
            code: "DUPLICATE_EMAIL"
          },
          { status: 409 }
        );
      }
      
      // Create new patient
      const newPatient = await db.createPatient(patientData);
      
      // Remove sensitive information from response
      const sanitizedPatient = {
        id: newPatient.id,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        email: newPatient.email,
        phone: newPatient.phone,
        dateOfBirth: newPatient.dateOfBirth,
        gender: newPatient.gender,
        bloodType: newPatient.bloodType,
        createdAt: newPatient.createdAt,
        updatedAt: newPatient.updatedAt
      };
      
      performanceMonitor.recordMetric('patient_creation_time', Date.now() - startTime);
      performanceMonitor.recordMetric('patients_created', 1);
      
      return NextResponse.json(
        {
          patient: sanitizedPatient,
          message: "Patient created successfully",
          metadata: {
            processingTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          }
        },
        { status: 201 }
      );
      
    } catch (error) {
      performanceMonitor.recordMetric('patient_creation_errors', 1);
      console.error("Patient creation error:", error);
      
      return NextResponse.json(
        {
          error: "Failed to create patient",
          code: "PATIENT_CREATION_ERROR",
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimit: { requests: 10, windowMs: 60000 },
    validateInput: (data) => validatePatient(data)
  }
);