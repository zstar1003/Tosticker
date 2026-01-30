#!/bin/bash

echo "🌊 MindFlow - 快速启动脚本"
echo "=========================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查 Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    echo "   访问 https://rustup.rs/ 安装"
    exit 1
fi

# 检查 Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "📦 安装 Tauri CLI..."
    npm install -g @tauri-apps/cli
fi

echo "✅ 环境检查通过"
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
npm install

# 生成图标
echo "🎨 生成应用图标..."
cd src-tauri
tauri icon ../public/icon.svg
cd ..

echo ""
echo "✨ 安装完成！"
echo ""
echo "可用命令："
echo "  npm run tauri:dev       - 桌面端开发模式"
echo "  npm run tauri:build     - 构建生产版本"
echo "  npm run tauri:ios:dev   - iOS 开发（macOS 需要）"
echo "  npm run tauri:android:dev - Android 开发"
echo ""
echo "启动开发服务器..."
npm run tauri:dev
