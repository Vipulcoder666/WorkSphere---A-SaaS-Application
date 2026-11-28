const prisma = require('../config/prisma');

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function applyLeave({ employeeId, companyId, leaveType, startDate, endDate, reason }) {
  // Verify the employee belongs to the authenticated user's company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw createHttpError('Employee not found in your company', 404);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw createHttpError('End date cannot be earlier than start date', 400);
  }

  return prisma.leaveRequest.create({
    data: {
      employeeId,
      companyId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    },
  });
}

async function getLeaves(companyId, status) {
  const whereClause = { companyId };

  if (status) {
    whereClause.status = status;
  }

  return prisma.leaveRequest.findMany({
    where: whereClause,
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, department: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function updateLeaveStatus({ leaveId, companyId, status }) {
  const existing = await prisma.leaveRequest.findFirst({
    where: { id: leaveId, companyId },
  });

  if (!existing) {
    throw createHttpError('Leave request not found', 404);
  }

  if (existing.status !== 'PENDING') {
    throw createHttpError(`Leave request is already ${existing.status}`, 400);
  }

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status },
  });
}

module.exports = { applyLeave, getLeaves, updateLeaveStatus };