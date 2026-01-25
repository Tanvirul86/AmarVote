import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testDatabaseConnection() {
  console.log('🔍 BACKEND & DATABASE CONNECTION TEST\n');
  console.log('='.repeat(80));
  
  const results: any = {
    mongodb: { status: '❌', message: '' },
    models: { status: '❌', message: '', details: [] as string[] },
    apiRoutes: { status: '❌', message: '', details: [] as string[] },
  };

  try {
    // 1. Test MongoDB Connection
    console.log('\n📡 Testing MongoDB Connection...');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      results.mongodb = { status: '❌', message: 'MONGODB_URI not found in .env.local' };
      console.log('   ❌ MONGODB_URI not found');
    } else {
      await mongoose.connect(mongoUri);
      const db = mongoose.connection.db;
      
      if (db) {
        results.mongodb = { 
          status: '✅', 
          message: `Connected to database: ${db.databaseName}` 
        };
        console.log(`   ✅ Connected to: ${db.databaseName}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`   📦 Collections (${collections.length}): ${collections.map(c => c.name).join(', ')}`);
      }
    }

    // 2. Test Models
    console.log('\n📚 Testing Models...');
    const modelsToTest = [
      { name: 'User', path: '@/models/User' },
      { name: 'Vote', path: '@/models/Vote' },
      { name: 'Incident', path: '@/models/Incident' },
      { name: 'PoliticalParty', path: '@/models/PoliticalParty' },
      { name: 'PollingCenter', path: '@/models/PollingCenter' },
      { name: 'AuditLog', path: '@/models/AuditLog' },
    ];

    const modelResults: string[] = [];
    for (const modelInfo of modelsToTest) {
      try {
        const Model = (await import(`../models/${modelInfo.name}`)).default;
        const count = await Model.countDocuments();
        modelResults.push(`${modelInfo.name}: ✅ (${count} docs)`);
        console.log(`   ✅ ${modelInfo.name}: ${count} documents`);
      } catch (error: any) {
        modelResults.push(`${modelInfo.name}: ❌ ${error.message}`);
        console.log(`   ❌ ${modelInfo.name}: ${error.message}`);
      }
    }
    
    results.models = {
      status: modelResults.every(r => r.includes('✅')) ? '✅' : '⚠️',
      message: `${modelResults.filter(r => r.includes('✅')).length}/${modelsToTest.length} models working`,
      details: modelResults
    };

    // 3. Test API Routes (file existence)
    console.log('\n🛣️  Checking API Routes...');
    const apiRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/users',
      '/api/votes',
      '/api/incidents',
      '/api/political-parties',
      '/api/polling-centers',
      '/api/audit-logs',
    ];

    const fs = await import('fs');
    const routeResults: string[] = [];
    
    for (const route of apiRoutes) {
      const routePath = path.join(process.cwd(), 'app', route, 'route.ts');
      const exists = fs.existsSync(routePath);
      
      if (exists) {
        routeResults.push(`${route}: ✅`);
        console.log(`   ✅ ${route}`);
      } else {
        routeResults.push(`${route}: ❌ Not found`);
        console.log(`   ❌ ${route} - File not found`);
      }
    }
    
    results.apiRoutes = {
      status: routeResults.every(r => r.includes('✅')) ? '✅' : '⚠️',
      message: `${routeResults.filter(r => r.includes('✅')).length}/${apiRoutes.length} routes exist`,
      details: routeResults
    };

    // 4. Test Sample Database Operations
    console.log('\n🧪 Testing Sample Database Operations...');
    
    try {
      // Test User query
      const User = (await import('../models/User')).default;
      const user = await User.findOne({ role: 'Admin' });
      console.log(`   ✅ User query: Found admin - ${user?.name || 'Unknown'}`);
      
      // Test PoliticalParty query
      const PoliticalParty = (await import('../models/PoliticalParty')).default;
      const parties = await PoliticalParty.find({ status: 'Active' });
      console.log(`   ✅ PoliticalParty query: Found ${parties.length} active parties`);
      
      // Test PollingCenter query
      const PollingCenter = (await import('../models/PollingCenter')).default;
      const centers = await PollingCenter.find({ status: 'Active' });
      console.log(`   ✅ PollingCenter query: Found ${centers.length} active centers`);
      
      // Test Vote query
      const Vote = (await import('../models/Vote')).default;
      const votes = await Vote.find();
      console.log(`   ✅ Vote query: Found ${votes.length} votes`);
      
    } catch (error: any) {
      console.log(`   ❌ Database operations failed: ${error.message}`);
    }

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY\n');
  console.log(`MongoDB Connection:  ${results.mongodb.status} ${results.mongodb.message}`);
  console.log(`Models:             ${results.models.status} ${results.models.message}`);
  console.log(`API Routes:         ${results.apiRoutes.status} ${results.apiRoutes.message}`);
  
  const allPassed = 
    results.mongodb.status === '✅' && 
    results.models.status === '✅' && 
    results.apiRoutes.status === '✅';
  
  console.log('\n' + '='.repeat(80));
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Backend is ready!');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Check details above');
  }
  console.log('='.repeat(80) + '\n');
}

testDatabaseConnection();
