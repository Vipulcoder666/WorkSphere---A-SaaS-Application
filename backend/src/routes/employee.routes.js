const express = require('express');
const { z } = require('zod');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const subscriptionService = require('../services/subscription.service');
const auditService = require('../services/audit.service');

const router = express.Router();

// Require authentication for all employee routes
router.use(authenticate);

const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
});

const updateEmployeeSchema = createEmployeeSchema.partial();

// 1. POST /api/v1/employees -> Create employee (ADMIN & HR only)
router.post('/', authorize('ADMIN', 'HR'), async (req, res) => {
  try {
    const parsed = createEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }
const limitCheck = await subscriptionService.canAddEmployee(req.user.companyId);
 if (!limitCheck.allowed) {
   return res.status(403).json({
     error: `Plan limit reached (${limitCheck.currentCount}/${limitCheck.maxEmployees} on ${limitCheck.plan} plan). Please upgrade.`,
   });
 }
    const employee = await prisma.employee.create({
      data: {
        ...parsed.data,
        companyId: req.user.companyId, // Always sourced from verified JWT
      },
    });
  await auditService.logAction({
   companyId: req.user.companyId,
   userId: req.user.userId,
   action: 'EMPLOYEE_CREATED',
   entity: 'Employee',
   entityId: employee.id,
   details: { email: employee.email, department: employee.department },
 });

    res.status(201).json({ message: 'Employee created', data: employee });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'An employee with this email already exists in your company',
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET /api/v1/employees -> List all employees of logged-in user's company
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: employees });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. PATCH /api/v1/employees/:id -> Update employee (ADMIN & HR only)
router.patch('/:id', authorize('ADMIN', 'HR'), async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const parsed = updateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    // Verify employee belongs to the authenticated user's company (IDOR protection)
    const existing = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: req.user.companyId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updated = await prisma.employee.update({
      where: { id: employeeId },
      data: parsed.data,
    });

    res.status(200).json({ message: 'Employee updated', data: updated });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'An employee with this email already exists in your company',
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. DELETE /api/v1/employees/:id -> Delete employee (ADMIN only)
router.delete('/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const employeeId = Number(req.params.id);
    if (Number.isNaN(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const existing = await prisma.employee.findFirst({
      where: { id: employeeId, companyId: req.user.companyId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await prisma.employee.delete({ where: { id: employeeId } });

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;