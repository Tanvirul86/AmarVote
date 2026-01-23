import mongoose, { Schema, Document, Model } from 'mongoose';

// Incident Interface (includes notification fields)
export interface IIncident extends Document {
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  location: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
  thana?: string;
  district?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  reportedBy: {
    userId: string;
    name: string;
    role: string;
  };
  reportedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  images?: string[];
  notes?: string;
  
  // Notification fields
  notifyUsers?: string[]; // Array of user IDs to notify
  notifyRoles?: ('Admin' | 'Officer' | 'Police')[]; // Array of roles to notify
  priority?: 'low' | 'medium' | 'high';
  isRead?: boolean; // For tracking if incident notification is read
  actionRequired?: boolean;
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

// Incident Schema
const IncidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Reported', 'Under Investigation', 'Resolved', 'Dismissed'],
      default: 'Reported',
    },
    location: {
      type: String,
      required: true,
    },
    pollingCenterId: String,
    pollingCenterName: String,
    thana: String,
    district: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
    reportedBy: {
      userId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
      },
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: Date,
    assignedTo: String,
    images: [String],
    notes: String,
    
    // Notification fields
    notifyUsers: [String],
    notifyRoles: [{
      type: String,
      enum: ['Admin', 'Officer', 'Police'],
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Create indexes
IncidentSchema.index({ status: 1, severity: 1 });
IncidentSchema.index({ 'reportedBy.userId': 1 });
IncidentSchema.index({ reportedAt: -1 });
IncidentSchema.index({ pollingCenterId: 1 });

const Incident: Model<IIncident> =
  mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
