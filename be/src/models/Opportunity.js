import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const opportunitySchema = new mongoose.Schema({
  opportunityId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'closed', 'archived'], default: 'active' },
  participants: [participantSchema],
  closedAt: { type: Date, default: null },
  metadata: {
    externalRef: { type: String, default: null },
    policyId: { type: String, default: null },
  },
}, { timestamps: true });

opportunitySchema.index({ 'participants.userId': 1 });
opportunitySchema.index({ status: 1 });

opportunitySchema.methods.isParticipant = function (userId) {
  return this.participants.some((p) => {
    const id = p.userId._id || p.userId;
    return id.toString() === userId.toString();
  });
};

opportunitySchema.methods.isReadOnly = function () {
  return this.status !== 'active';
};

export default mongoose.model('Opportunity', opportunitySchema);
