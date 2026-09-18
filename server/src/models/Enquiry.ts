import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type EnquiryStatus = 'PENDING' | 'CONTACTED' | 'ACCEPTED' | 'REJECTED' | 'CLOSED';

export interface IEnquiry extends Document {
  tenant: Types.ObjectId;
  property: Types.ObjectId;
  ownerAgent: Types.ObjectId;
  message: string;
  phone?: string;
  status: EnquiryStatus;
  reply?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
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
    message: {
      type: String,
      required: [true, 'Enquiry message is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONTACTED', 'ACCEPTED', 'REJECTED', 'CLOSED'],
      default: 'PENDING',
      index: true,
    },
    reply: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
