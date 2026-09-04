import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Keep the category id as well as its display name. The UI filters by the id,
  // while the name makes an API project immediately presentable in a job card.
  category: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  budget: { type: Number, required: true },
  budgetType: { type: String, enum: ['Fixed', 'Hourly'], default: 'Fixed' },
  experience: { type: String },
  location: { type: String, default: 'Remote' },
  isRemote: { type: Boolean, default: true },
  duration: { type: String, default: '1-3 months' },
  deadline: { type: String },
  daysLeft: { type: Number },
  urgency: { type: String, enum: ['Featured', 'Urgent', 'Hot', 'Standard'], default: 'Standard' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
