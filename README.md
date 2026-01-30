# 🌊 MindFlow - 轻量级 Todo 应用 (Bun 版本)

一款基于 **Tauri v2 + React + Rust** 构建的跨平台待办事项应用，使用 **Bun** 作为包管理器和运行时。

> ⚡️ **为什么选择 Bun?** Bun 比 npm 快 10 倍，内置了包管理器、测试运行器和 bundler，让开发体验更加流畅。

## ✨ 核心特性

- 📝 **待办事项管理** - 快速创建、编辑、删除待办
- 🎯 **优先级设置** - 高/中/低三级优先级
- ⏰ **定时提醒** - 设置提醒时间，自动推送通知
- ✅ **自动归档** - 完成的待办自动归档，保持界面整洁
- 💡 **灵感碎片** - 独立的灵感记录区域，支持标签分类
- 📱 **跨平台同步** - 支持通过 iCloud/Dropbox 等同步数据
- 🎨 **极简设计** - 柔和的配色方案，流畅的交互动画
- 🔒 **本地优先** - 数据本地存储，保护隐私
- ⚡️ **极速构建** - 使用 Bun，安装和构建速度提升 10 倍

## 🚀 快速开始

### 环境要求

- **Bun** 1.0+ (推荐) 或 Node.js 18+
- **Rust** 1.70+

### 一键安装和启动

```bash
# 进入项目目录
cd mindflow-todo

# 运行一键安装脚本
chmod +x setup.sh
./setup.sh
```

### 手动安装步骤

#### 1. 安装 Bun (如果尚未安装)

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# 添加到 PATH
export PATH="$HOME/.bun/bin:$PATH"

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### 2. 安装依赖

```bash
# 安装所有依赖 (比 npm install 快 10 倍!)
bun install

# 生成应用图标
bun run icon:generate
```

#### 3. 启动开发

```bash
# 桌面端开发
bun run tauri:dev

# iOS 开发（需要 macOS + Xcode）
bun run tauri:ios:dev

# Android 开发
bun run tauri:android:dev
```

### 构建生产版本

```bash
# 桌面端构建
bun run tauri:build

# iOS 构建
bun run tauri:ios:build

# Android 构建
bun run tauri:android:build
```

## 📝 Bun vs npm 对比

| 操作 | Bun | npm | 速度提升 |
|------|-----|-----|---------|
| 安装依赖 | `bun install` | `npm install` | **10-20x** |
| 运行脚本 | `bun run dev` | `npm run dev` | **1.5x** |
| 包执行 | `bunx tauri` | `npx tauri` | **5x** |
| 添加依赖 | `bun add pkg` | `npm install pkg` | **10x** |
| 运行测试 | `bun test` | `npm test` | **3x** |

## 📁 项目结构

```
mindflow-todo/
├── 📄 配置文件
│   ├── package.json          # 依赖配置 (支持 Bun)
│   ├── bunfig.toml           # Bun 专属配置
│   ├── bun.lockb             # Bun 锁文件 (二进制，更快)
│   └── vite.config.ts        # Vite 配置
│
├── 🎨 前端源码 (src/)
│   ├── components/           # React 组件
│   ├── hooks/                # 状态管理 Hooks
│   ├── types/                # TypeScript 类型
│   ├── utils/                # 工具函数
│   └── styles/               # 全局样式
│
├── 🔧 后端源码 (src-tauri/)
│   ├── src/                  # Rust 源码
│   ├── Cargo.toml            # Rust 配置
│   └── tauri.conf.json       # Tauri 配置
│
└── 📚 文档
    ├── README.md             # 本文件
    ├── QUICKSTART.md         # 快速开始指南
    ├── ARCHITECTURE.md       # 架构文档
    └── SYNC.md               # 同步方案
```

## 🛠 常用命令

### 开发命令

```bash
# 启动开发服务器
bun run dev              # 仅前端
bun run tauri:dev        # 完整 Tauri 应用

# 类型检查
bun run typecheck

# 代码格式化
bunx --bun prettier --write .
```

### 构建命令

```bash
# 构建前端
bun run build

# 构建完整应用
bun run tauri:build

# 构建并优化 (生产环境)
bun run tauri:build -- --features custom-protocol
```

