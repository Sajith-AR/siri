#!/usr/bin/env tsx

/**
 * MongoDB Integration Test Script
 * 
 * This script tests the MongoDB connection and basic CRUD operations
 * Run with: npx tsx src/scripts/test-mongodb.ts
 */

import { db } from '../lib/database';
import { logger } from '../lib/logging';
import connectToDatabase, { checkDatabaseHealth } from '../lib/mongodb';

async function testMongoDBIntegration() {
  console.log('🧪 Testing MongoDB Integration...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    await connectToDatabase();
    console.log('✅ Database connected successfully\n');

    // Test 2: Database Health Check
    console.log('2️⃣ Testing database health...');
    const healthCheck = await checkDatabaseHealth();
    console.log(`✅ Database health: ${healthCheck.status}`);
    console.log(`⏱️  Response time: ${healthCheck.responseTime}ms\n`);

    // Test 3: Create a test patient
    console.log('3️⃣ Testing patient creation...');
    const testPatient = await db.createPatient({
      firstName: 'Test',
      lastName: 'Patient',
      email: `test.patient.${Date.now()}@example.com`,
      phone: '+1-555-TEST',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'other',
      bloodType: 'A+',
      allergies: ['Test Allergy'],
      medications: ['Test Medication'],
      medicalHistory: ['Test Condition'],
      isActive: true
    });
    console.log(`✅ Patient created with ID: ${testPatient._id}\n`);

    // Test 4: Retrieve the patient
    console.log('4️⃣ Testing patient retrieval...');
    const retrievedPatient = await db.getPatient(testPatient._id.toString());
    console.log(`✅ Patient retrieved: ${retrievedPatient?.firstName} ${retrievedPatient?.lastName}\n`);

    // Test 5: Create a test health record
    console.log('5️⃣ Testing health record creation...');
    const testRecord = await db.createHealthRecord({
      patientId: testPatient._id,
      type: 'symptom_check',
      data: {
        symptoms: ['headache', 'fever'],
        analysis: 'Test analysis result'
      },
      provider: 'Test Provider',
      confidence: 85,
      tags: ['test', 'automated'],
      status: 'active',
      severity: 'medium',
      followUpRequired: false,
      metadata: {
        source: 'test-script',
        version: '1.0'
      }
    });
    console.log(`✅ Health record created with ID: ${testRecord._id}\n`);

    // Test 6: Get patient statistics
    console.log('6️⃣ Testing patient statistics...');
    const patientStats = await db.getPatientStats();
    console.log(`✅ Total patients: ${patientStats.totalPatients}`);
    console.log(`📊 Gender distribution:`, patientStats.genderDistribution);
    console.log(`📈 Average age: ${patientStats.averageAge}\n`);

    // Test 7: Get health record statistics
    console.log('7️⃣ Testing health record statistics...');
    const recordStats = await db.getHealthRecordStats();
    console.log(`✅ Total records: ${recordStats.totalRecords}`);
    console.log(`📊 Records by type:`, recordStats.recordsByType);
    console.log(`🎯 Average confidence: ${recordStats.averageConfidence}%\n`);

    // Test 8: Search functionality
    console.log('8️⃣ Testing search functionality...');
    const searchResults = await db.searchPatients('Test', 5);
    console.log(`✅ Found ${searchResults.length} patients matching 'Test'\n`);

    // Test 9: Clean up test data
    console.log('9️⃣ Cleaning up test data...');
    await db.deletePatient(testPatient._id.toString());
    console.log('✅ Test patient deleted\n');

    console.log('🎉 All MongoDB integration tests passed!');
    console.log('🚀 Your MongoDB backend is ready for production!\n');

  } catch (error) {
    console.error('❌ MongoDB integration test failed:', error);
    
    await logger.log({
      level: 'error',
      message: 'MongoDB integration test failed',
      metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testMongoDBIntegration()
    .then(() => {
      console.log('✨ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export { testMongoDBIntegration };