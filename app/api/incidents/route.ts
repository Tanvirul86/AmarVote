import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Incident from '@/models/Incident';

// GET /api/incidents - Get all incidents or filter by query
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const userId = searchParams.get('userId');
    const incidentId = searchParams.get('incidentId');

    let query: any = {};

    if (incidentId) {
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
      }
      return NextResponse.json({ incident }, { status: 200 });
    }

    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (userId) query['reportedBy.userId'] = userId;

    const incidents = await Incident.find(query).sort({ reportedAt: -1 });

    return NextResponse.json({ incidents }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/incidents - Create a new incident
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const incident = await Incident.create({
      ...body,
      reportedAt: new Date(),
    });

    return NextResponse.json({ incident }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/incidents - Update incident
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { incidentId, ...updates } = body;

    console.log('PATCH /api/incidents - Received:', { incidentId, updates });

    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    // If status is being changed to Resolved, set resolvedAt
    if (updates.status === 'Resolved') {
      updates.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(incidentId, updates, {
      new: true,
      runValidators: true,
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    console.log('PATCH /api/incidents - Updated incident:', {
      id: incident._id,
      status: incident.status,
      acknowledgedBy: incident.acknowledgedBy,
      acknowledgedAt: incident.acknowledgedAt,
      acknowledgementNotes: incident.acknowledgementNotes
    });

    return NextResponse.json({ incident }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/incidents - Delete incident
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('incidentId');

    if (!incidentId) {
      return NextResponse.json({ error: 'Incident ID is required' }, { status: 400 });
    }

    const incident = await Incident.findByIdAndDelete(incidentId);

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Incident deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting incident:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
