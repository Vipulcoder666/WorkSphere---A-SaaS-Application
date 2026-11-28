const prisma = require('../config/prisma');

// Normalize current date to YYYY-MM-DD (UTC midnight) for PostgreSQL @db.Date
function getTodayDate() {
  const todayStr = new Date().toISOString().split('T')[0];
  return new Date(todayStr);
}

function createHttpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function checkIn(employeeId, companyId) {
  // Ensure the employee belongs to the authenticated user's company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw createHttpError('Employee not found in your company', 404);
  }

  const today = getTodayDate();

  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: { employeeId, date: today },
    },
  });

  if (existing) {
    throw createHttpError('Employee has already checked in today', 409);
  }

  return prisma.attendance.create({
    data: {
      employeeId,
      companyId,
      date: today,
      checkIn: new Date(),
      status: 'PRESENT',
    },
  });
}

async function checkOut(employeeId, companyId) {
  const today = getTodayDate();

  const existing = await prisma.attendance.findFirst({
    where: { employeeId, companyId, date: today },
  });

  if (!existing) {
    throw createHttpError('No check-in record found for today', 404);
  }

  if (existing.checkOut) {
    throw createHttpError('Employee has already checked out today', 409);
  }

  return prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  });
}

async function getAttendanceHistory(companyId, employeeId) {
  const whereClause = { companyId };

  if (employeeId) {
    whereClause.employeeId = employeeId;
  }

  return prisma.attendance.findMany({
    where: whereClause,
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, department: true },
      },
    },
    orderBy: { date: 'desc' },
  });
}

module.exports = { checkIn, checkOut, getAttendanceHistory };