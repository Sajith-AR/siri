import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Patient document
export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  medications: string[];
  medicalHistory: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    language: string;
    notifications: boolean;
    dataSharing: boolean;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Patient schema definition
const PatientSchema = new Schema<IPatient>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    index: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(date: Date) {
        const now = new Date();
        const age = now.getFullYear() - date.getFullYear();
        return age >= 0 && age <= 150;
      },
      message: 'Please enter a valid date of birth'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other', 'prefer_not_to_say'],
      message: 'Gender must be one of: male, female, other, prefer_not_to_say'
    }
  },
  bloodType: {
    type: String,
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'
    }
  },
  allergies: {
    type: [String],
    default: [],
    validate: {
      validator: function(allergies: string[]) {
        return allergies.length <= 50;
      },
      message: 'Cannot have more than 50 allergies'
    }
  },
  medications: {
    type: [String],
    default: [],
    validate: {
      validator: function(medications: string[]) {
        return medications.length <= 100;
      },
      message: 'Cannot have more than 100 medications'
    }
  },
  medicalHistory: {
    type: [String],
    default: [],
    validate: {
      validator: function(history: string[]) {
        return history.length <= 100;
      },
      message: 'Cannot have more than 100 medical history entries'
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid emergency contact phone number']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'si', 'ta', 'te', 'kn', 'bn']
    },
    notifications: {
      type: Boolean,
      default: true
    },
    dataSharing: {
      type: Boolean,
      default: false
    }
  },
  insurance: {
    provider: {
      type: String,
      trim: true,
      maxlength: [100, 'Insurance provider name cannot exceed 100 characters']
    },
    policyNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Policy number cannot exceed 50 characters']
    },
    groupNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Group number cannot exceed 50 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLoginAt: {
    type: Date,
    index: true
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

// Indexes for better performance
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ isActive: 1, createdAt: -1 });
PatientSchema.index({ 'preferences.language': 1 });

// Virtual for full name
PatientSchema.virtual('fullName').get(function(this: IPatient) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
PatientSchema.virtual('age').get(function(this: IPatient) {
  const now = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Instance methods
PatientSchema.methods.updateLastLogin = function(this: IPatient) {
  this.lastLoginAt = new Date();
  return this.save();
};

PatientSchema.methods.addMedicalHistory = function(this: IPatient, condition: string) {
  if (!this.medicalHistory.includes(condition)) {
    this.medicalHistory.push(condition);
  }
  return this.save();
};

PatientSchema.methods.addAllergy = function(this: IPatient, allergy: string) {
  if (!this.allergies.includes(allergy)) {
    this.allergies.push(allergy);
  }
  return this.save();
};

PatientSchema.methods.addMedication = function(this: IPatient, medication: string) {
  if (!this.medications.includes(medication)) {
    this.medications.push(medication);
  }
  return this.save();
};

// Static methods interface
interface IPatientModel extends Model<IPatient> {
  findByEmail(email: string): Promise<IPatient | null>;
  findByPhone(phone: string): Promise<IPatient | null>;
  searchPatients(query: string, limit?: number): Promise<IPatient[]>;
  getPatientStats(): Promise<{
    totalPatients: number;
    newThisMonth: number;
    genderDistribution: Record<string, number>;
    averageAge: number;
    ageRange: { min: number; max: number };
  }>;
}

// Static methods
PatientSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

PatientSchema.statics.findByPhone = function(phone: string) {
  return this.findOne({ phone, isActive: true });
};

PatientSchema.statics.searchPatients = function(query: string, limit: number = 10) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    isActive: true,
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex }
    ]
  }).limit(limit);
};

PatientSchema.statics.getPatientStats = async function() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const [totalPatients, newThisMonth, genderStats, ageStats] = await Promise.all([
    this.countDocuments({ isActive: true }),
    this.countDocuments({ isActive: true, createdAt: { $gte: thisMonth } }),
    this.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          averageAge: { $avg: '$age' },
          minAge: { $min: '$age' },
          maxAge: { $max: '$age' }
        }
      }
    ])
  ]);
  
  const genderDistribution: Record<string, number> = {};
  genderStats.forEach((stat: any) => {
    genderDistribution[stat._id] = stat.count;
  });
  
  return {
    totalPatients,
    newThisMonth,
    genderDistribution,
    averageAge: ageStats[0]?.averageAge || 0,
    ageRange: {
      min: ageStats[0]?.minAge || 0,
      max: ageStats[0]?.maxAge || 0
    }
  };
};

// Pre-save middleware
PatientSchema.pre('save', function(this: IPatient, next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim string fields
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();
  if (this.phone) this.phone = this.phone.trim();
  
  next();
});

// Create and export the model
const Patient: IPatientModel = (mongoose.models.Patient || mongoose.model<IPatient, IPatientModel>('Patient', PatientSchema)) as IPatientModel;

export default Patient;