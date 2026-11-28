const prisma = require('../config/prisma');

const PLAN_LIMITS = {
  FREE: 10,
  PRO: 100,
  ENTERPRISE: 10000,
};

async function getOrCreateSubscription(companyId) {
  let subscription = await prisma.subscription.findUnique({
    where: { companyId },
  });

  // Auto-create a FREE subscription if the company does not have one yet
  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: {
        companyId,
        plan: 'FREE',
        status: 'ACTIVE',
        maxEmployees: PLAN_LIMITS.FREE,
      },
    });
  }

  return subscription;
}

async function upgradePlan(companyId, plan) {
  await getOrCreateSubscription(companyId);

  return prisma.subscription.update({
    where: { companyId },
    data: {
      plan,
      status: 'ACTIVE',
      maxEmployees: PLAN_LIMITS[plan],
    },
  });
}

async function canAddEmployee(companyId) {
  const subscription = await getOrCreateSubscription(companyId);
  const currentCount = await prisma.employee.count({ where: { companyId } });
  return {
    allowed: currentCount < subscription.maxEmployees,
    currentCount,
    maxEmployees: subscription.maxEmployees,
    plan: subscription.plan,
  };
}

module.exports = { getOrCreateSubscription, upgradePlan, canAddEmployee };