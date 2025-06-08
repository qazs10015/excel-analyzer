# 使用官方 Node.js 18 作為基礎映像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 安裝 Python 和 build dependencies (某些 npm 套件可能需要)
RUN apk add --no-cache python3 make g++

# 複製根目錄的 package.json 和相關檔案
COPY package*.json ./

# 安裝後端依賴
RUN npm install

# 複製前端目錄
COPY frontend/ ./frontend/

# 進入前端目錄安裝依賴並構建
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# 回到根目錄
WORKDIR /app

# 複製所有原始碼
COPY . .

# 創建資料庫目錄
RUN mkdir -p database

# 暴露端口
EXPOSE 3001

# 設置環境變數
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=./database

# 啟動應用
CMD ["node", "server-commonjs.js"]
