import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Doctor document
export interface IDoctor extends Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  qualifications: string[];
  experience: number; // years
  languages: string[];
  availability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    isAvailable: boolean;
  }[];
  consultationFee: {
    inPerson: number;
    video: number;
    phone: number;
  };
  rating: {
    average: number;
    count: number;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  hospitalAffiliations: string[];
  isVerified: boolean;
  isActive: boolean;
  profileImage?: string;
  bio?: string;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Doctor schema definition
const DoctorSchema = new Schema<IDoctor>({
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
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'],
    index: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters'],
    index: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'License number cannot exceed 50 characters'],
    index: true
  },
  qualifications: {
    type: [String],
    required: [true, 'At least one qualification is required'],
    validate: {
      validator: function(qualifications: string[]) {
        return qualifications.length > 0 && qualifications.length <= 20;
      },
      message: 'Must have between 1 and 20 qualifications'
    }
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [70, 'Experience cannot exceed 70 years']
  },
  languages: {
    type: [String],
    default: ['en'],
    enum: {
      values: ['en', 'hi', 'si', 'ta', 'te', 'kn', 'bn'],
      message: 'Language must be one of: en, hi, si, ta, te, kn, bn'
    }
  },
  availability: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: [0, 'Day of week must be between 0-6'],
      max: [6, 'Day of week must be between 0-6']
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  consultationFee: {
    inPerson: {
      type: Number,
      required: [true, 'In-person consultation fee is required'],
      min: [0, 'Fee cannot be negative']
    },
    video: {
      type: Number,
      required: [true, 'Video consultation fee is required'],
      min: [0, 'Fee cannot be negative']
    },
    phone: {
      type: Number,
      required: [true, 'Phone consultation fee is required'],
      min: [0, 'Fee cannot be negative']
    }
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  hospitalAffiliations: {
    type: [String],
    default: [],
    validate: {
      validator: function(affiliations: string[]) {
        return affiliations.length <= 10;
      },
      message: 'Cannot have more than 10 hospital affiliations'
    }
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  profileImage: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
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
DoctorSchema.index({ firstName: 1, lastName: 1 });
DoctorSchema.index({ specialization: 1, isActive: 1, isVerified: 1 });
DoctorSchema.index({ 'rating.average': -1 });
DoctorSchema.index({ experience: -1 });
DoctorSchema.index({ languages: 1 });
DoctorSchema.index({ 'address.city': 1, 'address.state': 1 });
DoctorSchema.index({ createdAt: -1 });

// Virtual for full name
DoctorSchema.virtual('fullName').get(function(this: IDoctor) {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
DoctorSchema.virtual('formattedAddress').get(function(this: IDoctor) {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Instance methods
DoctorSchema.methods.updateLastActive = function(this: IDoctor) {
  this.lastActiveAt = new Date();
  return this.save();
};

DoctorSchema.methods.updateRating = function(this: IDoctor, newRating: number) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

DoctorSchema.methods.addHospitalAffiliation = function(this: IDoctor, hospital: string) {
  if (!this.hospitalAffiliations.includes(hospital)) {
    this.hospitalAffiliations.push(hospital);
  }
  return this.save();
};

DoctorSchema.methods.setAvailability = function(this: IDoctor, dayOfWeek: number, startTime: string, endTime: string, isAvailable: boolean = true) {
  const existingIndex = this.availability.findIndex(a => a.dayOfWeek === dayOfWeek);
  
  if (existingIndex >= 0) {
    this.availability[existingIndex] = { dayOfWeek, startTime, endTime, isAvailable };
  } else {
    this.availability.push({ dayOfWeek, startTime, endTime, isAvailable });
  }
  
  return this.save();
};

DoctorSchema.methods.isAvailableAt = function(this: IDoctor, date: Date): boolean {
  const dayOfWeek = date.getDay();
  const timeString = date.toTimeString().slice(0, 5); // HH:MM format
  
  const availability = this.availability.find(a => a.dayOfWeek === dayOfWeek && a.isAvailable);
  
  if (!availability) return false;
  
  return timeString >= availability.startTime && timeString <= availability.endTime;
};

// Static methods interface
interface IDoctorModel extends Model<IDoctor> {
  findBySpecialization(specialization: string, limit?: number): Promise<IDoctor[]>;
  findByLocation(city: string, state?: string, limit?: number): Promise<IDoctor[]>;
  findByLanguage(language: string, limit?: number): Promise<IDoctor[]>;
  searchDoctors(query: string, limit?: number): Promise<IDoctor[]>;
  getTopRatedDoctors(limit?: number): Promise<IDoctor[]>;
  findAvailableDoctors(date: Date, specialization?: string): Promise<IDoctor[]>;
  getDoctorStats(): Promise<{
    totalDoctors: number;
    verifiedDoctors: number;
    specializationDistribution: Record<string, number>;
    averageExperience: number;
    experienceRange: { min: number; max: number };
    averageRating: number;
    totalRatings: number;
  }>;
}

// Static methods
DoctorSchema.statics.findBySpecialization = function(specialization: string, limit: number = 20) {
  return this.find({
    specialization: new RegExp(specialization, 'i'),
    isActive: true,
    isVerified: true
  })
    .sort({ 'rating.average': -1, experience: -1 })
    .limit(limit);
};

DoctorSchema.statics.findByLocation = function(city: string, state?: string, limit: number = 20) {
  const query: any = {
    'address.city': new RegExp(city, 'i'),
    isActive: true,
    isVerified: true
  };
  
  if (state) {
    query['address.state'] = new RegExp(state, 'i');
  }
  
  return this.find(query)
    .sort({ 'rating.average': -1, experience: -1 })
    .limit(limit);
};

DoctorSchema.statics.findByLanguage = function(language: string, limit: number = 20) {
  return this.find({
    languages: language,
    isActive: true,
    isVerified: true
  })
    .sort({ 'rating.average': -1, experience: -1 })
    .limit(limit);
};

DoctorSchema.statics.searchDoctors = function(query: string, limit: number = 20) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    isActive: true,
    isVerified: true,
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { specialization: searchRegex },
      { qualifications: { $in: [searchRegex] } },
      { hospitalAffiliations: { $in: [searchRegex] } }
    ]
  })
    .sort({ 'rating.average': -1, experience: -1 })
    .limit(limit);
};

DoctorSchema.statics.getTopRatedDoctors = function(limit: number = 10) {
  return this.find({
    isActive: true,
    isVerified: true,
    'rating.count': { $gte: 5 } // At least 5 ratings
  })
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit);
};

DoctorSchema.statics.findAvailableDoctors = function(date: Date, specialization?: string) {
  const dayOfWeek = date.getDay();
  const timeString = date.toTimeString().slice(0, 5);
  
  const query: any = {
    isActive: true,
    isVerified: true,
    availability: {
      $elemMatch: {
        dayOfWeek: dayOfWeek,
        isAvailable: true,
        startTime: { $lte: timeString },
        endTime: { $gte: timeString }
      }
    }
  };
  
  if (specialization) {
    query.specialization = new RegExp(specialization, 'i');
  }
  
  return this.find(query)
    .sort({ 'rating.average': -1, experience: -1 });
};

DoctorSchema.statics.getDoctorStats = async function() {
  const [totalDoctors, verifiedDoctors, specializationStats, experienceStats, ratingStats] = await Promise.all([
    this.countDocuments({ isActive: true }),
    this.countDocuments({ isActive: true, isVerified: true }),
    this.aggregate([
      { $match: { isActive: true, isVerified: true } },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $match: { isActive: true, isVerified: true } },
      {
        $group: {
          _id: null,
          averageExperience: { $avg: '$experience' },
          minExperience: { $min: '$experience' },
          maxExperience: { $max: '$experience' }
        }
      }
    ]),
    this.aggregate([
      { $match: { isActive: true, isVerified: true, 'rating.count': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.average' },
          totalRatings: { $sum: '$rating.count' }
        }
      }
    ])
  ]);
  
  const specializationDistribution: Record<string, number> = {};
  specializationStats.forEach((stat: any) => {
    specializationDistribution[stat._id] = stat.count;
  });
  
  return {
    totalDoctors,
    verifiedDoctors,
    specializationDistribution,
    averageExperience: experienceStats[0]?.averageExperience || 0,
    experienceRange: {
      min: experienceStats[0]?.minExperience || 0,
      max: experienceStats[0]?.maxExperience || 0
    },
    averageRating: ratingStats[0]?.averageRating || 0,
    totalRatings: ratingStats[0]?.totalRatings || 0
  };
};

// Pre-save middleware
DoctorSchema.pre('save', function(this: IDoctor, next) {
  // Ensure email is lowercase
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  
  // Trim string fields
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();
  if (this.phone) this.phone = this.phone.trim();
  if (this.specialization) this.specialization = this.specialization.trim();
  if (this.licenseNumber) this.licenseNumber = this.licenseNumber.trim();
  
  // Sort availability by day of week
  if (this.availability) {
    this.availability.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }
  
  next();
});

// Create and export the model
const Doctor: IDoctorModel = (mongoose.models.Doctor || mongoose.model<IDoctor, IDoctorModel>('Doctor', DoctorSchema)) as IDoctorModel;

export default Doctor;