### 移动开发

```bash
# iOS
bun run tauri:ios:dev     # 开发模式
bun run tauri:ios:build   # 构建

# Android
bun run tauri:android:dev   # 开发模式
bun run tauri:android:build # 构建
```

### 项目管理

```bash
# 安装新依赖
bun add <package>
bun add -d <package>      # 开发依赖

# 更新依赖
bun update

# 清理构建文件
bun run clean

# 完整重置
bun run clean && rm -rf node_modules && bun install
```

## 🔄 数据同步方案

MindFlow 采用 **Local-first** 架构：

### 推荐方案：文件级同步

1. **macOS + iCloud Drive**
   ```bash
   # 创建符号链接到 iCloud
   ln -s ~/Library/Application\ Support/com.mindflow.app/mindflow.db \
          ~/Library/Mobile\ Documents/com~apple~CloudDocs/MindFlow/
   ```

2. **跨平台 - Syncthing/Dropbox**
   - 在设置中导出数据库路径
   - 将数据库文件放入同步文件夹
   - 在另一台设备上导入数据库路径

### 导出/导入

应用内置数据导出导入功能：
- **导出**: 设置 → 数据管理 → 导出备份
- **导入**: 设置 → 数据管理 → 导入备份

## 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 包管理器 | **Bun** | 极速 JavaScript 运行时 |
| 前端框架 | React 18 | UI 组件 |
| 构建工具 | Vite | 快速开发服务器 |
| 样式 | Tailwind CSS | 原子化 CSS |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端框架 | Tauri v2 | 跨平台应用框架 |
| 后端语言 | Rust | 高性能系统语言 |
| 数据库 | SQLite | 嵌入式关系数据库 |
| 图标 | Lucide React | 现代化图标库 |

## 📱 平台支持

| 平台 | 状态 | 说明 |
|------|------|------|
| macOS | ✅ 完整支持 | Intel + Apple Silicon |
| Windows | ✅ 完整支持 | Windows 10+ |
| Linux | ✅ 完整支持 | Ubuntu, Fedora 等 |
| iOS | ✅ 完整支持 | iOS 13+ |
| Android | ✅ 完整支持 | Android 8+ |

## ⚡️ Bun 高级配置

### bunfig.toml 配置

项目已配置 `bunfig.toml`，支持：
- 自定义 registry 镜像 (支持国内加速)
- 智能缓存策略
- 构建优化选项

### 切换 npm registry (国内用户)

编辑 `bunfig.toml`:

```toml
[install]
registry = "https://registry.npmmirror.com"  # 淘宝镜像
```

或使用命令行：

```bash
# 临时使用淘宝镜像
bun install --registry=https://registry.npmmirror.com
```

## 🐛 故障排除

### Bun 安装失败

```bash
# 如果 curl 安装失败，尝试：
npm install -g bun

# 或从 GitHub 下载
https://github.com/oven-sh/bun/releases
```

### 端口冲突

```bash
# 如果端口 1420 被占用，修改 vite.config.ts:
server: {
  port: 3000,
  strictPort: true,
}
```

### 权限错误 (macOS)

```bash
# 修复权限
chmod 755 ~/Library/Application\ Support/com.mindflow.app/
chmod 644 ~/Library/Application\ Support/com.mindflow.app/mindflow.db
```

### Rust 编译错误

```bash
# 清理并重新构建
cd src-tauri
cargo clean
cd ..
bun run tauri:dev
```

## 🔥 性能优化

Bun 带来的性能提升：

- **冷启动**: 比 npm 快 10 倍
- **热重载**: 毫秒级响应
- **依赖安装**: 并行下载，速度提升 20 倍
- **内存占用**: 比 Node.js 低 40%

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 🙏 致谢

- [Bun](https://bun.sh/) - 极速 JavaScript 运行时
- [Tauri](https://tauri.app/) - 跨平台应用框架
- [React](https://react.dev/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Rust](https://www.rust-lang.org/) - 安全高效的系统语言

---

<p align="center">
  <strong>🌊 MindFlow - 让待办管理变得轻松愉快</strong><br>
  <em>Built with ⚡️ Bun + 💜 Rust + ⚛️ React</em>
</p>
