import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type VisitStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface IVisit extends Document {
  tenant: Types.ObjectId;
  property: Types.ObjectId;
  ownerAgent: Types.ObjectId;
  requestedDate: Date;
  requestedTime: string; // e.g. "10:30 AM" or "14:00"
  status: VisitStatus;
  message?: string;
  rescheduleReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    ownerAgent: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedDate: {
      type: Date,
      required: [true, 'Visit date is required'],
      validate: {
        validator: function (val: Date) {
          // Allow today or future dates (with 1 day grace for timezone differences)
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          return val >= yesterday;
        },
        message: 'Visit date cannot be in the past',
      },
    },
    requestedTime: {
      type: String,
      required: [true, 'Visit time slot is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    message: {
      type: String,
      trim: true,
    },
    rescheduleReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Visit: Model<IVisit> =
  mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);
