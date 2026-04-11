import { StyleSheet } from '@react-pdf/renderer'

const COLORS = {
  ink: '#1C1611',
  inkSoft: '#5C5142',
  inkMuted: '#968974',
  gold: '#B8922F',
  paper: '#FEFBF2',
  cream: '#F6EFDC',
  creamLight: '#FBF7EC',
  divider: '#D9CFB8',
  dividerSoft: '#E8DFC6',
  green: '#4B8A5A',
  white: '#FFFFFF',
}

export const s = StyleSheet.create({
  page: {
    backgroundColor: COLORS.paper,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 50,
    fontFamily: 'Inter',
    fontSize: 10,
    color: COLORS.ink,
    lineHeight: 1.5,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 'auto',
  },
  devisTitle: {
    fontFamily: 'Playfair Display',
    fontSize: 28,
    fontWeight: 700,
    fontStyle: 'italic',
    color: COLORS.gold,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 8,
    fontSize: 9,
    color: COLORS.inkSoft,
  },
  metaLabel: {
    fontWeight: 600,
  },

  // Parties
  partiesRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 16,
  },
  partyCol: {
    flex: 1,
  },
  partyLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: COLORS.inkSoft,
    marginBottom: 1,
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginVertical: 8,
  },

  // Table header
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: 4,
  },
  thDesignation: {
    flex: 1,
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  thQty: {
    width: 70,
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  thUnitPrice: {
    width: 80,
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  thTotal: {
    width: 80,
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'right',
  },

  // Table row
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.dividerSoft,
  },
  tdDesignation: {
    flex: 1,
    paddingRight: 8,
  },
  tdName: {
    fontSize: 10,
    fontWeight: 500,
  },
  tdDesc: {
    fontSize: 8,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  tdQty: {
    width: 70,
    fontSize: 9,
    textAlign: 'center',
    alignSelf: 'center',
  },
  tdUnitPrice: {
    width: 80,
    fontSize: 9,
    textAlign: 'right',
    alignSelf: 'center',
  },
  tdTotal: {
    width: 80,
    fontSize: 10,
    fontWeight: 600,
    textAlign: 'right',
    alignSelf: 'center',
  },

  // Dual cards
  dualCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
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
    borderColor: COLORS.gold,
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

  // Totals section
  totalsContainer: {
    marginLeft: 'auto',
    width: 240,
    marginTop: 8,
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
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  totalLabelBold: {
    fontSize: 11,
    fontWeight: 700,
  },
  totalValueBold: {
    fontSize: 11,
    fontWeight: 700,
  },
  greenText: {
    color: COLORS.green,
  },

  // Section labels
  sectionLabel: {
    fontSize: 8,
    fontWeight: 600,
    color: COLORS.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  // Inclus gratuit
  inclusItem: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  inclusCheck: {
    fontSize: 9,
    color: COLORS.green,
  },
  inclusText: {
    fontSize: 9,
    color: COLORS.inkSoft,
  },

  // Bank details
  bankText: {
    fontSize: 9,
    color: COLORS.inkSoft,
    marginBottom: 1,
  },

  // CGV
  cgvText: {
    fontSize: 7.5,
    color: COLORS.inkMuted,
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

  // Spacing
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },

  // Badge
  badge: {
    fontSize: 7,
    backgroundColor: COLORS.gold,
    color: COLORS.white,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 4,
  },
})
