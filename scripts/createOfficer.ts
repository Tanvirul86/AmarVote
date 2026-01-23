import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function createOfficer() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ username: 'tamim' });
    if (existingUser) {
      console.log('⚠️  User "tamim" already exists!');
      console.log('User details:');
      console.log({
        username: existingUser.username,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        status: existingUser.status,
        id: existingUser._id.toString(),
      });
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('tamim123', 10);

    // Create officer
    const officer = await User.create({
      username: 'tamim',
      password: hashedPassword,
      email: 'tamim@amarvote.gov.bd',
      name: 'Tamim Rahman',
      role: 'Officer',
      status: 'Pending',
      phone: '01712345678',
      pollingCenterName: 'Gulshan High School',
      pollingCenterId: 'PC-DHK-001',
      location: 'Dhaka - Gulshan',
      thana: 'Gulshan',
      joinedDate: new Date(),
      lastActive: 'Never',
    });

    console.log('✅ Officer created successfully!');
    console.log('\n📝 Officer Details:');
    console.log('   Username: tamim');
    console.log('   Password: tamim123');
    console.log('   Name:', officer.name);
    console.log('   Email:', officer.email);
    console.log('   Role:', officer.role);
    console.log('   Status:', officer.status);
    console.log('   Polling Center:', officer.pollingCenterName);
    console.log('   ID:', officer._id.toString());

    // Verify in database
    console.log('\n🔍 Verifying in database...');
    const verifyUser = await User.findOne({ username: 'tamim' });
    if (verifyUser) {
      console.log('✅ User verified in MongoDB!');
      console.log('   Document ID:', verifyUser._id.toString());
      console.log('   Created at:', verifyUser.createdAt);
    } else {
      console.log('❌ User not found in database!');
    }

    await mongoose.connection.close();
    console.log('\n✨ Script completed successfully!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createOfficer();
