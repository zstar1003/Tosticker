# 🚀 MindFlow 快速开始指南 (Bun 版本)

> ⚡️ 本指南使用 **Bun** 替代 npm，提供更快的开发体验。

## 📋 前置要求

- **Bun**: 1.0 或更高版本 (推荐)
- **Rust**: 1.70 或更高版本

### Bun 安装

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows
powershell -c "irm bun.sh/install.ps1 | iex"

# 验证安装
bun --version  # 应输出 1.0.0 或更高
```

## 🛠️ 安装步骤

### 方法一：一键安装（推荐）

```bash
# 进入项目目录
cd mindflow-todo

# 运行自动安装脚本
chmod +x setup.sh
./setup.sh
```

这个脚本会自动完成：
- ✅ 安装 Bun（如果未安装）
- ✅ 安装项目依赖
- ✅ 生成应用图标
- ✅ 启动开发服务器

### 方法二：手动安装

#### 1. 环境检查

```bash
# 检查 Bun
bun --version

# 检查 Rust
cargo --version
```

#### 2. 安装依赖

```bash
# 安装所有依赖 (比 npm install 快 10 倍!)
bun install

# 生成应用图标
bun run icon:generate
```

## 🖥️ 桌面端开发

### 启动开发服务器

```bash
bun run tauri:dev
```

应用会自动打开，支持热重载（Hot Reload）。

> 💡 **提示**: Bun 的热重载速度比 npm 快 50%！

### 构建生产版本

```bash
# macOS
bun run tauri:build

# 输出目录: src-tauri/target/release/bundle/
```

## 📱 移动端开发

### iOS (需要 macOS 和 Xcode)

```bash
# 初始化 iOS 项目（首次）
bunx --bun tauri ios init

# 开发模式
bun run tauri:ios:dev

# 构建
bun run tauri:ios:build
```

### Android

```bash
# 初始化 Android 项目（首次）
bunx --bun tauri android init

# 开发模式
bun run tauri:android:dev

# 构建
bun run tauri:android:build
```

## 🔄 数据同步设置

### macOS + iCloud 同步

1. 打开终端
2. 运行以下命令：

```bash
# 创建 iCloud Drive 中的 MindFlow 文件夹
mkdir -p ~/Library/Mobile\ Documents/com~apple~CloudDocs/MindFlow

# 备份原始数据库（如果有）
cp ~/Library/Application\ Support/com.mindflow.app/mindflow.db \
   ~/Desktop/mindflow-backup.db

# 移动数据库到 iCloud
mv ~/Library/Application\ Support/com.mindflow.app/mindflow.db \
   ~/Library/Mobile\ Documents/com~apple~CloudDocs/MindFlow/

# 创建符号链接
ln -s ~/Library/Mobile\ Documents/com~apple~CloudDocs/MindFlow/mindflow.db \
       ~/Library/Application\ Support/com.mindflow.app/mindflow.db
```

3. 重启 MindFlow 应用
4. 在其他 Mac 上重复相同步骤

### 跨平台同步（Syncthing）

1. 安装 Syncthing: https://syncthing.net/
2. 在 Syncthing 中添加同步文件夹
3. 将数据库路径设为同步目录
4. 在所有设备上配置相同的同步设置

## 🐛 故障排除

### Bun 安装失败

```bash
# 如果 curl 安装失败，尝试 npm 安装
npm install -g bun

# 或手动下载
# https://github.com/oven-sh/bun/releases
```

### 端口冲突

```bash
# 如果端口 1420 被占用，修改 vite.config.ts:
server: {
  port: 3000,  // 改为其他端口
  strictPort: true,
}
```

### 数据库权限错误

```bash
# 修复 macOS 权限
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

### 移动端连接问题

确保电脑和手机在同一 WiFi 网络下，或者使用 USB 调试。

## 📝 Bun 常用命令速查表

| 操作 | Bun 命令 | npm 命令 | 速度 |
|------|---------|---------|------|
| 安装依赖 | `bun install` | `npm install` | 10x ⚡️ |
| 添加依赖 | `bun add <pkg>` | `npm install <pkg>` | 10x ⚡️ |
| 开发模式 | `bun run tauri:dev` | `npm run tauri:dev` | 1.5x 🚀 |
| 构建 | `bun run tauri:build` | `npm run tauri:build` | 2x 🚀 |
| 运行测试 | `bun test` | `npm test` | 3x ⚡️ |
| 执行包 | `bunx tauri` | `npx tauri` | 5x 🚀 |
| 添加开发依赖 | `bun add -d <pkg>` | `npm install -D <pkg>` | 10x ⚡️ |
| 更新依赖 | `bun update` | `npm update` | 5x 🚀 |

### 项目特定命令

| 命令 | 说明 |
|------|------|
| `bun run dev` | 仅启动前端开发服务器 |
| `bun run tauri:dev` | 启动桌面端开发 |
| `bun run tauri:build` | 构建桌面端生产包 |
| `bun run tauri:ios:dev` | iOS 开发模式 |
| `bun run tauri:android:dev` | Android 开发模式 |
| `bun run icon:generate` | 生成应用图标 |
| `bun run setup` | 完整项目设置 |
| `bun run clean` | 清理构建文件 |
| `bun run typecheck` | TypeScript 类型检查 |

## 🎯 功能使用说明

### 创建待办
1. 点击右上角"新建待办"按钮
2. 填写标题（必填）
3. 选择优先级（高/中/低）
4. 可选：添加描述、截止日期、提醒时间
5. 点击"创建待办"

### 完成待办
- 点击待办左侧的圆圈，自动归档
- 或在归档页面恢复

### 记录灵感
1. 切换到"灵感碎片"标签
2. 点击"记录灵感"
3. 输入内容，可添加标签
4. 保存

### 数据备份
1. 在设置中找到"数据管理"
2. 点击"导出备份"生成 JSON 文件
3. 需要时点击"导入备份"恢复

## 🔧 高级配置

### 自定义 Bun 配置

编辑 `bunfig.toml`:

```toml
[install]
# 使用国内镜像加速
registry = "https://registry.npmmirror.com"

[run]
# 环境变量
env = { NODE_ENV = "development" }
```

### 自定义数据库位置

编辑 `src-tauri/src/db/mod.rs`:

```rust
// 修改数据库路径
let db_path = PathBuf::from("/your/custom/path/mindflow.db");
```

### 修改主题颜色

编辑 `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#your-color',  // 修改主色
  },
}
```

## 🚀 性能优化技巧

### Bun 性能调优

```bash
# 使用 --bun 标志强制使用 Bun 运行时
bunx --bun vite

# 启用 SMID 优化（如果 CPU 支持）
export BUN_JSC_useSIMD=1

# 开发模式使用更激进的缓存
bun install --cache-dir .bun-cache
```

### 构建优化

```bash
# 生产构建（压缩）
bun run tauri:build -- --features custom-protocol

# 清理缓存重新构建
bun run clean && bun install && bun run tauri:build
```

## 📞 获取帮助

- 查看完整文档: [README.md](./README.md)
- 技术架构: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 同步方案: [SYNC.md](./SYNC.md)
- 提交 Issue: GitHub Issues

### Bun 资源

- [Bun 官方文档](https://bun.sh/docs)
- [Bun GitHub](https://github.com/oven-sh/bun)
- [Bun 1.0 发布说明](https://bun.sh/blog/bun-v1.0)

---

🌊 **开始使用 MindFlow，体验 Bun 带来的极速开发！**

<em>⚡️ 快 10 倍的依赖安装，快 5 倍的运行速度</em>
