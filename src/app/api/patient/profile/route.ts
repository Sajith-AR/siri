import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

// Mock patient data - in production, this would come from a database
const mockPatients = {
  "+1234567890": {
    id: "patient_001",
    name: "Sarah Johnson",
    age: 28,
    email: "sarah.johnson@email.com",
    phone: "+1234567890",
    medicalHistory: ["Asthma", "Allergies to peanuts"],
    currentMedications: ["Albuterol inhaler", "Vitamin D"],
    emergencyContact: {
      name: "John Johnson",
      phone: "+1234567891",
      relationship: "Spouse"
    },
    healthMetrics: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      weight: 140,
      height: "5'6\"",
      lastUpdated: "2024-12-08T10:00:00Z"
    },
    appointments: [
      {
        id: "apt_001",
        date: "2024-12-08T14:00:00Z",
        type: "Video Consultation",
        doctor: "Dr. Smith",
        status: "scheduled"
      }
    ],
    messages: [
      {
        id: "msg_001",
        from: "Dr. Smith",
        message: "Your test results look great! See you at our appointment today.",
        timestamp: "2024-12-08T08:00:00Z",
        unread: true
      },
      {
        id: "msg_002",
        from: "Nurse Johnson",
        message: "Please remember to take your medication with food.",
        timestamp: "2024-12-07T16:00:00Z",
        unread: true
      }
    ]
  }
};

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const patient = mockPatients[decoded.phone as keyof typeof mockPatients];
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: patient,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Patient profile API error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const patient = mockPatients[decoded.phone as keyof typeof mockPatients];
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const updates = await req.json();
    
    // Update allowed fields
    if (updates.name) patient.name = updates.name;
    if (updates.email) patient.email = updates.email;
    if (updates.age) patient.age = updates.age;
    if (updates.medicalHistory) patient.medicalHistory = updates.medicalHistory;
    if (updates.currentMedications) patient.currentMedications = updates.currentMedications;
    if (updates.emergencyContact) patient.emergencyContact = { ...patient.emergencyContact, ...updates.emergencyContact };

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: patient,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Patient profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}