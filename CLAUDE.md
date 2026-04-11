@AGENTS.md

# OKO Devis Generator — Harness & Conventions

## 项目简介

内部 B2B devis 生成器，销售团队用，给欧洲华人餐厅开报价单。Next.js 16.2.3 + React 19 + TypeScript + Tailwind v4 + @react-pdf/renderer + html-to-image.

- **Plan**：`~/.claude/plans/oko-devis-v3.md`
- **Memory**：`~/.claude/projects/-Users-zhangxiaonan/memory/project_oko_devis.md`
- **Design**：`~/Downloads/oko-devis-design.pen` (Pencil)
- **Deploy**：Vercel team `wenfei366-9745s-projects`

## 铁律（不能违反）

1. **无 AI 运行时** — 所有多语言内容硬编码在 `app/lib/i18n.ts` 字典里，不调任何翻译 API/LLM。
2. **HT/TVA 只在法国显示** — `customer.country === 'FR'` 才展示 HT + TVA 20% + TTC；其他国家只展示单一 Total，不拆税。
3. **5 语言输出** — FR (default) / IT / ES / DE / ZH。UI 语言永远是中文（销售用）。Devis 内容跟随用户选择的输出语言。
4. **法语版本为法律依据** — 非法语 devis 底部有法语小字 `Version française fait foi en cas de litige`。
5. **历史条目不可变** — `saveToHistory()` 冲突即抛，强制 fork 新 id。语言切换在历史视图里不持久化。
6. **Slftq 模版 1:1 对齐** — 中列预览和 PDF/PNG 都要严格按 Pencil 里的 Slftq frame 设计。
7. **PDF 分页原子块** — 行/总计/签名用 `wrap={false}` 不能跨页切割。
8. **PNG 长图** — ≤12000px 单文件，>12000px 自动分 2 份 (toast 提示)，绝不静默截断。
9. **字体本地打包** — `public/fonts/*.ttf`，不用远程 URL。
10. **数据模型有鉴别器** — `LineItem.kind = 'line'` / `PackageLine.kind = 'package'`，用 discriminated union。

## 技术栈

- Next.js 16.2.3 (Turbopack) + React 19 + TypeScript strict
- Tailwind v4 (CSS 变量 + @theme)
- @react-pdf/renderer 4.4 (dynamic import + ssr:false, `serverExternalPackages`)
- html-to-image 1.11 (PNG 长图导出)
- vitest 4.1 (单元测试)
- @playwright/test 1.59 (E2E + 视觉回归)
- localStorage 持久化（per-browser，非权威）
- Vercel 部署（team `wenfei366-9745s-projects`）

## 命令

```bash
pnpm dev          # 开发服务器
pnpm build        # 生产构建
pnpm typecheck    # TypeScript 零错检查
pnpm lint         # ESLint
pnpm test         # vitest run
pnpm test:watch   # vitest watch
pnpm test:e2e     # Playwright
```

**每次提交前必须全部通过**：typecheck + lint + test + build。

## Git 规则

- commit 格式：`M<N>: <description>` 对应 plan 里的 milestone
- 每个 milestone 一次 commit（子任务可追加 commit 但标注 M<N>.<sub>）
- 每次 push 后告诉用户版本号（commit hash）
- 不 skip hooks (`--no-verify` 禁用)
- 不 force push 到 main
- 敏感文件不入库（`.env`, `.vercel/`, `tsconfig.tsbuildinfo`）

## 目录结构

```
app/
├── layout.tsx               根布局 + next/font
├── globals.css              Tailwind + 主题变量
├── page.tsx                 Builder 入口
├── history/page.tsx         历史页
├── components/              React 组件（见 plan M3-M7）
└── lib/
    ├── types.ts             数据模型（带鉴别器）
    ├── i18n.ts              5 语言字典 + 辅助函数
    ├── catalog.ts           10 服务（引用 i18n）
    ├── legal.ts             OKO 发件人常量 + CGV 5 语言
    ├── tax.ts               France-only HT/TVA 逻辑
    ├── calculations.ts      纯函数
    ├── discounts.ts         折扣预设 + scope 逻辑
    ├── storage.ts           localStorage（fork-on-conflict）
    ├── numbering.ts         DRAFT-YYYY-nnn-XXXX 生成
    ├── viewModel.ts         共享视图层（HTML/PDF/PNG）
    ├── pdf/                 @react-pdf/renderer 组件
    └── png/                 html-to-image 导出
public/
├── fonts/                   4 TTF: Playfair + Inter (regular + italic)
├── oko-logo.png             真 logo（Slftq 里引用）
└── oko-signature.png        手写签名
```

## 不能做的事

- 不在 M<N> 里写超出 plan 该 milestone 范围的代码
- 不绕开 Codex 审查（每个 M 完成必走）
- 不在 non-FR 语言里显示 TVA
- 不混合语言（中文 UI 里的 devis 内容必须纯目标语言）
- 不硬编码字符串在组件里（所有可见文案走 i18n）
- 不引入远程字体 / 远程翻译 / 远程 API
- 不在没通过 typecheck+test+build 的情况下 commit
- 不修改 saved 历史条目（不可变）

## 护栏层（Harness）

1. **CLAUDE.md** — 本文件，项目规则
2. **TypeScript strict** — `tsconfig.json` 已开启 strict
3. **ESLint** — `next lint` + `eslint-config-next`
4. **Vitest** — 单元测试覆盖 lib/ 纯函数（>85%）
5. **Playwright** — E2E + 视觉回归（M9）
6. **Pre-commit hook** — `.git/hooks/pre-commit` 跑 typecheck + lint + test
7. **Codex 审查** — 每个 M 完成让 Codex 独立 review
8. **Vercel preview** — 每次 push 自动部署 preview，人工检查
