const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

router.get('/', async (req, res) => {
    const tenants = await Tenant.findAll();
    res.json(tenants);
});

router.post('/', async (req, res) => {
    const { name } = req.body;
    const [tenant, created] = await Tenant.findOrCreate({ where: { name }});
    res.json({ tenant, created });
});

module.exports = router;