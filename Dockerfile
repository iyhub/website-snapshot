# 使用 Node.js 官方镜像
FROM node:20-alpine AS base

# 安装系统依赖（Playwright 需要）
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    ttf-dejavu \
    fontconfig

# 设置 Chromium 路径和字体配置
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 配置字体缓存
RUN fc-cache -fv

# 安装 pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 安装 Playwright 浏览器 (仅二进制文件，依赖已在前面安装)
RUN npx playwright install chromium

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "build/index.js"]