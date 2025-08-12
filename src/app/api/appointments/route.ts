import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

// Mock appointments data
const mockAppointments = [
  {
    id: "apt_001",
    patientId: "patient_001",
    doctorId: "doctor_001",
    doctorName: "Dr. Sarah Smith",
    specialty: "General Medicine",
    date: "2024-12-08T14:00:00Z",
    duration: 30,
    type: "Video Consultation",
    status: "scheduled",
    notes: "Follow-up consultation",
    meetingLink: "/call/apt_001"
  },
  {
    id: "apt_002",
    patientId: "patient_001",
    doctorId: "doctor_002",
    doctorName: "Dr. Michael Johnson",
    specialty: "Cardiology",
    date: "2024-12-15T10:00:00Z",
    duration: 45,
    type: "In-Person",
    status: "scheduled",
    notes: "Routine checkup",
    location: "Medical Center, Room 205"
  }
];

const mockDoctors = [
  {
    id: "doctor_001",
    name: "Dr. Sarah Smith",
    specialty: "General Medicine",
    rating: 4.8,
    experience: "10 years",
    availability: [
      { date: "2024-12-09", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
      { date: "2024-12-10", slots: ["09:00", "10:30", "13:00", "14:30", "16:00"] }
    ]
  },
  {
    id: "doctor_002",
    name: "Dr. Michael Johnson",
    specialty: "Cardiology",
    rating: 4.9,
    experience: "15 years",
    availability: [
      { date: "2024-12-09", slots: ["10:00", "11:00", "15:00", "16:00"] },
      { date: "2024-12-10", slots: ["09:00", "10:00", "14:00", "15:00"] }
    ]
  },
  {
    id: "doctor_003",
    name: "Dr. Emily Chen",
    specialty: "Dermatology",
    rating: 4.7,
    experience: "8 years",
    availability: [
      { date: "2024-12-09", slots: ["09:30", "11:00", "13:30", "15:00"] },
      { date: "2024-12-10", slots: ["10:00", "11:30", "14:00", "16:00"] }
    ]
  }
];

// GET - Fetch appointments for a patient
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    // In production, you'd query the database based on patient ID
    const patientAppointments = mockAppointments.filter(apt => apt.patientId === "patient_001");

    return NextResponse.json({
      success: true,
      data: patientAppointments,
      count: patientAppointments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Appointments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST - Create new appointment
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const { doctorId, date, time, type, notes } = await req.json();

    if (!doctorId || !date || !time || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: doctorId, date, time, type" 
      }, { status: 400 });
    }

    const doctor = mockDoctors.find(d => d.id === doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Check availability (simplified)
    const dateAvailability = doctor.availability.find(a => a.date === date);
    if (!dateAvailability || !dateAvailability.slots.includes(time)) {
      return NextResponse.json({ 
        error: "Selected time slot is not available" 
      }, { status: 400 });
    }

    const newAppointment = {
      id: `apt_${Date.now()}`,
      patientId: "patient_001", // In production, get from decoded token
      doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: `${date}T${time}:00Z`,
      duration: type === "Video Consultation" ? 30 : 45,
      type,
      status: "scheduled",
      notes: notes || "",
      meetingLink: type === "Video Consultation" ? `/call/apt_${Date.now()}` : undefined,
      location: type === "In-Person" ? "Medical Center" : undefined
    };

    // In production, save to database
    mockAppointments.push(newAppointment);

    return NextResponse.json({
      success: true,
      message: "Appointment scheduled successfully",
      data: newAppointment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Appointments POST error:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}