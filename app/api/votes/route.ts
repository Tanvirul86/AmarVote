import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vote from '@/models/Vote';
import PoliticalParty from '@/models/PoliticalParty';

// GET /api/votes - Get all votes or votes by filter
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const pollingCenterId = searchParams.get('pollingCenterId');
    const userId = searchParams.get('userId');

    let query: any = {};

    if (pollingCenterId) {
      query.pollingCenter = pollingCenterId;
    }

    if (userId) {
      query['submittedBy.userId'] = userId;
    }

    const votes = await Vote.find(query)
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      votes,
      count: votes.length,
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST /api/votes - Submit new vote
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      pollingCenter,
      pollingCenterName,
      location,
      totalVotes,
      totalVoters,
      submittedBy,
      partyVotes,
      isCorrection,
    } = body;

    // Validate required fields
    if (!pollingCenter || !pollingCenterName || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required polling center information' },
        { status: 400 }
      );
    }

    if (!submittedBy || !submittedBy.userId || !submittedBy.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required submitter information' },
        { status: 400 }
      );
    }

    if (totalVotes === undefined || totalVoters === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing vote count information' },
        { status: 400 }
      );
    }

    // Check if vote already submitted for this polling center
    const existingVote = await Vote.findOne({ pollingCenter });

    if (existingVote && !isCorrection) {
      return NextResponse.json(
        { success: false, error: 'Votes already submitted for this polling center' },
        { status: 409 }
      );
    }

    // Build partyVoteBreakdown from partyVotes
    let partyVoteBreakdown: Array<{ partyId: string; partyName: string; votes: number }> = [];

    if (partyVotes && typeof partyVotes === 'object') {
      // Fetch all political parties
      const parties = await PoliticalParty.find({ status: 'active' }).lean();
      const partyMap = new Map(parties.map(p => [p.partyId, p.name]));

      partyVoteBreakdown = Object.entries(partyVotes).map(([partyId, votes]) => ({
        partyId,
        partyName: partyMap.get(partyId) || partyId,
        votes: Number(votes) || 0,
      }));
    }

    // If correction approved, update existing vote
    if (existingVote && isCorrection) {
      existingVote.totalVotes = totalVotes;
      existingVote.totalVoters = totalVoters;
      existingVote.partyVotes = partyVotes;
      existingVote.partyVoteBreakdown = partyVoteBreakdown;
      existingVote.submittedAt = new Date();
      
      await existingVote.save();

      return NextResponse.json({
        success: true,
        message: 'Votes corrected successfully',
        vote: existingVote,
        isCorrected: true,
      });
    }

    // Create new vote
    const newVote = new Vote({
      pollingCenter,
      pollingCenterId: pollingCenter,
      pollingCenterName,
      location,
      totalVotes,
      totalVoters,
      submittedBy,
      partyVotes,
      partyVoteBreakdown,
      status: 'submitted',
      submittedAt: new Date(),
    });

    await newVote.save();

    return NextResponse.json({
      success: true,
      message: 'Votes submitted successfully',
      vote: newVote,
    });
  } catch (error) {
    console.error('Error submitting votes:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to submit votes' },
      { status: 500 }
    );
  }
}

// PATCH /api/votes - Update vote status (verify/reject)
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { voteId, status, verifiedBy } = body;

    if (!voteId) {
      return NextResponse.json(
        { success: false, error: 'Vote ID is required' },
        { status: 400 }
      );
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      verifiedAt: new Date(),
    };

    if (verifiedBy) {
      updateData.verifiedBy = verifiedBy;
    }

    const updatedVote = await Vote.findByIdAndUpdate(
      voteId,
      updateData,
      { new: true }
    );

    if (!updatedVote) {
      return NextResponse.json(
        { success: false, error: 'Vote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vote status updated successfully',
      vote: updatedVote,
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vote' },
      { status: 500 }
    );
  }
}
