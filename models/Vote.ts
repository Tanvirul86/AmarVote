import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IVote extends Document {
  pollingCenter: string;
  pollingCenterId?: string;
  pollingCenterName: string;
  location: string;
  totalVotes: number;
  totalVoters: number;
  submittedBy: {
    userId: string;
    name: string;
    email?: string;
  };
  partyVotes?: Record<string, number>;
  partyVoteBreakdown?: Array<{
    partyId: string;
    partyName: string;
    votes: number;
  }>;
  submittedAt: Date;
  status: 'submitted' | 'verified' | 'rejected';
  verifiedBy?: {
    userId: string;
    name: string;
  };
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    pollingCenter: {
      type: String,
      required: true,
      index: true,
    },
    pollingCenterId: {
      type: String,
      index: true,
    },
    pollingCenterName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    totalVotes: {
      type: Number,
      required: true,
      min: 0,
    },
    totalVoters: {
      type: Number,
      required: true,
      min: 0,
    },
    submittedBy: {
      userId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
    partyVotes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    partyVoteBreakdown: [
      {
        partyId: {
          type: String,
          required: true,
        },
        partyName: {
          type: String,
          required: true,
        },
        votes: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'rejected'],
      default: 'submitted',
    },
    verifiedBy: {
      userId: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying votes by polling center
VoteSchema.index({ pollingCenter: 1, submittedAt: -1 });
VoteSchema.index({ 'submittedBy.userId': 1 });

const Vote = models.Vote || model<IVote>('Vote', VoteSchema);

export default Vote;
