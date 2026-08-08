import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema({
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  freelancerName: { type: String, required: true },
  freelancerAvatar: { type: String },
  bidAmount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  netAmount: { type: Number, required: true },
  estimatedDays: { type: Number, required: true },
  coverLetter: { type: String, required: true },
  submittedDate: { type: String, default: 'Just now' },
  status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Proposal', proposalSchema);
