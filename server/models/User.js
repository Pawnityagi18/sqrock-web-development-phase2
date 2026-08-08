import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['freelancer', 'client'], required: true },
  avatar: { type: String },
  title: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  hourlyRate: { type: Number },
  jobSuccessRate: { type: Number, default: 100 },
  skills: [{ type: String }],
  bio: { type: String }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
