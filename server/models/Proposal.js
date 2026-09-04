import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  netAmount: { type: Number },
  estimatedDays: { type: Number, required: true },
  coverLetter: { type: String, required: true },
  submittedDate: { type: String, default: 'Just now' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Proposal', proposalSchema);
