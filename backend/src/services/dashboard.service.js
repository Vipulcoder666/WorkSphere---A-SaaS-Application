const prisma = require('../config/prisma');

function getTodayDate() {
  const todayStr = new Date().toISOString().split('T')[0];
  return new Date(todayStr);
}

async function getCompanyStats(companyId) {
  const today = getTodayDate();

  // Run all 4 database queries in parallel for faster response
  const [totalEmployees, presentToday, pendingLeaves, departmentGroups] =
    await Promise.all([
      prisma.employee.count({
        where: { companyId },
      }),
      prisma.attendance.count({
        where: { companyId, date: today, status: 'PRESENT' },
      }),
      prisma.leaveRequest.count({
        where: { companyId, status: 'PENDING' },
      }),
      prisma.employee.groupBy({
        by: ['department'],
        where: { companyId },
        _count: { id: true },
      }),
    ]);

  const departmentStats = departmentGroups.map((group) => ({
    department: group.department,
    count: group._count.id,
  }));

  return {
    totalEmployees,
    presentToday,
    absentToday: Math.max(0, totalEmployees - presentToday),
    pendingLeaves,
    departmentStats,
  };
}

module.exports = { getCompanyStats };