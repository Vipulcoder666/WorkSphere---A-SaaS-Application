const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createUser({ fullName, email, password, roleName, companyId }) {
  // Find the requested role inside the admin's company
  const role = await prisma.role.findUnique({
    where: {
      name_companyId: { name: roleName, companyId },
    },
  });

  if (!role) {
    throw createHttpError(`Role '${roleName}' not found for your company`, 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      companyId,
      roleId: role.id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      companyId: true,
      isActive: true,
      role: { select: { name: true } },
      createdAt: true,
    },
  });
}

async function getCompanyUsers(companyId) {
  return prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      fullName: true,
      email: true,
      isActive: true,
      role: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { createUser, getCompanyUsers };