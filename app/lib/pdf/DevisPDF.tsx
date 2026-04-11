import { Document, Page, View, Text, Image } from '@react-pdf/renderer'
import { s } from './styles'
import type { DevisViewModel } from '../viewModel'
import { formatEuro } from '../calculations'

interface DevisPDFProps {
  vm: DevisViewModel
}

export function DevisPDF({ vm }: DevisPDFProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header + meta — atomic block so logo and meta rows never split across pages */}
        <View wrap={false}>
          <View style={s.headerRow}>
            <Image src="/oko-logo.png" style={s.logo} />
            <Text style={s.devisTitle}>{vm.labels.devisTitle}</Text>
          </View>

          {/* Meta */}
          <View style={s.metaRow}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={s.metaLabel}>{vm.labels.number} </Text>
              <Text>{vm.meta.number}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={s.metaLabel}>{vm.labels.date} </Text>
              <Text>{vm.meta.date}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={s.metaLabel}>{vm.labels.validity} </Text>
              <Text>{vm.meta.validity}</Text>
            </View>
          </View>
        </View>

        {/* Objet */}
        <View style={s.mb8}>
          <View style={{ flexDirection: 'row', fontSize: 9 }}>
            <Text style={[s.metaLabel, { color: '#5C5142' }]}>{vm.labels.objet} </Text>
            <Text>{vm.meta.objet}</Text>
          </View>
        </View>

        {/* Emetteur / Destinataire — atomic block */}
        <View wrap={false} style={s.partiesRow}>
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>{vm.labels.emetteur}</Text>
            <Text style={s.partyName}>{vm.emetteur.name}</Text>
            <Text style={s.partyLine}>{vm.emetteur.address}</Text>
            <Text style={s.partyLine}>{vm.emetteur.rcs}</Text>
            <Text style={s.partyLine}>{vm.emetteur.capital}</Text>
            <Text style={s.partyLine}>{vm.emetteur.email}</Text>
          </View>
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>{vm.labels.destinataire}</Text>
            <Text style={s.partyName}>{vm.destinataire.name}</Text>
            <Text style={s.partyLine}>{vm.destinataire.address}</Text>
            <Text style={s.partyLine}>{vm.destinataire.postalCity}</Text>
            <Text style={s.partyLine}>{vm.destinataire.contactName}</Text>
            <Text style={s.partyLine}>{vm.destinataire.email}</Text>
            <Text style={s.partyLine}>{vm.destinataire.phone}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Items table */}
        {vm.items.length > 0 && (
          <>
            {/* Table header */}
            <View style={s.tableHeader}>
              <Text style={s.thDesignation}>{vm.labels.designation}</Text>
              <Text style={s.thQty}>{vm.labels.qtyDuration}</Text>
              <Text style={s.thUnitPrice}>{vm.labels.unitPrice}</Text>
              <Text style={s.thTotal}>{vm.labels.lineTotal}</Text>
            </View>

            {/* Table rows — each atomic */}
            {vm.items.map((item, idx) => (
              <View key={idx} wrap={false} style={s.tableRow}>
                <View style={s.tdDesignation}>
                  <Text style={s.tdName}>{item.name}</Text>
                  {item.description ? (
                    <Text style={s.tdDesc}>{item.description}</Text>
                  ) : null}
                </View>
                <Text style={s.tdQty}>{item.qtyLabel}</Text>
                <Text style={s.tdUnitPrice}>{item.unitPriceLabel}</Text>
                <Text style={s.tdTotal}>{item.lineAmountLabel}</Text>
              </View>
            ))}
          </>
        )}

        {/* Dual cards — atomic block */}
        {vm.dualCards && (
          <View wrap={false} style={s.dualCardRow}>
            {/* Monthly */}
            <View style={s.dualCard}>
              <Text style={s.dualCardLabel}>{vm.labels.mensuel}</Text>
              <Text style={s.dualCardStrikethrough}>
                {vm.labels.tarifNormal} : {formatEuro(vm.dualCards.monthly.baseline)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                <Text style={s.dualCardPrice}>
                  {formatEuro(vm.dualCards.monthly.final)}
                </Text>
                <Text style={s.dualCardUnit}>{vm.labels.perMonth}</Text>
              </View>
              <Text style={s.dualCardSavings}>
                {vm.labels.economie} : {formatEuro(vm.dualCards.monthly.economy)} ({vm.dualCards.monthly.economyPct}%)
              </Text>
            </View>

            {/* Annual */}
            <View style={s.dualCardGold}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Text style={s.dualCardLabelGold}>{vm.labels.annuel} &#9733;</Text>
                <Text style={s.badge}>{vm.labels.recommande}</Text>
              </View>
              <Text style={s.dualCardStrikethrough}>
                {vm.labels.tarifNormal} : {formatEuro(vm.dualCards.annual.baseline)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                <Text style={s.dualCardPrice}>
                  {formatEuro(vm.dualCards.annual.final)}
                </Text>
                <Text style={s.dualCardUnit}>{vm.labels.perYear}</Text>
              </View>
              <Text style={s.dualCardSavings}>
                {vm.labels.economie} : {formatEuro(vm.dualCards.annual.economy)} ({vm.dualCards.annual.economyPct}%)
              </Text>
            </View>
          </View>
        )}

        {/* Totals — atomic block */}
        <View wrap={false} style={s.totalsContainer}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>{vm.labels.subtotal}</Text>
            <Text style={s.totalValue}>{vm.totalsFormatted.subtotal}</Text>
          </View>

          {vm.totals.discountAmount > 0 && (
            <View style={s.totalRow}>
              <Text style={[s.totalLabel, s.greenText]}>{vm.labels.discount}</Text>
              <Text style={[s.totalValue, s.greenText]}>{vm.totalsFormatted.discount}</Text>
            </View>
          )}

          {vm.isFrance ? (
            <>
              <View style={s.totalRowBold}>
                <Text style={s.totalLabelBold}>{vm.labels.totalHT}</Text>
                <Text style={s.totalValueBold}>{vm.totalsFormatted.totalHT}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>{vm.labels.tva}</Text>
                <Text style={s.totalValue}>{vm.totalsFormatted.tva}</Text>
              </View>
              <View style={s.totalRowBold}>
                <Text style={s.totalLabelBold}>{vm.labels.totalTtc}</Text>
                <Text style={s.totalValueBold}>{vm.totalsFormatted.total}</Text>
              </View>
            </>
          ) : (
            <View style={s.totalRowBold}>
              <Text style={s.totalLabelBold}>{vm.labels.totalHT}</Text>
              <Text style={s.totalValueBold}>{vm.totalsFormatted.total}</Text>
            </View>
          )}
        </View>

        {/* Inclus gratuitement */}
        {vm.inclusGratuit.length > 0 && (
          <View style={s.mt8}>
            <Text style={s.sectionLabel}>{vm.labels.inclusGratuitement}</Text>
            {vm.inclusGratuit.map((name, i) => (
              <View key={i} style={s.inclusItem}>
                <Text style={s.inclusCheck}>&#10003;</Text>
                <Text style={s.inclusText}>{name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bank details — atomic block */}
        <View wrap={false} style={s.mt12}>
          <View style={s.divider} />
          <Text style={s.sectionLabel}>{vm.labels.coordonneesBancaires}</Text>
          <Text style={s.bankText}>IBAN : {vm.bankDetails.iban}</Text>
          <Text style={s.bankText}>BIC : {vm.bankDetails.bic}</Text>
          <Text style={s.bankText}>{vm.bankDetails.bank}</Text>
        </View>

        {/* Conditions generales — can wrap */}
        <View style={s.mt12}>
          <View style={s.divider} />
          <Text style={s.sectionLabel}>{vm.labels.conditionsGenerales}</Text>
          {vm.conditionsGenerales.map((clause, i) => (
            <Text key={i} style={s.cgvText}>{clause}</Text>
          ))}
        </View>

        {/* Signature block — atomic, pushed to last page if space is tight */}
        <View break />
        <View wrap={false} style={s.mt12}>
          <View style={s.divider} />
          <View style={s.signatureRow}>
            <View style={s.signatureCol}>
              <Text style={s.signatureLabel}>{vm.labels.bonPourAccord}</Text>
              <Text style={s.signatureTeam}>{vm.labels.equipeOko}</Text>
              <Image src="/oko-signature.png" style={s.signatureImg} />
            </View>
            <View style={s.signatureCol}>
              <Text style={s.signatureLabel}>{vm.labels.dateSignature}</Text>
              <View style={s.signatureLine} />
            </View>
          </View>
        </View>

        {/* Legal footnote */}
        {vm.legalFootnote ? (
          <Text style={s.footnote}>{vm.legalFootnote}</Text>
        ) : null}
      </Page>
    </Document>
  )
}
