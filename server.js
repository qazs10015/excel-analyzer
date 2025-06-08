import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const sampleDataDir = './sample data';

// 載入並解析所有 Excel 數據
function loadAllExcelData() {
  const allData = [];

  const files = fs.readdirSync(sampleDataDir).filter((file) => file.endsWith('.xls') || file.endsWith('.xlsx'));

  files.forEach((filename) => {
    const filePath = path.join(sampleDataDir, filename);
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
  });

  return allData;
}

// 載入數據
const excelData = loadAllExcelData();
console.log(`✅ 成功載入 ${excelData.length} 筆零組件數據`);

// API 路由
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

  // 如果指定檔案，先過濾檔案
  if (fileName) {
    filteredData = filteredData.filter((item) => item.fileName.toLowerCase().includes(fileName.toLowerCase()));
  }

  // 搜尋邏輯
  const results = filteredData.filter((item) => {
    const searchTerm = query.toLowerCase();

    if (field && field !== 'all') {
      // 特定欄位搜尋
      const fieldValue = item.componentData[field];
      return fieldValue && fieldValue.toString().toLowerCase().includes(searchTerm);
    } else {
      // 全欄位搜尋 (包含產品資訊和零組件資料)
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
    results: results.map((item) => ({
      fileName: item.fileName,
      sheetName: item.sheetName,
      productInfo: item.productInfo,
      componentData: item.componentData,
    })),
  });
});

// 取得所有可用的欄位
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

// 取得所有檔案名稱
app.get('/api/files', (req, res) => {
  const files = [...new Set(excelData.map((item) => item.fileName))];

  res.json({
    success: true,
    files: files,
  });
});

// 取得統計資訊
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   GET /api/search?query=關鍵字&field=欄位名稱&fileName=檔案名稱`);
  console.log(`   GET /api/fields`);
  console.log(`   GET /api/files`);
  console.log(`   GET /api/stats`);
});
