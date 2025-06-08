import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const sampleDataDir = './database';

// 更詳細的分析
function detailedAnalysis() {
  console.log('=== 詳細數據結構分析 ===\n');

  const files = fs.readdirSync(sampleDataDir).filter((file) => file.endsWith('.xls') || file.endsWith('.xlsx'));

  files.forEach((filename) => {
    console.log(`📁 分析文件: ${filename}`);
    console.log('='.repeat(60));

    const filePath = path.join(sampleDataDir, filename);
    const workbook = XLSX.readFile(filePath);

    workbook.SheetNames.forEach((sheetName) => {
      console.log(`📊 工作表: ${sheetName}`);

      const worksheet = workbook.Sheets[sheetName];

      // 使用原始數據格式
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      console.log(`總行數: ${rawData.length}`);

      // 分析前 10 行的結構
      console.log('前 10 行詳細內容:');
      rawData.slice(0, 10).forEach((row, index) => {
        console.log(`第 ${index + 1} 行 (${row.length} 欄):`, row);
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
        console.log(`\n✅ 找到表頭在第 ${headerRowIndex + 1} 行`);
        const headers = rawData[headerRowIndex];
        console.log('表頭欄位:', headers);

        // 解析實際數據
        const dataRows = rawData.slice(headerRowIndex + 1).filter((row) => row.some((cell) => cell && cell.toString().trim() !== ''));

        console.log(`\n📈 有效數據行數: ${dataRows.length}`);

        if (dataRows.length > 0) {
          console.log('\n前 3 行實際數據:');
          dataRows.slice(0, 3).forEach((row, index) => {
            console.log(`數據行 ${index + 1}:`);
            headers.forEach((header, colIndex) => {
              if (header && row[colIndex]) {
                console.log(`  ${header}: ${row[colIndex]}`);
              }
            });
            console.log('');
          });
        }
      } else {
        console.log('⚠️  未找到標準表頭格式');
      }

      console.log('\n' + '='.repeat(40) + '\n');
    });
  });
}

// 測試搜尋不同欄位
function testFieldSearch() {
  console.log('=== 欄位搜尋測試 ===\n');

  const files = fs.readdirSync(sampleDataDir).filter((file) => file.endsWith('.xls') || file.endsWith('.xlsx'));

  const allStructuredData = [];

  files.forEach((filename) => {
    const filePath = path.join(sampleDataDir, filename);
    const workbook = XLSX.readFile(filePath);

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      // 尋找表頭
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

        dataRows.forEach((row) => {
          const structuredRow = {};
          headers.forEach((header, index) => {
            if (header) {
              structuredRow[header] = row[index] || '';
            }
          });

          allStructuredData.push({
            fileName: filename,
            sheetName: sheetName,
            data: structuredRow,
          });
        });
      }
    });
  });

  console.log(`📊 總共處理了 ${allStructuredData.length} 行結構化數據\n`);

  // 測試不同類型的搜尋
  const searchTests = [
    { field: '零組件(材料)名稱', term: 'IC' },
    { field: '製造商', term: 'Samsung' },
    { field: '型號(零組件)', term: '2025' },
    { field: null, term: 'USB' }, // 全欄位搜尋
  ];

  searchTests.forEach((test) => {
    console.log(`🔍 搜尋測試: ${test.field ? `在 "${test.field}" 欄位` : '全欄位'} 搜尋 "${test.term}"`);

    const results = allStructuredData.filter((item) => {
      if (test.field) {
        // 特定欄位搜尋
        const fieldValue = item.data[test.field];
        return fieldValue && fieldValue.toString().toLowerCase().includes(test.term.toLowerCase());
      } else {
        // 全欄位搜尋
        return Object.values(item.data).some((value) => value && value.toString().toLowerCase().includes(test.term.toLowerCase()));
      }
    });

    console.log(`   找到 ${results.length} 個結果`);
    if (results.length > 0) {
      console.log(`   範例結果:`);
      const example = results[0];
      console.log(`     文件: ${example.fileName}`);
      console.log(`     ${test.field || '匹配欄位'}: ${test.field ? example.data[test.field] : '多欄位匹配'}`);
    }
    console.log('');
  });
}

// 執行分析
detailedAnalysis();
testFieldSearch();
