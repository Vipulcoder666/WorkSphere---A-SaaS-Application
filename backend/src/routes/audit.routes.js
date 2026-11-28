const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const auditService = require('../services/audit.service');

const router = express.Router();

router.use(authenticate);

// Only ADMIN can view company audit logs
router.get('/', authorize('ADMIN'), async (req, res) => {
  try {
    const logs = await auditService.getCompanyAuditLogs(req.user.companyId);
    res.status(200).json({ data: logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;