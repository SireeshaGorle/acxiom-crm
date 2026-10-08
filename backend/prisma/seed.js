import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ACXIOMCRM database seed...');

  // 1. Seed Roles
  const roles = [
    { id: 1, name: 'ADMIN', description: 'System Administrator with full system control' },
    { id: 2, name: 'MANAGER', description: 'Sales Manager with team oversight and analytics access' },
    { id: 3, name: 'SALES_EXECUTIVE', description: 'Sales Executive managing assigned leads, customers, and deals' }
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name, description: r.description },
      create: r
    });
  }
  console.log('✅ Roles seeded');

  // 2. Seed Users
  const defaultPassword = await bcrypt.hash('Admin@123456', 10);
  const managerPassword = await bcrypt.hash('Manager@123456', 10);
  const salesPassword = await bcrypt.hash('Sales@123456', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@acxiomcrm.com' },
    update: {},
    create: {
      email: 'admin@acxiomcrm.com',
      password: defaultPassword,
      firstName: 'Alexander',
      lastName: 'Admin',
      phone: '+1 555-0101',
      roleId: 1,
      isActive: true
    }
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@acxiomcrm.com' },
    update: {},
    create: {
      email: 'manager@acxiomcrm.com',
      password: managerPassword,
      firstName: 'Morgan',
      lastName: 'Manager',
      phone: '+1 555-0102',
      roleId: 2,
      isActive: true
    }
  });

  const salesUser1 = await prisma.user.upsert({
    where: { email: 'sales@acxiomcrm.com' },
    update: {},
    create: {
      email: 'sales@acxiomcrm.com',
      password: salesPassword,
      firstName: 'Samantha',
      lastName: 'Sales',
      phone: '+1 555-0103',
      roleId: 3,
      isActive: true
    }
  });

  const salesUser2 = await prisma.user.upsert({
    where: { email: 'david.sales@acxiomcrm.com' },
    update: {},
    create: {
      email: 'david.sales@acxiomcrm.com',
      password: salesPassword,
      firstName: 'David',
      lastName: 'Davis',
      phone: '+1 555-0104',
      roleId: 3,
      isActive: true
    }
  });
  console.log('✅ Users seeded');

  // 3. Seed Customers (12 realistic customers)
  const customersData = [
    { customerCode: 'CUST-0001', name: 'Robert Vance', email: 'robert@vancerefrigeration.com', phone: '+1 212-555-0190', companyName: 'Vance Refrigeration', city: 'New York', state: 'NY', status: 'ACTIVE', assignedToId: salesUser1.id },
    { customerCode: 'CUST-0002', name: 'Eleanor Sterling', email: 'eleanor@sterlingcorp.io', phone: '+1 415-555-0145', companyName: 'Sterling Global Tech', city: 'San Francisco', state: 'CA', status: 'ACTIVE', assignedToId: salesUser1.id },
    { customerCode: 'CUST-0003', name: 'Marcus Aurelius', email: 'marcus@quantumdynamics.org', phone: '+1 312-555-0182', companyName: 'Quantum Dynamics Labs', city: 'Chicago', state: 'IL', status: 'ACTIVE', assignedToId: salesUser2.id },
    { customerCode: 'CUST-0004', name: 'Sarah Connor', email: 'sarah@cyberdyneai.com', phone: '+1 206-555-0112', companyName: 'Cyberdyne Systems AI', city: 'Seattle', state: 'WA', status: 'ACTIVE', assignedToId: managerUser.id },
    { customerCode: 'CUST-0005', name: 'Bruce Wayne', email: 'bruce@wayneenterprises.com', phone: '+1 617-555-0199', companyName: 'Wayne Enterprises Tech', city: 'Boston', state: 'MA', status: 'ACTIVE', assignedToId: salesUser2.id },
    { customerCode: 'CUST-0006', name: 'Diana Prince', email: 'diana@themysciraglobal.com', phone: '+1 202-555-0177', companyName: 'Themyscira Logistics', city: 'Washington', state: 'DC', status: 'ACTIVE', assignedToId: salesUser1.id },
    { customerCode: 'CUST-0007', name: 'Tony Stark', email: 'tony@starkinnovations.io', phone: '+1 310-555-0155', companyName: 'Stark Innovations', city: 'Los Angeles', state: 'CA', status: 'ACTIVE', assignedToId: managerUser.id },
    { customerCode: 'CUST-0008', name: 'Natasha Roman', email: 'natasha@shieldhealth.com', phone: '+1 512-555-0133', companyName: 'Shield Health Solutions', city: 'Austin', state: 'TX', status: 'ACTIVE', assignedToId: salesUser2.id },
    { customerCode: 'CUST-0009', name: 'Clark Kent', email: 'clark@dailyplanetmedia.com', phone: '+1 303-555-0144', companyName: 'Daily Planet Digital', city: 'Denver', state: 'CO', status: 'INACTIVE', assignedToId: salesUser1.id },
    { customerCode: 'CUST-0010', name: 'Arthur Curry', email: 'arthur@atlanticoceanics.com', phone: '+1 305-555-0166', companyName: 'Atlantic Oceanic Freight', city: 'Miami', state: 'FL', status: 'ACTIVE', assignedToId: salesUser2.id },
    { customerCode: 'CUST-0011', name: 'Barry Allen', email: 'barry@centralspeedlogistics.com', phone: '+1 602-555-0188', companyName: 'Central Speed Logistics', city: 'Phoenix', state: 'AZ', status: 'ACTIVE', assignedToId: salesUser1.id },
    { customerCode: 'CUST-0012', name: 'Hal Jordan', email: 'hal@ferrisaviation.com', phone: '+1 702-555-0122', companyName: 'Ferris Aerospace Solutions', city: 'Las Vegas', state: 'NV', status: 'ACTIVE', assignedToId: managerUser.id }
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        ...c,
        createdById: adminUser.id
      }
    });
    createdCustomers.push(cust);
  }
  console.log('✅ Customers seeded');

  // 4. Seed Leads (12 realistic leads)
  const leadsData = [
    { leadCode: 'LEAD-0001', name: 'Vikram Mehta', email: 'vikram@apexcloud.in', phone: '+1 408-555-0123', companyName: 'Apex Cloud India', source: 'WEBSITE', status: 'QUALIFIED', estimatedValue: 48000, assignedToId: salesUser1.id },
    { leadCode: 'LEAD-0002', name: 'Jessica Alba', email: 'jessica@honestfintech.com', phone: '+1 212-555-0144', companyName: 'Honest FinTech Labs', source: 'REFERRAL', status: 'CONTACTED', estimatedValue: 65000, assignedToId: salesUser2.id },
    { leadCode: 'LEAD-0003', name: 'Liam Neeson', email: 'liam@neesonsecurity.com', phone: '+1 617-555-0165', companyName: 'Neeson Enterprise Security', source: 'COLD_CALL', status: 'NEW', estimatedValue: 32000, assignedToId: salesUser1.id },
    { leadCode: 'LEAD-0004', name: 'Rachel Green', email: 'rachel@ralphlaurenretail.com', phone: '+1 212-555-0187', companyName: 'Ralph Retail Group', source: 'EXHIBITION', status: 'QUALIFIED', estimatedValue: 92000, assignedToId: managerUser.id },
    { leadCode: 'LEAD-0005', name: 'Chandler Bing', email: 'chandler@dataanalytics.org', phone: '+1 312-555-0198', companyName: 'Bing Statistical Processing', source: 'WEBSITE', status: 'CONTACTED', estimatedValue: 28000, assignedToId: salesUser2.id },
    { leadCode: 'LEAD-0006', name: 'Monica Geller', email: 'monica@culinarycloud.net', phone: '+1 206-555-0109', companyName: 'Culinary Cloud Catering', source: 'SOCIAL_MEDIA', status: 'NEW', estimatedValue: 15000, assignedToId: salesUser1.id },
    { leadCode: 'LEAD-0007', name: 'Harvey Specter', email: 'harvey@pearsonhardman.legal', phone: '+1 212-555-0171', companyName: 'Pearson Hardman Legal Tech', source: 'REFERRAL', status: 'CONVERTED', estimatedValue: 120000, assignedToId: salesUser1.id, convertedCustomerId: createdCustomers[1].id },
    { leadCode: 'LEAD-0008', name: 'Mike Ross', email: 'mike@probonocrm.org', phone: '+1 212-555-0172', companyName: 'Ross Law Clinics', source: 'WEBSITE', status: 'UNQUALIFIED', estimatedValue: 8000, assignedToId: salesUser2.id },
    { leadCode: 'LEAD-0009', name: 'Donna Paulsen', email: 'donna@executiveops.com', phone: '+1 212-555-0173', companyName: 'Paulsen Executive Operations', source: 'EXHIBITION', status: 'LOST', estimatedValue: 40000, assignedToId: salesUser1.id },
    { leadCode: 'LEAD-0010', name: 'Louis Litt', email: 'louis@littassociates.com', phone: '+1 212-555-0174', companyName: 'Litt Finance & Tax Advisory', source: 'COLD_CALL', status: 'QUALIFIED', estimatedValue: 75000, assignedToId: managerUser.id },
    { leadCode: 'LEAD-0011', name: 'Walter White', email: 'walter@albuquerquechem.com', phone: '+1 505-555-0150', companyName: 'Albuquerque Chemical Supply', source: 'WEBSITE', status: 'CONTACTED', estimatedValue: 55000, assignedToId: salesUser2.id },
    { leadCode: 'LEAD-0012', name: 'Jesse Pinkman', email: 'jesse@vamonospest.com', phone: '+1 505-555-0151', companyName: 'Vamonos Operations Tech', source: 'SOCIAL_MEDIA', status: 'NEW', estimatedValue: 22000, assignedToId: salesUser1.id }
  ];

  const createdLeads = [];
  for (const l of leadsData) {
    const lead = await prisma.lead.upsert({
      where: { leadCode: l.leadCode },
      update: {},
      create: {
        ...l,
        createdById: adminUser.id
      }
    });
    createdLeads.push(lead);
  }
  console.log('✅ Leads seeded');

  // 5. Seed Opportunities (7 realistic deals)
  const oppsData = [
    {
      opportunityCode: 'OPP-0001',
      name: 'Vance Enterprise Cold Storage IoT Suite',
      customerId: createdCustomers[0].id,
      amount: 45000,
      stage: 'NEGOTIATION',
      probability: 80,
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      notes: 'Final contract terms under legal review',
      assignedToId: salesUser1.id
    },
    {
      opportunityCode: 'OPP-0002',
      name: 'Sterling Global Cloud Migration',
      customerId: createdCustomers[1].id,
      leadId: createdLeads[6].id,
      amount: 120000,
      stage: 'WON',
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'WON',
      notes: 'Deal closed successfully. Implementation scheduled.',
      assignedToId: salesUser1.id
    },
    {
      opportunityCode: 'OPP-0003',
      name: 'Quantum Dynamics Supercomputing Cluster License',
      customerId: createdCustomers[2].id,
      amount: 180000,
      stage: 'PROPOSAL',
      probability: 60,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      notes: 'Proposal sent to CTO; waiting for technical demo session.',
      assignedToId: salesUser2.id
    },
    {
      opportunityCode: 'OPP-0004',
      name: 'Cyberdyne AI Predictive Maintenance System',
      customerId: createdCustomers[3].id,
      amount: 95000,
      stage: 'QUALIFICATION',
      probability: 30,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      notes: 'Discovery call completed; assessing API integration scope.',
      assignedToId: managerUser.id
    },
    {
      opportunityCode: 'OPP-0005',
      name: 'Wayne Enterprises Smart City Defense Portal',
      customerId: createdCustomers[4].id,
      amount: 250000,
      stage: 'WON',
      probability: 100,
      expectedCloseDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      status: 'WON',
      notes: 'Annual recurring contract signed.',
      assignedToId: salesUser2.id
    },
    {
      opportunityCode: 'OPP-0006',
      name: 'Themyscira Fleet Tracking Telematics',
      customerId: createdCustomers[5].id,
      amount: 60000,
      stage: 'LOST',
      probability: 0,
      expectedCloseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'LOST',
      notes: 'Client selected internal legacy build due to budget freeze.',
      assignedToId: salesUser1.id
    },
    {
      opportunityCode: 'OPP-0007',
      name: 'Stark Clean Energy Smart Grid Integration',
      customerId: createdCustomers[6].id,
      amount: 135000,
      stage: 'NEGOTIATION',
      probability: 75,
      expectedCloseDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      notes: 'Pricing discount approved by Sales Manager.',
      assignedToId: managerUser.id
    }
  ];

  for (const opp of oppsData) {
    await prisma.opportunity.upsert({
      where: { opportunityCode: opp.opportunityCode },
      update: {},
      create: {
        ...opp,
        createdById: adminUser.id
      }
    });
  }
  console.log('✅ Opportunities seeded');

  // 6. Seed Follow-Ups (10 items)
  const followUpsData = [
    {
      customerId: createdCustomers[0].id,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      type: 'CALL',
      remarks: 'Follow up on MSA contract revisions with Robert Vance',
      status: 'PLANNED',
      assignedToId: salesUser1.id
    },
    {
      leadId: createdLeads[0].id,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      type: 'MEETING',
      remarks: 'Product walkthrough and architecture demo with Vikram Mehta',
      status: 'PLANNED',
      assignedToId: salesUser1.id
    },
    {
      customerId: createdCustomers[2].id,
      followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      type: 'EMAIL',
      remarks: 'Send security compliance whitepaper and SOC2 report',
      status: 'PLANNED',
      assignedToId: salesUser2.id
    },
    {
      leadId: createdLeads[1].id,
      followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'CALL',
      remarks: 'Discuss fintech licensing requirements',
      status: 'COMPLETED',
      assignedToId: salesUser2.id
    },
    {
      customerId: createdCustomers[4].id,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      type: 'TASK',
      remarks: 'Prepare quarterly review slide deck for Wayne Enterprises',
      status: 'PLANNED',
      assignedToId: salesUser2.id
    },
    {
      leadId: createdLeads[3].id,
      followUpDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      type: 'MEETING',
      remarks: 'Executive sales pitch with Rachel Green',
      status: 'PLANNED',
      assignedToId: managerUser.id
    },
    {
      customerId: createdCustomers[6].id,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      type: 'CALL',
      remarks: 'Finalize discount percentage with Stark procurement',
      status: 'PLANNED',
      assignedToId: managerUser.id
    },
    {
      leadId: createdLeads[2].id,
      followUpDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'EMAIL',
      remarks: 'Introductory email sent regarding enterprise security suite',
      status: 'COMPLETED',
      assignedToId: salesUser1.id
    }
  ];

  for (const f of followUpsData) {
    await prisma.followUp.create({
      data: {
        ...f,
        createdById: adminUser.id
      }
    });
  }
  console.log('✅ Follow-ups seeded');

  // 7. Seed Activities (8 items)
  const activitiesData = [
    {
      type: 'CALL',
      subject: 'Discovery Call with Vance Refrigeration',
      description: 'Discussed requirements for cold storage IoT telemetry and ERP sync.',
      activityDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      customerId: createdCustomers[0].id,
      status: 'COMPLETED',
      assignedToId: salesUser1.id
    },
    {
      type: 'MEETING',
      subject: 'Solution Architecture Review with Sterling Global',
      description: 'Presented scalable microservice and database cloud migration plan.',
      activityDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      customerId: createdCustomers[1].id,
      status: 'COMPLETED',
      assignedToId: salesUser1.id
    },
    {
      type: 'EMAIL',
      subject: 'Sent Proposal Quote for Quantum Dynamics',
      description: 'Delivered customized tier-1 pricing matrix for HPC cluster licensing.',
      activityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      customerId: createdCustomers[2].id,
      status: 'COMPLETED',
      assignedToId: salesUser2.id
    },
    {
      type: 'TASK',
      subject: 'Draft Wayne Enterprises Annual SOW',
      description: 'Prepared statement of work for next generation smart defense portal.',
      activityDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      customerId: createdCustomers[4].id,
      status: 'COMPLETED',
      assignedToId: salesUser2.id
    },
    {
      type: 'CALL',
      subject: 'Introductory Qualification with Apex Cloud',
      description: 'Verified budget authority and timeline for CRM modernization project.',
      activityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      leadId: createdLeads[0].id,
      status: 'COMPLETED',
      assignedToId: salesUser1.id
    }
  ];

  for (const a of activitiesData) {
    await prisma.activity.create({
      data: {
        ...a,
        createdById: adminUser.id
      }
    });
  }
  console.log('✅ Activities seeded');

  // 8. Seed Audit Logs
  const auditLogsData = [
    { userId: adminUser.id, userEmail: adminUser.email, action: 'LOGIN', entity: 'AUTH', newValue: '{"role":"ADMIN"}', ipAddress: '127.0.0.1', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { userId: adminUser.id, userEmail: adminUser.email, action: 'CREATE', entity: 'USER', recordId: String(salesUser1.id), newValue: '{"email":"sales@acxiomcrm.com","role":"SALES_EXECUTIVE"}', ipAddress: '127.0.0.1', createdAt: new Date(Date.now() - 3600 * 1000) },
    { userId: salesUser1.id, userEmail: salesUser1.email, action: 'LOGIN', entity: 'AUTH', newValue: '{"role":"SALES_EXECUTIVE"}', ipAddress: '192.168.1.45', createdAt: new Date(Date.now() - 1800 * 1000) },
    { userId: salesUser1.id, userEmail: salesUser1.email, action: 'CREATE', entity: 'CUSTOMER', recordId: String(createdCustomers[0].id), newValue: '{"customerCode":"CUST-0001","name":"Robert Vance"}', ipAddress: '192.168.1.45', createdAt: new Date(Date.now() - 1200 * 1000) },
    { userId: salesUser1.id, userEmail: salesUser1.email, action: 'CONVERT_LEAD', entity: 'LEAD', recordId: String(createdLeads[6].id), newValue: '{"status":"CONVERTED","customerCode":"CUST-0002","opportunityCode":"OPP-0002"}', ipAddress: '192.168.1.45', createdAt: new Date(Date.now() - 600 * 1000) }
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({
      data: log
    });
  }
  console.log('✅ Audit logs seeded');

  console.log('🚀 Seed data completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
