import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PoliticalParty from '@/models/PoliticalParty';

// GET /api/political-parties - Get all political parties or filter by query
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const partyId = searchParams.get('partyId');

    let query: any = {};

    if (partyId) {
      const party = await PoliticalParty.findOne({ partyId });
      if (!party) {
        return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
      }
      return NextResponse.json({ party }, { status: 200 });
    }

    if (status) query.status = status;

    const parties = await PoliticalParty.find(query).sort({ name: 1 });

    return NextResponse.json({ parties }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching political parties:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/political-parties - Create a new political party
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Check if party ID already exists
    const existing = await PoliticalParty.findOne({ partyId: body.partyId });
    if (existing) {
      return NextResponse.json(
        { error: 'Party ID already exists' },
        { status: 400 }
      );
    }

    const party = await PoliticalParty.create(body);

    return NextResponse.json({ party }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating political party:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/political-parties - Update political party
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { partyId, ...updates } = body;

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 });
    }

    const party = await PoliticalParty.findOneAndUpdate(
      { partyId },
      updates,
      { new: true, runValidators: true }
    );

    if (!party) {
      return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
    }

    return NextResponse.json({ party }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating political party:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/political-parties - Delete political party
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID is required' }, { status: 400 });
    }

    const party = await PoliticalParty.findOneAndDelete({ partyId });

    if (!party) {
      return NextResponse.json({ error: 'Political party not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Political party deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting political party:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
