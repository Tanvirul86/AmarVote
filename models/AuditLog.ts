import mongoose, { Schema, Document, Model } from 'mongoose';

// Audit Log Interface
export interface IAuditLog extends Document {
  user: string;
  action: string;
  details: string;
  ip: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Schema
const AuditLogSchema = new Schema<IAuditLog>(
  {
    user: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ user: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
