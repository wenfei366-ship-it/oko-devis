# OKO Devis / Contract Project Doc

Last updated: 2026-04-13

## 1. Project Overview

`oko-devis` is OKO's internal sales tool for generating multilingual B2B devis for restaurants.

Current status:
- Production URL: `https://oko-devis.vercel.app`
- Latest deployed commit: `04ec1c0`
- Latest local commit target: shared history + adaptive layout update
- Vercel project: `oko-devis`
- Supabase project: `oko-devis-apac`
- Supabase region: `Southeast Asia (Singapore)`
- Supabase project ref: `ndsusktrnlmtxvgnryag`
- Devis module has already gone through multiple detail-fix rounds and is live in production

## 1.1 Current Infra Status

### Supabase

- Supabase is the source of truth for shared structured data
- Devis history is already shared in the cloud
- Shared workspace mode is active
- Login is not required for normal devis history read/write

### Cloudflare

- Cloudflare CLI is already logged in
- Login email: `dev@joinoko.com`
- Account name: `OKO DEV`
- Account id: `245ce970bb12cc9b92a47f23f3653bd0`

### R2

- R2 is already enabled
- Existing buckets:
  - `hot-uploader`
  - `oko-sites-dev`
- If contract/devis files use R2, create a new dedicated bucket for this project/module
- Do not reuse the existing buckets for contract file storage

### Confirmed storage direction

- Structured devis / contract data stays in Supabase
- Files such as PDF, screenshots, evidence images, and attachments go to R2

## 2. What Exists Today

### Devis module

Implemented and deployed:
- 5 output languages: `fr / it / es / de / zh`
- Chinese operator UI
- Builder + live preview + PDF + PNG export
- Devis history page
- Supabase-backed shared history across devices
- Responsive three-column builder with centered preview scaling

Current user flow:
1. Sales fills customer + services + language
2. User opens magazine preview modal
3. Devis is auto-saved to shared Supabase history
4. User can revisit `/history` from any work device without logging in

### Current cloud history behavior

- History is now stored in Supabase, not localStorage
- History currently uses one shared workspace: `oko-shared`
- No login is required to read or save shared history
- History records are immutable snapshots
- Same `devis.id` collision throws and forces fork/save-as-new-version
- RLS currently allows `anon` / `authenticated` access only to the shared workspace
- Future account login can be added later for `created_by` / `updated_by` tracking

### Confirmed file storage direction for next phase

- Supabase continues to store structured history records
- R2 should be used for generated PDFs
- R2 should be used for confirmation screenshots and evidence files
- R2 should be used for any future contract attachments
- R2 usage should go into a newly created dedicated bucket for this project/module

## 3. Technical Stack

- Next.js `16.2.3`
- React `19`
- TypeScript strict
- Tailwind v4
- `@react-pdf/renderer`
- `html-to-image`
- Supabase JS client
- Supabase Postgres
- Vercel deployment

## 4. Important Existing Files

- [CLAUDE.md](/Users/zhangxiaonan/Downloads/oko-devis/CLAUDE.md)
- [PROJECT-LOG.md](/Users/zhangxiaonan/Downloads/oko-devis/PROJECT-LOG.md)
- [app/lib/types.ts](/Users/zhangxiaonan/Downloads/oko-devis/app/lib/types.ts)
- [app/lib/storage.ts](/Users/zhangxiaonan/Downloads/oko-devis/app/lib/storage.ts)
- [app/components/TopNav.tsx](/Users/zhangxiaonan/Downloads/oko-devis/app/components/TopNav.tsx)
- [app/components/MagazineModal.tsx](/Users/zhangxiaonan/Downloads/oko-devis/app/components/MagazineModal.tsx)
- [app/history/page.tsx](/Users/zhangxiaonan/Downloads/oko-devis/app/history/page.tsx)
- [supabase/migrations/20260413061814_create_devis_history.sql](/Users/zhangxiaonan/Downloads/oko-devis/supabase/migrations/20260413061814_create_devis_history.sql)
- [supabase/migrations/20260413102000_switch_devis_history_to_shared_workspace.sql](/Users/zhangxiaonan/Downloads/oko-devis/supabase/migrations/20260413102000_switch_devis_history_to_shared_workspace.sql)

## 5. Contract Module Direction

### Product decision

Contract should live in the same project, but as a separate module/page, not mixed into the current devis builder screen.

Recommended structure:
- `devis` remains the quote workflow
- `contract` becomes the contract workflow
- Main path: `devis -> create contract`
- Secondary path: `create contract directly without devis`

### Core contract workflow

