const dashboardService = require('../services/dashboard.service');

async function getStats(req, res) {
  try {
    const stats = await dashboardService.getCompanyStats(req.user.companyId);
    res.status(200).json({ data: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getStats };