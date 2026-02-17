import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Message from '../models/Message.js';
import logger from '../utils/logger.js';

const users = [
  { ssoId: 'broker-001', email: 'sarah.chen@brokerco.com', name: 'Sarah Chen', role: 'broker' },
  { ssoId: 'broker-002', email: 'james.wilson@brokerco.com', name: 'James Wilson', role: 'broker' },
  { ssoId: 'broker-003', email: 'lisa.park@brokerco.com', name: 'Lisa Park', role: 'broker' },
  { ssoId: 'underwriter-001', email: 'maria.garcia@insureco.com', name: 'Maria Garcia', role: 'underwriter' },
  { ssoId: 'underwriter-002', email: 'david.kim@insureco.com', name: 'David Kim', role: 'underwriter' },
  { ssoId: 'underwriter-003', email: 'emily.ross@insureco.com', name: 'Emily Ross', role: 'underwriter' },
];

export async function seed() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      logger.info('Database already seeded, skipping...');
      return;
    }

    logger.info('Seeding database...');

    // Insert users
    const createdUsers = await User.insertMany(users);
    const userMap = {};
    createdUsers.forEach((u) => { userMap[u.ssoId] = u; });

    // Insert opportunities
    const opportunities = [
      {
        opportunityId: 'OPP-2024-001',
        name: 'Acme Corp Health Plan',
        status: 'active',
        participants: [
          { userId: userMap['broker-001']._id, role: 'broker' },
          { userId: userMap['underwriter-001']._id, role: 'underwriter' },
        ],
      },
      {
        opportunityId: 'OPP-2024-002',
        name: 'TechStart Benefits Package',
        status: 'active',
        participants: [
          { userId: userMap['broker-002']._id, role: 'broker' },
          { userId: userMap['underwriter-001']._id, role: 'underwriter' },
        ],
      },
      {
        opportunityId: 'OPP-2024-003',
        name: 'GlobalRetail Group Coverage',
        status: 'active',
        participants: [
          { userId: userMap['broker-003']._id, role: 'broker' },
          { userId: userMap['underwriter-002']._id, role: 'underwriter' },
        ],
      },
      {
        opportunityId: 'OPP-2024-004',
        name: 'Heritage Manufacturing Plan',
        status: 'closed',
        closedAt: new Date('2025-12-15'),
        participants: [
          { userId: userMap['broker-001']._id, role: 'broker' },
          { userId: userMap['underwriter-003']._id, role: 'underwriter' },
        ],
      },
    ];

    const createdOpps = await Opportunity.insertMany(opportunities);
    const oppMap = {};
    createdOpps.forEach((o) => { oppMap[o.opportunityId] = o; });

    // Insert sample messages
    const now = new Date();
    const hour = 3600000;
    const messages = [
      // Acme Corp conversation (broker-001 Sarah + underwriter-001 Maria)
      {
        opportunityId: oppMap['OPP-2024-001']._id,
        senderId: userMap['broker-001']._id,
        type: 'text',
        content: 'I am messaging regarding Acme Corp Health Plan. Did you see my note about the census change? We need to discuss this in further detail. Thanks.',
        status: { sent: new Date(now - 4 * hour), delivered: [{ userId: userMap['underwriter-001']._id, timestamp: new Date(now - 3.9 * hour) }], read: [{ userId: userMap['underwriter-001']._id, timestamp: new Date(now - 3.5 * hour) }] },
        createdAt: new Date(now - 4 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-001']._id,
        senderId: userMap['underwriter-001']._id,
        type: 'text',
        content: 'Hi. Yes I did see. Thank you for the reminder. Please see the file that I attached to review my updates regarding the census change. Please let me know if you have any further questions.',
        status: { sent: new Date(now - 3 * hour), delivered: [{ userId: userMap['broker-001']._id, timestamp: new Date(now - 2.9 * hour) }], read: [{ userId: userMap['broker-001']._id, timestamp: new Date(now - 2.5 * hour) }] },
        createdAt: new Date(now - 3 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-001']._id,
        senderId: userMap['underwriter-001']._id,
        type: 'file',
        content: '',
        file: { originalName: 'Census_Update_Q1.pdf', storagePath: 'OPP-2024-001/census-update-q1.pdf', mimeType: 'application/pdf', size: 245000 },
        status: { sent: new Date(now - 2.95 * hour), delivered: [{ userId: userMap['broker-001']._id, timestamp: new Date(now - 2.9 * hour) }], read: [] },
        createdAt: new Date(now - 2.95 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-001']._id,
        senderId: userMap['broker-001']._id,
        type: 'text',
        content: 'Got it, reviewing now. The numbers look good but we may need to adjust the rates for the dependents. Can you run that analysis?',
        status: { sent: new Date(now - 2 * hour), delivered: [], read: [] },
        createdAt: new Date(now - 2 * hour),
      },

      // TechStart conversation (broker-002 James + underwriter-001 Maria)
      {
        opportunityId: oppMap['OPP-2024-002']._id,
        senderId: userMap['broker-002']._id,
        type: 'text',
        content: 'Hi Maria, TechStart is looking to expand their benefits package. They want to add dental and vision coverage for their 150 employees.',
        status: { sent: new Date(now - 24 * hour), delivered: [{ userId: userMap['underwriter-001']._id, timestamp: new Date(now - 23 * hour) }], read: [{ userId: userMap['underwriter-001']._id, timestamp: new Date(now - 22 * hour) }] },
        createdAt: new Date(now - 24 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-002']._id,
        senderId: userMap['underwriter-001']._id,
        type: 'text',
        content: 'Thanks for the update, James. I will prepare the preliminary quotes for dental and vision plans. Can you confirm the effective date they are targeting?',
        status: { sent: new Date(now - 20 * hour), delivered: [{ userId: userMap['broker-002']._id, timestamp: new Date(now - 19 * hour) }], read: [] },
        createdAt: new Date(now - 20 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-002']._id,
        senderId: userMap['broker-002']._id,
        type: 'text',
        content: 'The client is targeting April 1st for the effective date. We need quotes ready by mid-February so they can review before the board meeting.',
        status: { sent: new Date(now - 18 * hour), delivered: [], read: [] },
        createdAt: new Date(now - 18 * hour),
      },

      // GlobalRetail conversation (broker-003 Lisa + underwriter-002 David)
      {
        opportunityId: oppMap['OPP-2024-003']._id,
        senderId: userMap['broker-003']._id,
        type: 'text',
        content: 'GlobalRetail has 500+ employees across 12 locations. They need a comprehensive group health plan with multi-state compliance.',
        status: { sent: new Date(now - 48 * hour), delivered: [{ userId: userMap['underwriter-002']._id, timestamp: new Date(now - 47 * hour) }], read: [{ userId: userMap['underwriter-002']._id, timestamp: new Date(now - 46 * hour) }] },
        createdAt: new Date(now - 48 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-003']._id,
        senderId: userMap['underwriter-002']._id,
        type: 'text',
        content: 'Multi-state compliance adds complexity. I will need the census data broken down by state. Can you request that from the client?',
        status: { sent: new Date(now - 44 * hour), delivered: [{ userId: userMap['broker-003']._id, timestamp: new Date(now - 43 * hour) }], read: [{ userId: userMap['broker-003']._id, timestamp: new Date(now - 42 * hour) }] },
        createdAt: new Date(now - 44 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-003']._id,
        senderId: userMap['broker-003']._id,
        type: 'text',
        content: 'Sure, I will request the state-by-state breakdown from GlobalRetail and get back to you this week.',
        status: { sent: new Date(now - 40 * hour), delivered: [], read: [] },
        createdAt: new Date(now - 40 * hour),
      },

      // Heritage Manufacturing (closed) conversation (broker-001 Sarah + underwriter-003 Emily)
      {
        opportunityId: oppMap['OPP-2024-004']._id,
        senderId: userMap['broker-001']._id,
        type: 'text',
        content: 'Heritage Manufacturing plan has been finalized and implemented. Great work on this one!',
        status: { sent: new Date(now - 720 * hour), delivered: [{ userId: userMap['underwriter-003']._id, timestamp: new Date(now - 719 * hour) }], read: [{ userId: userMap['underwriter-003']._id, timestamp: new Date(now - 718 * hour) }] },
        createdAt: new Date(now - 720 * hour),
      },
      {
        opportunityId: oppMap['OPP-2024-004']._id,
        senderId: userMap['underwriter-003']._id,
        type: 'text',
        content: 'Thank you, Sarah. The implementation went smoothly. Closing this conversation as the opportunity is now live.',
        status: { sent: new Date(now - 718 * hour), delivered: [{ userId: userMap['broker-001']._id, timestamp: new Date(now - 717 * hour) }], read: [{ userId: userMap['broker-001']._id, timestamp: new Date(now - 716 * hour) }] },
        createdAt: new Date(now - 718 * hour),
      },
    ];

    await Message.insertMany(messages);

    logger.info(`Seeded: ${createdUsers.length} users, ${createdOpps.length} opportunities, ${messages.length} messages`);
  } catch (error) {
    logger.error('Seed failed:', error.message);
    throw error;
  }
}

// Run directly
if (process.argv[1] && process.argv[1].includes('seedData')) {
  await connectDB();
  await seed();
  await mongoose.disconnect();
  logger.info('Seed complete, disconnected');
}
