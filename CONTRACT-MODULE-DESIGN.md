# OKO Contract Module Design

Last updated: 2026-04-13

## 1. Design Goal

Design the `contract` module as the second document workflow inside `oko-devis`.

Positioning:
- `devis` = sales quotation and proposal
- `contract` = formal legal agreement and follow-through record

Design principles:
- keep the same OKO editorial brand language as `devis`
- make `contract` visibly more formal, calmer, and denser
- reuse existing shared-history patterns instead of inventing a new workspace model
- prioritize `devis -> contract` as the primary path
- keep the contract template fixed, with only a small editable surface

This document is for information architecture and product design only.
No implementation decisions in this phase.

## 2. What Must Be Reused From Current Devis

Based on the current deployed `devis` module:

- same Chinese internal operator UI
- same top-level OKO visual language: cream paper, dark ink, gold accent, editorial typography
- same shared workspace logic: one team-visible history, no login gate
- same snapshot logic: history records are immutable, edits create a new draft/version
- same service basis when a contract starts from a devis
- same naming baseline: `restaurant name + postal code`

Reusable interaction patterns:
- builder/editor + centered live document preview
- history as the central entry for revisiting records
- document preview modal/detail view
- export-first workflow around PDF generation

## 3. Product Role of Contract

The contract is not a copy of the devis screen.

It should do three jobs:
1. convert a negotiated devis into a formal agreement
2. track sending and customer confirmation
3. become the operational record until completion

That means the contract module has one extra layer the devis module does not have:
- lifecycle management after PDF generation

## 4. Primary Users

Internal sales/operator only.

User goals:
- create a contract quickly from an accepted devis
- avoid retyping customer and service data
- fill only contract-only information
- generate a clean formal PDF
- record how the customer confirmed
- find the contract later from any work device

## 5. Core User Flows

### A. Primary flow: from devis

1. Open `/history`
2. Search and open a devis record
3. Click `制作合同`
4. System creates a contract draft linked to that devis snapshot
5. Open contract editor
6. Review non-editable fixed legal template
7. Fill limited editable fields
8. Generate/export PDF
9. Mark as `sent` after sending
10. Record customer confirmation evidence
11. Mark as `completed`

### B. Secondary flow: direct contract

1. Click `新建合同`
2. Enter client identity
3. Select services using the same commercial service model as devis
4. Generate a contract draft without `devis_id`
5. Continue in the same editor and lifecycle flow

### C. Operational follow-up flow

1. Open existing contract from `/history`
2. Update lifecycle status
3. Add sending note or confirmation note
4. Upload or attach confirmation evidence metadata
5. Re-export PDF if needed

## 6. Route Architecture

Recommended routes:

- `/devis` or `/` = existing devis builder
- `/history` = unified shared history for devis + contracts
- `/contract/new` = direct contract creation entry
- `/contract/[id]` = contract editor/detail page

Optional later route:
- `/contract/[id]/pdf` for isolated print/export rendering if needed

Routing rule:
- `devis` remains a separate workflow
- `contract` must not be merged into the current devis builder screen

## 7. Information Architecture

### 7.1 Top-level navigation

Top nav should evolve from single-module wording to workspace wording.

Recommended nav items:
- `Devis`
- `历史记录`
- `新建合同`

Optional status label:
- `团队共享工作台 · 打开即同步`

### 7.2 Unified history

`/history` becomes the operational hub.

Core blocks:
- page header
- global search input
- filter chips: `All / Devis / Contracts`
- result grid/list
- quick actions on each card

Devis card actions:
- `查看`
- `复制编辑`
- `制作合同`
- `删除`

Contract card actions:
- `查看 / 编辑`
- `导出 PDF`
- `更新状态`
- `删除`

History card metadata for contracts:
- contract number
- linked devis number if any
- restaurant name
- postal code / city
- language
- current status
- updated time
- confirmation badge if confirmed

### 7.3 Contract editor page

The contract page should be structured as three coordinated zones, matching the spirit of the current devis builder while adapting it to a more formal document.

Left column: source and structure
- linked devis summary card if created from devis
- contract lifecycle card
- service summary / contract scope block
- template section navigator

Middle column: live contract preview
- centered paper preview
- more legal/formal page rhythm than devis
- contract sections visible in document order

Right column: editable fields
- client identity block
- contract metadata block
- payment and commercial terms block
- special clauses / remarks block
- sending and confirmation block
- main action buttons

## 8. Contract Page Sections

The document itself should read as a fixed agreement, not as an editable sales sheet.

Recommended document sections:

1. Cover/header
- `CONTRAT DE PRESTATION` or localized equivalent
- contract number
- contract date
- optional linked devis reference

2. Parties
- service provider = OKO fixed legal identity
- client company
- client address
- representative/contact

3. Contract purpose
- fixed legal intro
- short statement of the mission/scope

4. Scope of services
- service list imported from devis or selected directly
- grouped in a concise, contractual presentation
- no freeform product catalog behavior here

5. Commercial terms
- fees / totals
- payment mode
- deposit or milestone wording if applicable

6. Execution conditions
- start date or start condition
- duration / renewal rule if applicable
- client obligations if required by legal template

7. Special clauses
- short editable clause area
- reserved for negotiated exceptions only

8. Confirmation / acceptance reminder
- wording adapted to non-e-sign process
- explains accepted confirmation channels

9. Signature / acknowledgment block
- customer side
- OKO side
- no online signature capture required

10. Legal footer / annex note
- fixed legal language
- optional reference to attached CGV/annexes if used later

