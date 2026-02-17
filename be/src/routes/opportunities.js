import { Router } from 'express';
import Opportunity from '../models/Opportunity.js';
import Message from '../models/Message.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/opportunities - List user's opportunities with last message + unread count
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const statusFilter = req.query.status;

    const query = { 'participants.userId': userId };
    if (statusFilter) query.status = statusFilter;

    const opportunities = await Opportunity.find(query)
      .populate('participants.userId', 'name email role isOnline lastSeen')
      .lean();

    // For each opportunity, get last message and unread count
    const result = await Promise.all(opportunities.map(async (opp) => {
      const lastMessage = await Message.findOne({ opportunityId: opp._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'name role')
        .lean();

      const unreadCount = await Message.countDocuments({
        opportunityId: opp._id,
        senderId: { $ne: userId },
        'status.read.userId': { $ne: userId },
      });

      return { ...opp, lastMessage, unreadCount };
    }));

    // Sort by last message time (newest first)
    result.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.json({ opportunities: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/opportunities/:id - Get opportunity details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id)
      .populate('participants.userId', 'name email role isOnline lastSeen');

    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    if (!opportunity.isParticipant(req.user._id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    res.json({ opportunity });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/opportunities/:id - Update opportunity status
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    if (!opportunity.isParticipant(req.user._id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    opportunity.status = status;
    if (status === 'closed') opportunity.closedAt = new Date();
    await opportunity.save();

    res.json({ opportunity });
  } catch (error) {
    next(error);
  }
});

export default router;
