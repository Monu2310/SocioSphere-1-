const prisma = require('../config/prisma');

const getAllSlots = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const where = {
      ...(status && { status }),
      ...(type && { slotType: type }),
    };

    const slots = await prisma.parkingSlot.findMany({
      where,
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, name: true, flatNumber: true } },
            vehicle: true,
          },
        },
      },
      orderBy: { slotNumber: 'asc' },
    });

    res.json({ success: true, data: slots });
  } catch (error) {
    next(error);
  }
};

const createSlot = async (req, res, next) => {
  try {
    const { slotNumber, slotType, floor, block } = req.body;
    const slot = await prisma.parkingSlot.create({ data: { slotNumber, slotType, floor, block } });
    res.status(201).json({ success: true, message: 'Parking slot created.', data: slot });
  } catch (error) {
    next(error);
  }
};

const createMultipleSlots = async (req, res, next) => {
  try {
    const { prefix, count, slotType, floor, block } = req.body;
    const slots = Array.from({ length: count }, (_, i) => ({
      slotNumber: `${prefix}${String(i + 1).padStart(3, '0')}`,
      slotType: slotType || 'RESIDENT',
      floor: floor || null,
      block: block || null,
    }));

    await prisma.parkingSlot.createMany({ data: slots, skipDuplicates: true });
    res.status(201).json({ success: true, message: `${count} parking slots created.` });
  } catch (error) {
    next(error);
  }
};

const assignSlot = async (req, res, next) => {
  try {
    const { userId, vehicleId, expiresAt } = req.body;
    const { slotId } = req.params;

    const slot = await prisma.parkingSlot.findUnique({ where: { id: slotId } });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    if (slot.status === 'OCCUPIED') return res.status(400).json({ success: false, message: 'Slot is already occupied.' });

    const [assignment] = await prisma.$transaction([
      prisma.parkingAssignment.create({
        data: { slotId, userId, vehicleId: vehicleId || null, expiresAt: expiresAt ? new Date(expiresAt) : null },
        include: { slot: true, user: { select: { name: true, flatNumber: true } }, vehicle: true },
      }),
      prisma.parkingSlot.update({ where: { id: slotId }, data: { status: 'OCCUPIED' } }),
    ]);

    res.status(201).json({ success: true, message: 'Slot assigned.', data: assignment });
  } catch (error) {
    next(error);
  }
};

const releaseSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    await prisma.$transaction([
      prisma.parkingAssignment.updateMany({ where: { slotId, isActive: true }, data: { isActive: false } }),
      prisma.parkingSlot.update({ where: { id: slotId }, data: { status: 'AVAILABLE' } }),
    ]);

    res.json({ success: true, message: 'Slot released.' });
  } catch (error) {
    next(error);
  }
};

const deleteSlot = async (req, res, next) => {
  try {
    await prisma.parkingSlot.delete({ where: { id: req.params.slotId } });
    res.json({ success: true, message: 'Parking slot deleted.' });
  } catch (error) {
    next(error);
  }
};

const getParkingStats = async (req, res, next) => {
  try {
    const [total, occupied, residentSlots, visitorSlots, visitorOccupied] = await Promise.all([
      prisma.parkingSlot.count(),
      prisma.parkingSlot.count({ where: { status: 'OCCUPIED' } }),
      prisma.parkingSlot.count({ where: { slotType: 'RESIDENT' } }),
      prisma.parkingSlot.count({ where: { slotType: 'VISITOR' } }),
      prisma.parkingSlot.count({ where: { slotType: 'VISITOR', status: 'OCCUPIED' } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        occupied,
        available: total - occupied,
        utilizationRate: total > 0 ? ((occupied / total) * 100).toFixed(1) : 0,
        resident: { total: residentSlots, occupied: occupied - visitorOccupied },
        visitor: { total: visitorSlots, occupied: visitorOccupied, available: visitorSlots - visitorOccupied },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Vehicle management
const addVehicle = async (req, res, next) => {
  try {
    const { licensePlate, vehicleType, brand, model, color } = req.body;
    const userId = req.user.id;

    const vehicle = await prisma.vehicle.create({
      data: { userId, licensePlate, vehicleType, brand, model, color },
    });

    res.status(201).json({ success: true, message: 'Vehicle registered.', data: vehicle });
  } catch (error) {
    next(error);
  }
};

const removeVehicle = async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.vehicleId } });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    if (vehicle.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await prisma.vehicle.delete({ where: { id: req.params.vehicleId } });
    res.json({ success: true, message: 'Vehicle removed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllSlots, createSlot, createMultipleSlots, assignSlot, releaseSlot, deleteSlot, getParkingStats, addVehicle, removeVehicle };
