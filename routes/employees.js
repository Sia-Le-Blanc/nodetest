const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

router.post('/', async (req, res) => {
    const { tenant_id, name, position } = req.body;
    const employee = await Employee.create({ tenant_id, name, position });
    res.json(employee);
});

router.get('/', async (req, res) => {
    const employees = await Employee.findAll();
    res.json(employees);  // employee → employees
});

module.exports = router;