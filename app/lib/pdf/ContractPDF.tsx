import { Document, Image, Page, Text, View } from '@react-pdf/renderer'
import type { Contract } from '../types'
import { formatEuroCompact } from '../calculations'
import {
  buildProviderLines,
  formatContractDate,
  getContractCopy,
  getFixedPriceLines,
  getPaymentModeLabel,
  getSelectedServiceSummaries,
  getStandardServiceLines,
  getTotalUnitLabel,
} from '../contractContent'
import { cs } from './contractStyles'

interface ContractPDFProps {
  contract: Contract
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={cs.bulletList}>
      {items.map((item) => (
        <View key={item} style={cs.bulletRow}>
          <Text style={cs.bulletDot}>•</Text>
          <Text style={cs.bulletText}>{item}</Text>
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
  const fixedPrices = getFixedPriceLines(contract.lang)
  const selectedServices = getSelectedServiceSummaries(contract)
  const dateLabel = formatContractDate(contract.meta.date, contract.lang)
  const customerTitle = contract.customer.name || 'Client'

  return (
    <Document>
      <Page size="A4" style={cs.page}>
        <View style={cs.topRow}>
          <View>
            <Text style={cs.sectionLabel}>
              CONTRAT · N° {contract.meta.number}
              {contract.meta.devisNumber ? ` · LIÉ AU DEVIS ${contract.meta.devisNumber}` : ''}
            </Text>
            <Text style={cs.title}>{copy.title}</Text>
            <Text style={cs.subtitle}>
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

        <Text style={cs.sectionTitle}>{copy.partiesTitle}</Text>
        <View style={cs.partiesRow}>
          <View style={cs.partyCard}>
            <Text style={cs.sectionLabel}>{copy.providerLabel}</Text>
            <View style={{ marginTop: 8 }}>
              {providerLines.map((line) => (
                <Text key={line} style={cs.partyLine}>{line}</Text>
              ))}
            </View>
          </View>

          <View style={cs.partyCard}>
            <Text style={cs.sectionLabel}>{copy.clientLabel}</Text>
            <View style={{ marginTop: 8 }}>
              <Text style={cs.partyLine}>{contract.customer.name || '—'}</Text>
              <Text style={cs.partyLine}>{contract.customer.address || '—'}</Text>
              <Text style={cs.partyLine}>
                {[contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ') || '—'}
              </Text>
              <Text style={cs.partyLine}>{contract.customer.contactName || '—'}</Text>
              <Text style={cs.partyLine}>{contract.customer.email || '—'}</Text>
              <Text style={cs.partyLine}>{contract.customer.phone || '—'}</Text>
            </View>
          </View>
        </View>

        <Text style={cs.intro}>{copy.intro}</Text>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article1Title}</Text>
          <Text style={cs.paragraph}>{copy.article1Intro}</Text>
          <BulletList items={serviceLines} />
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article2Title}</Text>
          <Text style={cs.paragraph}>{copy.article2Content}</Text>
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article3Title}</Text>
          <Text style={cs.paragraph}>{copy.article3Intro}</Text>
          <Text style={cs.paragraph}>{copy.article3Point1Title}</Text>
          <Text style={cs.paragraph}>{copy.article3Point1Content}</Text>
          <Text style={cs.paragraph}>{copy.article3Point2Title}</Text>
          <Text style={cs.paragraph}>{copy.article3Point2Content}</Text>
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
          <Text style={cs.sectionTitle}>{copy.article4Title}</Text>
          <Text style={cs.paragraph}>{copy.article4Content1}</Text>
          <Text style={cs.paragraph}>{copy.article4Content2}</Text>
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article5Title}</Text>
          <Text style={cs.paragraph}>{copy.article5Intro}</Text>
          <BulletList items={[copy.article5a, copy.article5b, copy.article5c]} />
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article6Title}</Text>
          <Text style={cs.paragraph}>{copy.article6Content}</Text>
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article7Title}</Text>
          <Text style={cs.paragraph}>{copy.article7Intro}</Text>

          <View style={cs.priceCard}>
            {fixedPrices.map((line) => (
              <Text key={line} style={cs.paragraph}>{line}</Text>
            ))}
          </View>

          <Text style={{ ...cs.paragraph, marginTop: 8 }}>{copy.article7Note}</Text>

          <View style={cs.choiceRow}>
            <View style={cs.choiceBox}>
              <Text style={cs.sectionLabel}>
                {copy.article7ClientChoice} · {contract.selectedServices.length} SERVICES
              </Text>
              <View style={{ marginTop: 8 }}>
                {selectedServices.map((line) => (
                  <Text key={line} style={cs.paragraph}>{line}</Text>
                ))}
              </View>
            </View>

            <View style={cs.finalBox}>
              <Text style={{ ...cs.sectionLabel, color: '#F5D48A' }}>{copy.article7FinalPrice}</Text>
              <Text style={cs.finalPrice}>{formatEuroCompact(contract.finalTotal)}</Text>
              <Text style={cs.finalMeta}>
                {getPaymentModeLabel(contract)} · {getTotalUnitLabel(contract)}
              </Text>
              <Text style={cs.finalSub}>
                {copy.total}: {formatEuroCompact(contract.subtotalDisplay)}
              </Text>
            </View>
          </View>
        </View>

        <View style={cs.article}>
          <Text style={cs.sectionTitle}>{copy.article8Title}</Text>
          <View style={cs.noteBox}>
            <Text style={cs.paragraph}>{contract.specialConditions || copy.article8Placeholder}</Text>
          </View>
        </View>

        <View style={cs.articleDivider} />
        <Text style={cs.paragraph}>
          {copy.madeIn} {copy.madeOn} {dateLabel} {copy.inParis}.
        </Text>

        <View style={cs.signatureRow}>
          <View style={cs.signatureBox}>
            <Text style={cs.sectionLabel}>{copy.clientSignatureLabel}</Text>
            <Text style={{ ...cs.paragraph, marginTop: 8 }}>{contract.customer.name || '—'}</Text>
            <Text style={cs.signatureHint}>{copy.clientSignatureHint}</Text>
            <View style={cs.signatureArea} />
            <Text style={cs.signatureDate}>{dateLabel}</Text>
          </View>

          <View style={cs.signatureBox}>
            <Text style={cs.sectionLabel}>{copy.providerSignatureLabel}</Text>
            <Text style={{ ...cs.paragraph, marginTop: 8 }}>SAS OKO · M. Shengmao KE, Président</Text>
            <Text style={cs.signatureHint}>{dateLabel} · Paris</Text>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/oko-signature.png" style={cs.signatureImg} />
            <Text style={cs.signatureDate}>support@joinoko.com</Text>
          </View>
        </View>

        <Text style={cs.legalNote}>{copy.frenchLegalNote}</Text>
        <Footer page="2 / 2" />
      </Page>
    </Document>
  )
}
