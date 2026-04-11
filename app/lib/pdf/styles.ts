import { StyleSheet } from '@react-pdf/renderer'

const COLORS = {
  ink: '#2A2620',
  inkSoft: '#5C5142',
  inkMuted: '#968974',
  gold: '#A8702E',
  goldAccent: '#B8922F',
  paper: '#F8F1E0',
  cream: '#F6EFDC',
  creamLight: '#FBF7EA',
  divider: '#D9CFB8',
  dividerSoft: '#E8DFC6',
  tableHeaderBg: '#F2EAD3',
  green: '#4B8A5A',
  totalBarBg: '#2A2620',
  totalBarText: '#F8F1E0',
  white: '#FFFFFF',
}

export const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 45,
    fontFamily: 'Inter',
    fontSize: 9,
    color: COLORS.ink,
    lineHeight: 1.4,
  },

  // Header: document title left, logo+url right
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  devisTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 28,
    fontWeight: 700,
    color: COLORS.ink,
  },
  logoBlock: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 72,
    height: 'auto',
    marginBottom: 2,
  },
  logoUrl: {
    fontSize: 7,
    color: COLORS.inkMuted,
  },

  // N° row: "N° XXXX • DATE" left
  numRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  numLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numGold: {
    fontSize: 9,
    color: COLORS.gold,
    fontWeight: 600,
  },
  numDate: {
    fontSize: 9,
    color: COLORS.inkSoft,
  },

  // Hard divider (solid ink)
  hardDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ink,
    marginBottom: 10,
  },

  // Soft divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginVertical: 8,
  },

  // Parties: ÉMETTEUR / DESTINATAIRE
  partiesRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 12,
  },
  partyCol: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: COLORS.inkSoft,
    marginBottom: 1,
  },

  // OBJET / DATE / VALIDITÉ / DÉBUT — 4-column row
  metaGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaGridCol: {
    flex: 1,
  },
  metaGridLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  metaGridValue: {
    fontSize: 9,
    color: COLORS.ink,
  },

  // Table header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.tableHeaderBg,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  thDesignation: {
    flex: 1,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  thQty: {
    width: 70,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  thUnitPrice: {
    width: 80,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  thTotal: {
    width: 80,
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.ink,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'right',
  },

  // Table row
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.dividerSoft,
    alignItems: 'center',
  },
  tdDesignation: {
    flex: 1,
    paddingRight: 8,
  },
  tdName: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.ink,
  },
  tdDesc: {
    fontSize: 8,
    color: COLORS.inkSoft,
    marginTop: 2,
  },
  tdQty: {
    width: 70,
    fontSize: 8,
    color: COLORS.inkSoft,
    textAlign: 'center',
  },
  tdUnitPrice: {
    width: 80,
    fontSize: 8,
    color: COLORS.inkSoft,
    textAlign: 'right',
  },
  tdTotal: {
    width: 80,
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.ink,
    textAlign: 'right',
  },

  // Dual cards
  dualCardChoiceLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  dualCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  dualCard: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.divider,
    backgroundColor: COLORS.creamLight,
  },
  dualCardGold: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.goldAccent,
    backgroundColor: COLORS.creamLight,
  },
  dualCardLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dualCardLabelGold: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  dualCardStrikethrough: {
    fontSize: 8,
    color: COLORS.inkMuted,
    textDecoration: 'line-through',
  },
  dualCardPrice: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 2,
  },
  dualCardUnit: {
    fontSize: 8,
    color: COLORS.inkMuted,
  },
  dualCardSavings: {
    fontSize: 8,
    color: COLORS.green,
    marginTop: 2,
  },

  // TOTAL HT bar
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.totalBarBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  totalBarLabel: {
    fontFamily: 'Playfair Display',
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.totalBarText,
  },
  totalBarValue: {
    fontFamily: 'Playfair Display',
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.totalBarText,
  },

  // Subtotal / discount rows (above total bar)
  totalsContainer: {
    marginLeft: 'auto',
    width: 240,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 10,
    color: COLORS.inkSoft,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 500,
  },
  greenText: {
    color: COLORS.green,
  },

  // Section label (gold)
  sectionLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // Inclus gratuit — 2-column grid
  inclusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  inclusItem: {
    width: '50%',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  inclusCheck: {
    fontSize: 8,
    color: COLORS.green,
  },
  inclusText: {
    fontSize: 8,
    color: COLORS.inkSoft,
  },

  // Bank details card
  bankCard: {
    backgroundColor: COLORS.creamLight,
    borderWidth: 1,
    borderColor: COLORS.divider,
    padding: 10,
    marginTop: 8,
  },
  bankRow: {
    flexDirection: 'row',
    gap: 20,
  },
  bankCol: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 7,
    fontWeight: 600,
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  bankText: {
    fontSize: 8,
    color: COLORS.inkSoft,
    marginBottom: 1,
  },

  // CGV
  cgvText: {
    fontSize: 7.5,
    color: COLORS.inkSoft,
    lineHeight: 1.6,
    marginBottom: 3,
  },

  // Signature
  signatureRow: {
    flexDirection: 'row',
    gap: 30,
    marginTop: 12,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: 600,
    marginBottom: 4,
  },
  signatureTeam: {
    fontSize: 9,
    color: COLORS.inkMuted,
    marginBottom: 8,
  },
  signatureImg: {
    width: 80,
    height: 'auto',
    opacity: 0.8,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    borderStyle: 'dashed',
    height: 40,
  },

  // Legal footnote
  footnote: {
    fontSize: 7,
    color: COLORS.inkMuted,
    fontStyle: 'italic',
    marginTop: 12,
  },

  // Badge
  badge: {
    fontSize: 7,
    backgroundColor: COLORS.goldAccent,
    color: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 4,
  },

  // Spacing
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
})
