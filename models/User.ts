import mongoose, { Schema, Document, Model } from 'mongoose';

// User Interface
export interface IUser extends Document {
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Officer' | 'Police';
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  joinedDate: Date;
  lastActive: string;
  serviceId?: string;
  rank?: string;
  avatar?: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
  thana?: string;
  nidDocument?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Officer', 'Police'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Pending'],
      default: 'Pending',
    },
    location: {
      type: String,
      required: true,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: String,
      default: 'Never',
    },
    serviceId: String,
    rank: String,
    avatar: String,
    pollingCenterId: String,
    pollingCenterName: String,
    thana: String,
    nidDocument: String,
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ role: 1, status: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
