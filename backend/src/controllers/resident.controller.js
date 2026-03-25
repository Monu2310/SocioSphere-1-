const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

const getAllResidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      role: 'RESIDENT',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { flatNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [residents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, flatNumber: true,
          phone: true, isActive: true, createdAt: true,
          vehicles: { select: { id: true, licensePlate: true, vehicleType: true } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: residents,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getResidentById = async (req, res, next) => {
  try {
    const resident = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, role: true,
        flatNumber: true, phone: true, avatar: true, isActive: true, createdAt: true,
        vehicles: true,
        parkingAssignments: {
          where: { isActive: true },
          include: { slot: true, vehicle: true },
        },
      },
    });
    if (!resident) return res.status(404).json({ success: false, message: 'Resident not found.' });
    res.json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
};

const createResident = async (req, res, next) => {
  try {
    const { name, email, password, flatNumber, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password || 'Resident@123', 12);

    const resident = await prisma.user.create({
      data: { name, email, password: hashed, flatNumber, phone, role: 'RESIDENT' },
      select: { id: true, name: true, email: true, flatNumber: true, phone: true, createdAt: true },
    });

    res.status(201).json({ success: true, message: 'Resident added successfully.', data: resident });
  } catch (error) {
    next(error);
  }
};

const updateResident = async (req, res, next) => {
  try {
    const { name, phone, flatNumber, isActive } = req.body;

    const resident = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, phone, flatNumber, isActive },
      select: { id: true, name: true, email: true, flatNumber: true, phone: true, isActive: true },
    });

    res.json({ success: true, message: 'Resident updated successfully.', data: resident });
  } catch (error) {
    next(error);
  }
};

const deleteResident = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Resident removed successfully.' });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalResidents, activeResidents, totalSlots, occupiedSlots, activePolls, marketplaceItems] =
      await Promise.all([
        prisma.user.count({ where: { role: 'RESIDENT' } }),
        prisma.user.count({ where: { role: 'RESIDENT', isActive: true } }),
        prisma.parkingSlot.count(),
        prisma.parkingSlot.count({ where: { status: 'OCCUPIED' } }),
        prisma.poll.count({ where: { status: 'ACTIVE' } }),
        prisma.marketplaceItem.count({ where: { status: 'AVAILABLE' } }),
      ]);

    const recentActivity = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, flatNumber: true } } },
    });

    res.json({
      success: true,
      data: {
        residents: { total: totalResidents, active: activeResidents, inactive: totalResidents - activeResidents },
        parking: { total: totalSlots, occupied: occupiedSlots, available: totalSlots - occupiedSlots },
        polls: { active: activePolls },
        marketplace: { activeListings: marketplaceItems },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllResidents, getResidentById, createResident, updateResident, deleteResident, getDashboardStats };
