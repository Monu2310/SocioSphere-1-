const prisma = require('../config/prisma');

const pickFirst = (list) => list.find(Boolean) || null;

const getResidentAssistant = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    const text = question.toLowerCase();
    const responses = [
      {
        match: ['parking', 'slot', 'vehicle'],
        answer: 'Parking updates are available in the Parking section. You can view assigned slots, request changes, and track visitor slots there.',
        links: ['/parking'],
      },
      {
        match: ['poll', 'vote'],
        answer: 'You can vote on active polls and track results in the Polls section. We send reminders before polls close.',
        links: ['/polls'],
      },
      {
        match: ['marketplace', 'sell', 'buy', 'listing'],
        answer: 'Marketplace lets residents buy and sell items securely. You can browse or create listings from the Marketplace page.',
        links: ['/marketplace'],
      },
      {
        match: ['notice', 'announcement', 'notification', 'alert'],
        answer: 'All official updates are available under Notifications. Unread items are highlighted for quick access.',
        links: ['/notifications'],
      },
      {
        match: ['profile', 'account', 'password'],
        answer: 'You can update your profile details and change your password from the Profile page.',
        links: ['/profile'],
      },
      {
        match: ['maintenance', 'leak', 'repair', 'electric', 'water'],
        answer: 'For maintenance issues, submit a complaint with clear details and photos if possible. We route it to the right team fast.',
        links: [],
      },
      {
        match: ['security', 'visitor', 'gate'],
        answer: 'Security and visitor management updates are handled by the committee. Use Notifications for official updates or contact security directly.',
        links: [],
      },
    ];

    const picked = pickFirst(
      responses.map((entry) => (entry.match.some((m) => text.includes(m)) ? entry : null)),
    );

    const answer = picked?.answer || 'I can help with parking, polls, marketplace, notifications, or profile updates. What do you need?';
    const links = picked?.links || [];

    res.json({ success: true, data: { answer, links } });
  } catch (error) {
    next(error);
  }
};

