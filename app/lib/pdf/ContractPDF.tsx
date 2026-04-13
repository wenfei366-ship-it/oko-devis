import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { Contract } from '../types'
import { formatEuroCompact } from '../calculations'
import {
  getArticle7ReferenceRows,
  buildProviderLines,
  formatContractDate,
  getContractCopy,
  getContractPriceHint,
  getPaymentModeLabel,
  getSelectedServiceSummaries,
  getStandardServiceLines,
  getTotalUnitLabel,
} from '../contractContent'
import { cs } from './contractStyles'

interface ContractPDFProps {
  contract: Contract
}

function BulletList({ items, fontFamily }: { items: string[]; fontFamily?: string }) {
  return (
    <View style={cs.bulletList}>
      {items.map((item) => (
        <View key={item} style={cs.bulletRow}>
          <Text style={cs.bulletDot}>•</Text>
          <Text style={{ ...cs.bulletText, fontFamily: fontFamily || 'Inter' }}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

function Footer({ page }: { page: string }) {
  return (
    <View style={cs.footer} fixed>
      <Text style={cs.footerText}>SAS OKO · 31 boulevard de Magenta · 75010 Paris</Text>
      <Text style={cs.footerText}>{page}</Text>
    </View>
  )
}

export function ContractPDF({ contract }: ContractPDFProps) {
  const copy = getContractCopy(contract.lang)
  const providerLines = buildProviderLines()
  const serviceLines = getStandardServiceLines(contract.lang)
  const article7Rows = getArticle7ReferenceRows(contract.lang)
  const selectedServices = getSelectedServiceSummaries(contract)
  const dateLabel = formatContractDate(contract.meta.date, contract.lang)
  const customerTitle = contract.customer.name || 'Client'
  const isChinese = contract.lang === 'zh'
  const bodyFont = isChinese ? 'Noto Sans SC' : 'Inter'
  const displayFont = isChinese ? 'Noto Sans SC' : 'Playfair Display'

  return (
    <Document>
      <Page size="A4" style={cs.page}>
        <View style={cs.topRow}>
          <View>
            <Text style={cs.sectionLabel}>
              CONTRAT · N° {contract.meta.number}
              {contract.meta.devisNumber ? ` · LIÉ AU DEVIS ${contract.meta.devisNumber}` : ''}
            </Text>
            <Text style={{ ...cs.title, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'normal', letterSpacing: isChinese ? 0 : undefined }}>{copy.title}</Text>
            <Text style={{ ...cs.subtitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>
              {copy.subtitlePrefix} — Paris, le {dateLabel}
            </Text>
          </View>

          <View style={cs.logoBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/oko-logo.png" style={cs.logo} />
            <Text style={cs.logoUrl}>joinoko.com</Text>
          </View>
        </View>

        <View style={cs.divider} />

        <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.partiesTitle}</Text>
        <View style={cs.partiesRow}>
          <View style={cs.partyCard}>
            <Text style={{ ...cs.sectionLabel, fontFamily: bodyFont }}>{copy.providerLabel}</Text>
            <View style={{ marginTop: 8 }}>
              {providerLines.map((line) => (
                <Text key={line} style={{ ...cs.partyLine, fontFamily: bodyFont }}>{line}</Text>
              ))}
            </View>
          </View>

          <View style={cs.partyCard}>
            <Text style={{ ...cs.sectionLabel, fontFamily: bodyFont }}>{copy.clientLabel}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>{contract.customer.name || '—'}</Text>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>{contract.customer.address || '—'}</Text>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>
                {[contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ') || '—'}
              </Text>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>{contract.customer.contactName || '—'}</Text>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>{contract.customer.email || '—'}</Text>
              <Text style={{ ...cs.partyLine, fontFamily: bodyFont }}>{contract.customer.phone || '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={{ ...cs.intro, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.intro}</Text>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article1Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article1Intro}</Text>
          <BulletList items={serviceLines} fontFamily={bodyFont} />
        </View>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article2Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article2Content}</Text>
        </View>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article3Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article3Intro}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article3Point1Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article3Point1Content}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article3Point2Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article3Point2Content}</Text>
        </View>

        <Footer page="1 / 2" />
      </Page>

      <Page size="A4" style={cs.page}>
        <View style={cs.topRow}>
          <Text style={cs.sectionLabel}>CONTRAT · N° {contract.meta.number} · SUITE</Text>
          <Text style={cs.footerText}>{customerTitle} · {dateLabel}</Text>
        </View>

        <View style={cs.divider} />

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article4Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article4Content1}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article4Content2}</Text>
        </View>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article5Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article5Intro}</Text>
          <BulletList items={[copy.article5a, copy.article5b, copy.article5c]} fontFamily={bodyFont} />
        </View>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article6Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article6Content}</Text>
        </View>

        <View style={cs.article}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article7Title}</Text>
          <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{copy.article7Intro}</Text>

          <View style={cs.priceCard}>
            <View style={cs.priceHeaderRow}>
              <Text style={{ width: 30 }} />
              <Text style={{ ...cs.sectionLabel, flex: 1, color: '#6B5A3D', letterSpacing: 1.2, fontFamily: bodyFont }}>DÉSIGNATION</Text>
              <Text style={{ ...cs.sectionLabel, width: 74, textAlign: 'right', color: '#6B5A3D', letterSpacing: 1.2, fontFamily: bodyFont }}>MENSUEL</Text>
              <Text style={{ ...cs.sectionLabel, width: 74, textAlign: 'right', color: '#6B5A3D', letterSpacing: 1.2, fontFamily: bodyFont }}>ANNUEL</Text>
            </View>
            {article7Rows.map((row) => (
              <View
                key={row.numeral}
                style={{
                  ...cs.priceRow,
                  backgroundColor: row.emphasized ? '#1C1611' : row.muted ? 'rgba(246,239,220,0.5)' : '#FEFBF2',
                }}
              >
                <Text style={{ ...cs.priceNumeral, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{row.numeral}</Text>
                <View style={cs.priceDesignation}>
                  <Text style={{ ...cs.priceTitle, color: row.emphasized ? '#F8F1E0' : '#1C1611', fontFamily: bodyFont }}>{row.title}</Text>
                  <Text style={{ ...cs.priceDescription, color: row.emphasized ? '#D9CFB8' : '#6B5A3D', fontFamily: bodyFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{row.description}</Text>
                </View>
                <Text style={{ ...cs.priceMonth, color: row.emphasized ? '#D9CFB8' : '#1C1611', fontFamily: bodyFont }}>{row.monthly}</Text>
                <Text style={{ ...cs.priceYear, color: row.emphasized ? '#F8F1E0' : '#1C1611', fontFamily: bodyFont }}>{row.annual}</Text>
              </View>
            ))}
          </View>

          <Text style={{ ...cs.paragraph, marginTop: 6, fontFamily: bodyFont }}>{copy.article7Note}</Text>

          <View style={cs.choiceRow}>
            <View style={cs.choiceBox}>
              <Text style={{ ...cs.sectionLabel, fontFamily: bodyFont }}>
                {copy.article7ClientChoice} · {contract.selectedServices.length} SERVICES
              </Text>
              <View style={{ marginTop: 8 }}>
                {contract.selectedServices.length === 0 ? (
                  <View style={cs.serviceChip}>
                    <Text style={{ ...cs.serviceName, fontFamily: bodyFont }}>{copy.noServices}</Text>
                  </View>
                ) : (
                  contract.selectedServices.map((item, index) => (
                    <View key={`${item.id}-${index}`} style={cs.serviceChip}>
                      <Text style={{ ...cs.serviceName, fontFamily: bodyFont }}>{selectedServices[index]}</Text>
                      <Text style={{ ...cs.serviceMeta, fontFamily: bodyFont }}>{getContractPriceHint(item, contract.lang, contract.paymentMode)}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <View style={cs.finalBox}>
              <Text style={{ ...cs.sectionLabel, color: '#F5D48A', fontFamily: bodyFont }}>{copy.article7FinalPrice}</Text>
              <Text style={{ ...cs.finalPrice, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{formatEuroCompact(contract.finalTotal)}</Text>
              <Text style={{ ...cs.finalMeta, fontFamily: bodyFont }}>
                {getPaymentModeLabel(contract)} · {getTotalUnitLabel(contract)}
              </Text>
              <Text style={{ ...cs.finalSub, fontFamily: bodyFont }}>
                {copy.total}: {formatEuroCompact(contract.subtotalDisplay)}
              </Text>
            </View>
          </View>
        </View>

        <View style={cs.article} wrap={false}>
          <Text style={{ ...cs.sectionTitle, fontFamily: displayFont, fontStyle: isChinese ? 'normal' : 'italic' }}>{copy.article8Title}</Text>
          <View style={cs.noteBox}>
            <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>{contract.specialConditions || copy.article8Placeholder}</Text>
          </View>
        </View>

        <View style={cs.articleDivider} />
        <Text style={{ ...cs.paragraph, fontFamily: bodyFont }}>
          {copy.madeIn} {copy.madeOn} {dateLabel} {copy.inParis}.
        </Text>

        <View style={cs.signatureRow} wrap={false}>
          <View style={cs.signatureBox}>
            <Text style={{ ...cs.sectionLabel, fontFamily: bodyFont }}>{copy.clientSignatureLabel}</Text>
            <Text style={{ ...cs.paragraph, marginTop: 8, fontFamily: bodyFont }}>{contract.customer.name || '—'}</Text>
            <Text style={{ ...cs.signatureHint, fontFamily: bodyFont }}>{copy.clientSignatureHint}</Text>
            <View style={cs.signatureArea} />
            <Text style={{ ...cs.signatureDate, fontFamily: bodyFont }}>{dateLabel}</Text>
          </View>

          <View style={cs.signatureBox}>
            <Text style={{ ...cs.sectionLabel, fontFamily: bodyFont }}>{copy.providerSignatureLabel}</Text>
            <Text style={{ ...cs.paragraph, marginTop: 8, fontFamily: bodyFont }}>SAS OKO · M. Shengmao KE, Président</Text>
            <Text style={{ ...cs.signatureHint, fontFamily: bodyFont }}>{dateLabel} · Paris</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/oko-signature.png" style={cs.signatureImg} />
            <Text style={{ ...cs.signatureDate, fontFamily: bodyFont }}>support@joinoko.com</Text>
          </View>
        </View>

        <Text style={{ ...cs.legalNote, fontFamily: bodyFont }}>{copy.frenchLegalNote}</Text>
        <Footer page="2 / 2" />
      </Page>
    </Document>
  )
}
