# 🚀 MindFlow 快速开始指南

## 📋 前置要求

- **Node.js**: 18.0 或更高版本
- **Rust**: 1.70 或更高版本
- **npm** 或 **yarn** 或 **pnpm**

## 🛠️ 安装步骤

### 1. 环境检查

```bash
# 检查 Node.js
node --version  # 应输出 v18.x.x 或更高

# 检查 Rust
cargo --version  # 应输出 1.70+ 版本

# 检查 npm
npm --version
```

### 2. 安装 Tauri CLI

```bash
npm install -g @tauri-apps/cli
```

### 3. 项目设置

```bash
# 进入项目目录
cd mindflow-todo

# 安装依赖
npm install

# 生成应用图标
cd src-tauri && tauri icon ../public/icon.svg && cd ..
```

## 🖥️ 桌面端开发

### 启动开发服务器

```bash
npm run tauri:dev
```

应用会自动打开，支持热重载（Hot Reload）。

### 构建生产版本

```bash
# macOS
npm run tauri:build

# 输出目录: src-tauri/target/release/bundle/
```

## 📱 移动端开发

### iOS (需要 macOS 和 Xcode)

```bash
# 初始化 iOS 项目（首次）
npm run tauri ios init

# 开发模式
npm run tauri:ios:dev

# 构建
npm run tauri:ios:build
```

### Android

```bash
# 初始化 Android 项目（首次）
npm run tauri android init

# 开发模式
npm run tauri:android:dev

# 构建
npm run tauri:android:build
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

### 端口冲突

如果端口 1420 被占用，修改 `vite.config.ts`:

```typescript
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
npm run tauri:dev
```

### 移动端连接问题

确保电脑和手机在同一 WiFi 网络下，或者使用 USB 调试。

## 📝 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 仅启动前端开发服务器 |
| `npm run tauri:dev` | 启动桌面端开发 |
| `npm run tauri:build` | 构建桌面端生产包 |
| `npm run tauri:ios:dev` | iOS 开发模式 |
| `npm run tauri:android:dev` | Android 开发模式 |
| `cargo tauri icon` | 生成应用图标 |

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

## 📞 获取帮助

- 查看完整文档: [README.md](./README.md)
- 技术架构: [ARCHITECTURE.md](./ARCHITECTURE.md)
- 同步方案: [SYNC.md](./SYNC.md)
- 提交 Issue: GitHub Issues

---

🌊 开始使用 MindFlow，让待办管理变得轻松愉快！
