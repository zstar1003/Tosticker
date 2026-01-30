# MindFlow 数据同步方案

## 架构设计

### Local-First 架构
MindFlow 采用 Local-first 架构，所有数据首先存储在本地 SQLite 数据库，确保：
- ✅ 离线可用
- ✅ 快速响应
- ✅ 数据主权（用户完全控制数据）
- ✅ 无需服务器

### 同步策略

#### 方案1: 文件级同步（推荐，简单易用）
利用第三方文件同步服务同步数据库文件：

**支持的同步服务：**
- **macOS/iOS**: iCloud Drive
- **跨平台**: Dropbox, Google Drive, Syncthing, Resilio Sync

**实现方式：**
1. 数据库文件位于应用数据目录：`~/Library/Application Support/com.mindflow.app/mindflow.db`
2. 用户将数据库文件链接到云同步文件夹
3. 多设备间通过云同步服务自动同步

**优点：**
- 简单配置，无需开发服务器
- 支持所有平台
- 完全免费
- 数据加密（由云服务提供）

#### 方案2: 自定义同步服务器（高级）
自建同步服务器，使用 CRDT (Conflict-free Replicated Data Types) 算法处理冲突。

**技术栈：**
- Turso (SQLite Edge Database)
- Electric SQL (Sync Engine)
- 或自建 WebSocket 同步服务

### 配置指南

## macOS + iCloud 同步配置

1. 打开 Finder，前往 `~/Library/Application Support/com.mindflow.app/`
2. 找到 `mindflow.db` 文件
3. 创建符号链接到 iCloud Drive:
   ```bash
   ln -s ~/Library/Mobile\ Documents/com~apple~CloudDocs/MindFlow/mindflow.db \
          ~/Library/Application\ Support/com.mindflow.app/mindflow.db
   ```

## iOS 支持

Tauri v2 支持 iOS，通过以下步骤构建：

```bash
# 初始化 iOS 项目
cd mindflow-todo
npm run tauri ios init

# 开发模式
npm run tauri ios dev

# 构建
npm run tauri ios build
```

### iOS 配置

1. 在 Xcode 中打开 `src-tauri/gen/apple/mindflow-todo.xcodeproj`
2. 配置 Signing & Capabilities
3. 启用 iCloud 容器（如需同步）
4. 构建并运行

## 数据安全

- 数据库存储在应用沙盒内
- 支持数据库加密（可通过 SQLCipher）
- 备份和恢复功能

## 导出/导入

应用内置数据导出导入功能：
- 导出: 生成 JSON 备份文件
- 导入: 从 JSON 恢复数据