## 9. Editable vs Fixed Surface

The contract should be mostly fixed.

### Editable fields

- client company
- client address
- postal code
- city
- contact / representative name
- email
- phone
- contract date
- start date or service start condition
- payment mode
- special clauses / remarks
- internal sending note
- confirmation method
- confirmation note
- confirmation time

### Derived from devis when linked

- restaurant name
- address and contact data
- language
- service scope
- totals
- linked devis number
- base display name

### Fixed / template-controlled

- OKO legal identity block
- core legal paragraphs
- section ordering
- formal headings
- footer/legal references

## 10. Contract Status Model

Recommended statuses:
- `draft`
- `generated`
- `sent`
- `confirmed`
- `completed`
- `cancelled`

Meaning:

- `draft`: being prepared, not yet exported/sent
- `generated`: PDF considered ready or exported
- `sent`: sent to customer through email/Feishu/manual workflow
- `confirmed`: customer accepted through allowed confirmation method
- `completed`: contract is operationally closed and validated
- `cancelled`: abandoned or superseded

Recommended UI rule:
- status should always be visible on history cards and contract detail header

## 11. Sending And Confirmation Architecture

Because there is no online signature, the module must treat confirmation tracking as first-class information.

### Sending block

Fields:
- sending status
- sent at
- sending channel
- sending note

Suggested sending channels:
- `email`
- `feishu`
- `manual`

### Confirmation block

Fields:
- confirmation method
- confirmation note
- confirmed at
- evidence attachment metadata

Suggested confirmation methods:
- `email_reply`
- `group_message`
- `manual_note`

Evidence in this phase should be modeled as record metadata, not a full media management system.

Recommended evidence fields for design:
- evidence file name
- evidence URL/path
- uploaded at
- short caption

## 12. Shared History Strategy

The `contract` module should follow the same shared workspace philosophy as `devis`.

Rules:
- same shared workspace concept
- no login required for normal team usage
- records visible on every work device
- history entries remain immutable snapshots
- editing an existing saved contract should fork into a new saved version when necessary

History behavior recommendation:
- show contracts and devis in one search surface
- allow fuzzy search across both document types
- linked documents should cross-reference each other

## 13. Search And Naming

Default display name:
- `restaurant name + postal code`

Examples:
- `Chez Lin - 75011`
- `Soleil - 13008`

Unified searchable fields:
- restaurant name
- postal code
- city
- contact name
- email
- devis number
- contract number

Recommended extra searchable fields for contracts:
- representative name
- confirmation note
- linked devis number

## 14. Contract Card Design In History

Each contract card should visually feel related to devis cards but more formal.

Recommended card anatomy:
- top strip with contract number and status badge
- central identity block with display name
- secondary line with city / contact / linked devis
- footer actions

Visual distinction from devis:
- calmer density
- stronger status signaling
- less sales-preview framing, more record framing

## 15. Source-Linking Rules Between Devis And Contract

When a contract is created from a devis:
- keep a persistent `devis_id` reference
- snapshot the source commercial data into the contract payload
- do not make the contract live-sync with later devis edits

Reason:
- contract must remain a stable legal record
- later devis edits should not retroactively mutate an already generated contract

Recommended visible references:
- contract shows `source devis number`
- devis history card can show `已有合同` / `已生成合同` badge later

## 16. Draft Editor Layout Recommendation

To stay aligned with the shipped devis UI, the contract editor should preserve the three-zone mental model:

- left = source context and state
- middle = live formal preview
- right = allowed edits and actions

But the contract editor should feel less like assembly and more like controlled review.

Recommended differences from devis:
- fewer input controls visible at once
- stronger section grouping
- more status-oriented actions
- more restrained accent usage

## 17. PDF Design Direction

The contract PDF should inherit OKO branding but move one degree more formal than the devis PDF.

Desired qualities:
- premium editorial feel
- stable legal readability
- less decorative than the magazine-style devis modal
- stronger hierarchy for parties, clauses, and totals
- clear footer and reference numbering

Recommended tone:
- cream paper stays
- dark ink stays
- gold accent becomes more restrained
- typography contrast stays, but with tighter legal rhythm

## 18. MVP Scope For Contract Design

In the first implementation phase, the contract module should include:

- direct route structure
- contract draft creation
- create-from-devis flow
- limited editable fields
- fixed contract template preview
- contract PDF export
- shared history persistence
- status updates
- confirmation method + note + timestamp

Explicitly not required for MVP:
- online signature
- customer portal
- advanced permissions
- live collaboration
- full attachment management
- actual Feishu/email integration if workflow logging is enough initially

## 19. Recommended Next Deliverables

After this IA phase, the next design steps should be:

1. draw page-level wireframes for:
   - unified history
   - contract editor
   - contract detail/read-only state
2. define the contract PDF section layout
3. define exact editable field set and labels
4. write contract data model and storage spec
5. then write implementation plan

## 20. Open Questions To Resolve Before Coding

- Is the contract output language always inherited from the devis, or can it be switched independently?
- Do we need one single fixed contract template, or a small set of templates by service mix?
- Should `generated` mean first PDF export, or manual “ready for sending” confirmation?
- Should `completed` be manual only, or derived from `confirmed + internal follow-up done`?
- Do confirmation screenshots need binary upload in MVP, or only evidence metadata placeholder?
- Does the direct-contract path allow all service combinations, or only a restricted subset?
- Should unified history default to `All` or to the most recently used document type?
