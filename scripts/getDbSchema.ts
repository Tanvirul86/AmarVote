import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function getDbSchema() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri);
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('✅ Connected to database:', db.databaseName);
    console.log('='.repeat(80));
    console.log('\n📊 DATABASE SCHEMA\n');
    console.log('='.repeat(80));

    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📁 Total Collections: ${collections.length}\n`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log('\n' + '─'.repeat(80));
      console.log(`📦 Collection: ${collectionName}`);
      console.log('─'.repeat(80));
      
      const collection = db.collection(collectionName);
      
      // Get collection stats
      const stats: any = await db.command({ collStats: collectionName });
      console.log(`   Documents: ${stats.count || 0}`);
      console.log(`   Size: ${stats.size ? (stats.size / 1024).toFixed(2) : '0'} KB`);
      console.log(`   Avg Document Size: ${stats.avgObjSize ? (stats.avgObjSize / 1024).toFixed(2) + ' KB' : 'N/A'}`);
      
      // Get indexes
      const indexes = await collection.indexes();
      console.log(`\n   📑 Indexes (${indexes.length}):`);
      indexes.forEach((index: any) => {
        const keys = Object.keys(index.key).map(k => `${k}: ${index.key[k]}`).join(', ');
        console.log(`      - ${index.name}: { ${keys} }${index.unique ? ' [UNIQUE]' : ''}`);
      });
      
      // Get validation schema if exists
      const collectionDetails: any = await db.listCollections({ name: collectionName }).toArray();
      if (collectionDetails[0]?.options?.validator) {
        console.log('\n   🔒 Validation Schema:');
        console.log('      ' + JSON.stringify(collectionDetails[0].options.validator, null, 6));
      }
      
      // Get sample document to show schema
      const sampleDoc = await collection.findOne({});
      if (sampleDoc) {
        console.log('\n   📝 Schema (from sample document):');
        
        const displaySchema = (obj: any, indent = 6) => {
          const spaces = ' '.repeat(indent);
          for (const [key, value] of Object.entries(obj)) {
            if (key === '__v') continue; // Skip mongoose version key
            
            if (value === null) {
              console.log(`${spaces}${key}: null`);
            } else if (Array.isArray(value)) {
              if (value.length > 0) {
                console.log(`${spaces}${key}: [`);
                if (typeof value[0] === 'object' && value[0] !== null) {
                  displaySchema(value[0], indent + 3);
                  console.log(`${spaces}   ... (${value.length} items)`);
                } else {
                  console.log(`${spaces}   ${typeof value[0]} ... (${value.length} items)`);
                }
                console.log(`${spaces}]`);
              } else {
                console.log(`${spaces}${key}: [] (empty array)`);
              }
            } else if (value instanceof Date) {
              console.log(`${spaces}${key}: Date`);
            } else if (typeof value === 'object' && value !== null) {
              if ((value as any)._bsontype === 'ObjectId' || value.constructor?.name === 'ObjectId') {
                console.log(`${spaces}${key}: ObjectId`);
              } else {
                console.log(`${spaces}${key}: {`);
                displaySchema(value, indent + 3);
                console.log(`${spaces}}`);
              }
            } else {
              console.log(`${spaces}${key}: ${typeof value}`);
            }
          }
        };
        
        displaySchema(sampleDoc);
        
        // Show actual sample values for important fields
        console.log('\n   💡 Sample Values:');
        const importantFields = ['_id', 'name', 'email', 'role', 'status', 'type', 'partyId', 'username'];
        for (const field of importantFields) {
          if (sampleDoc[field] !== undefined) {
            const value = sampleDoc[field];
            const displayValue = value?.toString().substring(0, 50) || 'null';
            console.log(`      ${field}: ${displayValue}`);
          }
        }
      } else {
        console.log('\n   ⚠️  No documents found in this collection');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ Schema extraction complete!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('❌ Error fetching database schema:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

getDbSchema();
