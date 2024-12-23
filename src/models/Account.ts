import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  userId: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
}

const accountSchema = new Schema<IAccount>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  publicKey: {
    type: String,
    required: true
  },
  privateKey: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Account = mongoose.model<IAccount>('Account', accountSchema);