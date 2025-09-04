# Website Screenshot 📸

一个基于 SvelteKit 和 Playwright 构建的网站截图服务，支持高质量网页截图并提供 RESTful API。

## ✨ 特性

- 🚀 **高性能截图**：基于 Playwright Chromium 引擎
- 🌍 **中文支持**：完美支持中文网站截图，无乱码问题
- 📱 **响应式截图**：支持自定义视窗大小和全页截图
- 🔄 **实时进度**：支持 Server-Sent Events 流式 API
- 📥 **一键下载**：支持截图结果直接下载
- 🐳 **Docker 支持**：提供完整的 Docker 部署方案

## 🛠 技术栈

- **前端**：SvelteKit + Svelte 5 + TailwindCSS
- **后端**：SvelteKit API Routes
- **截图引擎**：Playwright Chromium
- **部署**：Node.js + Docker

## 📋 API 文档

### 1. 直接截图 API

```http
GET /api/screenshot?url={URL}&fullpage={boolean}
```

**参数**：
- `url` (必需)：要截图的网址
- `fullpage` (可选)：是否全页截图，默认 `false`

**响应**：
- Content-Type: `image/png`
- 直接返回 PNG 图片数据

**示例**：
```bash
curl "http://localhost:3000/api/screenshot?url=https://github.com" \
  --output screenshot.png
```

### 2. 流式截图 API(BETA)

```http
POST /api/screenshot/stream
Content-Type: application/json

{
  "url": "https://example.com"
}
```

**响应**：
- Content-Type: `text/event-stream`
- Server-Sent Events 格式

**事件格式**：
```json
{
  "status": "starting|navigating|capturing|completed|error",
  "message": "状态描述",
  "imageData": "data:image/png;base64,..."  // 仅在 completed 状态
}
```

**示例**：
```javascript
const response = await fetch('/api/screenshot/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://github.com' })
});

const reader = response.body?.getReader();
// 处理流式响应...
```

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 访问应用
open http://localhost:3000
```

### Docker 部署

```bash
# 构建镜像
docker build -t website-screenshot .

# 运行容器
docker run -p 3000:3000 website-screenshot
```

## 🏗 项目结构

```
src/
├── routes/
│   ├── +page.svelte              # 主页面 - 截图工具界面
│   ├── api-demo/+page.svelte      # API 演示页面
│   └── api/screenshot/
│       ├── +server.ts             # 直接截图 API
│       └── stream/+server.ts      # 流式截图 API
├── lib/
│   └── components/                # 共享组件
└── app.html                       # HTML 模板
```

## ⚙️ 配置说明

### Chromium 启动参数

为确保在容器环境中正常运行和支持中文字体渲染，项目配置了以下启动参数：

```javascript
{
  executablePath: '/usr/bin/chromium-browser',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--font-render-hinting=none',
    '--disable-font-subpixel-positioning'
  ]
}
```

### Docker 字体支持

Dockerfile 中安装了中文字体包以支持中文内容截图：

```dockerfile
RUN apk add --no-cache \
    chromium \
    wqy-zenhei \
    ttf-wqy-zenhei \
    ttf-dejavu \
    fontconfig

# 配置字体缓存
RUN fc-cache -fv
```

## 📝 使用示例

### Web 界面使用

1. 访问 `http://localhost:3000`
2. 在输入框中输入要截图的网址
3. 点击「Screenshot」按钮
4. 等待截图完成后点击「Download」下载

### 程序化调用

```javascript
// Node.js 示例
const fs = require('fs');

async function captureScreenshot(url) {
  const response = await fetch(`http://localhost:3000/api/screenshot?url=${encodeURIComponent(url)}`);
  
  if (response.ok) {
    const buffer = await response.arrayBuffer();
    fs.writeFileSync('screenshot.png', Buffer.from(buffer));
    console.log('Screenshot saved!');
  }
}

captureScreenshot('https://github.com');
```

```python
# Python 示例
import requests

def capture_screenshot(url):
    response = requests.get(f'http://localhost:3000/api/screenshot?url={url}')
    
    if response.status_code == 200:
        with open('screenshot.png', 'wb') as f:
            f.write(response.content)
        print('Screenshot saved!')

capture_screenshot('https://github.com')
```

## 🔧 开发命令

```bash
# 开发
pnpm run dev

# 构建
pnpm run build

# 预览构建结果
pnpm run preview

# 类型检查
pnpm run check

# 运行端到端测试
pnpm run test:e2e
```

## 🐛 故障排除

### 中文乱码问题

如果遇到中文显示乱码：

1. 确保 Docker 镜像包含中文字体
2. 检查 Chromium 启动参数是否正确
3. 验证字体缓存是否正确配置

### 截图超时

默认超时时间为 30 秒，如果需要调整：

```javascript
await page.goto(targetUrl, {
  waitUntil: 'networkidle',
  timeout: 60000,  // 增加到 60 秒
});
```

### 内存不足

在容器环境中如果遇到内存问题，可以添加以下启动参数：

```javascript
args: [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--memory-pressure-off',
  '--max-old-space-size=4096'
]
```

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果这个项目对您有帮助，请给它一个星标！