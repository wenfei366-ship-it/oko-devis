# Design Reference Files

These are 2x resolution PNG exports from the Pencil design file.
Use them as pixel-perfect targets when writing CSS.

- `YxXBG.png` — Web Builder (main page, 3-column layout, 1600×1600)
- `ymZax.png` — Magazine Preview Modal (1800×2100) 
- `c5XaK.png` — Package Generator Modal (1200×980)
- `contract-module-wireframes.svg` — Contract 模块草图（历史记录页 / 合同编辑页 / 合同查看页）

Source: `/Users/zhangxiaonan/Downloads/oko-devis-design.pen`

## Key design specs (from Pencil layout snapshot)

### Colors
- Page bg: #F6EFDC
- Card bg: #FEFBF2
- Card hover/alt: #F6EFDC (0.55 opacity)
- Ink: #1C1611
- Gold: #B8922F
- Muted: #9B8550, #6B5A3D, #8B7A3E
- Border: #D4C58E
- Nav bg: #F8EFDC
- Dark buttons: #1C1611

### Layout (YxXBG = 1600×1600)
- Top nav: full width, height 72, bg #F8EFDC, bottom 1px border #D4C58E
- Left catalog: x=20, y=96, w=240, h=1476, bg #FEFBF2, rounded 14
- Middle preview: x=280, y=96, w=840, h=1476, bg #EFE3C6, rounded 14
  - A4 inside at x=300, y=168, natural 800 wide
- Right forms: starts at x=1140, y=96, w=436
  - Client card: h=520, bg #FEFBF2, rounded 14
  - Date card: y=636, h=144
  - Language card: y=800, h=160
  - Create button: y=980, h=76, bg #1C1611, rounded 14

### Service cards (left column)
- Each: 200×76, rounded 10
- Added state: gold left bar 3px + FR name with ✓ + × delete
- Not added: bg #F6EFDC 0.55 opacity + simple + button
- Shows: FR name, ZH description, annual price (Playfair italic 15), monthly subtext (Inter 9)

### Fonts
- Titles/prices: Playfair Display italic 700
- Body: Inter 400-700
- UI labels: Inter 9-14
