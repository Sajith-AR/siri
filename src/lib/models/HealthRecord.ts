import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for HealthRecord document
export interface IHealthRecord extends Document {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  type: 'symptom_check' | 'ai_consultation' | 'vital_signs' | 'medication' | 'appointment' | 'lab_result' | 'diagnosis';
  data: any;
  provider?: string;
  confidence?: number;
  tags: string[];
  status: 'active' | 'archived' | 'deleted';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  followUpRequired: boolean;
  followUpDate?: Date;
  attachments?: {
    filename: string;
    url: string;
    type: string;
    size: number;
  }[];
  metadata: {
    source: string;
    version: string;
    processingTime?: number;
    aiModel?: string;
  };
  createdBy?: mongoose.Types.ObjectId; // Doctor or system ID
  reviewedBy?: mongoose.Types.ObjectId; // Doctor ID
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// HealthRecord schema definition
const HealthRecordSchema = new Schema<IHealthRecord>({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Record type is required'],
    enum: {
      values: ['symptom_check', 'ai_consultation', 'vital_signs', 'medication', 'appointment', 'lab_result', 'diagnosis'],
      message: 'Type must be one of: symptom_check, ai_consultation, vital_signs, medication, appointment, lab_result, diagnosis'
    },
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    required: [true, 'Record data is required'],
    validate: {
      validator: function (data: any) {
        return data && typeof data === 'object';
      },
      message: 'Data must be a valid object'
    }
  },
  provider: {
    type: String,
    trim: true,
    maxlength: [100, 'Provider name cannot exceed 100 characters']
  },
  confidence: {
    type: Number,
    min: [0, 'Confidence cannot be less than 0'],
    max: [100, 'Confidence cannot be greater than 100']
  },
  tags: {
    type: [String],
    default: [],
    index: true,
    validate: {
      validator: function (tags: string[]) {
        return tags.length <= 20;
      },
      message: 'Cannot have more than 20 tags'
    }
  },
  status: {
    type: String,
    default: 'active',
    enum: {
      values: ['active', 'archived', 'deleted'],
      message: 'Status must be one of: active, archived, deleted'
    },
    index: true
  },
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    index: true
  },
  followUpRequired: {
    type: Boolean,
    default: false,
    index: true
  },
  followUpDate: {
    type: Date,
    validate: {
      validator: function (this: IHealthRecord, date: Date) {
        if (!this.followUpRequired) return true;
        return date && date > new Date();
      },
      message: 'Follow-up date must be in the future when follow-up is required'
    },
    index: true
  },
  attachments: [{
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['image', 'document', 'video', 'audio']
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'File size cannot be negative']
    }
  }],
  metadata: {
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters']
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
      trim: true,
      maxlength: [20, 'Version cannot exceed 20 characters']
    },
    processingTime: {
      type: Number,
      min: [0, 'Processing time cannot be negative']
    },
    aiModel: {
      type: String,
      trim: true,
      maxlength: [50, 'AI model name cannot exceed 50 characters']
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  },
  toObject: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Compound indexes for better performance
HealthRecordSchema.index({ patientId: 1, createdAt: -1 });
HealthRecordSchema.index({ patientId: 1, type: 1, createdAt: -1 });
HealthRecordSchema.index({ type: 1, severity: 1, createdAt: -1 });
HealthRecordSchema.index({ followUpRequired: 1, followUpDate: 1 });
HealthRecordSchema.index({ status: 1, createdAt: -1 });
HealthRecordSchema.index({ tags: 1, createdAt: -1 });

