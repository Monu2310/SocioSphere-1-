const prisma = require('../config/prisma');

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

module.exports = { getInsights, getActivityLogs };
