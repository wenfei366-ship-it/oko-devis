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
        {/* Header: DEVIS left, OKO logo + url right */}
        <View wrap={false}>
          <View style={s.headerRow}>
            <Text style={s.devisTitle}>{vm.labels.devisTitle}</Text>
            <View style={s.logoBlock}>
              <Image src="/oko-logo.png" style={s.logo} />
              <Text style={s.logoUrl}>joinoko.com</Text>
            </View>
          </View>

          {/* N° row: "N° XXXX • DATE" left */}
          <View style={s.numRow}>
            <View style={s.numLeft}>
              <Text style={s.numGold}>{vm.labels.number} {vm.meta.number}</Text>
              <Text style={s.numDate}>  •  {vm.meta.date}</Text>
            </View>
          </View>

          {/* Hard divider */}
          <View style={s.hardDivider} />
        </View>

        {/* ÉMETTEUR / DESTINATAIRE */}
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

        {/* OBJET / DATE / VALIDITÉ / DÉBUT — 4-column row */}
        <View wrap={false} style={s.metaGridRow}>
          <View style={s.metaGridCol}>
            <Text style={s.metaGridLabel}>{vm.labels.objet}</Text>
            <Text style={s.metaGridValue}>{vm.meta.objet}</Text>
          </View>
          <View style={s.metaGridCol}>
            <Text style={s.metaGridLabel}>{vm.labels.date}</Text>
            <Text style={s.metaGridValue}>{vm.meta.date}</Text>
          </View>
          <View style={s.metaGridCol}>
            <Text style={s.metaGridLabel}>{vm.labels.validity}</Text>
            <Text style={s.metaGridValue}>{vm.meta.validity}</Text>
          </View>
          <View style={s.metaGridCol}>
            <Text style={s.metaGridLabel}>{vm.labels.debutPrestation}</Text>
            <Text style={s.metaGridValue}>{vm.meta.debutPrestation}</Text>
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

            {/* Table rows */}
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

        {/* Dual cards */}
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

        {/* Totals — subtotal + discount + TOTAL HT bar */}
        <View wrap={false}>
          <View style={s.totalsContainer}>
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
          </View>

          {/* TOTAL HT bar — dark bg, Playfair font */}
          <View style={s.totalBar}>
            <Text style={s.totalBarLabel}>{vm.labels.totalHT}</Text>
            <Text style={s.totalBarValue}>{vm.totalsFormatted.totalHT}</Text>
          </View>
        </View>

        {/* Inclus gratuitement — 2 columns with ✓ prefix */}
        {vm.inclusGratuit.length > 0 && (
          <View wrap={false} style={s.mt8}>
            <Text style={s.sectionLabel}>{vm.labels.inclusGratuitement}</Text>
            <View style={s.inclusGrid}>
              {vm.inclusGratuit.map((name, i) => (
                <View key={i} style={s.inclusItem}>
                  <Text style={s.inclusCheck}>&#10003;</Text>
                  <Text style={s.inclusText}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bank details card — 2 columns */}
        <View wrap={false} style={s.bankCard}>
          <Text style={s.sectionLabel}>{vm.labels.coordonneesBancaires}</Text>
          <View style={s.bankRow}>
            <View style={s.bankCol}>
              <Text style={s.bankLabel}>IBAN</Text>
              <Text style={s.bankText}>{vm.bankDetails.iban}</Text>
              <Text style={[s.bankLabel, { marginTop: 4 }]}>BIC</Text>
              <Text style={s.bankText}>{vm.bankDetails.bic}</Text>
            </View>
            <View style={s.bankCol}>
              <Text style={s.bankLabel}>BÉNÉFICIAIRE</Text>
              <Text style={s.bankText}>{vm.emetteur.name}</Text>
              <Text style={[s.bankLabel, { marginTop: 4 }]}>BANQUE</Text>
              <Text style={s.bankText}>{vm.bankDetails.bank}</Text>
            </View>
          </View>
        </View>

        {/* Conditions générales */}
        <View style={s.mt12}>
          <Text style={s.sectionLabel}>{vm.labels.conditionsGenerales}</Text>
          {vm.conditionsGenerales.map((clause, i) => (
            <Text key={i} style={s.cgvText}>{clause}</Text>
          ))}
        </View>

        {/* Signature block: BON POUR ACCORD left, L'ÉQUIPE OKO right */}
        <View break />
        <View wrap={false} style={s.mt12}>
          <View style={s.divider} />
          <View style={s.signatureRow}>
            <View style={s.signatureCol}>
              <Text style={s.signatureLabel}>{vm.labels.bonPourAccord}</Text>
              <View style={s.signatureLine} />
            </View>
            <View style={s.signatureCol}>
              <Text style={s.signatureLabel}>{vm.labels.equipeOko}</Text>
              <Text style={s.signatureTeam}>{vm.labels.dateSignature}</Text>
              <Image src="/oko-signature.png" style={s.signatureImg} />
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
