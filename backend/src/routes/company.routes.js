const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

// POST /api/v1/companies -> Create a new company
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const company = await prisma.company.create({
      data: { name, email },
    });

    res.status(201).json({ message: 'Company created', data: company });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Company with this email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/v1/companies -> Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await prisma.company.findMany();
    res.status(200).json({ data: companies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;