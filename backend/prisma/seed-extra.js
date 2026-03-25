require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const residentSeed = [
  ['Ananya Mehta', 'ananya@example.com', 'A-103', '+91-9876500010'],
  ['Rohan Desai', 'rohan@example.com', 'A-104', '+91-9876500011'],
  ['Neha Joshi', 'neha@example.com', 'A-105', '+91-9876500012'],
  ['Arjun Nair', 'arjun@example.com', 'B-103', '+91-9876500013'],
  ['Kavya Iyer', 'kavya@example.com', 'B-104', '+91-9876500014'],
  ['Siddharth Rao', 'sid@example.com', 'B-105', '+91-9876500015'],
  ['Pooja Verma', 'pooja@example.com', 'C-203', '+91-9876500016'],
  ['Manish Gupta', 'manish@example.com', 'C-204', '+91-9876500017'],
  ['Aisha Khan', 'aisha@example.com', 'C-205', '+91-9876500018'],
  ['Nitin Arora', 'nitin@example.com', 'D-302', '+91-9876500019'],
  ['Meera Kulkarni', 'meera@example.com', 'D-303', '+91-9876500020'],
  ['Dev Malhotra', 'dev@example.com', 'D-304', '+91-9876500021'],
  ['Isha Chawla', 'isha@example.com', 'E-401', '+91-9876500022'],
  ['Harsh Bansal', 'harsh@example.com', 'E-402', '+91-9876500023'],
  ['Tanvi Agarwal', 'tanvi@example.com', 'E-403', '+91-9876500024'],
];

const itemTemplates = [
  ['Dining Table Set 6-Seater', 'FURNITURE', 14500],
  ['LG Microwave 28L', 'APPLIANCES', 5200],
  ['OnePlus Nord CE', 'ELECTRONICS', 8900],
  ['Office Chair Ergonomic', 'FURNITURE', 3500],
  ['Treadmill Foldable', 'SPORTS', 12000],
  ['Bookshelf 5 Tier', 'FURNITURE', 2100],
  ['Study Lamp LED', 'ELECTRONICS', 900],
  ['Cricket Kit Full', 'SPORTS', 2600],
  ['Air Cooler Symphony', 'APPLIANCES', 4800],
  ['Instant Pot 6L', 'APPLIANCES', 3700],
  ['Kids Bicycle 20 inch', 'SPORTS', 3200],
  ['Novel Collection 25 Books', 'BOOKS', 1500],
  ['Mixer Grinder Philips', 'APPLIANCES', 2400],
  ['iPad 9th Gen 64GB', 'ELECTRONICS', 18500],
  ['Bean Bag XL', 'FURNITURE', 1700],
  ['Winter Jacket Set', 'CLOTHING', 1300],
  ['Sony Soundbar', 'ELECTRONICS', 7200],
  ['Ceiling Fan Havells', 'APPLIANCES', 2100],
  ['Coffee Table Oak', 'FURNITURE', 2800],
  ['Badminton Racket Pair', 'SPORTS', 1400],
  ['Shoes Nike UK9', 'CLOTHING', 2200],
  ['Books for UPSC Prep', 'BOOKS', 3200],
  ['Wardrobe 3 Door', 'FURNITURE', 9000],
  ['Smart Watch Fitbit', 'ELECTRONICS', 5600],
  ['Refrigerator 190L', 'APPLIANCES', 9800],
  ['Helmet LS2', 'SPORTS', 1800],
  ['Kurta Set (New)', 'CLOTHING', 1100],
  ['Canon DSLR 1500D', 'ELECTRONICS', 21000],
  ['Vacuum Cleaner', 'APPLIANCES', 3000],
  ['Sofa 3 Seater', 'FURNITURE', 12500],
];

async function main() {
  const hash = await bcrypt.hash('resident123', 12);

  const users = [];
  for (const [name, email, flat, phone] of residentSeed) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, flatNumber: flat, phone, isActive: true },
      create: { name, email, password: hash, role: 'RESIDENT', flatNumber: flat, phone, isActive: true },
      select: { id: true, name: true, email: true, flatNumber: true, phone: true },
    });
    users.push(user);
  }

  let created = 0;
  for (let i = 0; i < itemTemplates.length; i++) {
    const [baseTitle, category, price] = itemTemplates[i];
    const seller = users[i % users.length];
    const title = `${baseTitle} • ${seller.flatNumber}`;

    const exists = await prisma.marketplaceItem.findFirst({
      where: { title, sellerId: seller.id },
      select: { id: true },
    });

    if (!exists) {
      await prisma.marketplaceItem.create({
        data: {
          title,
          description: `${baseTitle} in good condition. Available for quick pickup from ${seller.flatNumber}.`,
          price,
          category,
          status: i % 11 === 0 ? 'RESERVED' : i % 17 === 0 ? 'SOLD' : 'AVAILABLE',
          sellerId: seller.id,
          aiCategory: category,
          contactInfo: seller.phone,
          images: [],
        },
      });
      created += 1;
    }
  }

  console.log(`Residents upserted: ${users.length}`);
  console.log(`Marketplace listings inserted: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
