# OKO Devis Generator — PROJECT LOG

## 2026-04-11
- [feat] M0: 技术 spike — 装 @react-pdf/renderer + html-to-image + vitest + playwright, 字体本地打包, Next 16 构建验证通过
- [feat] M0.1: Harness — CLAUDE.md 项目规则 + pre-commit hook (typecheck + lint + test)
- [feat] M1: 数据模型 v3 (I18nString, LineItem.kind 鉴别器, PackageLine, Customer 无 TVA/SIREN) + i18n 5 语言字典 (30+ label 组 × 5 语, 10 服务, 12 CGV 条款) + OKO 发件人常量 + IBAN
- [fix] M1.1: Codex BLOCK — 法律脚注改为法语原文, CGV 定金条款明确仅适用建站费/硬件, 罚金条款改为 BCE+10 标准措辞
- [feat] M2: 纯函数层 (tax.ts / calculations.ts / discounts.ts) + 64 个单元测试全通过, 覆盖 FR-only TVA, 折扣 scope, 套餐计算
- [fix] M2.1: Codex 修复 — 百分比折扣 0-100 clamp + selectedIds 折扣更新 recurring finals
- [feat] M3-M7: 全套 UI 组件 — 3 列 builder, 实时预览, 服务目录, 客户表单, 语言选择, 套餐生成器, 杂志风格预览 modal, PDF 多页渲染, PNG 长图导出, 历史记录页
- [fix] M8: Codex 最终审查修复 — i18n 单位本地化, inline edit, PNG 离屏渲染, PDF 签名分页, cloneForEdit API
- [deploy] https://oko-devis.vercel.app — Vercel team wenfei366-9745s-projects

## 2026-04-11 (续)
- [fix] M8.2: UI 像素级重写 — TopNav/BuilderShell/ServiceCatalog/CustomerForm/DatePickerCard/LanguagePicker 全部按 Pencil 设计稿重做 CSS
- [fix] M8.3: DevisLivePreview header 修正 — DEVIS 大字左、OKO logo 右、N° 金色
- [deploy] https://oko-devis.vercel.app — 版本 e3da65e

## 下次接着做
- DevisLivePreview 继续细化：ÉMETTEUR/DESTINATAIRE 双栏排版、表格行样式、金色分隔线、IBAN 块、CGV 缩略、签名区、服务描述斜体
- 中列预览添加服务后的表格行显示效果验证
- 月付/年付双卡样式（Pencil YxXBG 里的 MENSUEL/ANNUEL 黑/白卡）
- MagazineModal 杂志预览视觉还原（ymZax）
- PackageGenerator 视觉还原（c5XaK）
- M9 冒烟测试
- 用户 Stephan 验收 + 反馈迭代
- CGV 法语文本需要 Stephan 最终确认
- 建 GitHub remote + CI/CD
