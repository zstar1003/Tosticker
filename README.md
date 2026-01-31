<p align="center">
  <img width="100" height="100" src="public/icon.svg" alt="Logo">
</p>

<h1 align="center"><b>吐司便签</b></h1>

<p align="center">
  一款跨平台桌面便签待办应用
</p>

## 快速下载

访问[下载页面](https://github.com/zstar1003/Tosticker/releases/latest)下载该软件，支持Windows/Linux/MacOS系统。

<div align="center">

![软件界面](assets/image.png)

</div>


## 开发指南

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/zstar1003/Tosticker
cd Tosticker

# 安装依赖
bun install

# 生成应用图标
bun run icon:generate

# 启动开发环境
bun run tauri:dev
```

### 构建生产版本

```bash
# macOS
bun run tauri:build

# 构建完成后，安装包位于:
# src-tauri/target/release/bundle/dmg/吐司便签_0.1.0_aarch64.dmg
```

## 使用说明

### 基础操作

| 操作 | 说明 |
|------|------|
| **添加待办** | 点击右下角的 `+` 按钮，输入待办内容 |
| **完成待办** | 点击待办左侧的方框，标记为完成 |
| **编辑待办** | 点击待办右侧的铅笔图标，可修改内容和优先级 |
| **删除待办** | 点击待办右侧的垃圾桶图标 |
| **拖拽排序** | 在未完成标签页，按住待办项拖动调整顺序 |
| **切换标签** | 点击顶部的"未完成"/"已完成"切换视图 |

### AI 功能

1. 打开设置（点击右上角的齿轮图标）
2. 配置智谱 AI API 密钥（从 [open.bigmodel.cn](https://open.bigmodel.cn) 获取）
3. 添加待办时，点击输入框右侧的 ✨ 按钮，AI 将自动优化标题

### 快捷键

- `Ctrl + O` - 显示/隐藏应用窗口

## 配置说明

### AI 设置

应用支持智谱 AI（Zhipu AI）的 `glm-4.7-flash` 模型：

1. 访问 [open.bigmodel.cn](https://open.bigmodel.cn) 注册账号
2. 获取 API Key
3. 在应用设置中填入 API Key
4. 点击"测试连接"验证配置

### 数据存储

- **macOS**: `~/Library/Application Support/com.tosticker.app/tosticker.db`
- **Windows**: `%APPDATA%/com.tosticker.app/tosticker.db`
- **Linux**: `~/.local/share/com.tosticker.app/tosticker.db`


## 许可证

[MIT License](LICENSE)

## 致谢

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [React](https://react.dev/) - 用户界面库
- [Bun](https://bun.sh/) - JavaScript 运行时
- [智谱 AI](https://open.bigmodel.cn/) - AI 服务