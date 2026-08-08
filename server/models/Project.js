import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  budget: { type: Number, required: true },
  budgetType: { type: String, enum: ['Fixed Price', 'Hourly Rate'], default: 'Fixed Price' },
  postedTime: { type: String, default: 'Just now' },
  clientName: { type: String, required: true },
  clientCompany: { type: String },
  clientAvatar: { type: String },
  verifiedClient: { type: Boolean, default: true },
  proposalsCount: { type: Number, default: 0 },
  urgent: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  skills: [{ type: String }],
  description: { type: String, required: true },
  deliverables: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
