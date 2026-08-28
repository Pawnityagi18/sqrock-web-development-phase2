import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'proposal_received', 'proposal_accepted', 'proposal_declined',
      'milestone_funded', 'milestone_submitted', 'milestone_released',
      'new_message', 'contract_disputed', 'review_received'
    ],
    required: true
  },
  message: { type: String, required: true },
  link: { type: String }, // frontend route/hash the notification should navigate to, e.g. '/dashboard?tab=contracts'
  read: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