const getComplaintTriage = async (req, res, next) => {
  try {
    const { title = '', description = '' } = req.body;
    const text = `${title} ${description}`.toLowerCase();
    if (!text.trim()) {
      return res.status(400).json({ success: false, message: 'Complaint details are required.' });
    }

    const rules = [
      { match: ['fire', 'smoke', 'gas'], category: 'SAFETY', priority: 'HIGH' },
      { match: ['leak', 'water', 'sewage', 'drain'], category: 'PLUMBING', priority: 'HIGH' },
      { match: ['power', 'electric', 'short', 'voltage'], category: 'ELECTRICAL', priority: 'HIGH' },
      { match: ['security', 'guard', 'gate', 'visitor'], category: 'SECURITY', priority: 'MEDIUM' },
      { match: ['parking', 'slot', 'vehicle'], category: 'PARKING', priority: 'MEDIUM' },
      { match: ['noise', 'loud', 'party'], category: 'COMMUNITY', priority: 'LOW' },
      { match: ['clean', 'garbage', 'waste'], category: 'HOUSEKEEPING', priority: 'LOW' },
    ];

    const hit = pickFirst(rules.map((r) => (r.match.some((m) => text.includes(m)) ? r : null))) || {
      category: 'GENERAL',
      priority: 'LOW',
    };

    const recommendations = [];
    if (hit.category === 'PLUMBING') recommendations.push('Attach photos of the leak and mention exact location.');
    if (hit.category === 'ELECTRICAL') recommendations.push('Mention any sparks, smell, or flickering pattern.');
    if (hit.category === 'SECURITY') recommendations.push('Include time, gate entry, and guard name if possible.');
    if (hit.category === 'PARKING') recommendations.push('Include slot number and vehicle details.');

    res.json({
      success: true,
      data: {
        category: hit.category,
        priority: hit.priority,
        summary: `Classified as ${hit.category} with ${hit.priority} priority.`,
        recommendations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getNoticeDraft = async (req, res, next) => {
  try {
    const { title = '', points = [], audience = 'Residents' } = req.body;
    if (!title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const bulletList = Array.isArray(points)
      ? points.filter((p) => p && p.trim())
      : String(points).split('\n').map((p) => p.trim()).filter(Boolean);

    const body = [
      `Hello ${audience},`,
      '',
      `This is a quick update regarding: ${title}.`,
      ...(bulletList.length ? ['','Key details:', ...bulletList.map((p) => `• ${p}`)] : []),
      '',
      'Thanks for your attention.',
      'SocioSphere Committee',
    ].join('\n');

    res.json({ success: true, data: { subject: title, body } });
  } catch (error) {
    next(error);
  }
};

const getFollowups = async (req, res, next) => {
  try {
    const activePolls = await prisma.poll.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true },
    });

    if (activePolls.length === 0) {
      return res.json({ success: true, data: { pending: [] } });
    }

    const pollIds = activePolls.map((p) => p.id);
    const [votes, residents] = await Promise.all([
      prisma.vote.findMany({ where: { pollId: { in: pollIds } }, select: { pollId: true, userId: true } }),
      prisma.user.findMany({ where: { role: 'RESIDENT', isActive: true }, select: { id: true, name: true, flatNumber: true } }),
    ]);

    const votesByPoll = votes.reduce((acc, v) => {
      acc[v.pollId] = acc[v.pollId] || new Set();
      acc[v.pollId].add(v.userId);
      return acc;
    }, {});

    const pending = activePolls.map((poll) => {
      const voted = votesByPoll[poll.id] || new Set();
      const pendingResidents = residents.filter((r) => !voted.has(r.id)).slice(0, 10);
      return { pollId: poll.id, pollTitle: poll.title, pendingResidents };
    }).filter((p) => p.pendingResidents.length > 0);

    res.json({ success: true, data: { pending } });
  } catch (error) {
    next(error);
  }
};

const getMaintenanceForecast = async (req, res, next) => {
  try {
    const [parkingUtilization, marketplaceActive, recentPolls] = await Promise.all([
      prisma.parkingSlot.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.marketplaceItem.count({ where: { status: 'AVAILABLE' } }),
      prisma.poll.count({ where: { status: 'ACTIVE' } }),
    ]);

    const occupied = parkingUtilization.find((p) => p.status === 'OCCUPIED')?._count?.status || 0;
    const totalSlots = parkingUtilization.reduce((s, p) => s + p._count.status, 0);
    const utilization = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

    const riskScore = Math.min(90, Math.max(10, utilization + (marketplaceActive > 15 ? 10 : 0) + (recentPolls > 3 ? 5 : 0)));
    const signals = [];
    if (utilization > 80) signals.push('Parking utilization is above 80%');
    if (marketplaceActive > 15) signals.push('Marketplace activity is high (increased parcel volume)');
    if (recentPolls > 3) signals.push('Multiple active polls may increase committee workload');

    res.json({
      success: true,
      data: {
        riskScore,
        signals,
        actions: [
          'Schedule elevator and pump inspections this week.',
          'Review security staffing during peak hours.',
          'Audit parking allocation for visitor overflow.',
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPriorityQueue = async (req, res, next) => {
  try {
    const [activePolls, pollCounts, parkingUtilization] = await Promise.all([
      prisma.poll.findMany({ where: { status: 'ACTIVE' }, select: { id: true, title: true } }),
      prisma.poll.findMany({ where: { status: 'ACTIVE' }, include: { _count: { select: { votes: true } } } }),
      prisma.parkingSlot.groupBy({ by: ['status'], _count: { status: true } }),
    ]);

    const occupied = parkingUtilization.find((p) => p.status === 'OCCUPIED')?._count?.status || 0;
    const totalSlots = parkingUtilization.reduce((s, p) => s + p._count.status, 0);
    const utilization = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

    const priorities = [];
    if (utilization > 85) {
      priorities.push({ level: 'HIGH', title: 'Parking capacity nearing limits', detail: `Utilization at ${utilization}%.` });
    }

    pollCounts.forEach((poll) => {
      if (poll._count.votes < 5) {
        priorities.push({ level: 'MEDIUM', title: 'Low poll participation', detail: `"${poll.title}" has ${poll._count.votes} votes.` });
      }
    });

    if (activePolls.length > 3) {
      priorities.push({ level: 'MEDIUM', title: 'Multiple active polls', detail: `${activePolls.length} polls running in parallel.` });
    }

    res.json({ success: true, data: { priorities } });
  } catch (error) {
    next(error);
  }
};

const getInsights = async (req, res, next) => {
  try {
    const [
      totalResidents,
      activePolls,
      closedPolls,
      totalVotes,
      parkingUtilization,
      marketplaceActive,
      marketplaceSold,
      recentPolls,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'RESIDENT', isActive: true } }),
      prisma.poll.count({ where: { status: 'ACTIVE' } }),
      prisma.poll.count({ where: { status: 'CLOSED' } }),
      prisma.vote.count(),
      prisma.parkingSlot.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.marketplaceItem.count({ where: { status: 'AVAILABLE' } }),
      prisma.marketplaceItem.count({ where: { status: 'SOLD' } }),
      prisma.poll.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { votes: true } } },
      }),
    ]);

    const occupied = parkingUtilization.find((p) => p.status === 'OCCUPIED')?._count?.status || 0;
    const totalSlots = parkingUtilization.reduce((s, p) => s + p._count.status, 0);

    const insights = [];

    if (totalVotes > 0 && (activePolls + closedPolls) > 0) {
      const avgVotes = (totalVotes / (activePolls + closedPolls)).toFixed(1);
      insights.push(`Average community participation: ${avgVotes} votes per poll.`);
    }

    if (totalSlots > 0) {
      const rate = ((occupied / totalSlots) * 100).toFixed(0);
      insights.push(`Parking occupancy is at ${rate}% (${occupied}/${totalSlots} slots used).`);
    }

    if (marketplaceSold > 0) {
      insights.push(`${marketplaceSold} items have been successfully sold in the marketplace.`);
    }

    if (recentPolls.length > 0) {
      const topPoll = recentPolls.reduce((max, p) => (p._count.votes > max._count.votes ? p : max), recentPolls[0]);
      if (topPoll._count.votes > 0) {
        insights.push(`Most engaged recent poll: "${topPoll.title}" with ${topPoll._count.votes} votes.`);
      }
    }

    const marketplaceByCategory = await prisma.marketplaceItem.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 3,
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalResidents,
          activePolls,
          parkingOccupancy: totalSlots > 0 ? `${((occupied / totalSlots) * 100).toFixed(0)}%` : '0%',
          marketplaceListings: marketplaceActive,
        },
        insights,
        marketplaceTrends: marketplaceByCategory,
        pollActivity: recentPolls.map((p) => ({ title: p.title, votes: p._count.votes, status: p.status })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, role: true, flatNumber: true } } },
      }),
      prisma.activityLog.count(),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
  getActivityLogs,
  getResidentAssistant,
  getComplaintTriage,
  getNoticeDraft,
  getFollowups,
  getMaintenanceForecast,
  getPriorityQueue,
};
