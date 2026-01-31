# 吐司便签 (ToSticker) GitHub Actions 多平台自动打包执行计划

## TL;DR

> **目标**: 为 Tauri v2 项目创建 GitHub Actions 工作流，实现 Windows、Linux (x86_64 + ARM64)、macOS (Intel + Apple Silicon) 的自动化多平台打包和签名发布。
> 
> **交付物**:
> - `.github/workflows/release.yml` - 完整工作流配置
> - `docs/RELEASE_SETUP.md` - 详细的配置和设置文档
> 
> **Estimated Effort**: Medium (2-3 小时)
> **Parallel Execution**: YES - 5 平台并行构建
> **Critical Path**: Setup → Build x5 → Release Upload

---

## Context

### Original Request
用户要求为 Tauri v2 项目 "吐司便签" 制定 GitHub Actions 多平台自动打包计划，包含：
1. 自动打包工作流
2. Windows, Linux, macOS 多平台支持
3. x86_64 和 ARM 架构
4. macOS 签名和公证
5. 配置文档

### Interview Summary
**Key Discussions**:
- 使用 GitHub Release 触发构建（用户可控制发布时机）
- 使用简洁版本格式 `v1.0.0`
- 提供完整的签名配置指南（含证书申请步骤）
- 目标：GitHub Release + 签名公证
- 使用原生 ARM64 运行器（2024年底 GitHub 已提供）

**Research Findings**:
- Tauri v2 官方使用 `tauri-apps/tauri-action@v0`
- Bun 使用 `oven-sh/setup-bun@v2`
- macOS 双架构构建需要同时安装 `aarch64-apple-darwin,x86_64-apple-darwin` 目标
- Linux 需要 `libwebkit2gtk-4.1-dev` 等依赖（Tauri v2 使用 webkit2gtk 4.1）
- 证书需要 Base64 编码存储在 GitHub Secrets

### Metis Review
**Identified Gaps** (addressed):
- ✅ 确认使用 GitHub Release 触发而非 push 触发
- ✅ 提供证书申请完整流程
- ✅ 包含故障排除指南
- ✅ 提供测试验证步骤

---

## Work Objectives

### Core Objective
创建完整的 GitHub Actions CI/CD 流程，实现 Tauri 应用的多平台自动构建、签名、公证和发布。

### Concrete Deliverables
1. `.github/workflows/release.yml` - 工作流配置文件
2. `docs/RELEASE_SETUP.md` - 详细配置文档（中文）

### Definition of Done
- [ ] 工作流文件已创建并提交
- [ ] 配置文档已创建并提交
- [ ] 用户已阅读并理解配置步骤
- [ ] 用户已完成 GitHub Secrets 配置
- [ ] 成功创建测试 Release 验证构建

### Must Have
- ✅ Windows x86_64 构建
- ✅ Linux x86_64 构建
- ✅ Linux ARM64 构建
- ✅ macOS Intel (x86_64) 构建
- ✅ macOS Apple Silicon (aarch64) 构建
- ✅ macOS 签名配置
- ✅ 详细的配置文档

### Must NOT Have (Guardrails)
- ❌ Windows ARM64 构建（Tauri v2 暂不支持）
- ❌ Linux ARMv7 (32位) 构建（需求低，构建复杂）
- ❌ App Store 发布配置（当前阶段只考虑 GitHub Release）
- ❌ 自动版本号递增（使用 package.json 版本）

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (需要新建)
- **User wants tests**: Manual-only (CI/CD 本身不涉及业务逻辑测试)
- **QA approach**: Manual verification via GitHub Actions UI + Release artifacts download

### Automated Verification (NO User Intervention)

**For Workflow changes** (using Bash):
```bash
# Agent runs:
git add .github/workflows/release.yml
git commit -m "ci: add multi-platform release workflow"
git push origin main
# Assert: Workflow file appears in .github/workflows/ directory
# Assert: GitHub UI > Actions shows the workflow
```

