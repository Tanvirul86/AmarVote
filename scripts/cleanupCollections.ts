import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function cleanupCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Collections to remove (old ones that were merged)
    const collectionsToRemove = ['notifications', 'systemsettings', 'votesubmissions'];

    for (const collectionName of collectionsToRemove) {
      try {
        const collections = await db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length > 0) {
          await db.dropCollection(collectionName);
          console.log(`✅ Dropped collection: ${collectionName}`);
        } else {
          console.log(`ℹ️  Collection not found: ${collectionName}`);
        }
      } catch (error: any) {
        console.log(`⚠️  Error dropping ${collectionName}:`, error.message);
      }
    }

    console.log('\n✅ Cleanup completed!');
    console.log('Remaining collections should be: users, incidents, pollingcenters, politicalparties, auditlogs');

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupCollections();
