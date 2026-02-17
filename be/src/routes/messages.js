import { Router } from 'express';
import Message from '../models/Message.js';
import Opportunity from '../models/Opportunity.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/opportunities/:oppId/messages - Paginated messages
router.get('/opportunities/:oppId/messages', authenticate, async (req, res, next) => {
  try {
    const { oppId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;
    const before = req.query.before; // cursor: messageId

    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    if (!opportunity.isParticipant(req.user._id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const query = { opportunityId: oppId };
    if (before) {
      const cursorMsg = await Message.findById(before);
      if (cursorMsg) {
        query.createdAt = { $lt: cursorMsg.createdAt };
      }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('senderId', 'name email role initials')
      .lean();

    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    // Return in chronological order
    messages.reverse();

    res.json({ messages, hasMore });
  } catch (error) {
    next(error);
  }
});

// POST /api/opportunities/:oppId/messages - Send message (REST fallback)
router.post('/opportunities/:oppId/messages', authenticate, async (req, res, next) => {
  try {
    const { oppId } = req.params;
    const { content, type = 'text', file } = req.body;

    const opportunity = await Opportunity.findById(oppId);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    if (!opportunity.isParticipant(req.user._id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }
    if (opportunity.isReadOnly()) {
      return res.status(403).json({ error: 'Opportunity is read-only' });
    }

    const message = await Message.create({
      opportunityId: oppId,
      senderId: req.user._id,
      type,
      content,
      file: file || undefined,
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email role');

    res.status(201).json({ message: populated });
  } catch (error) {
    next(error);
  }
});

// GET /api/opportunities/:oppId/export - Export chat as JSON
router.get('/opportunities/:oppId/export', authenticate, async (req, res, next) => {
  try {
    const { oppId } = req.params;

    const opportunity = await Opportunity.findById(oppId)
      .populate('participants.userId', 'name email role');
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    if (!opportunity.isParticipant(req.user._id)) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const messages = await Message.find({ opportunityId: oppId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email role')
      .lean();

    const exportData = {
      opportunity: {
        id: opportunity.opportunityId,
        name: opportunity.name,
        status: opportunity.status,
        participants: opportunity.participants.map((p) => ({
          name: p.userId.name,
          email: p.userId.email,
          role: p.userId.role,
        })),
      },
      messages: messages.map((m) => ({
        sender: m.senderId.name,
        senderEmail: m.senderId.email,
        type: m.type,
        content: m.content,
        file: m.file?.originalName || null,
        timestamp: m.createdAt,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: req.user.name,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="chat-export-${opportunity.opportunityId}.json"`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

export default router;