Primary flow:
1. Open devis history
2. Click `制作合同`
3. Auto-create contract draft from selected devis
4. Review fixed contract template
5. Fill contract-only fields
6. Generate contract PDF
7. Send by email and/or Feishu
8. Record customer confirmation
9. Mark contract completed

Secondary flow:
1. Click `新建合同`
2. Select services directly using the same service model as devis
3. Continue with contract generation flow

## 6. Confirmed Contract Requirements

### Contract content

The contract should:
- match the visual language of `devis`
- look more formal, detailed, and refined
- use a fixed legal template
- expose only limited editable fields
- pull as much data as possible from devis automatically

Editable fields should likely include:
- client company
- client address
- client representative
- contract date
- special clauses / remarks
- payment mode
- contract status and confirmation evidence

### No online signature required

Customer online signing is not required.

Accepted confirmation methods:
- email reply such as `bon pour accord`
- group message confirmation
- manual confirmation note

The system should support:
- logging confirmation method
- saving confirmation time
- uploading screenshot evidence from group chat
- marking contract as completed after confirmation

### Sending

Desired sending capability:
- email sending
- ideally Feishu sending or Feishu-triggered workflow

### Naming and search

Default display / filename should be based on:
- `restaurant name + postal code`

Examples:
- `Chez Lin - 75011`
- `Soleil - 13008`

History search should support fuzzy matching across both devis and contracts.

Searchable fields should include:
- restaurant name
- postal code
- city
- contact name
- email
- devis number
- contract number

## 7. Recommended Contract Data Model

Suggested new table:
- `contract_history`

Suggested linked file storage:
- `pdf_path`
- `pdf_url`
- `evidence_files` jsonb
- `attachments` jsonb

Suggested fields:
- `id`
- `user_id`
- `devis_id` nullable
- `display_name`
- `restaurant_name`
- `postal_code`
- `city`
- `lang`
- `contract_number`
- `status`
- `confirmation_method`
- `confirmation_note`
- `confirmed_at`
- `contract jsonb`
- `search_text`
- `created_at`
- `updated_at`

Suggested status values:
- `draft`
- `generated`
- `sent`
- `confirmed`
- `completed`
- `cancelled`

Suggested confirmation method values:
- `email_reply`
- `group_message`
- `manual_note`

## 8. UI / Routing Recommendation

Recommended routes:
- `/` or `/devis` for devis builder
- `/history` for unified search/history
- `/contract/new`
- `/contract/[id]`

Recommended history behavior:
- one shared search input
- filter chips: `All / Devis / Contracts`
- each devis card gets `制作合同`
- each contract card gets `查看 / 编辑 / 导出 PDF`

## 9. Design Direction for Next Phase

The next design phase should not start directly from code.

Recommended process:
1. define contract information architecture
2. design contract pages in Pencil or Figma
3. align contract visual language with current devis identity
4. only then implement code

Design targets:
- same brand language as current devis
- more formal document layout
- premium editorial feel, not generic SaaS cards
- clear distinction between:
  - contract editor
  - contract PDF
  - history/detail record

## 10. Confirmed Development SOP

The relevant global SOP was confirmed from:
- [/Users/zhangxiaonan/.claude/CLAUDE.md](/Users/zhangxiaonan/.claude/CLAUDE.md)
- [/Users/zhangxiaonan/.claude/rules/01-workflow.md](/Users/zhangxiaonan/.claude/rules/01-workflow.md)
- [/Users/zhangxiaonan/.claude/rules/02-new-project.md](/Users/zhangxiaonan/.claude/rules/02-new-project.md)
- [/Users/zhangxiaonan/.claude/rules/09-design-quality.md](/Users/zhangxiaonan/.claude/rules/09-design-quality.md)
- [/Users/zhangxiaonan/.claude/rules/10-problem-solving.md](/Users/zhangxiaonan/.claude/rules/10-problem-solving.md)

### Working SOP summary

1. Brainstorm first
2. Narrow scope before implementation
3. Research mature products / open source / skills first
4. Confirm harness and rules
5. Design UI before coding
6. Write implementation plan
7. Implement
8. Verify locally
9. Deploy
10. Run online smoke test

### Important SOP reminders for this project

- Do not jump directly into contract coding before design
- Reuse mature patterns instead of inventing blindly
- Save generated project documents in the project itself
- Every code/config change must end with a git commit
- Browser verification is required after deployment

## 11. Recommended Next Conversation Start Point

In the next conversation, continue from:
- finalize contract information architecture
- decide exact contract pages
- produce first design draft in Pencil or Figma
- then write phase-1 implementation plan

Recommended next deliverables:
- contract module PRD
- route map
- database schema for contracts
- page wireframes
- milestone plan for implementation
