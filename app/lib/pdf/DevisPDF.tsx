'use client'

import { Document, Page, View, Text } from '@react-pdf/renderer'
import type { Devis } from '../types'
import type { DevisTotals } from '../types'
import { registerPdfFonts } from './fonts'
import { styles, C } from './styles'
import { OKO_SENDER, CONDITIONS_GENERALES, SERVICES_OFFERTS } from '../legal'
import { formatEuro, formatEuroShort, lineTotal } from '../calculations'

registerPdfFonts()

interface Props {
  devis: Devis
  totals: DevisTotals
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function DevisPDF({ devis, totals }: Props) {
  const forfaitItems = devis.items.filter((i) => i.pdfSection === 'forfait')
  const complementItems = devis.items.filter((i) => i.pdfSection === 'complement')
  const hardwareItems = devis.items.filter((i) => i.pdfSection === 'hardware')

  const customer = devis.customer
  const meta = devis.meta

  return (
    <Document title={`Devis ${meta.number}`} author="OKO">
      <Page size="A4" style={styles.page}>
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.devisTitle}>DEVIS</Text>
            <View style={styles.devisNumRow}>
              <Text style={styles.devisNum}>N° {meta.number}</Text>
              <Text style={styles.devisDot}>·</Text>
              <Text style={styles.devisDate}>{formatDate(meta.date).toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.logoBlock}>
            <Text style={styles.logoText}>OKO</Text>
            <View style={styles.logoUnder} />
            <Text style={styles.brandTag}>TableMi Technology</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── INFO ROW ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ÉMETTEUR</Text>
            <Text style={styles.infoName}>
              {OKO_SENDER.legalName} · {OKO_SENDER.legalForm}
            </Text>
            <Text style={styles.infoLine}>
              {OKO_SENDER.address}, {OKO_SENDER.postalCode} {OKO_SENDER.city}
              {'\n'}
              {OKO_SENDER.rcs} · Capital : {OKO_SENDER.capital}
              {'\n'}
              SIREN : {OKO_SENDER.siren}
              {'\n'}
              TVA intra. : {OKO_SENDER.tvaIntra}
              {'\n'}
              {OKO_SENDER.email} · {OKO_SENDER.website}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>DESTINATAIRE</Text>
            <Text style={styles.infoName}>{customer.name || '—'}</Text>
            <Text style={styles.infoLine}>
              {customer.legalForm ? `${customer.legalForm}\n` : ''}
              {customer.address || '—'}
              {'\n'}
              {customer.postalCode} {customer.city}
              {customer.country ? `, ${customer.country}` : ''}
              {customer.siren ? `\nSIREN : ${customer.siren}` : ''}
              {customer.tva ? `\nTVA : ${customer.tva}` : ''}
              {customer.email ? `\n${customer.email}` : ''}
              {customer.phone ? ` · ${customer.phone}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.dividerSoft} />

        {/* ── META ROW ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>OBJET</Text>
            <Text style={styles.metaValue}>{meta.objet || '—'}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>DATE D&apos;ÉMISSION</Text>
            <Text style={styles.metaValue}>{formatDate(meta.date)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>VALIDITÉ</Text>
            <Text style={styles.metaValue}>{meta.validityDays} jours</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>DÉBUT PRESTATION</Text>
            <Text style={styles.metaValue}>
              {meta.startDate ? formatDate(meta.startDate) : 'À convenir'}
            </Text>
          </View>
        </View>

        <View style={styles.dividerSoft} />

        {/* ── TABLE HEADER ── */}
        <View style={styles.tableHeader}>
          <View style={styles.colDesc}>
            <Text style={styles.tableHeaderText}>DÉSIGNATION</Text>
          </View>
          <View style={styles.colQty}>
            <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>QTÉ / DURÉE</Text>
          </View>
          <View style={styles.colPrice}>
            <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>PRIX UNIT.</Text>
          </View>
          <View style={styles.colTotal}>
            <Text style={[styles.tableHeaderText, { textAlign: 'right' }]}>TOTAL HT</Text>
          </View>
        </View>

        {/* ── Section I: Forfait ── */}
        {forfaitItems.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionNum}>I.</Text>
              <Text style={styles.sectionTitle}>Forfait & abonnements</Text>
            </View>
            {forfaitItems.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemDesignation}>{it.designation}</Text>
                  {it.description ? (
                    <Text style={styles.itemDescription}>{it.description}</Text>
                  ) : null}
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.itemMeta}>{it.qtyLabel}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={styles.itemMeta}>
                    {formatEuroShort(it.unitPrice)} / {it.unit}
                  </Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.itemTotal}>{formatEuroShort(lineTotal(it))}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Section II: Complément ── */}
        {complementItems.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionNum}>II.</Text>
              <Text style={styles.sectionTitle}>Services complémentaires</Text>
            </View>
            {complementItems.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemDesignation}>{it.designation}</Text>
                  {it.description ? (
                    <Text style={styles.itemDescription}>{it.description}</Text>
                  ) : null}
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.itemMeta}>{it.qtyLabel}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={styles.itemMeta}>
                    {formatEuroShort(it.unitPrice)} / {it.unit}
                  </Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.itemTotal}>{formatEuroShort(lineTotal(it))}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Section III: Hardware ── */}
        {hardwareItems.length > 0 && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionNum}>III.</Text>
              <Text style={styles.sectionTitle}>Matériel</Text>
            </View>
            {hardwareItems.map((it) => (
              <View key={it.id} style={styles.itemRow}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemDesignation}>{it.designation}</Text>
                  {it.description ? (
                    <Text style={styles.itemDescription}>{it.description}</Text>
                  ) : null}
                </View>
                <View style={styles.colQty}>
                  <Text style={styles.itemMeta}>{it.qtyLabel}</Text>
                </View>
                <View style={styles.colPrice}>
                  <Text style={styles.itemMeta}>
                    {formatEuroShort(it.unitPrice)} / {it.unit}
                  </Text>
                </View>
                <View style={styles.colTotal}>
                  <Text style={styles.itemTotal}>{formatEuroShort(lineTotal(it))}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Discount line ── */}
        {totals.discountAmount > 0 && devis.discount.kind !== 'none' && (
          <View style={styles.discountRow}>
            <View style={styles.colDesc}>
              <Text style={styles.discountLabel}>
                {'label' in devis.discount ? devis.discount.label : 'Remise'}
              </Text>
            </View>
            <View style={styles.colQty}>
              <Text style={styles.itemMeta}>—</Text>
            </View>
            <View style={styles.colPrice}>
              <Text style={styles.itemMeta}>—</Text>
            </View>
            <View style={styles.colTotal}>
              <Text style={styles.discountValue}>−{formatEuroShort(totals.discountAmount)}</Text>
            </View>
          </View>
        )}

        {/* ── Totals ── */}
        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatEuro(totals.subtotalHT)}</Text>
            </View>
            {totals.discountAmount > 0 && (
              <View style={styles.totalLine}>
                <Text style={[styles.totalLabel, { color: C.gold }]}>Remise</Text>
                <Text style={[styles.totalValue, { color: C.gold }]}>
                  −{formatEuro(totals.discountAmount)}
                </Text>
              </View>
            )}
            <View style={styles.totalSeparator} />
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Total HT</Text>
              <Text style={styles.totalValue}>{formatEuro(totals.totalHT)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>TVA 20 %</Text>
              <Text style={styles.totalValue}>{formatEuro(totals.tva)}</Text>
            </View>
            <View style={styles.ttcBox}>
              <Text style={styles.ttcLabel}>TOTAL TTC</Text>
              <Text style={styles.ttcValue}>{formatEuro(totals.totalTTC)}</Text>
            </View>
          </View>
        </View>

        {/* ── Free services ── */}
        <View style={styles.freeBlock} wrap={false}>
          <Text style={styles.freeLabel}>INCLUS GRATUITEMENT</Text>
          <View style={styles.freeGrid}>
            <View style={styles.freeCol}>
              {SERVICES_OFFERTS.slice(0, 4).map((s, i) => (
                <Text key={i} style={styles.freeItem}>
                  ✓ {s}
                </Text>
              ))}
            </View>
            <View style={styles.freeCol}>
              {SERVICES_OFFERTS.slice(4).map((s, i) => (
                <Text key={i} style={styles.freeItem}>
                  ✓ {s}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── Conditions ── */}
        <View style={styles.conditionsBlock} wrap>
          <Text style={styles.condLabel}>CONDITIONS GÉNÉRALES</Text>
          {CONDITIONS_GENERALES.map((c, i) => (
            <View key={i} style={styles.condItem}>
              <Text style={styles.condNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.condBody}>
                <Text style={styles.condTitle}>{c.title}. </Text>
                {c.body}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Signature ── */}
        <View style={styles.signatureRow} wrap={false}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>BON POUR ACCORD</Text>
            <Text style={styles.signatureInstr}>
              À retourner daté, signé et précédé de{'\n'}la mention manuscrite « Bon pour accord ».
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Date et signature du client</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>L&apos;ÉQUIPE OKO</Text>
            <Text style={[styles.signatureInstr, { marginBottom: 22 }]}>
              Cordialement,{'\n'}L&apos;équipe commerciale.
            </Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureTeam}>OKO · TableMi Technology</Text>
            <Text style={styles.signatureContact}>
              {OKO_SENDER.email} · {OKO_SENDER.website}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
