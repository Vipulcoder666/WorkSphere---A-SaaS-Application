const prisma = require('../config/prisma');

async function logAction({ companyId, userId, action, entity, entityId = null, details = null }) {
  return prisma.auditLog.create({
    data: {
      companyId,
      userId,
      action,
      entity,
      entityId,
      details,
    },
  });
}

async function getCompanyAuditLogs(companyId) {
  return prisma.auditLog.findMany({
    where: { companyId },
    include: {
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

module.exports = { logAction, getCompanyAuditLogs };