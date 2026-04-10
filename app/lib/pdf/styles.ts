import { StyleSheet } from '@react-pdf/renderer'

// Color palette — 1:1 with Pencil design
export const C = {
  bg: '#F8F1E0',
  bgSoft: '#FDFAF0',
  bgCream: '#F2EAD3',
  bgCreamAlt: '#FCFBF3',
  ink: '#2A2620',
  inkSoft: '#5C5142',
  inkMuted: '#968974',
  gold: '#A8702E',
  divider: '#D9CFB8',
  dividerSoft: '#E8DFC6',
  white: '#FFFFFF',
  red: '#C54B3C',
}

export const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    padding: 48,
    fontFamily: 'Inter',
    fontSize: 10,
    color: C.ink,
  },

  // ── Header ───────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end' },
  devisTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 56,
    letterSpacing: -1,
    color: C.ink,
    marginBottom: 4,
    lineHeight: 0.9,
  },
  devisNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  devisNum: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1.5,
    color: C.gold,
  },
  devisDot: {
    marginHorizontal: 8,
    color: C.gold,
  },
  devisDate: {
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: 1.2,
    color: C.inkSoft,
  },
  logoBlock: {
    alignItems: 'flex-end',
  },
  logoText: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 36,
    color: C.ink,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  logoUnder: {
    width: 40,
    height: 1.5,
    backgroundColor: C.gold,
    marginBottom: 4,
  },
  brandTag: {
    fontSize: 8,
    fontWeight: 500,
    letterSpacing: 1.2,
    color: C.inkSoft,
  },

  // ── Divider ──────────────────────────────
  divider: { height: 1.5, backgroundColor: C.ink, marginVertical: 12 },
  dividerSoft: { height: 0.5, backgroundColor: C.divider, marginVertical: 12 },
  dividerThin: { height: 0.5, backgroundColor: C.dividerSoft, marginVertical: 4 },

  // ── Info Row (Émetteur / Destinataire) ───
  infoRow: { flexDirection: 'row', gap: 32, marginBottom: 12 },
  infoCol: { flex: 1 },
  infoLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.gold,
    marginBottom: 4,
  },
  infoName: {
    fontSize: 11,
    fontWeight: 700,
    color: C.ink,
    marginBottom: 3,
  },
  infoLine: {
    fontSize: 9,
    color: C.inkSoft,
    lineHeight: 1.5,
  },

  // ── Meta Row ─────────────────────────────
  metaRow: { flexDirection: 'row', gap: 32, marginBottom: 4 },
  metaCol: { flexDirection: 'column' },
  metaLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.3,
    color: C.gold,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 500,
    color: C.ink,
  },

  // ── Items Table ──────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.bgCream,
    padding: 8,
    alignItems: 'center',
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.4,
    color: C.ink,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 8,
  },
  sectionNum: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 14,
    color: C.gold,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontStyle: 'italic',
    fontSize: 12,
    color: C.ink,
  },
  itemRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'flex-start',
    borderBottom: `0.5pt solid ${C.dividerSoft}`,
  },
  colDesc: { flex: 1, paddingRight: 8 },
  colQty: { width: 72, textAlign: 'right' },
  colPrice: { width: 72, textAlign: 'right' },
  colTotal: { width: 72, textAlign: 'right' },
  itemDesignation: {
    fontSize: 10,
    fontWeight: 600,
    color: C.ink,
  },
  itemDescription: {
    fontSize: 8,
    color: C.inkSoft,
    marginTop: 1,
  },
  itemMeta: {
    fontSize: 9,
    color: C.inkSoft,
  },
  itemTotal: {
    fontSize: 10,
    fontWeight: 600,
    color: C.ink,
  },
  discountRow: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderBottom: `0.5pt solid ${C.dividerSoft}`,
  },
  discountLabel: {
    fontSize: 10,
    fontWeight: 600,
    fontStyle: 'italic',
    color: C.gold,
  },
  discountValue: {
    fontSize: 10,
    fontWeight: 700,
    color: C.gold,
  },

  // ── Totals ───────────────────────────────
  totalsWrap: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: { width: 240 },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: { fontSize: 10, color: C.inkSoft },
  totalValue: { fontSize: 10, fontWeight: 500, color: C.ink },
  totalSeparator: { height: 0.5, backgroundColor: C.ink, marginVertical: 4 },
  ttcBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.ink,
    padding: 10,
    marginTop: 6,
    borderRadius: 4,
  },
  ttcLabel: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.5,
    color: C.bg,
  },
  ttcValue: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 16,
    color: C.bg,
  },

  // ── Free services block ──────────────────
  freeBlock: { marginTop: 16 },
  freeLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.gold,
    marginBottom: 6,
  },
  freeGrid: { flexDirection: 'row', gap: 20 },
  freeCol: { flex: 1, flexDirection: 'column', gap: 3 },
  freeItem: { fontSize: 9, color: C.inkSoft },

  // ── Conditions ───────────────────────────
  conditionsBlock: { marginTop: 14 },
  condLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.gold,
    marginBottom: 6,
  },
  condItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  condNum: {
    fontSize: 8,
    fontWeight: 700,
    color: C.ink,
    width: 18,
  },
  condBody: {
    fontSize: 8,
    color: C.inkSoft,
    lineHeight: 1.5,
    flex: 1,
  },
  condTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: C.ink,
  },

  // ── Signature ────────────────────────────
  signatureRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 18,
    paddingTop: 14,
    borderTop: `0.5pt solid ${C.divider}`,
  },
  signatureCol: { flex: 1 },
  signatureLabel: {
    fontSize: 7,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: C.gold,
    marginBottom: 4,
  },
  signatureInstr: {
    fontSize: 8,
    fontStyle: 'italic',
    color: C.inkMuted,
    lineHeight: 1.5,
    marginBottom: 16,
  },
  signatureLine: {
    height: 0.5,
    backgroundColor: C.ink,
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 8,
    color: C.inkSoft,
  },
  signatureTeam: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    fontSize: 10,
    color: C.ink,
    marginBottom: 2,
  },
  signatureContact: {
    fontSize: 8,
    color: C.inkSoft,
  },
})
