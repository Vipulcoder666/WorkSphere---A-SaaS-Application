const express = require('express');
const { z } = require('zod');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const subscriptionService = require('../services/subscription.service');
const auditService = require('../services/audit.service');

const router = express.Router();

router.use(authenticate);

const upgradeSchema = z.object({
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']),
});

// Get current company subscription
router.get('/', authorize('ADMIN', 'HR'), async (req, res) => {
  try {
    const subscription = await subscriptionService.getOrCreateSubscription(req.user.companyId);
    res.status(200).json({ data: subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade or change company subscription plan (simulated)
router.patch('/upgrade', authorize('ADMIN'), async (req, res) => {
  try {
    const parsed = upgradeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid plan. Choose FREE, PRO, or ENTERPRISE' });
    }

    const updated = await subscriptionService.upgradePlan(req.user.companyId, parsed.data.plan);

    await auditService.logAction({
      companyId: req.user.companyId,
      userId: req.user.userId,
      action: 'SUBSCRIPTION_UPDATED',
      entity: 'Subscription',
      entityId: updated.id,
      details: { plan: updated.plan, maxEmployees: updated.maxEmployees },
    });

    res.status(200).json({ message: 'Subscription updated', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;