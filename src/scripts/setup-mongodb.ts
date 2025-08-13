#!/usr/bin/env tsx

/**
 * MongoDB Atlas Setup and Connection Test
 * 
 * This script will:
 * 1. Test your MongoDB Atlas connection
 * 2. Create necessary indexes
 * 3. Initialize sample data
 * 4. Verify all collections are working
 * 
 * Run with: npx tsx src/scripts/setup-mongodb.ts
 */

import connectToDatabase, { checkDatabaseHealth, createIndexes } from '../lib/mongodb';
import { db } from '../lib/database';
import { logger } from '../lib/logging';

async function setupMongoDB() {
  console.log('🚀 Setting up MongoDB Atlas for Healthcare Platform...\n');

  try {
    // Step 1: Test Connection
    console.log('1️⃣ Testing MongoDB Atlas connection...');
    await connectToDatabase();
    console.log('✅ Successfully connected to MongoDB Atlas!\n');

    // Step 2: Health Check
    console.log('2️⃣ Running database health check...');
    const health = await checkDatabaseHealth();
    console.log(`✅ Database Status: ${health.status}`);
    console.log(`⏱️  Response Time: ${health.responseTime}ms`);
    console.log(`📊 Database Details:`, health.details);
    console.log('');

    // Step 3: Create Indexes
    console.log('3️⃣ Creating database indexes for optimal performance...');
    await createIndexes();
    console.log('✅ Database indexes created successfully!\n');

    // Step 4: Test Sample Data Creation
    console.log('4️⃣ Testing sample data creation...');
    
    // Create a test patient
    const testPatient = await db.createPatient({
      firstName: 'Atlas',
      lastName: 'Test',
      email: `atlas.test.${Date.now()}@healthcare.com`,
      phone: '+1-555-ATLAS',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'other',
      bloodType: 'O+',
      allergies: ['None'],
      medications: [],
      medicalHistory: [],
      isActive: true,
      preferences: {
        language: 'en',
        notifications: true,
        dataSharing: false
      }
    });
    
    console.log(`✅ Test patient created: ${testPatient.firstName} ${testPatient.lastName}`);
    console.log(`📧 Email: ${testPatient.email}`);
    console.log(`🆔 Patient ID: ${testPatient._id}\n`);

    // Create a test health record
    const testRecord = await db.createHealthRecord({
      patientId: testPatient._id,
      type: 'symptom_check',
      data: {
        symptoms: ['Connection test successful'],
        analysis: 'MongoDB Atlas integration working perfectly',
        confidence: 100
      },
      provider: 'MongoDB Atlas Setup',
      confidence: 100,
      tags: ['setup', 'test', 'atlas'],
      status: 'active',
      severity: 'low',
      followUpRequired: false,
      metadata: {
        source: 'setup-script',
        version: '1.0',
        processingTime: Date.now()
      }
    });
    
    console.log(`✅ Test health record created: ${testRecord._id}\n`);

    // Step 5: Test Statistics
    console.log('5️⃣ Testing database statistics...');
    const patientStats = await db.getPatientStats();
    const recordStats = await db.getHealthRecordStats();
    
    console.log(`📊 Patient Statistics:`);
    console.log(`   Total Patients: ${patientStats.totalPatients}`);
    console.log(`   New This Month: ${patientStats.newPatientsThisMonth}`);
    console.log(`   Average Age: ${patientStats.averageAge} years`);
    console.log(`   Gender Distribution:`, patientStats.genderDistribution);
    
    console.log(`\n📊 Health Record Statistics:`);
    console.log(`   Total Records: ${recordStats.totalRecords}`);
    console.log(`   Records This Week: ${recordStats.recordsThisWeek}`);
    console.log(`   Average Confidence: ${recordStats.averageConfidence}%`);
    console.log(`   Records by Type:`, recordStats.recordsByType);
    console.log('');

    // Step 6: Test Search Functionality
    console.log('6️⃣ Testing search functionality...');
    const searchResults = await db.searchPatients('Atlas', 5);
    console.log(`✅ Search test: Found ${searchResults.length} patients matching 'Atlas'\n`);

    // Step 7: Clean up test data (optional)
    console.log('7️⃣ Cleaning up test data...');
    await db.deletePatient(testPatient._id.toString());
    console.log('✅ Test data cleaned up\n');

    // Final Success Message
    console.log('🎉 MongoDB Atlas Setup Complete!');
    console.log('🏥 Your healthcare platform is ready to use with MongoDB Atlas!');
    console.log('🚀 You can now start your application with: npm run dev\n');

    // Connection Info
    console.log('📋 Connection Information:');
    console.log(`   Database: healthcare`);
    console.log(`   Cluster: cluster0.5fwqb3m.mongodb.net`);
    console.log(`   Status: Connected and Ready`);
    console.log(`   Collections: patients, healthrecords, doctors, appointments`);
    console.log('');

    console.log('🔗 Useful Commands:');
    console.log('   Test connection: npx tsx src/scripts/test-mongodb.ts');
    console.log('   Start development: npm run dev');
    console.log('   View health status: curl http://localhost:3000/api/health');
    console.log('');

  } catch (error) {
    console.error('❌ MongoDB Atlas setup failed!');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('authentication failed')) {
        console.error('\n🔐 Authentication Error:');
        console.error('   Please check your username and password in the connection string');
        console.error('   Make sure your MongoDB Atlas user has the correct permissions');
      } else if (error.message.includes('network')) {
        console.error('\n🌐 Network Error:');
        console.error('   Please check your internet connection');
        console.error('   Verify that your IP address is whitelisted in MongoDB Atlas');
      } else if (error.message.includes('timeout')) {
        console.error('\n⏰ Timeout Error:');
        console.error('   Connection timed out - check your network and Atlas configuration');
      }
    }
    
    console.error('\n🛠️  Troubleshooting Steps:');
    console.error('   1. Verify your MongoDB Atlas connection string in .env.local');
    console.error('   2. Check that your IP is whitelisted in Atlas Network Access');
    console.error('   3. Ensure your database user has read/write permissions');
    console.error('   4. Try connecting with MongoDB Compass to test the connection');
    console.error('');
    
    await logger.log({
      level: 'error',
      message: 'MongoDB Atlas setup failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    process.exit(1);
  }
}

// Run the setup
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log('✨ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { setupMongoDB };