**For Documentation** (using Bash):
```bash
# Agent runs:
ls -la docs/RELEASE_SETUP.md
# Assert: File exists and size > 1000 bytes
```

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately):
├── Task 1: Create workflow directory structure
└── Task 2: Create docs directory

Wave 2 (After Wave 1):
├── Task 3: Generate release.yml workflow file
└── Task 4: Generate RELEASE_SETUP.md documentation

Wave 3 (After Wave 2):
└── Task 5: Commit and push to repository

Critical Path: Task 1 → Task 3 → Task 5
Parallel Speedup: All tasks independent except commit ordering
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1 | None | 3, 4 | 2 |
| 2 | None | 3, 4 | 1 |
| 3 | 1 | 5 | 4 |
| 4 | 2 | 5 | 3 |
| 5 | 3, 4 | None | None (final) |

---

## TODOs

- [ ] 1. 创建工作流目录结构

  **What to do**:
  - 创建 `.github/workflows/` 目录
  - 确保目录权限正确

  **Must NOT do**:
  - 不要创建其他不必要的目录
  - 不要修改现有文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Reason**: 简单的目录创建，无复杂逻辑

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 3
  - **Blocked By**: None

  **Acceptance Criteria**:
  ```bash
  ls -la .github/workflows/
  # Assert: Directory exists
  ```

  **Commit**: YES (groups with Task 2, 3, 4)

---

- [ ] 2. 创建文档目录

  **What to do**:
  - 创建 `docs/` 目录（如果不存在）

  **Must NOT do**:
  - 不要创建嵌套子目录

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 4
  - **Blocked By**: None

  **Acceptance Criteria**:
  ```bash
  ls -la docs/
  # Assert: Directory exists
  ```

  **Commit**: YES (groups with Task 1, 3, 4)

---

- [ ] 3. 生成 release.yml 工作流文件

  **What to do**:
  - 创建 `.github/workflows/release.yml` 文件
  - 包含完整的 5 平台构建矩阵
  - 配置 Bun 环境
  - 配置 Rust 环境
  - 配置 macOS 签名和公证
  - 配置 GitHub Release 自动创建

  **Must NOT do**:
  - 不要硬编码敏感信息
  - 不要修改 tauri.conf.json 的 bundle 配置

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Reason**: 需要准确理解 Tauri Actions 语法和 YAML 结构

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 4)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5
  - **Blocked By**: Task 1

  **References**:
  - `src-tauri/tauri.conf.json` - 应用标识符、版本信息
  - `package.json` - 确认使用 Bun
  - Tauri v2 官方文档: https://v2.tauri.app/distribute/pipelines/github/
  - tauri-action: https://github.com/tauri-apps/tauri-action

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  cat .github/workflows/release.yml | grep -E "(name:|on:|jobs:)"
  # Assert: Contains workflow structure
  # Assert: Contains 5 platform entries in matrix
  # Assert: Contains oven-sh/setup-bun
  # Assert: Contains APPLE_CERTIFICATE environment variables
  ```

  **Commit**: YES (groups with Task 1, 2, 4)
  - Message: `ci: add GitHub Actions workflow for multi-platform releases`

---

- [ ] 4. 生成 RELEASE_SETUP.md 配置文档

  **What to do**:
  - 创建 `docs/RELEASE_SETUP.md` 文件
  - 包含 Apple Developer 账号设置指南
  - 包含证书创建和导出步骤
  - 包含 GitHub Secrets 设置步骤
  - 包含测试和验证步骤
  - 包含故障排除指南

  **Must NOT do**:
  - 不要包含实际证书内容
  - 不要假设用户已有 Apple Developer 账号

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: []
  - **Reason**: 需要编写清晰的中文技术文档

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 3)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 5
  - **Blocked By**: Task 2

  **References**:
  - Apple Developer 文档
  - Tauri macOS 签名文档

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  wc -l docs/RELEASE_SETUP.md
  # Assert: File has > 100 lines
  
  grep -E "(Apple Developer|证书|Secrets|BASE64|故障排除)" docs/RELEASE_SETUP.md
  # Assert: Contains all required sections
  ```

  **Commit**: YES (groups with Task 1, 2, 3)
  - Message: `docs: add release setup documentation in Chinese`

