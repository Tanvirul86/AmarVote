import mongoose, { Schema, Document, Model } from 'mongoose';

// Political Party Interface
export interface IPoliticalParty extends Document {
  partyId: string;
  name: string;
  symbol: string;
  symbolIcon?: string;
  color: string;
  leader: string;
  established?: Date;
  description?: string;
  manifesto?: string;
  website?: string;
  logo?: string;
  registrationNumber?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  totalSeats?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Political Party Schema
const PoliticalPartySchema = new Schema<IPoliticalParty>(
  {
    partyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    symbolIcon: String,
    color: {
      type: String,
      required: true,
      default: '#6b7280',
    },
    leader: {
      type: String,
      required: true,
      trim: true,
    },
    established: Date,
    description: String,
    manifesto: String,
    website: String,
    logo: String,
    registrationNumber: String,
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    totalSeats: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
PoliticalPartySchema.index({ partyId: 1 });
PoliticalPartySchema.index({ name: 1 });
PoliticalPartySchema.index({ status: 1 });

const PoliticalParty: Model<IPoliticalParty> =
  mongoose.models.PoliticalParty ||
  mongoose.model<IPoliticalParty>('PoliticalParty', PoliticalPartySchema);

export default PoliticalParty;
