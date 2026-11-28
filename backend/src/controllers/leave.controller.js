const { z } = require('zod');
const leaveService = require('../services/leave.service');

const applyLeaveSchema = z.object({
  employeeId: z.number().int().positive('Employee ID must be a positive integer'),
  leaveType: z.string().min(2, 'Leave type is required'),
  startDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid end date'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

const updateStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

async function applyLeave(req, res) {
  try {
    const parsed = applyLeaveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const leave = await leaveService.applyLeave({
      ...parsed.data,
      companyId: req.user.companyId,
    });

    res.status(201).json({ message: 'Leave request submitted', data: leave });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getLeaves(req, res) {
  try {
    const { status } = req.query;
    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const leaves = await leaveService.getLeaves(req.user.companyId, status);
    res.status(200).json({ data: leaves });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateLeaveStatus(req, res) {
  try {
    const leaveId = Number(req.params.id);
    if (Number.isNaN(leaveId)) {
      return res.status(400).json({ error: 'Invalid leave request ID' });
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const updated = await leaveService.updateLeaveStatus({
      leaveId,
      companyId: req.user.companyId,
      status: parsed.data.status,
    });

    res.status(200).json({ message: `Leave request ${parsed.data.status.toLowerCase()}`, data: updated });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { applyLeave, getLeaves, updateLeaveStatus };