import { config } from 'dotenv';
import { resolve } from 'path';
import dbConnect from '../lib/mongodb';
import Incident from '../models/Incident';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function cleanupSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await dbConnect();

    console.log('🧹 Cleaning up sample data...');

    // Remove sample incident
    const result = await Incident.deleteMany({
      $or: [
        { title: 'Sample Incident' },
        { 'reportedBy.name': 'Sample Officer' },
        { description: /sample.*testing purposes/i }
      ]
    });

    console.log(`✅ Removed ${result.deletedCount} sample incident(s)`);

    console.log('✨ Cleanup completed successfully!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up sample data:', error);
    process.exit(1);
  }
}

cleanupSampleData();
