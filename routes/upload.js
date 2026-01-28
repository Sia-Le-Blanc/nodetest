const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const UploadedFile = require('../models/UploadedFile');
const XLSX = require('xlsx');
const OpenAI = require('openai');

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        // 한글 파일명 Buffer 디코딩
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const uniqueName = Date.now() + '-' + originalName;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

router.post('/files', upload.array('files', 500), async (req, res) => {
    try {
        const savedFiles = [];
        const skipped = [];
        
        for (const file of req.files) {
            const fileType = file.mimetype.includes('image') ? 'image' : 'excel';
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            
            // 같은 파일명이 이미 있는지 확인
            const existing = await UploadedFile.findOne({
                where: { 
                    original_name: originalName,
                    processed: false  // 미처리 파일만 체크
                }
            });
            
            if (existing) {
                // 중복 파일은 스킵하고 삭제
                await fs.unlink(file.path);
                skipped.push(originalName);
                continue;
            }
            
            const uploadedFile = await UploadedFile.create({
                file_path: file.path,
                file_type: fileType,
                original_name: originalName,
                processed: false
            });
            
            savedFiles.push(uploadedFile);
        }
        
        res.json({ 
            success: true, 
            uploaded: savedFiles.length,
            skipped: skipped.length,
            skippedFiles: skipped,
            message: `${savedFiles.length}개 업로드, ${skipped.length}개 중복 스킵`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 저장된 파일들 처리 (배치)
router.post('/process', async (req, res) => {
    try {
        // 미처리 파일들 가져오기
        const unprocessedFiles = await UploadedFile.findAll({
            where: { processed: false }
        });
        
        const results = [];
        
        for (const fileRecord of unprocessedFiles) {
            // 경로에서 파일 읽기
            const fileBuffer = await fs.readFile(fileRecord.file_path);
            
            // 파일 타입별 처리
            let processedData;
            if (fileRecord.file_type === 'excel') {
                processedData = await processExcel(fileBuffer);
            } else if (fileRecord.file_type === 'image') {
                processedData = await processImage(fileBuffer);
            }
            
            // 처리 완료 표시
            await fileRecord.update({ processed: true });
            
            // 처리 후 파일 삭제
            await fs.unlink(fileRecord.file_path);
            
            results.push({
                id: fileRecord.id,
                name: fileRecord.original_name,
                result: processedData
            });
        }
        
        res.json({ 
            success: true, 
            processed: results.length,
            results 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 엑셀 처리 함수
async function processExcel(buffer) {
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];  // 첫 번째 시트
    const sheet = workbook.Sheets[sheetName];
    
    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // 텍스트로 변환
    const text = data.map(row => row.join(' | ')).join('\n');
    
    return {
        success: true,
        rows: data.length,
        preview: text.substring(0, 200)  // 처음 200자만
    };
}

const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY
});

// 이미지 처리 함수 (GPT Vision)
async function processImage(buffer) {
    const base64Image = buffer.toString('base64');
    
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: '이 영수증에서 정보를 JSON 형식으로만 추출해줘. 다른 설명 없이 오직 JSON만: {"상호명": "", "금액": 0, "날짜": "", "품목": ""}'
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: `data:image/jpeg;base64,${base64Image}`
                    }
                }
            ]
        }],
        max_tokens: 1000
    });
    
    const text = response.choices[0].message.content;
    const cleanText = text.replace(/```json|```/g, '').trim();
    
    try {
        return JSON.parse(cleanText);
    } catch {
        return { error: 'JSON 파싱 실패', rawText: text };
    }
}

module.exports = router;