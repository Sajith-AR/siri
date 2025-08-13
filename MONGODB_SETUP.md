# 🍃 MongoDB Integration Guide

This healthcare platform uses **MongoDB** as its primary database with **Mongoose** for object modeling. This guide will help you set up and configure MongoDB for both development and production environments.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
- [Production Setup (MongoDB Atlas)](#production-setup-mongodb-atlas)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [Testing the Integration](#testing-the-integration)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account

### 1. Install Dependencies
```bash
npm install mongodb mongoose @types/mongodb
```

### 2. Set Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local and add your MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/healthcare
```

### 3. Start the Application
```bash
npm run dev
```

The application will automatically:
- Connect to MongoDB
- Create necessary indexes
- Initialize sample data
- Run health checks

## 🏠 Local Development Setup

### Option 1: Install MongoDB Locally

#### On macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### On Ubuntu/Debian:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### On Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB as a Windows service

### Option 2: Use Docker

```bash
# Run MongoDB in a Docker container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:latest

# Or use Docker Compose
cat > docker-compose.yml << EOF
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: healthcare_mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
      MONGO_INITDB_DATABASE: healthcare

volumes:
  mongodb_data:
EOF

docker-compose up -d
```

### Environment Configuration for Local Development:
```bash
# .env.local
DATABASE_URL=mongodb://localhost:27017/healthcare
NODE_ENV=development
```

## ☁️ Production Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster

### 2. Configure Network Access
1. In Atlas dashboard, go to "Network Access"
2. Add your application's IP addresses
3. For development, you can use `0.0.0.0/0` (not recommended for production)

### 3. Create Database User
1. Go to "Database Access"
2. Create a new database user with read/write permissions
3. Note the username and password

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

### Environment Configuration for Production:
```bash
# .env.production
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority
NODE_ENV=production
```

## ⚙️ Environment Configuration

### Required Environment Variables:

```bash
# MongoDB Configuration
DATABASE_URL=mongodb://localhost:27017/healthcare
MONGODB_URI=mongodb://localhost:27017/healthcare  # Alternative name

# Environment
NODE_ENV=development  # or 'production'

# Optional: AI Services
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key

# Optional: Authentication
JWT_SECRET=your_jwt_secret
```

### Connection String Formats:

#### Local MongoDB:
```
mongodb://localhost:27017/healthcare
```

#### Local MongoDB with Authentication:
```
mongodb://username:password@localhost:27017/healthcare
```

#### MongoDB Atlas:
```
mongodb+srv://username:password@cluster.mongodb.net/healthcare?retryWrites=true&w=majority
```

#### MongoDB Replica Set:
```
mongodb://host1:27017,host2:27017,host3:27017/healthcare?replicaSet=myReplicaSet
```

## 📊 Database Schema

### Collections Overview:

#### 1. **Patients Collection**
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  bloodType: String,
  allergies: [String],
  medications: [String],
  medicalHistory: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  preferences: {
    language: String,
    notifications: Boolean,
    dataSharing: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. **Health Records Collection**
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  type: String, // 'symptom_check', 'ai_consultation', etc.
  data: Mixed, // Flexible data storage
  provider: String,
  confidence: Number,
  tags: [String],
  status: String, // 'active', 'archived', 'deleted'
  severity: String, // 'low', 'medium', 'high', 'critical'
  followUpRequired: Boolean,
  followUpDate: Date,
  metadata: {
    source: String,
    version: String,
    processingTime: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **Doctors Collection**
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  specialization: String,
  licenseNumber: String (unique),
  qualifications: [String],
  experience: Number,
  languages: [String],
  availability: [{
    dayOfWeek: Number, // 0-6
    startTime: String, // "HH:MM"
    endTime: String,   // "HH:MM"
    isAvailable: Boolean
  }],
  consultationFee: {
    inPerson: Number,
    video: Number,
    phone: Number
  },
  rating: {
    average: Number,
    count: Number
  },
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **Appointments Collection**
```javascript
{
  _id: ObjectId,
  patientId: ObjectId (ref: Patient),
  doctorId: ObjectId (ref: Doctor),
  dateTime: Date,
  endDateTime: Date,
  type: String, // 'consultation', 'follow_up', etc.
  status: String, // 'scheduled', 'confirmed', etc.
  duration: Number, // minutes
  fee: {
    amount: Number,
    currency: String,
    paymentStatus: String
  },
  meetingDetails: {
    platform: String,
    meetingUrl: String,
    accessCode: String
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes:

The application automatically creates these indexes for optimal performance:

```javascript
// Patients
{ email: 1 } // unique
{ phone: 1 }
{ firstName: 1, lastName: 1 }
{ isActive: 1, createdAt: -1 }

// Health Records
{ patientId: 1, createdAt: -1 }
{ patientId: 1, type: 1, createdAt: -1 }
{ type: 1, severity: 1, createdAt: -1 }
{ tags: 1, createdAt: -1 }

// Doctors
{ email: 1 } // unique
{ specialization: 1, isActive: 1, isVerified: 1 }
{ 'rating.average': -1 }

// Appointments
{ patientId: 1, dateTime: 1 }
{ doctorId: 1, dateTime: 1 }
{ doctorId: 1, dateTime: 1 } // unique for active appointments
```

## 🧪 Testing the Integration

### Run the Test Script:
```bash
# Install tsx for running TypeScript directly
npm install -g tsx

# Run the MongoDB integration test
npx tsx src/scripts/test-mongodb.ts
```

### Manual Testing:

#### 1. Check Database Connection:
```bash
curl http://localhost:3000/api/health?service=mongodb
```

#### 2. Test Patient Creation:
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk_test_healthcare_demo_key" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "dateOfBirth": "1990-01-01",
    "gender": "male"
  }'
```

#### 3. Test Health Record Creation:
```bash
curl -X POST http://localhost:3000/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "input": "I have a headache and fever"
  }'
```

### Using MongoDB Compass:

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your connection string
3. Browse the `healthcare` database
4. Explore collections: `patients`, `healthrecords`, `doctors`, `appointments`

## 🔧 Troubleshooting

### Common Issues:

#### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running locally or check your connection string.

#### 2. Authentication Failed
```
Error: Authentication failed
```
**Solution:** Verify your username/password in the connection string.

#### 3. Network Timeout
```
Error: Server selection timed out
```
**Solution:** Check network access settings in MongoDB Atlas or firewall rules.

#### 4. Database Not Found
```
Error: Database 'healthcare' not found
```
**Solution:** MongoDB creates databases automatically. This error usually indicates a connection issue.

### Debug Mode:

Enable debug logging by setting:
```bash
DEBUG=mongoose:*
NODE_ENV=development
```

### Health Check Endpoint:

Monitor database health at:
```
GET /api/health?service=mongodb
```

Response:
```json
{
  "service": "mongodb",
  "status": "healthy",
  "responseTime": 15,
  "details": {
    "connected": true,
    "database": "healthcare",
    "collections": 4
  }
}
```

## 📈 Performance Optimization

### 1. Connection Pooling
The application uses connection pooling with these settings:
- `maxPoolSize: 10` - Maximum 10 concurrent connections
- `serverSelectionTimeoutMS: 5000` - 5-second timeout
- `socketTimeoutMS: 45000` - 45-second socket timeout

### 2. Indexes
All necessary indexes are created automatically for optimal query performance.

### 3. Caching
Frequently accessed data is cached in memory to reduce database load.

### 4. Aggregation Pipelines
Complex analytics queries use MongoDB's aggregation framework for better performance.

## 🔒 Security Best Practices

### 1. Connection Security
- Use TLS/SSL in production
- Restrict network access to specific IPs
- Use strong authentication credentials

### 2. Data Protection
- Enable field-level encryption for sensitive data
- Implement proper access controls
- Regular security audits

### 3. Backup Strategy
- Enable automated backups in MongoDB Atlas
- Test backup restoration procedures
- Implement point-in-time recovery

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)

---

🎉 **Congratulations!** Your healthcare platform now has a robust MongoDB backend ready for production use!