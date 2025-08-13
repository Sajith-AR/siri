import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Appointment document
export interface IAppointment extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  dateTime: Date;
  endDateTime: Date;
  type: 'consultation' | 'follow_up' | 'emergency' | 'routine_checkup' | 'video_call' | 'phone_call';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  duration: number; // minutes
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  prescription?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  followUpRequired: boolean;
  followUpDate?: Date;
  fee: {
    amount: number;
    currency: string;
    paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
    paymentMethod?: string;
    transactionId?: string;
  };
  meetingDetails?: {
    platform: 'zoom' | 'google_meet' | 'teams' | 'phone';
    meetingId?: string;
    meetingUrl?: string;
    accessCode?: string;
  };
  reminders: {
    type: 'email' | 'sms' | 'push';
    sentAt: Date;
    status: 'sent' | 'delivered' | 'failed';
  }[];
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  rescheduledFrom?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment schema definition
const AppointmentSchema = new Schema<IAppointment>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required'],
    index: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Appointment date and time is required'],
    validate: {
      validator: function(date: Date) {
        return date > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time is required'],
    validate: {
      validator: function(this: IAppointment, endDate: Date) {
        return endDate > this.dateTime;
      },
      message: 'End time must be after start time'
    }
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: {
      values: ['consultation', 'follow_up', 'emergency', 'routine_checkup', 'video_call', 'phone_call'],
      message: 'Type must be one of: consultation, follow_up, emergency, routine_checkup, video_call, phone_call'
    },
    index: true
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: {
      values: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      message: 'Status must be one of: scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled'
    },
    index: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  symptoms: {
    type: [String],
    default: [],
    validate: {
      validator: function(symptoms: string[]) {
        return symptoms.length <= 20;
      },
      message: 'Cannot have more than 20 symptoms'
    }
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
  },
  prescription: [{
    medication: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Medication name cannot exceed 200 characters']
    },
    dosage: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Dosage cannot exceed 100 characters']
    },
    frequency: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Frequency cannot exceed 100 characters']
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Duration cannot exceed 100 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false,
    index: true
  },
  followUpDate: {
    type: Date,
    validate: {
      validator: function(this: IAppointment, date: Date) {
        if (!this.followUpRequired) return true;
        return date && date > this.dateTime;
      },
      message: 'Follow-up date must be after the appointment date when follow-up is required'
    },
    index: true
  },
  fee: {
    amount: {
      type: Number,
      required: [true, 'Fee amount is required'],
      min: [0, 'Fee cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'LKR'],
      uppercase: true
    },
    paymentStatus: {
      type: String,
      default: 'pending',
      enum: {
        values: ['pending', 'paid', 'refunded', 'cancelled'],
        message: 'Payment status must be one of: pending, paid, refunded, cancelled'
      }
    },
    paymentMethod: {
      type: String,
      trim: true,
      maxlength: [50, 'Payment method cannot exceed 50 characters']
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters']
    }
  },
  meetingDetails: {
    platform: {
      type: String,
      enum: {
        values: ['zoom', 'google_meet', 'teams', 'phone'],
        message: 'Platform must be one of: zoom, google_meet, teams, phone'
      }
    },
    meetingId: {
      type: String,
      trim: true,
      maxlength: [100, 'Meeting ID cannot exceed 100 characters']
    },
    meetingUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Meeting URL cannot exceed 500 characters']
    },
    accessCode: {
      type: String,
      trim: true,
      maxlength: [50, 'Access code cannot exceed 50 characters']
    }
  },
  reminders: [{
    type: {
      type: String,
      required: true,
      enum: ['email', 'sms', 'push']
    },
    sentAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    refPath: 'cancelledByModel'
  },
  cancelledAt: {
    type: Date
  },
  rescheduledFrom: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    refPath: 'createdByModel'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Compound indexes for better performance
AppointmentSchema.index({ patientId: 1, dateTime: 1 });
AppointmentSchema.index({ dateTime: 1, status: 1 });
AppointmentSchema.index({ status: 1, createdAt: -1 });
AppointmentSchema.index({ followUpRequired: 1, followUpDate: 1 });

// Unique constraint to prevent double booking
AppointmentSchema.index(
  { doctorId: 1, dateTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] } 
    }
  }
);

