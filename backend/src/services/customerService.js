import prisma from '../config/prisma.js';
import { generateCode } from '../utils/codeGenerator.js';
import { createAuditLog } from './auditService.js';
import { buildRoleBasedWhereClause } from '../middleware/rbac.js';

export const getCustomers = async ({ page = 1, limit = 10, search = '', status, user }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  let where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { companyName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { customerCode: { contains: search, mode: 'insensitive' } }
    ];
  }

  where = buildRoleBasedWhereClause(user, where);

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: {
          select: { opportunities: true, followUps: true, activities: true }
        }
      }
    })
  ]);

  return { customers, total, page, limit };
};

export const getCustomerById = async (id, user) => {
  const customerId = Number(id);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      opportunities: {
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      },
      followUps: {
        orderBy: { followUpDate: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      },
      activities: {
        orderBy: { activityDate: 'desc' },
        include: { assignedTo: { select: { firstName: true, lastName: true } } }
      },
      convertedLeads: {
        select: { id: true, leadCode: true, name: true, email: true, createdAt: true }
      }
    }
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  // RBAC check for Sales Executive
  if (user.role === 'SALES_EXECUTIVE' && customer.assignedToId !== user.id && customer.createdById !== user.id) {
    const error = new Error('Access denied to this customer record');
    error.statusCode = 403;
    throw error;
  }

  return customer;
};

export const createCustomer = async (data, user, ipAddress) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existing = await prisma.customer.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    const error = new Error('A customer with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  const count = await prisma.customer.count();
  const customerCode = generateCode('CUST', count);

  const newCustomer = await prisma.customer.create({
    data: {
      customerCode,
      name: data.name.trim(),
      email: normalizedEmail,
      phone: data.phone.trim(),
      companyName: data.companyName.trim(),
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      status: data.status || 'ACTIVE',
      createdById: user.id,
      assignedToId: data.assignedToId ? Number(data.assignedToId) : user.id
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'CREATE',
    entity: 'CUSTOMER',
    recordId: String(newCustomer.id),
    newValue: newCustomer,
    ipAddress
  });

  return newCustomer;
};

export const updateCustomer = async (id, data, user, ipAddress) => {
  const customerId = Number(id);
  const existing = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!existing) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES_EXECUTIVE' && existing.assignedToId !== user.id && existing.createdById !== user.id) {
    const error = new Error('Access denied to modify this customer');
    error.statusCode = 403;
    throw error;
  }

  if (data.email && data.email.toLowerCase().trim() !== existing.email) {
    const duplicateEmail = await prisma.customer.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });
    if (duplicateEmail) {
      const error = new Error('Another customer already exists with this email address');
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: customerId },
    data: {
      name: data.name !== undefined ? data.name.trim() : existing.name,
      email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      companyName: data.companyName !== undefined ? data.companyName.trim() : existing.companyName,
      address: data.address !== undefined ? data.address.trim() : existing.address,
      city: data.city !== undefined ? data.city.trim() : existing.city,
      state: data.state !== undefined ? data.state.trim() : existing.state,
      status: data.status !== undefined ? data.status : existing.status,
      assignedToId: data.assignedToId !== undefined ? (data.assignedToId ? Number(data.assignedToId) : null) : existing.assignedToId
    },
    include: {
      createdBy: { select: { firstName: true, lastName: true } },
      assignedTo: { select: { firstName: true, lastName: true } }
    }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'UPDATE',
    entity: 'CUSTOMER',
    recordId: String(customerId),
    oldValue: existing,
    newValue: updatedCustomer,
    ipAddress
  });

  return updatedCustomer;
};

export const deleteCustomer = async (id, user, ipAddress) => {
  const customerId = Number(id);
  const existing = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!existing) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  // Admin or Manager can delete/deactivate
  if (user.role === 'SALES_EXECUTIVE') {
    const error = new Error('Sales Executives cannot delete customers');
    error.statusCode = 403;
    throw error;
  }

  await prisma.customer.delete({
    where: { id: customerId }
  });

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'DELETE',
    entity: 'CUSTOMER',
    recordId: String(customerId),
    oldValue: existing,
    ipAddress
  });

  return true;
};
