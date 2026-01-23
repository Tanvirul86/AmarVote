import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PollingCenter from '@/models/PollingCenter';

// GET /api/polling-centers - Get all polling centers or filter by query
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const district = searchParams.get('district');
    const thana = searchParams.get('thana');
    const status = searchParams.get('status');
    const centerId = searchParams.get('centerId');

    let query: any = {};

    if (centerId) {
      const center = await PollingCenter.findOne({ pollingCenterId: centerId });
      if (!center) {
        return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
      }
      return NextResponse.json({ center }, { status: 200 });
    }

    if (district) query.district = district;
    if (thana) query.thana = thana;
    if (status) query.status = status;

    const centers = await PollingCenter.find(query).sort({ district: 1, name: 1 });

    return NextResponse.json({ centers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching polling centers:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/polling-centers - Create a new polling center
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if polling center ID already exists
    const existing = await PollingCenter.findOne({ pollingCenterId: body.pollingCenterId });
    if (existing) {
      return NextResponse.json(
        { error: 'Polling center ID already exists' },
        { status: 400 }
      );
    }

    const center = await PollingCenter.create(body);

    return NextResponse.json({ center }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating polling center:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/polling-centers - Update polling center
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { centerId, ...updates } = body;

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 });
    }

    const center = await PollingCenter.findOneAndUpdate(
      { pollingCenterId: centerId },
      updates,
      { new: true, runValidators: true }
    );

    if (!center) {
      return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
    }

    return NextResponse.json({ center }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating polling center:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/polling-centers - Delete polling center
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');

    if (!centerId) {
      return NextResponse.json({ error: 'Center ID is required' }, { status: 400 });
    }

    const center = await PollingCenter.findOneAndDelete({ pollingCenterId: centerId });

    if (!center) {
      return NextResponse.json({ error: 'Polling center not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Polling center deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting polling center:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
