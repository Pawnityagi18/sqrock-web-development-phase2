import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['freelancer', 'client', 'admin'], required: true },
  avatar: { type: String },
  title: { type: String },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  hourlyRate: { type: Number },
  jobSuccessRate: { type: Number, default: 100 },
  skills: [{ type: String }],
  bio: { type: String },
  razorpayAccountId: { type: String }, // Route Linked Account id (acc_...) for freelancer payouts
  razorpayOnboardingComplete: { type: Boolean, default: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
