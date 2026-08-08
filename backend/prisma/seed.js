import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ROLES = [
  'ADMIN', 'PROCUREMENT_MANAGER', 'INVENTORY_PLANNER', 'WAREHOUSE_USER', 'SUPPLIER',
  'FINANCE_REVIEWER', 'EMPLOYEE', 'MANAGER', 'INSTRUCTOR', 'LEARNING_ADMIN', 'HR_PARTNER', 'BUSINESS_LEADER',
];

const DEMO_PASSWORD = 'Password123!';

// Helper for random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function main() {
  console.log('Starting large-scale data seed...');

  const org = await prisma.organization.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: { id: '00000000-0000-0000-0000-000000000001', name: 'Acme Global Enterprise L&D' },
  });

  const roleRecords = {};
  for (const name of ROLES) {
    roleRecords[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const demoUsers = [
    { name: 'Ana Admin', email: 'admin@demo.local', role: 'ADMIN' },
    { name: 'Priya Procurement', email: 'procurement@demo.local', role: 'PROCUREMENT_MANAGER' },
    { name: 'Ivan Planner', email: 'planner@demo.local', role: 'INVENTORY_PLANNER' },
    { name: 'Wesley Warehouse', email: 'warehouse@demo.local', role: 'WAREHOUSE_USER' },
    { name: 'Sam Supplier', email: 'supplier@demo.local', role: 'SUPPLIER' },
    { name: 'Fiona Finance', email: 'finance@demo.local', role: 'FINANCE_REVIEWER' },
    { name: 'Evan Employee', email: 'employee@demo.local', role: 'EMPLOYEE' },
    { name: 'Manny Manager', email: 'manager@demo.local', role: 'MANAGER' },
    { name: 'Ira Instructor', email: 'instructor@demo.local', role: 'INSTRUCTOR' },
    { name: 'Harry HR', email: 'hr@demo.local', role: 'HR_PARTNER' }
  ];

  const createdUsers = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        organizationId: org.id,
        roleId: roleRecords[u.role].id,
        status: 'ACTIVE',
        deletedAt: null,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        organizationId: org.id,
        roleId: roleRecords[u.role].id,
      },
    });
    createdUsers.push(user);
  }

  console.log('Seeding 3 Global Locations and Bins...');
  const locations = [
    { id: '00000000-0000-0000-0000-0000000000a1', name: 'Americas Hub', type: 'warehouse' },
    { id: '00000000-0000-0000-0000-0000000000a2', name: 'EMEA Hub', type: 'warehouse' },
    { id: '00000000-0000-0000-0000-0000000000a3', name: 'Digital Licenses', type: 'virtual' }
  ];
  const dbLocations = [];
  for (const loc of locations) {
    const l = await prisma.location.upsert({
      where: { id: loc.id },
      update: {},
      create: { ...loc, organizationId: org.id },
    });
    dbLocations.push(l);

    if (loc.type === 'warehouse') {
      for (let b = 1; b <= 3; b++) {
        await prisma.bin.upsert({
          where: { locationId_code: { locationId: l.id, code: `BIN-${b}` } },
          update: {},
          create: { locationId: l.id, code: `BIN-${b}` }
        });
      }
    }
  }

  console.log('Seeding 50 diverse items...');
  const prefixes = {
    'COURSE_LICENCE': 'LIC',
    'CONTENT_SUBSCRIPTION': 'SUB',
    'CERTIFICATION_VOUCHER': 'VCH',
    'TRAINING_MATERIAL': 'MAT',
    'DEVICE': 'DEV'
  };

  const itemNames = [
    'Advanced React Architecture', 'Python Data Science Masterclass', 'AWS Certified Solutions Architect',
    'Google Cloud Engineer', 'Kubernetes Security', 'Agile Scrum Master', 'PMP Exam Prep',
    'Enterprise Cyber Security', 'Leadership and Influence', 'Machine Learning Foundations'
  ];

  const dbItems = [];
  let itemCounter = 1;
  for (const cat of Object.keys(prefixes)) {
    for (let i = 0; i < 10; i++) {
      const sku = `${prefixes[cat]}-${1000 + itemCounter}`;
      const name = `${itemNames[i % itemNames.length]} (${cat.toLowerCase().replace('_', ' ')}) - Tier ${Math.floor(i/3)+1}`;
      
      const item = await prisma.item.upsert({
        where: { sku },
        update: {},
        create: {
          sku,
          name,
          category: cat,
          organizationId: org.id,
          unit: cat === 'DEVICE' ? 'piece' : 'license'
        },
      });
      dbItems.push(item);
      itemCounter++;
    }
  }

  console.log('Seeding stock balances, 24 months of demand history, and replenishment parameters...');
  const now = new Date();
  
  for (const item of dbItems) {
    // Distribute stock across locations
    for (const loc of dbLocations) {
      if ((item.category === 'DEVICE' || item.category === 'TRAINING_MATERIAL') && loc.type === 'virtual') continue;
      if ((item.category !== 'DEVICE' && item.category !== 'TRAINING_MATERIAL') && loc.type === 'warehouse') continue;

      const existingBalance = await prisma.stockBalance.findFirst({
        where: { itemId: item.id, locationId: loc.id, lotId: null },
      });
      if (!existingBalance) {
        await prisma.stockBalance.create({
          data: {
            itemId: item.id,
            locationId: loc.id,
            onHandQty: randomInt(0, 200),
            reservedQty: randomInt(0, 20),
          },
        });
      }
    }

    await prisma.replenishmentParameter.upsert({
      where: { itemId: item.id },
      update: {},
      create: {
        itemId: item.id,
        safetyStock: randomInt(10, 50),
        reorderPoint: randomInt(50, 100),
        reorderQty: randomInt(100, 500),
        leadTimeDays: randomInt(2, 30),
      },
    });

    await prisma.demandHistory.deleteMany({ where: { itemId: item.id } });

    // Generate 24 months of demand history with seasonality (higher in Q4)
    for (let m = 23; m >= 0; m--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 0);
      const monthIndex = periodStart.getMonth();
      const isQ4 = monthIndex >= 9;
      
      let baseQuantity = randomInt(50, 150);
      if (isQ4) baseQuantity += randomInt(50, 100); // Q4 spike
      
      await prisma.demandHistory.create({
        data: {
          itemId: item.id,
          periodStart,
          periodEnd,
          quantity: baseQuantity,
          driver: randomChoice(['course_completion', 'new_hire_cohort', 'cert_renewal']),
        },
      });
    }
  }

  console.log('Seeding 5 Suppliers...');
  const suppliersData = [
    { name: 'Global EdTech Partners', riskScore: 'LOW', onTime: 98, quality: 99 },
    { name: 'Hardware VR Supplies Inc.', riskScore: 'MEDIUM', onTime: 85, quality: 90 },
    { name: 'Print Media Corp', riskScore: 'LOW', onTime: 95, quality: 95 },
    { name: 'Discount Vouchers LLC', riskScore: 'HIGH', onTime: 70, quality: 80 },
    { name: 'Enterprise Cloud Certifications', riskScore: 'LOW', onTime: 99, quality: 100 },
  ];

  const dbSuppliers = [];
  for (const s of suppliersData) {
    const supplier = await prisma.supplier.findFirst({ where: { organizationId: org.id, name: s.name } });
    if (!supplier) {
      const newSup = await prisma.supplier.create({
        data: {
          organizationId: org.id,
          name: s.name,
          contactEmail: `orders@${s.name.replace(/\s+/g, '').toLowerCase()}.demo`,
          leadTimeDays: randomInt(5, 21),
          riskScore: s.riskScore,
          scorecard: { onTimeDelivery: s.onTime, qualityScore: s.quality, costVariance: (Math.random() * 5).toFixed(1) },
        },
      });
      dbSuppliers.push(newSup);
    } else {
      dbSuppliers.push(supplier);
    }
  }

  console.log('Seeding Purchase Requests, Approvals, and Notifications...');
  const planner = createdUsers.find(u => u.email === 'planner@demo.local');
  const admin = createdUsers.find(u => u.email === 'admin@demo.local');
  
  if (planner) {
    for (let i = 0; i < 5; i++) {
      const randomItem = randomChoice(dbItems);
      const isAiGenerated = Math.random() > 0.5;
      
      const request = await prisma.purchaseRequest.create({
        data: {
          organizationId: org.id,
          requestedById: planner.id,
          aiGenerated: isAiGenerated,
          status: isAiGenerated ? 'PENDING_REVIEW' : randomChoice(['APPROVED', 'PENDING_REVIEW']),
          lines: { create: { itemId: randomItem.id, quantity: randomInt(20, 100) } },
        },
      });

      if (isAiGenerated || request.status === 'PENDING_REVIEW') {
        await prisma.approval.create({
          data: { 
            purchaseRequestId: request.id, 
            actorId: planner.id, 
            outcome: 'PENDING', 
            reason: isAiGenerated ? 'AI generated forecast replenishment' : 'Manual stock adjustment' 
          },
        });
      }
    }
  }

  if (admin) {
    const notifications = [
      { title: 'Stockout Risk Detected', body: 'Item DEV-1002 is projected to stockout in 3 days.', severity: 'CRITICAL' },
      { title: 'New Supplier Onboarded', body: 'Enterprise Cloud Certifications added to preferred list.', severity: 'INFO' },
      { title: 'AI Forecast Generated', body: 'Monthly forecast completed across all regions.', severity: 'INFO' },
      { title: 'Anomaly Detected', body: 'Purchase order #1043 exceeds historical limits.', severity: 'WARNING' },
      { title: 'Approval Required', body: '5 POs pending your approval.', severity: 'WARNING' }
    ];

    for (const n of notifications) {
      await prisma.notification.create({
        data: { 
          organizationId: org.id, 
          userId: admin.id, 
          title: n.title, 
          body: n.body, 
          severity: n.severity, 
          entityType: 'System' 
        },
      });
    }
  }

  console.log('Massive seed complete! Demo login: admin@demo.local / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
