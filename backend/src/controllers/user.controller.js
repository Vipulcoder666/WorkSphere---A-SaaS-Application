const { z } = require('zod');
const userService = require('../services/user.service');

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'HR', 'EMPLOYEE']),
});

async function createUser(req, res) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await userService.createUser({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
      roleName: parsed.data.role,
      companyId: req.user.companyId,
    });

    res.status(201).json({ message: 'User created successfully', data: user });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await userService.getCompanyUsers(req.user.companyId);
    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createUser, getUsers };