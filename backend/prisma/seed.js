require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SocioSphere database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sociosphere.com' },
    update: {},
    create: {
      name: 'Society Admin',
      email: 'admin@sociosphere.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91-9876543210',
      flatNumber: 'A-001',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create Residents
  const residentsData = [
    { name: 'Rahul Sharma', email: 'rahul@example.com', flat: 'B-101', phone: '+91-9876500001' },
    { name: 'Priya Patel', email: 'priya@example.com', flat: 'B-102', phone: '+91-9876500002' },
    { name: 'Amit Kumar', email: 'amit@example.com', flat: 'C-201', phone: '+91-9876500003' },
    { name: 'Sneha Reddy', email: 'sneha@example.com', flat: 'C-202', phone: '+91-9876500004' },
    { name: 'Vikram Singh', email: 'vikram@example.com', flat: 'D-301', phone: '+91-9876500005' },
  ];

  const residentPassword = await bcrypt.hash('resident123', 12);
  const residents = [];
  for (const r of residentsData) {
    const resident = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { name: r.name, email: r.email, password: residentPassword, role: 'RESIDENT', flatNumber: r.flat, phone: r.phone },
    });
    residents.push(resident);
  }
  console.log(`✅ ${residents.length} residents created`);

  // Create Parking Slots
  const slots = [];
  for (let i = 1; i <= 30; i++) {
    const slot = await prisma.parkingSlot.upsert({
      where: { slotNumber: `P-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        slotNumber: `P-${String(i).padStart(3, '0')}`,
        slotType: i <= 25 ? 'RESIDENT' : 'VISITOR',
        floor: `B${Math.ceil(i / 10)}`,
        block: i <= 15 ? 'A' : 'B',
      },
    });
    slots.push(slot);
  }
  console.log(`✅ ${slots.length} parking slots created`);

  // Add Vehicles & Assign Slots
  for (let i = 0; i < Math.min(3, residents.length); i++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId: residents[i].id,
        licensePlate: `MH01AB${1000 + i}`,
        vehicleType: 'Car',
        brand: ['Maruti', 'Hyundai', 'Honda'][i],
        model: ['Swift', 'Creta', 'City'][i],
        color: ['White', 'Silver', 'Red'][i],
      },
    });

    await prisma.parkingAssignment.create({
      data: { slotId: slots[i].id, userId: residents[i].id, vehicleId: vehicle.id, isActive: true },
    });
    await prisma.parkingSlot.update({ where: { id: slots[i].id }, data: { status: 'OCCUPIED' } });
  }
  console.log('✅ Vehicles and parking assignments created');

  // Create Polls
  const poll1 = await prisma.poll.create({
    data: {
      title: 'Should we increase monthly maintenance fees?',
      description: 'The current maintenance fee is ₹2,500/month. We propose increasing it to ₹3,000/month for better amenities.',
      createdBy: admin.id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      options: {
        create: [
          { text: 'Yes, increase to ₹3,000/month' },
          { text: 'No, keep it at ₹2,500/month' },
          { text: 'Increase to ₹2,750/month as a compromise' },
        ],
      },
    },
    include: { options: true },
  });

  const poll2 = await prisma.poll.create({
    data: {
      title: 'Approve new visitor parking rules?',
      description: 'Proposal: Visitors can park for a maximum of 4 hours between 8am-10pm.',
      createdBy: admin.id,
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      options: {
        create: [{ text: 'Yes, approve the new rules' }, { text: 'No, keep existing rules' }],
      },
    },
    include: { options: true },
  });

  // Add some votes
  await prisma.vote.create({ data: { pollId: poll1.id, optionId: poll1.options[0].id, userId: residents[0].id } });
  await prisma.vote.create({ data: { pollId: poll1.id, optionId: poll1.options[2].id, userId: residents[1].id } });
  await prisma.vote.create({ data: { pollId: poll2.id, optionId: poll2.options[0].id, userId: residents[0].id } });
  console.log('✅ Polls and votes created');

  // Create Marketplace Items
  const marketItems = [
    { title: 'Samsung 32" LED TV', description: '2 year old Samsung LED TV in excellent condition. No scratches.', price: 8500, category: 'ELECTRONICS', sellerId: residents[0].id, contactInfo: '+91-9876500001' },
    { title: 'Wooden Study Table', description: 'Solid wood study table with 2 drawers. Perfect condition.', price: 3200, category: 'FURNITURE', sellerId: residents[1].id, contactInfo: '+91-9876500002' },
    { title: 'IFB Washing Machine', description: '6.5kg fully automatic front load. 3 years old with AMC.', price: 15000, category: 'APPLIANCES', sellerId: residents[2].id, contactInfo: '+91-9876500003' },
    { title: 'Harry Potter Book Set (7 books)', description: 'Complete HP series in hardcover. Barely read, like new.', price: 1800, category: 'BOOKS', sellerId: residents[0].id, contactInfo: '+91-9876500001' },
    { title: 'Cycle - Hero Sprint', description: '21-speed mountain bike. 1 year old. Great condition.', price: 4500, category: 'SPORTS', sellerId: residents[3].id, contactInfo: '+91-9876500004', status: 'SOLD' },
  ];

  for (const item of marketItems) {
    await prisma.marketplaceItem.create({ data: item });
  }
  console.log(`✅ ${marketItems.length} marketplace items created`);

  // Create Welcome Notifications
  for (const resident of residents) {
    await prisma.notification.create({
      data: {
        userId: resident.id,
        title: 'Welcome to SocioSphere!',
        message: 'Welcome to your smart society management platform. Explore polls, marketplace, and more!',
        type: 'success',
      },
    });
  }
  console.log('✅ Welcome notifications sent');

  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin Login:    admin@sociosphere.com / admin123');
  console.log('Resident Login: rahul@example.com / resident123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