---

- [ ] 5. 提交所有更改到仓库

  **What to do**:
  - 添加所有新文件到 git
  - 提交更改
  - 推送到远程仓库

  **Must NOT do**:
  - 不要提交未完成的更改
  - 不要修改其他文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: None (final task)
  - **Blocked By**: Task 3, Task 4

  **Acceptance Criteria**:
  ```bash
  # Agent runs:
  git status
  # Assert: Working tree clean
  
  git log --oneline -1
  # Assert: Last commit is about workflow or docs
  
  git push origin main
  # Assert: Push succeeds
  ```

  **Commit**: N/A (this is the commit task itself)

---

## Technical Details

### 工作流触发条件
```yaml
on:
  workflow_dispatch:  # 手动触发
  release:
    types: [created]  # 创建 Release 时触发
```

### 构建矩阵配置
| 平台 | 运行器 | 目标 | 架构 |
|------|--------|------|------|
| macOS Apple Silicon | macos-latest | aarch64-apple-darwin | aarch64 |
| macOS Intel | macos-latest | x86_64-apple-darwin | x86_64 |
| Linux x86_64 | ubuntu-22.04 | x86_64-unknown-linux-gnu | x86_64 |
| Linux ARM64 | ubuntu-22.04-arm | aarch64-unknown-linux-gnu | aarch64 |
| Windows x86_64 | windows-latest | x86_64-pc-windows-msvc | x86_64 |

### 所需 GitHub Secrets

**macOS 签名 (必需)**:
- `APPLE_CERTIFICATE`: Base64 编码的 .p12 证书
- `APPLE_CERTIFICATE_PASSWORD`: 证书密码
- `APPLE_ID`: Apple ID 邮箱
- `APPLE_PASSWORD`: Apple ID 应用专用密码
- `APPLE_TEAM_ID`: Apple Team ID
- `KEYCHAIN_PASSWORD`: 临时钥匙串密码（任意值）

**自动提供**:
- `GITHUB_TOKEN`: 由 GitHub 自动提供，无需手动设置

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1-4 | `ci: add GitHub Actions workflow for multi-platform releases` | `.github/workflows/release.yml`, `docs/RELEASE_SETUP.md` | git status shows clean |

---

## Success Criteria

### Verification Commands
```bash
# 1. 检查文件存在
ls -la .github/workflows/release.yml
ls -la docs/RELEASE_SETUP.md

# 2. 验证 YAML 语法
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml'))"
# Expected: 无错误输出

# 3. 验证工作流在 GitHub UI 可见
# (需要查看 GitHub 仓库 Actions 页面)
```

### Final Checklist
- [ ] `.github/workflows/release.yml` 存在且语法正确
- [ ] `docs/RELEASE_SETUP.md` 存在且内容完整
- [ ] 文件已提交并推送到仓库
- [ ] GitHub Actions 页面显示新工作流

---

## 附加说明

### 用户后续步骤
1. **阅读文档**: 仔细阅读 `docs/RELEASE_SETUP.md`
2. **申请证书**: 如果没有 Apple Developer 账号，需要申请（$99/年）
3. **配置 Secrets**: 按照文档步骤在 GitHub 仓库设置 Secrets
4. **测试构建**: 创建一个测试 Release 验证工作流是否正常

### 已知限制
- Windows ARM64: Tauri v2 暂不支持
- Linux ARMv7: 不在当前计划内（需求低）
- App Store: 当前仅支持 GitHub Release 分发

### 成本考虑
- **公共仓库**: 所有构建免费（包括 ARM64）
- **私有仓库**: GitHub Actions 有免费额度，超出后按分钟计费
  - 预估每次构建约 15-20 分钟 × 5 平台 = 约 100 分钟
  - GitHub 免费额度：2000 分钟/月（公共仓库无限制）

---

*计划生成时间: 2026-01-31*
*适用于: tosticker (吐司便签) v0.1.0*
