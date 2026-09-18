import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: 'ENQUIRY' | 'VISIT' | 'PROPERTY' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  relatedEntity?: {
    entityType: 'Property' | 'Enquiry' | 'Visit';
    id: Types.ObjectId;
  };
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['ENQUIRY', 'VISIT', 'PROPERTY', 'SYSTEM'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Property', 'Enquiry', 'Visit'],
      },
      id: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
