import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import SmsVerification from '@/models/SmsVerification';
import bcrypt from 'bcryptjs';
import { generateVerificationCode, sendVerificationSMS, formatPhoneNumber, isValidPhoneNumber } from '@/lib/smsService';

// POST /api/auth/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      );
    }

    // Map role to database role format
    const roleMap: { [key: string]: string } = {
      admin: 'Admin',
      officer: 'Officer',
      police: 'Police',
    };

    const dbRole = roleMap[role.toLowerCase()];

    if (!dbRole) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Find user
    const user = await User.findOne({
      username: username.toLowerCase(),
      role: dbRole,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username, password, and selected role.' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your username, password, and selected role.' },
        { status: 401 }
      );
    }

    // Check status
    if (user.status === 'Pending') {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please wait for admin verification.' },
        { status: 403 }
      );
    }

    if (user.status === 'Inactive') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Check if user has a phone number for 2FA
    if (!user.phone) {
      return NextResponse.json(
        { error: 'No phone number registered. Please contact administrator to add your phone number.' },
        { status: 400 }
      );
    }

    // Validate phone number
    if (!isValidPhoneNumber(user.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please contact administrator.' },
        { status: 400 }
      );
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Delete any existing unverified codes for this user
    await SmsVerification.deleteMany({
      userId: user._id,
      verified: false,
    });

    // Create new verification record
    await SmsVerification.create({
      userId: user._id,
      phone: user.phone,
      code: verificationCode,
      expiresAt,
      verified: false,
      attempts: 0,
    });

    // Format phone number and send SMS
    const formattedPhone = formatPhoneNumber(user.phone);
    const smsResult = await sendVerificationSMS(formattedPhone, verificationCode);

    if (!smsResult.success) {
      console.error('Failed to send SMS:', smsResult.message);
      // Continue anyway for development/testing
    }

    // Return partial user info (don't complete login yet)
    const partialResponse = {
      userId: user._id.toString(),
      username: user.username,
      name: user.name,
      phone: user.phone,
      requiresVerification: true,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your phone',
        user: partialResponse,
        expiresIn: 300, // 5 minutes in seconds
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
