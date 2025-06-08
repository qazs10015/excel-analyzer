# Excel 資料查詢系統 - Docker 部署指南

## 🚀 Docker 快速啟動

### 方法一：使用 Docker Compose (推薦)

1. **準備資料檔案**
   ```bash
   # 確保 database 目錄存在並放入你的 Excel 檔案
   mkdir -p database
   # 將你的 .xls 或 .xlsx 檔案複製到 database/ 目錄
   ```

2. **啟動服務**
   ```bash
   # 構建並啟動容器
   docker-compose up --build

   # 背景執行
   docker-compose up -d --build
   ```

3. **訪問應用**
   - 打開瀏覽器訪問: http://localhost:3001
   - API 端點: http://localhost:3001/api/

### 方法二：使用 Docker 指令

1. **構建映像**
   ```bash
   docker build -t excel-analyzer .
   ```

2. **運行容器**
   ```bash
   docker run -d \
     --name excel-analyzer \
     -p 3001:3001 \
     -v $(pwd)/database:/app/database \
     excel-analyzer
   ```

## 📁 資料管理

### 添加新的 Excel 檔案
```bash
# 將新的 Excel 檔案複製到 database 目錄
cp your-new-file.xlsx database/

# 重新載入資料 (不需要重啟容器)
curl -X POST http://localhost:3001/api/reload
```

### 檢查服務狀態
```bash
# 查看容器狀態
docker-compose ps

# 查看日誌
docker-compose logs -f excel-tool

# 健康檢查
curl http://localhost:3001/api/health
```

## 🛠️ 管理指令

### 停止服務
```bash
docker-compose down
```

### 重新啟動
```bash
docker-compose restart
```

### 更新應用
```bash
# 重新構建並啟動
docker-compose up --build -d
```

### 清理資源
```bash
# 停止並移除容器、網路
docker-compose down

# 移除映像 (可選)
docker rmi excel-analyzer
```

## 🔧 自定義配置

### 環境變數
在 `docker-compose.yml` 中可以修改以下環境變數：

- `PORT`: 服務端口 (預設: 3001)
- `DATA_DIR`: 資料目錄路徑 (預設: ./database)
- `NODE_ENV`: 運行環境 (預設: production)

### 端口映射
如果需要使用不同端口，修改 `docker-compose.yml` 中的 ports 設定：
```yaml
ports:
  - "8080:3001"  # 主機端口:容器端口
```

## 📊 功能特色

- ✅ Excel 檔案自動解析
- ✅ 零組件資料搜尋
- ✅ 多欄位篩選
- ✅ 檔案級別過濾
- ✅ 即時資料重新載入
- ✅ 響應式 Web 介面
- ✅ Docker 化部署

## 🐳 Docker 優勢

1. **環境一致性**: 無論在哪台機器都能保證相同的運行環境
2. **快速部署**: 一鍵啟動完整服務
3. **資料持久化**: 通過 volume 掛載確保資料不丟失
4. **隔離性**: 不影響主機環境
5. **可擴展性**: 易於擴展到多容器架構

## 📝 注意事項

- 確保 Docker 和 Docker Compose 已安裝
- Excel 檔案需要放在 `database/` 目錄中
- 首次構建可能需要幾分鐘時間
- 資料目錄會自動掛載，修改檔案會實時反映
