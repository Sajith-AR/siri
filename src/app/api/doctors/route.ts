import { NextResponse } from "next/server";

const mockDoctors = [
  {
    id: "doctor_001",
    name: "Dr. Sarah Smith",
    specialty: "General Medicine",
    rating: 4.8,
    reviewCount: 127,
    experience: "10 years",
    education: "MD from Harvard Medical School",
    languages: ["English", "Spanish"],
    consultationFee: 150,
    avatar: "👩‍⚕️",
    bio: "Dr. Smith specializes in preventive care and chronic disease management with over 10 years of experience.",
    availability: [
      { date: "2024-12-09", slots: ["09:00", "10:00", "11:00", "14:00", "15:00"] },
      { date: "2024-12-10", slots: ["09:00", "10:30", "13:00", "14:30", "16:00"] },
      { date: "2024-12-11", slots: ["10:00", "11:00", "15:00", "16:00"] }
    ]
  },
  {
    id: "doctor_002",
    name: "Dr. Michael Johnson",
    specialty: "Cardiology",
    rating: 4.9,
    reviewCount: 89,
    experience: "15 years",
    education: "MD from Johns Hopkins University",
    languages: ["English"],
    consultationFee: 200,
    avatar: "👨‍⚕️",
    bio: "Cardiologist specializing in heart disease prevention and treatment with extensive research background.",
    availability: [
      { date: "2024-12-09", slots: ["10:00", "11:00", "15:00", "16:00"] },
      { date: "2024-12-10", slots: ["09:00", "10:00", "14:00", "15:00"] },
      { date: "2024-12-11", slots: ["11:00", "13:00", "14:00", "16:00"] }
    ]
  },
  {
    id: "doctor_003",
    name: "Dr. Emily Chen",
    specialty: "Dermatology",
    rating: 4.7,
    reviewCount: 156,
    experience: "8 years",
    education: "MD from Stanford University",
    languages: ["English", "Mandarin"],
    consultationFee: 175,
    avatar: "👩‍⚕️",
    bio: "Dermatologist focusing on skin health, cosmetic procedures, and skin cancer prevention.",
    availability: [
      { date: "2024-12-09", slots: ["09:30", "11:00", "13:30", "15:00"] },
      { date: "2024-12-10", slots: ["10:00", "11:30", "14:00", "16:00"] },
      { date: "2024-12-11", slots: ["09:00", "10:30", "15:30", "16:30"] }
    ]
  },
  {
    id: "doctor_004",
    name: "Dr. James Wilson",
    specialty: "Pediatrics",
    rating: 4.8,
    reviewCount: 203,
    experience: "12 years",
    education: "MD from UCLA Medical School",
    languages: ["English", "French"],
    consultationFee: 140,
    avatar: "👨‍⚕️",
    bio: "Pediatrician dedicated to children's health and development with a focus on preventive care.",
    availability: [
      { date: "2024-12-09", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
      { date: "2024-12-10", slots: ["08:30", "09:30", "13:00", "14:30", "16:00"] },
      { date: "2024-12-11", slots: ["09:00", "10:00", "11:00", "15:00"] }
    ]
  },
  {
    id: "doctor_005",
    name: "Dr. Priya Patel",
    specialty: "Mental Health",
    rating: 4.9,
    reviewCount: 94,
    experience: "7 years",
    education: "MD from Yale University",
    languages: ["English", "Hindi", "Gujarati"],
    consultationFee: 160,
    avatar: "👩‍⚕️",
    bio: "Psychiatrist specializing in anxiety, depression, and stress management with a holistic approach.",
    availability: [
      { date: "2024-12-09", slots: ["10:00", "12:00", "14:00", "16:00"] },
      { date: "2024-12-10", slots: ["09:00", "11:00", "13:00", "15:00"] },
      { date: "2024-12-11", slots: ["10:00", "12:00", "14:00", "17:00"] }
    ]
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty');
    const date = searchParams.get('date');
    const search = searchParams.get('search');

    let filteredDoctors = [...mockDoctors];

    // Filter by specialty
    if (specialty && specialty !== 'all') {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }

    // Filter by search term
    if (search) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by availability on specific date
    if (date) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.availability.some(avail => avail.date === date && avail.slots.length > 0)
      );
    }

    // Sort by rating (highest first)
    filteredDoctors.sort((a, b) => b.rating - a.rating);

    return NextResponse.json({
      success: true,
      data: filteredDoctors,
      count: filteredDoctors.length,
      filters: {
        specialty,
        date,
        search
      },
      specialties: [...new Set(mockDoctors.map(d => d.specialty))],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Doctors API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}