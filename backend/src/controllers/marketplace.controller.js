const prisma = require('../config/prisma');
const { uploadImage } = require('../config/cloudinary');
const fs = require('fs');

const CATEGORIES = ['FURNITURE', 'ELECTRONICS', 'APPLIANCES', 'CLOTHING', 'BOOKS', 'SPORTS', 'MISCELLANEOUS'];

const aiCategorize = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();
  if (/sofa|chair|table|bed|wardrobe|shelf|desk|cabinet/.test(text)) return 'FURNITURE';
  if (/phone|laptop|tablet|camera|tv|monitor|speaker|headphone|computer/.test(text)) return 'ELECTRONICS';
  if (/fridge|microwave|washing|oven|mixer|blender|iron|cooler|fan|ac/.test(text)) return 'APPLIANCES';
  if (/shirt|pant|dress|shoes|bag|jacket|saree|kurta/.test(text)) return 'CLOTHING';
  if (/book|novel|textbook|magazine|comic/.test(text)) return 'BOOKS';
  if (/cycle|cricket|football|gym|treadmill|bat|ball|racket/.test(text)) return 'SPORTS';
  return 'MISCELLANEOUS';
};

const getAllItems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      status = 'AVAILABLE',
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      mine,
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orderByMap = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
    };

    const orderBy = orderByMap[sort] || orderByMap.newest;

    const where = {
      ...(status && { status }),
      ...(category && { category }),
      ...(mine === 'true' && { sellerId: req.user.id }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: Number(minPrice) }),
              ...(maxPrice && { lte: Number(maxPrice) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.marketplaceItem.findMany({
        where,
        include: { seller: { select: { id: true, name: true, flatNumber: true, phone: true } } },
        skip,
        take: Number(limit),
        orderBy,
      }),
      prisma.marketplaceItem.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { id: true, name: true, flatNumber: true, phone: true, email: true } } },
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { title, description, price, category, contactInfo } = req.body;

    let images = [];
    let uploadWarning = null;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const url = await uploadImage(file.path, 'sociosphere/marketplace');
          images.push(url);
        } catch (err) {
          // Gracefully handle image upload issues so users can still create listings.
          if (
            err.code === 'CLOUDINARY_NOT_CONFIGURED' ||
            err.message?.toLowerCase().includes('unknown api key')
          ) {
            uploadWarning = 'Listing created without images because Cloudinary is not configured.';
          } else {
            uploadWarning = 'Listing created, but one or more images failed to upload.';
          }
        } finally {
          fs.unlink(file.path, () => {});
        }
      }
    }

    const aiCategory = aiCategorize(title, description);

    const item = await prisma.marketplaceItem.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category: category || aiCategory,
        sellerId: req.user.id,
        images,
        aiCategory,
        contactInfo,
      },
      include: { seller: { select: { id: true, name: true, flatNumber: true } } },
    });

    const message = uploadWarning || 'Item listed successfully.';
    res.status(201).json({ success: true, message, data: item, warning: uploadWarning });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const { title, description, price, category, status, contactInfo } = req.body;

    const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (item.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await prisma.marketplaceItem.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(category && { category }),
        ...(status && { status }),
        ...(contactInfo !== undefined && { contactInfo }),
      },
    });

    res.json({ success: true, message: 'Item updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const item = await prisma.marketplaceItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    if (item.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await prisma.marketplaceItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Item removed.' });
  } catch (error) {
    next(error);
  }
};

const getMarketplaceStats = async (req, res, next) => {
  try {
    const [available, sold, reserved, byCategory] = await Promise.all([
      prisma.marketplaceItem.count({ where: { status: 'AVAILABLE' } }),
      prisma.marketplaceItem.count({ where: { status: 'SOLD' } }),
      prisma.marketplaceItem.count({ where: { status: 'RESERVED' } }),
      prisma.marketplaceItem.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),
    ]);

    res.json({ success: true, data: { available, sold, reserved, byCategory } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllItems, getItemById, createItem, updateItem, deleteItem, getMarketplaceStats };
