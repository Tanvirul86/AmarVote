import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

    // Update last active
    user.lastActive = 'Just now';
    await user.save();

    // Return user without password
    const userResponse = {
      id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      location: user.location,
      avatar: user.avatar,
      serviceId: user.serviceId,
      rank: user.rank,
      pollingCenterId: user.pollingCenterId,
      pollingCenterName: user.pollingCenterName,
      thana: user.thana,
    };

    return NextResponse.json(
      {
        success: true,
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
