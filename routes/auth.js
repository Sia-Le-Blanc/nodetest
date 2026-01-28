const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 회원가입
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        const user = await User.create({ username, password, email });
        res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 로그인 (나중에 추가)
router.post('/login', async (req, res) => {
    res.json({ message: '로그인 기능 구현 예정' });
});

module.exports = router;