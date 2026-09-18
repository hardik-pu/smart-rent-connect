import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IFavourite extends Document {
  user: Types.ObjectId;
  property: Types.ObjectId;
  createdAt: Date;
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    user: {
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate favourites for the same user and property
FavouriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favourite: Model<IFavourite> =
  mongoose.models.Favourite || mongoose.model<IFavourite>('Favourite', FavouriteSchema);
