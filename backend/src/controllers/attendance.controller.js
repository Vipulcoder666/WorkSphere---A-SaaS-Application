const { z } = require('zod');
const attendanceService = require('../services/attendance.service');

const attendanceActionSchema = z.object({
  employeeId: z.number().int().positive('Employee ID must be a positive integer'),
});

async function checkIn(req, res) {
  try {
    const parsed = attendanceActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const record = await attendanceService.checkIn(
      parsed.data.employeeId,
      req.user.companyId
    );

    res.status(201).json({ message: 'Checked in successfully', data: record });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkOut(req, res) {
  try {
    const parsed = attendanceActionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const record = await attendanceService.checkOut(
      parsed.data.employeeId,
      req.user.companyId
    );

    res.status(200).json({ message: 'Checked out successfully', data: record });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getHistory(req, res) {
  try {
    const employeeId = req.query.employeeId
      ? Number(req.query.employeeId)
      : undefined;

    if (req.query.employeeId && Number.isNaN(employeeId)) {
      return res.status(400).json({ error: 'Invalid employeeId query parameter' });
    }

    const records = await attendanceService.getAttendanceHistory(
      req.user.companyId,
      employeeId
    );

    res.status(200).json({ data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { checkIn, checkOut, getHistory };