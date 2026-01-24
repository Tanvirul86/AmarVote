import { config } from 'dotenv';
import { resolve } from 'path';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import PoliticalParty from '../models/PoliticalParty';
import PollingCenter from '../models/PollingCenter';
import Incident from '../models/Incident';
import AuditLog from '../models/AuditLog';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await dbConnect();

    console.log('🌱 Starting database seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin', role: 'Admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping admin creation.');
    } else {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = await User.create({
        username: 'admin',
        password: hashedPassword,
        name: 'BEC Admin',
        email: 'admin@bec.gov.bd',
        role: 'Admin',
        status: 'Active',
        location: 'BEC HQ',
        joinedDate: new Date(),
        lastActive: 'Just now',
      });

      console.log('✅ Default admin user created:', {
        username: admin.username,
        email: admin.email,
        role: admin.role,
      });
    }

    // Create default political parties
    const defaultParties = [
      { partyId: 'PA', name: 'Party A', symbol: 'Boat', color: '#10b981', leader: 'Leader A' },
      { partyId: 'PB', name: 'Party B', symbol: 'Sheaf of Paddy', color: '#3b82f6', leader: 'Leader B' },
      { partyId: 'PC', name: 'Party C', symbol: 'Plow', color: '#f59e0b', leader: 'Leader C' },
      { partyId: 'PD', name: 'Party D', symbol: 'Rose', color: '#a855f7', leader: 'Leader D' },
      { partyId: 'PE', name: 'Party E', symbol: 'Eagle', color: '#ec4899', leader: 'Leader E' },
      { partyId: 'PF', name: 'Party F', symbol: 'Star', color: '#ef4444', leader: 'Leader F' },
      { partyId: 'IND', name: 'Independent', symbol: 'Cricket Bat', color: '#6b7280', leader: 'Various' },
    ];

    for (const party of defaultParties) {
      const existing = await PoliticalParty.findOne({ partyId: party.partyId });
      if (!existing) {
        await PoliticalParty.create({ ...party, status: 'Active' });
        console.log(`✅ Created political party: ${party.name}`);
      } else {
        console.log(`⚠️  Political party already exists: ${party.name}`);
      }
    }

    // Create sample polling centers
    const samplePollingCenters = [
      {
        pollingCenterId: 'PC-DHK-001',
        name: 'Gulshan High School',
        address: 'Gulshan Avenue, Dhaka',
        district: 'Dhaka',
        thana: 'Gulshan',
        division: 'Dhaka',
        totalRegisteredVoters: 2500,
        status: 'Active',
        facilities: ['Wheelchair Access', 'Parking', 'Washrooms'],
        accessibility: true,
      },
      {
        pollingCenterId: 'PC-DHK-002',
        name: 'Dhanmondi Government School',
        address: 'Road 27, Dhanmondi, Dhaka',
        district: 'Dhaka',
        thana: 'Dhanmondi',
        division: 'Dhaka',
        totalRegisteredVoters: 3200,
        status: 'Active',
        facilities: ['Wheelchair Access', 'Parking'],
        accessibility: true,
      },
      {
        pollingCenterId: 'PC-CTG-001',
        name: 'Agrabad Community Center',
        address: 'Agrabad, Chittagong',
        district: 'Chittagong',
        thana: 'Agrabad',
        division: 'Chittagong',
        totalRegisteredVoters: 1800,
        status: 'Active',
        facilities: ['Parking', 'Washrooms'],
        accessibility: true,
      },
    ];

    for (const center of samplePollingCenters) {
      const existing = await PollingCenter.findOne({ pollingCenterId: center.pollingCenterId });
      if (!existing) {
        await PollingCenter.create(center);
        console.log(`✅ Created polling center: ${center.name}`);
      } else {
        console.log(`⚠️  Polling center already exists: ${center.name}`);
      }
    }

    // Incidents will be created by users - no sample data

    // Create sample audit log (to make collection visible)
    const auditCount = await AuditLog.countDocuments();
    if (auditCount === 0) {
      await AuditLog.create({
        user: 'admin',
        action: 'SYSTEM_INITIALIZED',
        details: 'Database initialized with seed data',
        ip: '127.0.0.1',
      });
      console.log('✅ Created sample audit log');
    }

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📝 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: Admin\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
