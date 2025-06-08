# Excel 分析工具 📊

一個功能強大的 Excel 檔案分析和搜尋工具，支援上傳、解析和搜尋 Excel 檔案中的資料。

## ✨ 功能特色

- 📁 **檔案上傳**: 支援上傳 Excel 檔案 (.xlsx, .xls)
- 🔍 **智能搜尋**: 快速搜尋表格中的特定資料
- 📊 **資料分析**: 分析 Excel 檔案結構和內容
- 🌐 **網頁介面**: 友善的前端操作介面
- 🐳 **Docker 支援**: 容器化部署，一鍵啟動
- 💾 **資料持久化**: 自動儲存分析結果

## 🛠️ 技術架構

### 後端
- **Node.js** - 伺服器端運行環境
- **Express.js** - Web 應用框架
- **xlsx** - Excel 檔案解析
- **CORS** - 跨域資源分享

### 前端
- **React 19** - 使用者介面框架
- **Vite** - 快速開發建置工具
- **Axios** - HTTP 客戶端

### 部署
- **Docker** - 容器化技術
- **Docker Compose** - 多容器應用管理

## 📋 系統需求

- Node.js 16.0 或更高版本
- npm 或 yarn 套件管理器
- Docker (選用，用於容器化部署)

## 🚀 快速開始

### 方法一：直接運行

1. **克隆專案**
   ```bash
   git clone https://github.com/qazs10015/excel-analyzer.git
   cd excel-analyzer
   ```

2. **安裝後端依賴**
   ```bash
   npm install
   ```

3. **安裝前端依賴**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **啟動後端服務**
   ```bash
   npm run start
   ```

5. **啟動前端服務** (另開終端)
   ```bash
   cd frontend
   npm run dev
   ```

6. **訪問應用**
   - 前端：http://localhost:5173
   - 後端 API：http://localhost:3001

### 方法二：Docker 部署

1. **使用 Docker Compose 一鍵啟動**
   ```bash
   npm run docker:compose
   ```

2. **或者手動建置和運行**
   ```bash
   # 建置 Docker 映像
   npm run docker:build
   
   # 運行容器
   npm run docker:run
   ```

3. **停止容器**
   ```bash
   npm run docker:stop
   ```

## 📖 使用說明

### 基本操作

1. **上傳 Excel 檔案**
   - 在網頁介面中點擊上傳按鈕
   - 選擇您要分析的 Excel 檔案
   - 系統會自動解析檔案內容

2. **搜尋資料**
   - 在搜尋框中輸入關鍵字
   - 系統會在所有已上傳的檔案中搜尋
   - 顯示包含關鍵字的所有記錄

3. **查看分析結果**
   - 檢視檔案結構和統計資訊
   - 瀏覽表格資料
   - 下載分析報告

### API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/upload` | 上傳 Excel 檔案 |
| GET | `/api/search` | 搜尋資料 |
| GET | `/api/files` | 獲取檔案列表 |
| GET | `/api/analyze/:fileId` | 分析特定檔案 |

## 📁 專案結構

```
excel-analyzer/
├── 📄 README.md                 # 專案說明文件
├── 📄 package.json              # 後端依賴配置
├── 📄 server.js                 # 主要伺服器檔案
├── 📄 server-commonjs.js        # CommonJS 版本伺服器
├── 📄 server-debug.js           # 除錯版本伺服器
├── 📄 detailed-analyze.js       # 詳細分析功能
├── 📄 Dockerfile               # Docker 容器配置
├── 📄 docker-compose.yml       # Docker Compose 配置
├── 📁 database/                 # 資料庫檔案
└── 📁 frontend/                 # 前端應用
    ├── 📄 index.html            # 主頁面
    ├── 📄 package.json          # 前端依賴配置
    ├── 📄 vite.config.js        # Vite 配置
    ├── 📁 src/                  # 源代碼
    │   ├── 📄 App.jsx           # 主應用組件
    │   ├── 📄 main.jsx          # 應用入口
    │   └── 📁 assets/           # 靜態資源
    └── 📁 public/               # 公共資源
```

## 🔧 開發指南

### 可用腳本

#### 後端
```bash
npm run start        # 啟動生產環境伺服器
npm run dev          # 啟動開發環境伺服器
npm run analyze      # 運行分析腳本
```

#### 前端
```bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run preview      # 預覽建置結果
npm run lint         # 程式碼檢查
```

#### Docker
```bash
npm run docker:build    # 建置 Docker 映像
npm run docker:run      # 運行 Docker 容器
npm run docker:compose  # 使用 Docker Compose 啟動
npm run docker:stop     # 停止 Docker Compose 服務
```

### 環境配置

建立 `.env` 檔案來配置環境變數：

```env
PORT=3001
NODE_ENV=production
DATABASE_PATH=./database
MAX_FILE_SIZE=10MB
```

## 🤝 貢獻指南

1. Fork 這個專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 版本歷史

- **v1.0.0** (2025-06-08)
  - 初始版本發布
  - 基本 Excel 上傳和解析功能
  - React 前端介面
  - Docker 容器化支援

## 📄 授權條款

本專案使用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 📞 聯絡方式

- **專案連結**: [https://github.com/qazs10015/excel-analyzer](https://github.com/qazs10015/excel-analyzer)
- **問題回報**: [Issues](https://github.com/qazs10015/excel-analyzer/issues)

## 🙏 致謝

感謝以下開源專案的支持：
- [xlsx](https://github.com/SheetJS/sheetjs) - Excel 檔案處理
- [React](https://react.dev/) - 前端框架
- [Express.js](https://expressjs.com/) - 後端框架
- [Vite](https://vitejs.dev/) - 前端建置工具

---

⭐ 如果這個專案對您有幫助，請給我們一顆星！