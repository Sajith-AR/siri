import { z } from "zod";

// Common validation schemas
export const emailSchema = z.string().email("Invalid email format");
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number");
export const dateSchema = z.string().datetime("Invalid date format");

// Health-specific validation schemas
export const symptomSchema = z.object({
  text: z.string().min(1, "Symptom description required").max(1000, "Description too long"),
  severity: z.enum(["low", "medium", "high"]).optional(),
  duration: z.string().optional(),
  location: z.string().optional()
});

export const vitalSignsSchema = z.object({
  heartRate: z.number().min(30).max(250).optional(),
  bloodPressure: z.object({
    systolic: z.number().min(70).max(250),
    diastolic: z.number().min(40).max(150)
  }).optional(),
  temperature: z.number().min(95).max(110).optional(), // Fahrenheit
  oxygenSaturation: z.number().min(70).max(100).optional(),
  respiratoryRate: z.number().min(8).max(60).optional(),
  weight: z.number().min(1).max(1000).optional(), // kg
  height: z.number().min(30).max(300).optional() // cm
});

export const patientProfileSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  email: emailSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema,
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  medicalHistory: z.array(z.string()).optional(),
  emergencyContact: z.object({
    name: z.string().min(1),
    phone: phoneSchema,
    relationship: z.string()
  }).optional()
});

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Doctor ID required"),
  patientId: z.string().min(1, "Patient ID required"),
  dateTime: dateSchema,
  type: z.enum(["consultation", "follow_up", "emergency", "routine_checkup"]),
  duration: z.number().min(15).max(180).default(30), // minutes
  notes: z.string().max(500).optional(),
  symptoms: z.array(symptomSchema).optional()
});

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name required"),
  dosage: z.string().min(1, "Dosage required"),
  frequency: z.string().min(1, "Frequency required"),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().max(500).optional()
});

export const healthRiskAssessmentSchema = z.object({
  age: z.number().min(0).max(150),
  symptoms: z.array(symptomSchema).optional(),
  vitalSigns: vitalSignsSchema.optional(),
  medicalHistory: z.array(z.string()).optional(),
  lifestyle: z.object({
    smoking: z.boolean().optional(),
    alcohol: z.enum(["none", "light", "moderate", "heavy"]).optional(),
    exercise: z.enum(["none", "light", "moderate", "heavy"]).optional(),
    diet: z.enum(["poor", "fair", "good", "excellent"]).optional(),
    sleep: z.number().min(0).max(24).optional() // hours per night
  }).optional(),
  familyHistory: z.array(z.string()).optional(),
  currentMedications: z.array(medicationSchema).optional()
});

// API request validation schemas
export const symptomCheckRequestSchema = z.object({
  input: z.string().min(1, "Symptoms description required").max(2000, "Description too long"),
  patientId: z.string().optional(),
  severity: z.enum(["low", "medium", "high"]).optional()
});

export const aiAssistantRequestSchema = z.object({
  message: z.string().min(1, "Message required").max(1000, "Message too long"),
  context: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional(),
  patientHistory: z.object({
    previousSymptoms: z.array(symptomSchema).optional(),
    lastAssessment: z.any().optional(),
    preferences: z.any().optional()
  }).optional()
});

export const imageAnalysisRequestSchema = z.object({
  image: z.string().min(1, "Image data required"),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/, "Invalid image format"),
  description: z.string().max(500).optional()
});

// Validation helper functions
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { isValid: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { isValid: false, errors };
    }
    return { isValid: false, errors: ["Validation failed"] };
  }
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => validateRequest(schema, data);
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .slice(0, 1000); // Limit length
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '');
}

// Medical data validation helpers
export function validateVitalSigns(vitals: any): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  if (vitals.heartRate) {
    if (vitals.heartRate < 60) warnings.push("Heart rate below normal range");
    if (vitals.heartRate > 100) warnings.push("Heart rate above normal range");
  }
  
  if (vitals.bloodPressure) {
    const { systolic, diastolic } = vitals.bloodPressure;
    if (systolic > 140 || diastolic > 90) {
      warnings.push("Blood pressure elevated - consult healthcare provider");
    }
  }
  
  if (vitals.temperature) {
    if (vitals.temperature > 100.4) warnings.push("Fever detected");
    if (vitals.temperature < 97) warnings.push("Low body temperature");
  }
  
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
    warnings.push("Low oxygen saturation - seek immediate medical attention");
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

export function validateMedicationInteractions(medications: string[]): {
  hasInteractions: boolean;
  interactions: Array<{ drug1: string; drug2: string; severity: string; description: string }>;
} {
  // Simplified interaction checking - in production, use a comprehensive drug database
  const knownInteractions = new Map([
    ['warfarin-aspirin', { severity: 'high', description: 'Increased bleeding risk' }],
    ['metformin-alcohol', { severity: 'medium', description: 'Risk of lactic acidosis' }],
    ['lisinopril-potassium', { severity: 'medium', description: 'Risk of hyperkalemia' }]
  ]);
  
  const interactions: Array<{ drug1: string; drug2: string; severity: string; description: string }> = [];
  
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const drug1 = medications[i].toLowerCase();
      const drug2 = medications[j].toLowerCase();
      const key = `${drug1}-${drug2}`;
      const reverseKey = `${drug2}-${drug1}`;
      
      const interaction = knownInteractions.get(key) || knownInteractions.get(reverseKey);
      if (interaction) {
        interactions.push({
          drug1: medications[i],
          drug2: medications[j],
          severity: interaction.severity,
          description: interaction.description
        });
      }
    }
  }
  
  return {
    hasInteractions: interactions.length > 0,
    interactions
  };
}