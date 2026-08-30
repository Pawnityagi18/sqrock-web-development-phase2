import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'funded', 'submitted', 'released', 'disputed'],
    default: 'pending'
  },
  submissionNotes: { type: String },
  fundedAt: { type: Date },
  releasedAt: { type: Date },
  platformFee: { type: Number, default: 0 },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpayTransferId: { type: String }
}, { timestamps: true });

const contractSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  proposal: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'disputed'],
    default: 'active'
  },
  disputeReason: { type: String },
  disputeRaisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  disputeResolution: { type: String },
  milestones: [milestoneSchema]
}, { timestamps: true });

export default mongoose.model('Contract', contractSchema);
