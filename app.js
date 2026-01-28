require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');

const Tenant = require('./models/Tenant');
const Employee = require('./models/Employee');
const Approval = require('./models/Approval');
const User = require('./models/User');
const UploadedFile = require('./models/UploadedFile');
const DocumentTemplate = require('./models/DocumentTemplate');

const tenantRoutes = require('./routes/tenants');
const employeeRoutes = require('./routes/employees');
const approvalRoutes = require('./routes/approvals');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const templateRoutes = require('./routes/templates');  // 추가!

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

sequelize.sync({ force: false })
    .then(() => console.log('✅ DB 연결 및 테이블 확인 완료'));

app.get('/', (req, res) => {
    res.send('ERP 서버 작동 중!');
});

app.use('/tenants', tenantRoutes);
app.use('/employees', employeeRoutes);
app.use('/approvals', approvalRoutes);
app.use('/auth', authRoutes);
app.use('/upload', uploadRoutes);
app.use('/templates', templateRoutes);  // 추가!

app.listen(1972, () => {
    console.log('서버 실행: http://localhost:1972');
});