// Virtual for appointment duration in hours
AppointmentSchema.virtual('durationInHours').get(function(this: IAppointment) {
  return this.duration / 60;
});

// Virtual for time until appointment
AppointmentSchema.virtual('timeUntilAppointment').get(function(this: IAppointment) {
  const now = new Date();
  const diffMs = this.dateTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60))); // minutes
});

// Instance methods
AppointmentSchema.methods.confirm = function(this: IAppointment) {
  this.status = 'confirmed';
  return this.save();
};

AppointmentSchema.methods.cancel = function(this: IAppointment, reason: string, cancelledBy: mongoose.Types.ObjectId) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  return this.save();
};

AppointmentSchema.methods.complete = function(this: IAppointment, diagnosis?: string, prescription?: any[]) {
  this.status = 'completed';
  if (diagnosis) this.diagnosis = diagnosis;
  if (prescription) this.prescription = prescription;
  return this.save();
};

AppointmentSchema.methods.reschedule = function(this: IAppointment, newDateTime: Date, newEndDateTime: Date) {
  const originalId = this._id;
  this.status = 'rescheduled';
  
  // Create new appointment
  const newAppointment = new (this.constructor as Model<IAppointment>)({
    ...this.toObject(),
    _id: new mongoose.Types.ObjectId(),
    dateTime: newDateTime,
    endDateTime: newEndDateTime,
    status: 'scheduled',
    rescheduledFrom: originalId,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return Promise.all([this.save(), newAppointment.save()]);
};

AppointmentSchema.methods.addReminder = function(this: IAppointment, type: 'email' | 'sms' | 'push', status: 'sent' | 'delivered' | 'failed' = 'sent') {
  this.reminders.push({
    type,
    sentAt: new Date(),
    status
  });
  return this.save();
};

AppointmentSchema.methods.updatePaymentStatus = function(this: IAppointment, status: 'pending' | 'paid' | 'refunded' | 'cancelled', transactionId?: string, paymentMethod?: string) {
  this.fee.paymentStatus = status;
  if (transactionId) this.fee.transactionId = transactionId;
  if (paymentMethod) this.fee.paymentMethod = paymentMethod;
  return this.save();
};

// Static methods interface
interface IAppointmentModel extends Model<IAppointment> {
  findByPatient(patientId: mongoose.Types.ObjectId, status?: string, limit?: number): Promise<IAppointment[]>;
  findByDoctor(doctorId: mongoose.Types.ObjectId, status?: string, limit?: number): Promise<IAppointment[]>;
  findUpcoming(limit?: number): Promise<IAppointment[]>;
  findPendingPayments(limit?: number): Promise<IAppointment[]>;
  findPendingFollowUps(beforeDate?: Date): Promise<IAppointment[]>;
  checkDoctorAvailability(doctorId: mongoose.Types.ObjectId, dateTime: Date, duration: number): Promise<boolean>;
  getAppointmentStats(): Promise<{
    totalAppointments: number;
    appointmentsThisMonth: number;
    appointmentsThisWeek: number;
    upcomingAppointments: number;
    appointmentsByStatus: Record<string, number>;
    appointmentsByType: Record<string, number>;
    paymentsByStatus: Record<string, { count: number; totalAmount: number }>;
  }>;
}

// Static methods
AppointmentSchema.statics.findByPatient = function(patientId: mongoose.Types.ObjectId, status?: string, limit: number = 50) {
  const query: any = { patientId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ dateTime: -1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName email phone');
};

AppointmentSchema.statics.findByDoctor = function(doctorId: mongoose.Types.ObjectId, status?: string, limit: number = 50) {
  const query: any = { doctorId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ dateTime: -1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName email phone');
};

AppointmentSchema.statics.findUpcoming = function(limit: number = 50) {
  return this.find({
    dateTime: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  })
    .sort({ dateTime: 1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName email phone');
};

AppointmentSchema.statics.findPendingPayments = function(limit: number = 50) {
  return this.find({
    'fee.paymentStatus': 'pending',
    status: { $ne: 'cancelled' }
  })
    .sort({ dateTime: 1 })
    .limit(limit)
    .populate('doctorId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName email phone');
};

AppointmentSchema.statics.findPendingFollowUps = function(beforeDate?: Date) {
  const query: any = {
    followUpRequired: true,
    status: 'completed'
  };
  
  if (beforeDate) {
    query.followUpDate = { $lte: beforeDate };
  }
  
  return this.find(query)
    .sort({ followUpDate: 1 })
    .populate('doctorId', 'firstName lastName specialization')
    .populate('patientId', 'firstName lastName email phone');
};

AppointmentSchema.statics.checkDoctorAvailability = async function(doctorId: mongoose.Types.ObjectId, dateTime: Date, duration: number) {
  const endTime = new Date(dateTime.getTime() + duration * 60000);
  
  const conflictingAppointments = await this.find({
    doctorId,
    status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    $or: [
      {
        dateTime: { $lt: endTime },
        endDateTime: { $gt: dateTime }
      }
    ]
  });
  
  return conflictingAppointments.length === 0;
};

AppointmentSchema.statics.getAppointmentStats = async function() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const [
    totalAppointments,
    appointmentsThisMonth,
    appointmentsThisWeek,
    statusStats,
    typeStats,
    paymentStats,
    upcomingAppointments
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ createdAt: { $gte: thisMonth } }),
    this.countDocuments({ createdAt: { $gte: thisWeek } }),
    this.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $group: { _id: '$fee.paymentStatus', count: { $sum: 1 }, totalAmount: { $sum: '$fee.amount' } } }
    ]),
    this.countDocuments({
      dateTime: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] }
    })
  ]);
  
  const appointmentsByStatus: Record<string, number> = {};
  statusStats.forEach((stat: any) => {
    appointmentsByStatus[stat._id] = stat.count;
  });
  
  const appointmentsByType: Record<string, number> = {};
  typeStats.forEach((stat: any) => {
    appointmentsByType[stat._id] = stat.count;
  });
  
  const paymentsByStatus: Record<string, { count: number; totalAmount: number }> = {};
  paymentStats.forEach((stat: any) => {
    paymentsByStatus[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
  });
  
  return {
    totalAppointments,
    appointmentsThisMonth,
    appointmentsThisWeek,
    upcomingAppointments,
    appointmentsByStatus,
    appointmentsByType,
    paymentsByStatus
  };
};

// Pre-save middleware
AppointmentSchema.pre('save', function(this: IAppointment, next) {
  // Calculate end time if not provided
  if (!this.endDateTime && this.dateTime && this.duration) {
    this.endDateTime = new Date(this.dateTime.getTime() + this.duration * 60000);
  }
  
  // Set follow-up date if required but not set
  if (this.followUpRequired && !this.followUpDate && this.status === 'completed') {
    this.followUpDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week later
  }
  
  next();
});

// Post-save middleware for notifications
AppointmentSchema.post('save', async function(this: IAppointment) {
  // In a real application, you would trigger notifications here
  if (this.status === 'scheduled' || this.status === 'confirmed') {
    console.log(`Appointment ${this.status} for patient ${this.patientId} with doctor ${this.doctorId}`);
  }
});

// Create and export the model
const Appointment: IAppointmentModel = (mongoose.models.Appointment || mongoose.model<IAppointment, IAppointmentModel>('Appointment', AppointmentSchema)) as IAppointmentModel;

export default Appointment;