// Virtual for age of record
HealthRecordSchema.virtual('ageInDays').get(function (this: IHealthRecord) {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Instance methods
HealthRecordSchema.methods.addTag = function (this: IHealthRecord, tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

HealthRecordSchema.methods.removeTag = function (this: IHealthRecord, tag: string) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

HealthRecordSchema.methods.markAsReviewed = function (this: IHealthRecord, doctorId: mongoose.Types.ObjectId) {
  this.reviewedBy = doctorId;
  this.reviewedAt = new Date();
  return this.save();
};

HealthRecordSchema.methods.archive = function (this: IHealthRecord) {
  this.status = 'archived';
  return this.save();
};

HealthRecordSchema.methods.addAttachment = function (this: IHealthRecord, attachment: {
  filename: string;
  url: string;
  type: string;
  size: number;
}) {
  if (!this.attachments) {
    this.attachments = [];
  }
  this.attachments.push(attachment);
  return this.save();
};

// Static methods interface
interface IHealthRecordModel extends Model<IHealthRecord> {
  findByPatient(patientId: mongoose.Types.ObjectId, type?: string, limit?: number): Promise<IHealthRecord[]>;
  findByTags(tags: string[], limit?: number): Promise<IHealthRecord[]>;
  findPendingFollowUps(beforeDate?: Date): Promise<IHealthRecord[]>;
  getRecordStats(): Promise<{
    totalRecords: number;
    recordsThisWeek: number;
    recordsByType: Record<string, number>;
    recordsBySeverity: Record<string, number>;
    averageConfidence: number;
    confidenceRange: { min: number; max: number };
  }>;
  findCriticalRecords(limit?: number): Promise<IHealthRecord[]>;
  findUnreviewedRecords(limit?: number): Promise<IHealthRecord[]>;
}

// Static methods
HealthRecordSchema.statics.findByPatient = function (
  patientId: mongoose.Types.ObjectId,
  type?: string,
  limit: number = 50
) {
  const query: any = { patientId, status: 'active' };
  if (type) query.type = type;

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'firstName lastName specialization')
    .populate('reviewedBy', 'firstName lastName specialization');
};

HealthRecordSchema.statics.findByTags = function (tags: string[], limit: number = 50) {
  return this.find({
    tags: { $in: tags },
    status: 'active'
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

HealthRecordSchema.statics.findPendingFollowUps = function (beforeDate?: Date) {
  const query: any = {
    followUpRequired: true,
    status: 'active'
  };

  if (beforeDate) {
    query.followUpDate = { $lte: beforeDate };
  }

  return this.find(query)
    .sort({ followUpDate: 1 })
    .populate('patientId', 'firstName lastName email phone');
};

HealthRecordSchema.statics.getRecordStats = async function () {
  const now = new Date();
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalRecords, recordsThisWeek, typeStats, severityStats, confidenceStats] = await Promise.all([
    this.countDocuments({ status: 'active' }),
    this.countDocuments({ status: 'active', createdAt: { $gte: thisWeek } }),
    this.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { status: 'active', severity: { $exists: true } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { status: 'active', confidence: { $exists: true } } },
      {
        $group: {
          _id: null,
          averageConfidence: { $avg: '$confidence' },
          minConfidence: { $min: '$confidence' },
          maxConfidence: { $max: '$confidence' }
        }
      }
    ])
  ]);

  const recordsByType: Record<string, number> = {};
  typeStats.forEach((stat: any) => {
    recordsByType[stat._id] = stat.count;
  });

  const recordsBySeverity: Record<string, number> = {};
  severityStats.forEach((stat: any) => {
    recordsBySeverity[stat._id] = stat.count;
  });

  return {
    totalRecords,
    recordsThisWeek,
    recordsByType,
    recordsBySeverity,
    averageConfidence: confidenceStats[0]?.averageConfidence || 0,
    confidenceRange: {
      min: confidenceStats[0]?.minConfidence || 0,
      max: confidenceStats[0]?.maxConfidence || 0
    }
  };
};

HealthRecordSchema.statics.findCriticalRecords = function (limit: number = 20) {
  return this.find({
    status: 'active',
    severity: 'critical'
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('patientId', 'firstName lastName email phone');
};

HealthRecordSchema.statics.findUnreviewedRecords = function (limit: number = 50) {
  return this.find({
    status: 'active',
    reviewedBy: { $exists: false },
    severity: { $in: ['high', 'critical'] }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('patientId', 'firstName lastName email phone');
};

// Pre-save middleware
HealthRecordSchema.pre('save', function (this: IHealthRecord, next) {
  // Ensure tags are lowercase and trimmed
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  }

  // Set follow-up date if required but not set
  if (this.followUpRequired && !this.followUpDate) {
    const followUpDays = this.severity === 'critical' ? 1 : this.severity === 'high' ? 3 : 7;
    this.followUpDate = new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000);
  }

  next();
});

// Post-save middleware for notifications
HealthRecordSchema.post('save', async function (this: IHealthRecord) {
  // In a real application, you would trigger notifications here
  if (this.severity === 'critical' || this.severity === 'high') {
    // Trigger alert notification
    console.log(`High/Critical health record created for patient ${this.patientId}`);
  }
});

// Create and export the model
const HealthRecord: IHealthRecordModel = (mongoose.models.HealthRecord || mongoose.model<IHealthRecord, IHealthRecordModel>('HealthRecord', HealthRecordSchema)) as IHealthRecordModel;

export default HealthRecord;