const express = require('express');
const router = express.Router();
const Approval = require('../models/Approval');

// GET /approvals
router.get('/', async (req, res) => {
    const approvals = await Approval.findAll();
    res.json(approvals);
});

// POST /approvals
router.post('/', async (req, res) => {
    const { tenant_id, employee_id, title, amount } = req.body;
    const approval = await Approval.create({ tenant_id, employee_id, title, amount });
    res.json(approval);
});

module.exports = router;