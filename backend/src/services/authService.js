import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { config } from '../config/env.js';
import { createAuditLog } from './auditService.js';

export const register = async ({ email, password, firstName, lastName, phone, roleId = 3, ipAddress }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingUser) {
    const error = new Error('A user with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Ensure role exists
  const role = await prisma.role.findUnique({
    where: { id: Number(roleId) }
  });

  if (!role) {
    const error = new Error('Invalid role specified');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || null,
      roleId: Number(roleId),
      isActive: true
    },
    include: { role: true }
  });

  await createAuditLog({
    userId: newUser.id,
    userEmail: newUser.email,
    action: 'CREATE',
    entity: 'USER',
    recordId: String(newUser.id),
    newValue: { email: newUser.email, role: newUser.role.name },
    ipAddress
  });

  const token = jwt.sign(
    { userId: newUser.id, email: newUser.email, role: newUser.role.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      role: newUser.role.name
    },
    token
  };
};

export const login = async ({ email, password, ipAddress }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { role: true }
  });

  if (!user) {
    await createAuditLog({
      userEmail: normalizedEmail,
      action: 'FAILED_LOGIN',
      entity: 'AUTH',
      newValue: { reason: 'User not found' },
      ipAddress
    });
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if account is deactivated
  if (!user.isActive) {
    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'FAILED_LOGIN',
      entity: 'AUTH',
      newValue: { reason: 'Account deactivated' },
      ipAddress
    });
    const error = new Error('Account has been deactivated. Please contact your system administrator.');
    error.statusCode = 403;
    throw error;
  }

  // Check account lockout
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / (1000 * 60));
    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'SECURITY_EVENT',
      entity: 'AUTH',
      newValue: { reason: 'Attempt while locked' },
      ipAddress
    });
    const error = new Error(`Account is locked due to multiple failed login attempts. Try again in ${remainingMinutes} minute(s).`);
    error.statusCode = 403;
    throw error;
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const newAttempts = user.failedLoginAttempts + 1;
    let lockedUntil = null;

    if (newAttempts >= config.maxLoginAttempts) {
      lockedUntil = new Date(Date.now() + config.lockoutDurationMinutes * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: newAttempts,
        lockedUntil
      }
    });

    await createAuditLog({
      userId: user.id,
      userEmail: user.email,
      action: 'FAILED_LOGIN',
      entity: 'AUTH',
      newValue: { failedAttempts: newAttempts, locked: !!lockedUntil },
      ipAddress
    });

    if (lockedUntil) {
      const error = new Error(`Too many failed attempts. Account locked for ${config.lockoutDurationMinutes} minutes.`);
      error.statusCode = 403;
      throw error;
    }

    const remaining = config.maxLoginAttempts - newAttempts;
    const error = new Error(`Invalid email or password. ${remaining} attempt(s) remaining before account lockout.`);
    error.statusCode = 401;
    throw error;
  }

  // Reset failed login attempts on successful login
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
  }

  await createAuditLog({
    userId: user.id,
    userEmail: user.email,
    action: 'LOGIN',
    entity: 'AUTH',
    newValue: { role: user.role.name },
    ipAddress
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role.name
    },
    token
  };
};

export const logout = async ({ userId, userEmail, ipAddress }) => {
  await createAuditLog({
    userId,
    userEmail,
    action: 'LOGOUT',
    entity: 'AUTH',
    ipAddress
  });
  return true;
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      roleId: true,
      role: { select: { id: true, name: true, description: true } },
      isActive: true,
      createdAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};
