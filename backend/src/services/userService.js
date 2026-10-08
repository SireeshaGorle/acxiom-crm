import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { createAuditLog } from './auditService.js';

export const getUsers = async ({ page = 1, limit = 10, search = '', roleId, isActive }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where = {};

  if (roleId) {
    where.roleId = Number(roleId);
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        roleId: true,
        role: { select: { id: true, name: true, description: true } },
        isActive: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        createdAt: true,
        _count: {
          select: {
            assignedCustomers: true,
            assignedLeads: true,
            assignedOpportunities: true
          }
        }
      }
    })
  ]);

  return { users, total, page, limit };
};

export const getUserById = async (id) => {
  const userId = Number(id);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      roleId: true,
      role: { select: { id: true, name: true, description: true } },
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const getRoles = async () => {
  return prisma.role.findMany({
    orderBy: { id: 'asc' }
  });
};

export const createUser = async (data, currentUser, ipAddress) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone?.trim() || null,
      roleId: Number(data.roleId),
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    },
    include: { role: true }
  });

  await createAuditLog({
    userId: currentUser.id,
    userEmail: currentUser.email,
    action: 'CREATE',
    entity: 'USER',
    recordId: String(newUser.id),
    newValue: { email: newUser.email, role: newUser.role.name },
    ipAddress
  });

  return {
    id: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    phone: newUser.phone,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt
  };
};

export const updateUser = async (id, data, currentUser, ipAddress) => {
  const userId = Number(id);
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!existing) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.email && data.email.toLowerCase().trim() !== existing.email) {
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });
    if (duplicate) {
      const error = new Error('Another user already exists with this email address');
      error.statusCode = 409;
      throw error;
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      email: data.email !== undefined ? data.email.toLowerCase().trim() : existing.email,
      firstName: data.firstName !== undefined ? data.firstName.trim() : existing.firstName,
      lastName: data.lastName !== undefined ? data.lastName.trim() : existing.lastName,
      phone: data.phone !== undefined ? data.phone.trim() : existing.phone,
      roleId: data.roleId !== undefined ? Number(data.roleId) : existing.roleId,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive
    },
    include: { role: true }
  });

  const isRoleChanged = data.roleId && Number(data.roleId) !== existing.roleId;

  await createAuditLog({
    userId: currentUser.id,
    userEmail: currentUser.email,
    action: isRoleChanged ? 'ROLE_CHANGE' : 'UPDATE',
    entity: 'USER',
    recordId: String(userId),
    oldValue: { email: existing.email, role: existing.role.name, isActive: existing.isActive },
    newValue: { email: updated.email, role: updated.role.name, isActive: updated.isActive },
    ipAddress
  });

  return {
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    phone: updated.phone,
    role: updated.role,
    isActive: updated.isActive,
    updatedAt: updated.updatedAt
  };
};

export const toggleUserStatus = async (id, currentUser, ipAddress) => {
  const userId = Number(id);

  if (userId === currentUser.id) {
    const error = new Error('You cannot deactivate your own account');
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existing) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      isActive: !existing.isActive
    },
    include: { role: true }
  });

  await createAuditLog({
    userId: currentUser.id,
    userEmail: currentUser.email,
    action: updated.isActive ? 'UPDATE' : 'DEACTIVATE',
    entity: 'USER',
    recordId: String(userId),
    oldValue: { isActive: existing.isActive },
    newValue: { isActive: updated.isActive },
    ipAddress
  });

  return {
    id: updated.id,
    email: updated.email,
    isActive: updated.isActive
  };
};

export const resetUserPassword = async (id, newPassword, currentUser, ipAddress) => {
  const userId = Number(id);
  const existing = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existing) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });

  await createAuditLog({
    userId: currentUser.id,
    userEmail: currentUser.email,
    action: 'SECURITY_EVENT',
    entity: 'USER',
    recordId: String(userId),
    newValue: { message: 'Password reset by admin' },
    ipAddress
  });

  return true;
};
