import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'TENANT' | 'OWNER' | 'AGENT' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  preferences?: {
    budgetMax?: number;
    preferredCity?: string;
    preferredType?: string;
  };
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  verificationStatus: 'UNVERIFIED' | 'VERIFIED';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password hash by default
    },
    role: {
      type: String,
      enum: ['TENANT', 'OWNER', 'AGENT', 'ADMIN'],
      default: 'TENANT',
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    preferences: {
      budgetMax: Number,
      preferredCity: String,
      preferredType: String,
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED'],
      default: 'VERIFIED',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
