const prisma = require('../config/prisma');

const generatePollSummary = (poll, options) => {
  const totalVotes = options.reduce((sum, o) => sum + o._count.votes, 0);
  if (totalVotes === 0) return 'No votes have been cast yet.';

  const sorted = [...options].sort((a, b) => b._count.votes - a._count.votes);
  const winner = sorted[0];
  const winnerPercent = ((winner._count.votes / totalVotes) * 100).toFixed(1);

  return `Poll "${poll.title}" received ${totalVotes} votes. The leading option is "${winner.text}" with ${winnerPercent}% of votes (${winner._count.votes} votes). ${
    totalVotes > 10 ? 'Strong community engagement!' : 'Moderate participation observed.'
  }`;
};

const getAllPolls = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = status ? { status } : {};

    const [polls, total] = await Promise.all([
      prisma.poll.findMany({
        where,
        include: {
          creator: { select: { name: true } },
          options: {
            include: { _count: { select: { votes: true } } },
          },
          _count: { select: { votes: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.poll.count({ where }),
    ]);

    // Auto-expire polls
    const now = new Date();
    const expiredIds = polls
      .filter((p) => p.expiresAt && new Date(p.expiresAt) < now && p.status === 'ACTIVE')
      .map((p) => p.id);

    if (expiredIds.length > 0) {
      await prisma.poll.updateMany({ where: { id: { in: expiredIds } }, data: { status: 'EXPIRED' } });
    }

    const userVotes = req.user
      ? await prisma.vote.findMany({
          where: { userId: req.user.id, pollId: { in: polls.map((p) => p.id) } },
        })
      : [];

    const userVoteMap = Object.fromEntries(userVotes.map((v) => [v.pollId, v.optionId]));

    res.json({
      success: true,
      data: polls.map((p) => ({ ...p, userVotedOptionId: userVoteMap[p.id] || null })),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getPollById = async (req, res, next) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { name: true } },
        options: { include: { _count: { select: { votes: true } } } },
        _count: { select: { votes: true } },
      },
    });
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found.' });

    let userVotedOptionId = null;
    if (req.user) {
      const vote = await prisma.vote.findUnique({ where: { pollId_userId: { pollId: poll.id, userId: req.user.id } } });
      userVotedOptionId = vote?.optionId || null;
    }

    res.json({ success: true, data: { ...poll, userVotedOptionId } });
  } catch (error) {
    next(error);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const { title, description, options, expiresAt } = req.body;

    if (!options || options.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 options required.' });
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        createdBy: req.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        options: { create: options.map((text) => ({ text })) },
      },
      include: { options: true },
    });

    res.status(201).json({ success: true, message: 'Poll created.', data: poll });
  } catch (error) {
    next(error);
  }
};

const castVote = async (req, res, next) => {
  try {
    const { optionId } = req.body;
    const { id: pollId } = req.params;

    const poll = await prisma.poll.findUnique({ where: { id: pollId }, include: { options: true } });
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found.' });
    if (poll.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'Poll is not active.' });
    if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
      await prisma.poll.update({ where: { id: pollId }, data: { status: 'EXPIRED' } });
      return res.status(400).json({ success: false, message: 'Poll has expired.' });
    }

    const optionBelongsToPoll = poll.options.some((o) => o.id === optionId);
    if (!optionBelongsToPoll) return res.status(400).json({ success: false, message: 'Invalid option.' });

    const existingVote = await prisma.vote.findUnique({
      where: { pollId_userId: { pollId, userId: req.user.id } },
    });
    if (existingVote) return res.status(409).json({ success: false, message: 'You have already voted.' });

    await prisma.vote.create({ data: { pollId, optionId, userId: req.user.id } });

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { include: { _count: { select: { votes: true } } } }, _count: { select: { votes: true } } },
    });

    res.json({ success: true, message: 'Vote cast successfully.', data: updatedPoll });
  } catch (error) {
    next(error);
  }
};

const closePoll = async (req, res, next) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id },
      include: { options: { include: { _count: { select: { votes: true } } } } },
    });
    if (!poll) return res.status(404).json({ success: false, message: 'Poll not found.' });

    const summary = generatePollSummary(poll, poll.options);

    const updated = await prisma.poll.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED', aiSummary: summary },
    });

    res.json({ success: true, message: 'Poll closed.', data: updated });
  } catch (error) {
    next(error);
  }
};

const deletePoll = async (req, res, next) => {
  try {
    await prisma.poll.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Poll deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllPolls, getPollById, createPoll, castVote, closePoll, deletePoll };
