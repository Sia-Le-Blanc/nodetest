const express = require('express');
const sequelize = require('./config/database');

// 라우트 불러오기
const tenantRoutes = require('./routes/tenants');
const employeeRoutes = require('./routes/employees');
const approvalRoutes = require('./routes/approvals');

const app = express();

app.use(express.json());

// DB 연결
sequelize.sync({ force: false })
    .then(() => console.log('✅ DB 연결 및 테이블 확인 완료'));

// 기본 라우트
app.get('/', (req, res) => {
    res.send('ERP 서버 작동 중!');
});

// 라우트 연결
app.use('/tenants', tenantRoutes);
app.use('/employees', employeeRoutes);
app.use('/approvals', approvalRoutes);

app.listen(3000, () => {
    console.log('서버 실행: http://localhost:3000');
});