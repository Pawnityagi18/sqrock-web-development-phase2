import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 }
}, { timestamps: true });

// One review per (contract, reviewer) — prevents someone reviewing the same contract twice
reviewSchema.index({ contract: 1, reviewer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
