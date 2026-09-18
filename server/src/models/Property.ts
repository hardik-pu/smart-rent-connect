import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type PropertyType = 'apartment' | 'house' | 'villa' | 'studio';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ListingStatus = 'ACTIVE' | 'RENTED' | 'INACTIVE';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IProperty extends Document {
  title: string;
  description: string;
  owner: Types.ObjectId;
  propertyType: PropertyType;
  rent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
  amenities: string[];
  images: string[];
  address: string;
  city: string;
  state: string;
  country: string;
  location: ILocation;
  availability: boolean;
  availableFrom?: Date;
  verificationStatus: VerificationStatus;
  listingStatus: ListingStatus;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'villa', 'studio'],
      required: true,
      index: true,
    },
    rent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Rent cannot be negative'],
      index: true,
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Deposit cannot be negative'],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    listingStatus: {
      type: String,
      enum: ['ACTIVE', 'RENTED', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for location-based geospatial queries
PropertySchema.index({ location: '2dsphere' });
// Compound text search index for keyword queries
PropertySchema.index({ title: 'text', description: 'text', city: 'text', address: 'text' });

export const Property: Model<IProperty> =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
