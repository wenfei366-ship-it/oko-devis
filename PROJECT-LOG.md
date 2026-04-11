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

## 下次接着做
- M9: 本地冒烟测试 — Playwright 截图 5 语言 × 5 场景 = 25 张, PDF/PNG 样本导出, 分页压力测试
- M10: 线上冒烟测试
- 用户 Stephan 验收 + 反馈迭代
- CGV 法语文本需要 Stephan 最终确认
- 建 GitHub remote + CI/CD
