const express = require('express');
const router = express.Router();
const multer = require('multer');
const DocumentTemplate = require('../models/DocumentTemplate');
const XLSX = require('xlsx');
const fs = require('fs').promises;

const storage = multer.diskStorage({
    destination: 'uploads/templates/',
    filename: (req, file, cb) => {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueName = Date.now() + '-' + originalName;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

// 템플릿 업로드
router.post('/', upload.single('template'), async (req, res) => {
    const { tenant_id, name } = req.body;
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    const template = await DocumentTemplate.create({
        tenant_id,
        name,
        template_file_path: req.file.path
    });
    
    res.json({ success: true, template });
});

// 회사별 템플릿 조회
router.get('/:tenant_id', async (req, res) => {
    const templates = await DocumentTemplate.findAll({
        where: { tenant_id: req.params.tenant_id }
    });
    res.json(templates);
});

module.exports = router;

// 템플릿 엑셀 뷰어
router.get('/view/:template_id', async (req, res) => {
    const template = await DocumentTemplate.findByPk(req.params.template_id);
    
    if (!template) {
        return res.status(404).json({ error: '템플릿을 찾을 수 없습니다' });
    }
    
    // 엑셀 읽기
    const fileBuffer = await fs.readFile(template.template_file_path);
    const workbook = XLSX.read(fileBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 데이터 변환
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // 병합 셀 정보
    const merges = sheet['!merges'] || [];
    const mergeCells = merges.map(m => ({
        row: m.s.r,
        col: m.s.c,
        rowspan: m.e.r - m.s.r + 1,
        colspan: m.e.c - m.s.c + 1
    }));
    
    res.json({
        templateName: template.name,
        data: data,
        mergeCells: mergeCells
    });
});

router.post('/autofill/:template_id', upload.single('userFile'), async (req, res) => {
    const template = await DocumentTemplate.findByPk(req.params.template_id);
    
    // 템플릿 읽기
    const templateBuffer = await fs.readFile(template.template_file_path);
    const templateWorkbook = XLSX.read(templateBuffer);
    const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];
    const templateData = XLSX.utils.sheet_to_json(templateSheet, { header: 1, defval: '' });
    
    // 병합 셀 정보 추출
    const merges = templateSheet['!merges'] || [];
    const mergeCells = merges.map(m => ({
        row: m.s.r,
        col: m.s.c,
        rowspan: m.e.r - m.s.r + 1,
        colspan: m.e.c - m.s.c + 1
    }));
    
    // 사용자 파일 읽기
    const userBuffer = await fs.readFile(req.file.path);
    const userWorkbook = XLSX.read(userBuffer);
    const userSheet = userWorkbook.Sheets[userWorkbook.SheetNames[0]];
    const userData = XLSX.utils.sheet_to_json(userSheet, { header: 1, defval: '' });
    
    // 자동 채우기
    const result = templateData.map((row, rowIdx) => {
        return row.map((cell, colIdx) => {
            if (userData[rowIdx] && userData[rowIdx][colIdx]) {
                return userData[rowIdx][colIdx];
            }
            return cell || '';
        });
    });
    
    await fs.unlink(req.file.path);
    
    res.json({
        success: true,
        data: result,
        mergeCells: mergeCells  // 병합 셀 정보 추가!
    });
});