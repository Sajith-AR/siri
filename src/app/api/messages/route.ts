import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

// Mock messages data
const mockMessages = [
  {
    id: "msg_001",
    conversationId: "conv_001",
    senderId: "doctor_001",
    senderName: "Dr. Sarah Smith",
    senderType: "doctor",
    recipientId: "patient_001",
    message: "Your test results look great! See you at our appointment today.",
    timestamp: "2024-12-08T08:00:00Z",
    read: false,
    type: "text"
  },
  {
    id: "msg_002",
    conversationId: "conv_002",
    senderId: "nurse_001",
    senderName: "Nurse Johnson",
    senderType: "nurse",
    recipientId: "patient_001",
    message: "Please remember to take your medication with food.",
    timestamp: "2024-12-07T16:00:00Z",
    read: false,
    type: "text"
  },
  {
    id: "msg_003",
    conversationId: "conv_001",
    senderId: "patient_001",
    senderName: "Sarah Johnson",
    senderType: "patient",
    recipientId: "doctor_001",
    message: "Thank you! I'm feeling much better. See you soon.",
    timestamp: "2024-12-08T08:15:00Z",
    read: true,
    type: "text"
  },
  {
    id: "msg_004",
    conversationId: "conv_003",
    senderId: "system",
    senderName: "Lab Results",
    senderType: "system",
    recipientId: "patient_001",
    message: "Your blood work is complete and available to view.",
    timestamp: "2024-12-05T14:30:00Z",
    read: true,
    type: "notification",
    attachments: [
      {
        type: "lab_result",
        name: "Blood Work Results",
        url: "/api/documents/lab_001"
      }
    ]
  }
];

// GET - Fetch messages for a patient
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredMessages = mockMessages.filter(msg => 
      msg.recipientId === "patient_001" || msg.senderId === "patient_001"
    );

    // Filter by conversation if specified
    if (conversationId) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.conversationId === conversationId
      );
    }

    // Sort by timestamp (newest first)
    filteredMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const paginatedMessages = filteredMessages.slice(offset, offset + limit);

    // Group messages by conversation for overview
    const conversations = filteredMessages.reduce((acc, msg) => {
      if (!acc[msg.conversationId]) {
        acc[msg.conversationId] = {
          id: msg.conversationId,
          lastMessage: msg,
          unreadCount: 0,
          participants: []
        };
      }
      
      if (new Date(msg.timestamp) > new Date(acc[msg.conversationId].lastMessage.timestamp)) {
        acc[msg.conversationId].lastMessage = msg;
      }
      
      if (!msg.read && msg.senderId !== "patient_001") {
        acc[msg.conversationId].unreadCount++;
      }

      return acc;
    }, {} as any);

    return NextResponse.json({
      success: true,
      data: {
        messages: paginatedMessages,
        conversations: Object.values(conversations),
        pagination: {
          limit,
          offset,
          total: filteredMessages.length,
          hasMore: offset + limit < filteredMessages.length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST - Send new message
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const { recipientId, message, conversationId, type = "text" } = await req.json();

    if (!recipientId || !message) {
      return NextResponse.json({ 
        error: "Missing required fields: recipientId, message" 
      }, { status: 400 });
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId: conversationId || `conv_${Date.now()}`,
      senderId: "patient_001", // In production, get from decoded token
      senderName: "Sarah Johnson", // In production, get from user profile
      senderType: "patient" as const,
      recipientId,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };

    // In production, save to database
    mockMessages.push(newMessage);

    // In production, you might want to send real-time notifications here
    // using WebSockets, Server-Sent Events, or push notifications

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// PUT - Mark messages as read
export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as { phone: string };
    
    const { messageIds, conversationId } = await req.json();

    let updatedCount = 0;

    if (messageIds && Array.isArray(messageIds)) {
      // Mark specific messages as read
      mockMessages.forEach(msg => {
        if (messageIds.includes(msg.id) && msg.recipientId === "patient_001") {
          msg.read = true;
          updatedCount++;
        }
      });
    } else if (conversationId) {
      // Mark all messages in conversation as read
      mockMessages.forEach(msg => {
        if (msg.conversationId === conversationId && msg.recipientId === "patient_001" && !msg.read) {
          msg.read = true;
          updatedCount++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} messages marked as read`,
      updatedCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Messages PUT error:", error);
    return NextResponse.json({ error: "Failed to update messages" }, { status: 500 });
  }
}