import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'file', 'system'], default: 'text' },
  content: { type: String, default: '' },
  file: {
    originalName: String,
    storagePath: String,
    mimeType: String,
    size: Number,
    url: String,
    e3Response: mongoose.Schema.Types.Mixed,
  },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  status: {
    sent: { type: Date, default: Date.now },
    delivered: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    }],
    read: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    }],
  },
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ opportunityId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);
