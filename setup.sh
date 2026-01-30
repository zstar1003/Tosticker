#!/usr/bin/env bash

set -e

echo "🌊 MindFlow - Bun 快速启动脚本"
echo "================================"
echo ""

# 检查 Bun
if ! command -v bun &> /dev/null; then
    echo "❌ Bun 未安装，正在安装..."
    curl -fsSL https://bun.sh/install | bash
    
    # 重新加载 shell 配置
    if [ -f "$HOME/.bashrc" ]; then
        source "$HOME/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
        source "$HOME/.zshrc"
    fi
    
    if ! command -v bun &> /dev/null; then
        echo "⚠️  请手动重启终端或运行: source ~/.bashrc (或 ~/.zshrc)"
        exit 1
    fi
fi

echo "✅ Bun 版本: $(bun --version)"

# 检查 Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust 未安装，请先安装 Rust"
    echo "   访问 https://rustup.rs/ 安装"
    exit 1
fi

echo "✅ Rust 版本: $(cargo --version)"
echo ""

# 安装依赖
echo "📦 安装项目依赖..."
bun install

# 生成图标（如果不存在）
if [ ! -d "src-tauri/icons" ] || [ -z "$(ls -A src-tauri/icons 2>/dev/null)" ]; then
    echo "🎨 生成应用图标..."
    cd src-tauri
    bunx --bun tauri icon ../public/icon.svg
    cd ..
else
    echo "✅ 图标已存在，跳过生成"
fi

echo ""
echo "✨ 安装完成！"
echo ""
echo "🚀 可用命令："
echo ""
echo "  开发模式："
echo "    bun run tauri:dev        - 桌面端开发"
echo "    bun run tauri:ios:dev    - iOS 开发（macOS 需要）"
echo "    bun run tauri:android:dev - Android 开发"
echo ""
echo "  构建生产版本："
echo "    bun run tauri:build      - 桌面端构建"
echo "    bun run tauri:ios:build  - iOS 构建"
echo "    bun run tauri:android:build - Android 构建"
echo ""
echo "  其他命令："
echo "    bun run setup            - 完整项目设置"
echo "    bun run clean            - 清理所有构建文件"
echo "    bun run typecheck        - TypeScript 类型检查"
echo ""
echo "🎯 正在启动桌面端开发服务器..."
echo ""
bun run tauri:dev
