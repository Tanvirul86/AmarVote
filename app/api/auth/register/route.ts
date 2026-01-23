import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Register new user (Officer or Police)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { username, password, email, role, ...otherFields } = body;

    if (!username || !password || !email || !role) {
      return NextResponse.json(
        { error: 'Username, password, email, and role are required' },
        { status: 400 }
      );
    }

    // Only allow Officer and Police registration through this endpoint
    if (role !== 'Officer' && role !== 'Police') {
      return NextResponse.json(
        { error: 'Invalid role. Only Officer and Police can register.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with Pending status
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email.toLowerCase(),
      role,
      status: 'Pending',
      joinedDate: new Date(),
      lastActive: 'Never',
      ...otherFields,
    });

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please wait for admin approval.',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
