# 吐司便签 - 多平台打包配置指南

本文档详细说明如何配置 GitHub Actions 自动打包 macOS、Windows、Linux 平台的应用，包含签名和公证步骤。

## 📋 目录

1. [快速开始](#快速开始)
2. [GitHub Secrets 配置](#github-secrets-配置)
3. [macOS 签名和公证](#macos-签名和公证)
4. [Windows 签名（可选）](#windows-签名可选)
5. [触发构建](#触发构建)
6. [故障排除](#故障排除)

---

## 快速开始

### 前置条件

1. **GitHub 仓库**: 代码已推送到 GitHub
2. **Apple Developer 账户**: 用于 macOS 签名和公证（付费版 $99/年）
3. **macOS 设备**: 用于创建和导出证书（必须有）

---

## GitHub Secrets 配置

### 步骤 1: 打开 GitHub Secrets 设置

1. 访问你的 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**

### 步骤 2: 配置 macOS 必需的 Secrets

#### `APPLE_CERTIFICATE`

这是 **Base64 编码** 的 `.p12` 证书文件。

**创建步骤**:

1. **在 Mac 上打开 Keychain Access**（钥匙串访问）
2. 找到你的 **Developer ID Application** 证书
   - 如果没有，先 [创建证书](#创建-apple-开发者证书)
3. 展开证书，选中证书和私钥（两者都要）
4. 右键 → **Export 2 items...**
5. 保存为 `.p12` 格式，设置一个密码（记住这个密码！）
6. 在终端运行：

```bash
# 将 .p12 转换为 Base64
cd ~/Downloads
openssl base64 -in "证书文件名.p12" -out certificate-base64.txt

# 查看内容
cat certificate-base64.txt | pbcopy  # 复制到剪贴板
```

7. 将 `certificate-base64.txt` 的内容粘贴到 GitHub Secret `APPLE_CERTIFICATE`

---

#### `APPLE_CERTIFICATE_PASSWORD`

你导出 `.p12` 证书时设置的密码。

---

#### `KEYCHAIN_PASSWORD`

一个随机生成的密码，用于 CI 中的临时钥匙串。

**生成方法**:
```bash
openssl rand -base64 32
```

复制生成的字符串到 `KEYCHAIN_PASSWORD`。

---

#### `APPLE_SIGNING_IDENTITY`（可选）

证书的身份标识。如果不设置，CI 会自动查找。

**查找方法**:
```bash
security find-identity -v -p codesigning
```

输出示例：
```
  1) A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9 "Developer ID Application: 你的名字 (TEAM_ID)"
     1 identities found
```

Secret 的值是引号内的完整字符串：
```
Developer ID Application: 你的名字 (TEAM_ID)
```

---

#### `APPLE_ID`

你的 Apple ID 邮箱（例如：`yourname@example.com`）。

---

#### `APPLE_PASSWORD`

Apple ID 的**应用专用密码**，不是 Apple ID 的登录密码！

**创建步骤**:

1. 访问 [appleid.apple.com](https://appleid.apple.com)
2. 登录你的 Apple ID
3. 进入 **App-Specific Passwords** 部分
4. 点击 **Generate an app-specific password...**
5. 输入标签（例如：`GitHub Actions`）
6. 复制生成的密码到 `APPLE_PASSWORD`

---

#### `APPLE_TEAM_ID`

你的 Apple Team ID。

**查找方法**:

1. 访问 [developer.apple.com/account](https://developer.apple.com/account)
2. 点击 **Membership details**
3. 找到 **Team ID**（10个字符，例如：`ABCD123456`）

---

### Secrets 配置总结

| Secret 名称 | 必填 | 说明 |
|-------------|------|------|
| `APPLE_CERTIFICATE` | ✅ | Base64 编码的 .p12 证书 |
| `APPLE_CERTIFICATE_PASSWORD` | ✅ | 证书导出密码 |
| `KEYCHAIN_PASSWORD` | ✅ | 临时钥匙串密码（随机生成） |
| `APPLE_SIGNING_IDENTITY` | ❌ | 证书标识（可选，自动查找） |
| `APPLE_ID` | ✅ | Apple ID 邮箱 |
| `APPLE_PASSWORD` | ✅ | 应用专用密码 |
| `APPLE_TEAM_ID` | ✅ | Team ID |

---

## macOS 签名和公证

### 创建 Apple 开发者证书

如果你还没有 **Developer ID Application** 证书，需要创建一个：

#### 步骤 1: 创建证书签名请求（CSR）

1. 在 Mac 上打开 **Keychain Access**（钥匙串访问）
2. 菜单栏：**Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority...**
3. 填写信息：
   - **User Email Address**: 你的邮箱
   - **Common Name**: 你的名字或公司名
   - **CA Email Address**: 留空
   - **Request is**: 选择 **Saved to disk**
4. 点击 **Continue**，保存 `CertificateSigningRequest.certSigningRequest` 文件

#### 步骤 2: 在 Apple Developer 网站创建证书

1. 访问 [Certificates, IDs & Profiles](https://developer.apple.com/account/resources/certificates/list)
2. 点击 **Create a certificate** 或 **+** 按钮
3. 选择 **Developer ID Application**（用于在 App Store 外分发）
4. 点击 **Continue**
5. 上传步骤 1 创建的 `.certSigningRequest` 文件
6. 点击 **Continue** → **Download**
7. 双击下载的 `.cer` 文件安装到 Keychain

#### 步骤 3: 导出 .p12 文件

1. 在 Keychain Access 中找到刚安装的证书
2. 展开证书，**选中证书和私钥（两者都要）**
3. 右键 → **Export 2 items...**
4. 保存为 `.p12` 格式，设置密码
5. 记住密码，稍后需要作为 `APPLE_CERTIFICATE_PASSWORD`

---

### 公证（Notarization）说明

公证是 Apple 的安全检查过程，确保应用没有恶意软件。

**工作流程**:
1. CI 构建完成后，自动上传应用到 Apple 公证服务
2. Apple 扫描应用（通常几分钟）
3. 扫描通过后，Apple 颁发公证凭证
4. CI 将凭证"staple"到应用中
5. 用户下载时不会看到安全警告

**注意事项**:
- 需要有效的 Apple Developer 账户（付费版）
- 使用 **Developer ID Application** 证书签名的应用必须公证
- 免费开发者账户无法进行公证

---

## Windows 签名（可选）

Windows 签名不是必须的，但可以避免安全警告。

### 需要购买的证书

推荐供应商：
- **DigiCert** (~$474/年)
- **Sectigo** (~$166/年)
- **SSL.com** (~$295/年)

购买后你会收到 `.pfx` 格式的证书文件。

### 配置 GitHub Secrets

#### `WINDOWS_CERTIFICATE`

Base64 编码的 `.pfx` 文件：

```powershell
# PowerShell
[Convert]::ToBase64String((Get-Content -path "certificate.pfx" -Encoding Byte)) | Out-File "certificate-base64.txt"
```

#### `WINDOWS_CERTIFICATE_PASSWORD`

导出证书时设置的密码。

---

## 触发构建

### 方法 1: 推送 Tag（推荐）

```bash
# 1. 更新版本号（在 package.json 和 Cargo.toml 中）

# 2. 提交更改
git add .
git commit -m "Release v0.1.0"

# 3. 创建 tag
git tag -a v0.1.0 -m "Release version 0.1.0"

# 4. 推送 tag
git push origin v0.1.0
```

推送后 GitHub Actions 会自动开始构建。

### 方法 2: 手动触发

1. 访问 GitHub 仓库页面
2. 点击 **Actions** → **Publish Release**
3. 点击 **Run workflow**
4. 输入版本号（例如：`0.1.0`）
5. 点击 **Run workflow**

### 方法 3: 推送到 release 分支

```bash
git checkout -b release
git push origin release
```

---

## 构建产物

构建完成后，你可以在 Release 页面下载：

| 平台 | 架构 | 文件名示例 |
|------|------|-----------|
| macOS Apple Silicon | aarch64 | `吐司便签_0.1.0_aarch64.dmg` |
| macOS Intel | x86_64 | `吐司便签_0.1.0_x86_64.dmg` |
| Windows | x64 | `吐司便签_0.1.0_x64-setup.exe` 或 `.msi` |
| Linux | x64 | `吐司便签_0.1.0_amd64.AppImage` 或 `.deb` |

---

## 故障排除

### 问题 1: macOS 证书导入失败

**症状**: CI 日志显示证书导入失败或找不到证书

**解决方案**:
1. 检查 `APPLE_CERTIFICATE` 是否是正确的 Base64 格式
2. 确保证书是 `.p12` 格式，不是 `.cer`
3. 确保证书包含私钥（导出时选择证书+私钥）
4. 重新导出证书并上传

**验证证书**:
```bash
# 本地测试证书
echo "$APPLE_CERTIFICATE" | base64 --decode > test.p12
security import test.p12 -k ~/Library/Keychains/login.keychain -P "$APPLE_CERTIFICATE_PASSWORD"
```

---

### 问题 2: macOS 公证失败

**症状**: 构建成功但应用未被公证

**解决方案**:
1. 检查 `APPLE_ID`、`APPLE_PASSWORD`、`APPLE_TEAM_ID` 是否正确
2. 确保 `APPLE_PASSWORD` 是应用专用密码，不是 Apple ID 密码
3. 检查 Apple Developer 账户状态是否正常
4. 查看 Apple 邮件是否有拒绝原因

**验证公证状态**:
```bash
# 本地检查
spctl -a -v /Applications/吐司便签.app
```

---

### 问题 3: 构建时间过长

**症状**: CI 构建超过 30 分钟

**解决方案**:
1. 这是正常的，Rust 编译需要时间
2. 使用 `swatinem/rust-cache@v2` 缓存（已配置）
3. 后续构建会更快（依赖缓存）

---

### 问题 4: Release 没有发布

**症状**: Release 显示为 Draft，没有自动发布

**解决方案**:
1. 检查是否有构建失败
2. 查看 Actions 日志是否有错误
3. 如果没有错误，Release 会在所有平台构建成功后自动发布
4. 也可以手动点击 **Publish release** 按钮

---

### 问题 5: 应用打开显示"未验证的开发者"

**症状**: macOS 提示无法打开应用

**解决方案**:
1. 确保使用了 **Developer ID Application** 证书（不是 iOS 证书）
2. 确保证书没有过期
3. 确保公证成功（检查 Apple 邮件）
4. 临时解决方案：右键点击应用 → 打开

---

## Windows 构建特殊说明

### WiX Toolset (MSI) 构建失败

**症状**: Windows 构建失败，错误信息包含 `failed to run light.exe`

**原因**: Tauri 默认使用 WiX Toolset v3.14 创建 MSI 安装包，但 v3.14 在 GitHub Actions 上有已知问题。

**解决方案 1**（已集成到工作流）:
工作流已自动安装 WiX v3.11（更稳定版本），无需手动操作。

**解决方案 2**（备选）: 使用 NSIS 替代 MSI

如果你仍然遇到 MSI 构建问题，可以改用 NSIS 安装程序：

1. 修改 `src-tauri/tauri.conf.json`:
```json
{
  "bundle": {
    "targets": ["dmg", "app", "nsis", "appimage", "deb"],
    "windows": {
      "nsis": {
        "template": null,
        "license": null,
        "installMode": "currentUser",
        "languages": ["SimpChinese", "English"]
      }
    }
  }
}
```

2. 将 `"targets"` 中的 `"msi"` 替换为 `"nsis"` 或同时保留两者

**NSIS vs MSI 对比**:

| 特性 | MSI | NSIS |
|------|-----|------|
| 文件大小 | 较小 | 较小（可压缩） |
| 安装界面 | 标准 Windows 安装向导 | 可自定义 |
| 卸载支持 | 自动集成 | 自动集成 |
| 签名支持 | 完全支持 | 完全支持 |
| CI 稳定性 | 需要 WiX | 更稳定 |

### Windows 签名问题

如果没有 Windows 签名证书，Windows 会显示安全警告。这是正常的，用户可以点击"更多信息" → "仍要运行"来安装。

要消除警告，需要购买代码签名证书（见上文 Windows 签名部分）。

---

## 安全最佳实践

1. **不要提交证书到代码仓库**
   - 使用 GitHub Secrets
   - 在 `.gitignore` 中添加 `*.p12`, `*.pfx`, `*.mobileprovision`

2. **定期更新证书**
   - Apple Developer ID 证书有效期 5-7 年
   - 在到期前 3 个月更新

3. **保护应用专用密码**
   - 不要在邮件或聊天中分享
   - 仅在 GitHub Secrets 中使用

4. **限制工作流权限**
   - 工作流只应有 `contents: write` 权限
   - 不要给予不必要的权限

---

## 参考链接

- [Tauri GitHub Actions 文档](https://v2.tauri.app/distribute/pipelines/github/)
- [Apple Developer 证书管理](https://developer.apple.com/account/resources/certificates/list)
- [创建应用专用密码](https://support.apple.com/en-ca/HT204397)
- [macOS 代码签名指南](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [GitHub Actions Secrets 文档](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

## 需要帮助？

如果遇到问题：
1. 检查 GitHub Actions 日志获取详细错误信息
2. 查看 [Tauri GitHub Issues](https://github.com/tauri-apps/tauri/issues)
3. 在 [Tauri Discord](https://discord.gg/tauri) 社区寻求帮助

祝你打包顺利！🍞
