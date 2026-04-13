import mongoose, { Schema, Document, Model } from "mongoose";

export interface IValidityScore extends Document {
  postId:       mongoose.Types.ObjectId;
  score:        number;   // 0.0 – 1.0
  totalVotes:   number;
  upvotes:      number;
  downvotes:    number;
  calculatedAt: Date;
  recalculate(upvotes: number, downvotes: number): Promise<void>;
}

const ValidityScoreSchema = new Schema<IValidityScore>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true,   // one score doc per post
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    totalVotes: { type: Number, default: 0 },
    upvotes:    { type: Number, default: 0 },
    downvotes:  { type: Number, default: 0 },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Static helper to recalculate and save score
ValidityScoreSchema.methods.recalculate = async function (
  upvotes: number,
  downvotes: number
): Promise<void> {
  const total = upvotes + downvotes;
  this.upvotes    = upvotes;
  this.downvotes  = downvotes;
  this.totalVotes = total;
  this.score      = total === 0 ? 0 : parseFloat((upvotes / total).toFixed(4));
  this.calculatedAt = new Date();
  await this.save();
};

export const ValidityScoreModel: Model<IValidityScore> =
  mongoose.model<IValidityScore>("ValidityScore", ValidityScoreSchema);