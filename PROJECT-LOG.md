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

## 2026-04-11 (v5-v7)
- [fix] 问题1: 中列预览缩放 transform:scale 适配容器宽度，无横向滚动
- [fix] 问题2: TOTAL HT 深色条 (#1C1611 bg + Playfair italic 白字 + 金色小圆点)
- [fix] 问题4: PNG 下载空白 → visibility:hidden 改 opacity:0
- [fix] 问题6: 免费项目完整 8 项 (i18n FREE_SERVICES 数组)
- [fix] 问题7: 银行信息两栏 (IBAN 奶白卡 + OKO 地址)
- [fix] 问题9: 签名区两栏 (BON POUR ACCORD + L'ÉQUIPE OKO + 签名图)
- [deploy] https://oko-devis.vercel.app — 版本 81f90f7

## 用户反馈 v4 (7 个问题)
1. 中列预览固定 — 不能左右滑动，用 transform:scale 缩小到容器宽度，只上下滚
2. 价格显示不对 — TOTAL HT 要深色大条 + Playfair白字，MENSUEL/ANNUEL 双卡要黑/白对照
3. 杂志 Modal 不符 — 需要 washi tape、5 个信息标签、深色 backdrop、奶白面板
4. PNG 下载空白 — off-screen render target 问题
5. PDF 分页散 — 要紧凑，2-3 页放一起
6. 免费项目省略 — 要完整列出 Slftq 里的全部赠品
7. 银行信息格式 — 要两栏布局（IBAN+BIC 左，OKO 地址右）
+. OKO logo 位置大小协调性

## 下次接着做
- 按优先级修 7 个问题（详见 memory/feedback_devis_ui_v4.md）
- 优先：中列缩放(1) + PNG 空白(4) + 杂志 Modal(3) + 价格样式(2)
- 然后：银行格式(7) + 免费项(6) + PDF 紧凑(5) + logo 微调(8)
- 修完部署 + 再截图对比
- CGV 法语文本需要 Stephan 最终确认
- 建 GitHub remote + CI/CD

## 2026-04-13
- [docs] 新增 `PROJECT-DOC.md`，整理当前 devis 模块状态、Supabase/Vercel 信息、合同模块规划、统一搜索/命名规则、以及已确认开发 SOP
- [fix] Builder 自适应重构：三栏从固定 flex 改为响应式 grid，左侧产品目录加宽，中间预览改为居中缩放，解决不同浏览器下大面积空白
- [fix] 共享历史模式：取消“先登录再同步”，Supabase 历史改为 `oko-shared` 共享工作台，多设备直接查看与保存
- [db] 新增 migration `20260413102000_switch_devis_history_to_shared_workspace.sql`，将 `devis_history` 从按 `user_id` 隔离改为按 `workspace_id` 共享，并更新 RLS
- [verify] `pnpm typecheck`、`pnpm test`、`pnpm build` 通过；本地 production 截图确认首页三栏和 `/history` 无登录拦截
- [fix] 输出文案多语言修正：`DATE D'ÉMISSION` 改为走 i18n，预览与 PDF 同步；法律脚注改为各语言本地化说明，中文显示“如发生争议，以本报价单的法文版本为准。”
