import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
