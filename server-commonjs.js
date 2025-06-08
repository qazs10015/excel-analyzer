import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 支持環境變數指定數據目錄
const sampleDataDir = './database';

console.log('🚀 正在啟動 Docker 化的 Excel 查詢系統...');
console.log(`📁 數據目錄: ${sampleDataDir}`);

// 檢查數據目錄
function checkDataDirectory() {
  if (!fs.existsSync(sampleDataDir)) {
    console.warn('⚠️  數據目錄不存在，創建空目錄:', sampleDataDir);
    fs.mkdirSync(sampleDataDir, { recursive: true });
    return false;
  }

  const files = fs.readdirSync(sampleDataDir).filter((file) => file.endsWith('.xls') || file.endsWith('.xlsx'));

  if (files.length === 0) {
    console.warn('⚠️  數據目錄中沒有找到 Excel 文件');
    return false;
  }

  console.log(`✅ 找到 ${files.length} 個 Excel 文件`);
  return true;
}

// 載入並解析所有 Excel 數據
function loadAllExcelData() {
  console.log('📊 開始載入 Excel 數據...');
  const allData = [];

  if (!checkDataDirectory()) {
    console.log('📝 返回空數據集');
    return allData;
  }

  try {
    const files = fs.readdirSync(sampleDataDir).filter((file) => file.endsWith('.xls') || file.endsWith('.xlsx'));

    files.forEach((filename) => {
      console.log(`🔍 處理文件: ${filename}`);
      const filePath = path.join(sampleDataDir, filename);

      try {
        const workbook = XLSX.readFile(filePath);

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          });

          // 尋找表頭行
          let headerRowIndex = -1;
          for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            if (row.includes('序號') && row.includes('零組件(材料)名稱')) {
              headerRowIndex = i;
              break;
            }
          }

          if (headerRowIndex !== -1) {
            const headers = rawData[headerRowIndex];
            const dataRows = rawData.slice(headerRowIndex + 1).filter((row) => row.some((cell) => cell && cell.toString().trim() !== ''));

            // 提取產品資訊
            let productInfo = {
              companyName: '',
              productName: '',
              model: '',
              reportNumber: '',
            };

            // 從前幾行提取產品資訊
            for (let i = 0; i < headerRowIndex; i++) {
              const row = rawData[i];
              if (row.includes('公司名稱') && row[1]) {
                productInfo.companyName = row[1];
              }
              if (row.includes('品名') && row[1]) {
                productInfo.productName = row[1];
              }
              if (row.includes('商品型號') && row[11]) {
                productInfo.model = row[11];
              }
              if (row.includes('報告編號') && row[11]) {
                productInfo.reportNumber = row[11];
              }
            }

            dataRows.forEach((row) => {
              const structuredRow = {};
              headers.forEach((header, index) => {
                if (header) {
                  structuredRow[header] = row[index] || '';
                }
              });

              allData.push({
                fileName: filename,
                sheetName: sheetName,
                productInfo: productInfo,
                componentData: structuredRow,
              });
            });
          }
        });
      } catch (fileError) {
        console.error(`❌ 處理文件 ${filename} 時發生錯誤:`, fileError.message);
      }
    });

    return allData;
  } catch (error) {
    console.error('❌ 載入數據時發生錯誤:', error);
    return [];
  }
}

// 載入數據
let excelData = loadAllExcelData();
console.log(`✅ 成功載入 ${excelData.length} 筆零組件數據`);

// 提供重新載入數據的 API
app.post('/api/reload', (req, res) => {
  console.log('🔄 重新載入數據...');
  excelData = loadAllExcelData();

  res.json({
    success: true,
    message: '數據重新載入完成',
    totalData: excelData.length,
    timestamp: new Date().toISOString(),
  });
});

// 健康檢查 API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    dataDir: sampleDataDir,
    totalData: excelData.length,
    timestamp: new Date().toISOString(),
  });
});

// 提供靜態文件服務（前端）
app.use(express.static('./frontend/dist'));

// API 路由 (保持原有的 API 不變)
app.get('/api/search', (req, res) => {
  const { query, field, fileName } = req.query;

  if (!query) {
    return res.json({
      success: false,
      message: '請提供搜尋關鍵字',
      results: [],
    });
  }

  let filteredData = excelData;

  if (fileName) {
    filteredData = filteredData.filter((item) => item.fileName.toLowerCase().includes(fileName.toLowerCase()));
  }

  const results = filteredData.filter((item) => {
    const searchTerm = query.toLowerCase();

    if (field && field !== 'all') {
      const fieldValue = item.componentData[field];
      return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
    } else {
      const searchInProduct = Object.values(item.productInfo).some((value) => value && value.toString().toLowerCase().includes(searchTerm));

      const searchInComponent = Object.values(item.componentData).some((value) => value && value.toString().toLowerCase().includes(searchTerm));

      return searchInProduct || searchInComponent;
    }
  });

  res.json({
    success: true,
    query: query,
    field: field || 'all',
    totalResults: results.length,
    results: results,
  });
});

app.get('/api/fields', (req, res) => {
  const fields = new Set();

  excelData.forEach((item) => {
    Object.keys(item.componentData).forEach((field) => {
      if (field && field.trim()) {
        fields.add(field);
      }
    });
  });

  res.json({
    success: true,
    fields: Array.from(fields),
  });
});

app.get('/api/files', (req, res) => {
  const files = [...new Set(excelData.map((item) => item.fileName))];

  res.json({
    success: true,
    files: files,
  });
});

app.get('/api/stats', (req, res) => {
  const stats = {
    totalComponents: excelData.length,
    totalFiles: new Set(excelData.map((item) => item.fileName)).size,
    totalSheets: new Set(excelData.map((item) => `${item.fileName}-${item.sheetName}`)).size,
    companies: [...new Set(excelData.map((item) => item.productInfo.companyName).filter(Boolean))],
    products: [...new Set(excelData.map((item) => item.productInfo.productName).filter(Boolean))],
  };

  res.json({
    success: true,
    stats: stats,
  });
});

// 所有其他路由返回前端應用
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), './frontend/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Docker 化服務器運行在 http://0.0.0.0:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/search?query=關鍵字`);
  console.log(`   GET /api/fields`);
  console.log(`   GET /api/files`);
  console.log(`   GET /api/stats`);
  console.log(`   POST /api/reload`);
  console.log(`   GET /api/health`);
  console.log(`✅ 服務器已成功啟動!`);
});
