const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth.middleware');
const prisma = require('../config/prisma');

const router = express.Router();

// Zod schema for validating registration input
const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Invalid company email'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid user email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Login Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/v1/auth/register -> Register a new company + admin user
router.post('/register', async (req, res) => {
  try {
    // 1. Validate request body
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { companyName, companyEmail, fullName, email, password } = parsed.data;

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create Company, Default Roles, and Admin User in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
        },
      });

      const adminRole = await tx.role.create({
        data: { name: 'ADMIN', companyId: company.id },
      });

      await tx.role.createMany({
        data: [
          { name: 'HR', companyId: company.id },
          { name: 'EMPLOYEE', companyId: company.id },
        ],
      });

      const user = await tx.user.create({
        data: {
          fullName,
          email,
          passwordHash,
          companyId: company.id,
          roleId: adminRole.id,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          companyId: true,
          roleId: true,
          createdAt: true,
        },
      });

      return { company, user };
    });

    res.status(201).json({
      message: 'Company and Admin user registered successfully',
      data: result,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Company email or user email already exists',
      });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/v1/auth/login -> Authenticate user and return JWT
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    // 1. Find user along with their role
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Generate JWT containing userId, companyId, and role
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        companyId: user.companyId,
        role: user.role.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/auth/me -> Get current logged-in user's profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        companyId: true,
        role: { select: { name: true } },
        company: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;