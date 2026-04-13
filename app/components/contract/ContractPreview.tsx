'use client'

import Image from 'next/image'
import type { Contract } from '@/app/lib/types'
import { formatEuroCompact } from '@/app/lib/calculations'
import {
  buildProviderLines,
  formatContractDate,
  getContractCopy,
  getFixedPriceLines,
  getPaymentModeLabel,
  getSelectedServiceSummaries,
  getStandardServiceLines,
  getTotalUnitLabel,
} from '@/app/lib/contractContent'

interface ContractPreviewProps {
  contract: Contract
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="text-[9px] font-bold uppercase tracking-[2px]"
      style={{ color: '#9B8550' }}
    >
      {children}
    </div>
  )
}

function ArticleBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3
        className="text-[18px] font-bold italic leading-tight"
        style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
      >
        {title}
      </h3>
      <div className="space-y-2 text-[11px] leading-[1.72]" style={{ color: '#2A2620' }}>
        {children}
      </div>
    </section>
  )
}

function Paper({
  page,
  children,
}: {
  page: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-[2px] border px-[54px] py-[52px]"
      style={{
        width: 800,
        minHeight: 1132,
        backgroundColor: '#FEFBF2',
        borderColor: '#D9CFB8',
        boxShadow: '8px 8px 24px rgba(28,22,17,0.18)',
      }}
    >
      {children}
      <div
        className="mt-10 flex items-center justify-between border-t pt-3 text-[9px] uppercase tracking-[1.5px]"
        style={{ color: '#8B7A3E', borderColor: '#D9CFB8' }}
      >
        <span>SAS OKO · 31 boulevard de Magenta · 75010 Paris</span>
        <span>{page}</span>
      </div>
    </div>
  )
}

export default function ContractPreview({ contract }: ContractPreviewProps) {
  const copy = getContractCopy(contract.lang)
  const providerLines = buildProviderLines()
  const serviceLines = getStandardServiceLines(contract.lang)
  const priceLines = getFixedPriceLines(contract.lang)
  const selectedServices = getSelectedServiceSummaries(contract)

  return (
    <div className="space-y-8" data-contract-preview>
      <Paper page="1 / 2">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4">
            <SectionLabel>
              CONTRAT · N° {contract.meta.number}
              {contract.meta.devisNumber ? ` · LIÉ AU DEVIS ${contract.meta.devisNumber}` : ''}
            </SectionLabel>
            <div className="space-y-2">
              <h1
                className="max-w-[430px] text-[50px] font-bold leading-[0.96] tracking-[-1.2px]"
                style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
              >
                {copy.title}
              </h1>
              <p
                className="text-[15px] italic"
                style={{ color: '#6B5A3D', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
              >
                {copy.subtitlePrefix} — Paris, {formatContractDate(contract.meta.date, contract.lang)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Image src="/oko-logo.png" alt="OKO" width={88} height={88} className="ml-auto h-auto w-[88px]" />
            <div className="mt-2 text-[11px] font-semibold tracking-[1.6px]" style={{ color: '#8B7A3E' }}>
              joinoko.com
            </div>
          </div>
        </div>

        <div className="my-6 h-px" style={{ backgroundColor: '#B8922F' }} />

        <section className="space-y-4">
          <h2
            className="text-[22px] font-bold italic"
            style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
          >
            {copy.partiesTitle}
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.providerLabel}</SectionLabel>
              <div className="mt-3 space-y-1 text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
                {providerLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>

            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.clientLabel}</SectionLabel>
              <div className="mt-3 space-y-1 text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
                <div>{contract.customer.name || '—'}</div>
                <div>{contract.customer.address || '—'}</div>
                <div>{[contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ') || '—'}</div>
                <div>{contract.customer.contactName || '—'}</div>
                <div>{contract.customer.email || '—'}</div>
                <div>{contract.customer.phone || '—'}</div>
              </div>
            </div>
          </div>
        </section>

        <p
          className="mt-6 text-[12px] italic"
          style={{ color: '#5C5142', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
        >
          {copy.intro}
        </p>

        <div className="mt-6 space-y-5">
          <ArticleBlock title={copy.article1Title}>
            <p>{copy.article1Intro}</p>
            <ul className="space-y-1.5 pl-5">
              {serviceLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </ArticleBlock>

          <ArticleBlock title={copy.article2Title}>
            <p>{copy.article2Content}</p>
          </ArticleBlock>

          <ArticleBlock title={copy.article3Title}>
            <p>{copy.article3Intro}</p>
            <p className="font-semibold">{copy.article3Point1Title}</p>
            <p>{copy.article3Point1Content}</p>
            <p className="font-semibold">{copy.article3Point2Title}</p>
            <p>{copy.article3Point2Content}</p>
          </ArticleBlock>
        </div>
      </Paper>

      <div className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[2px]" style={{ color: '#9B8550' }}>
        <span className="h-px w-16" style={{ backgroundColor: '#B8922F' }} />
        <span>PAGE BREAK</span>
        <span className="h-px w-16" style={{ backgroundColor: '#B8922F' }} />
      </div>

      <Paper page="2 / 2">
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>CONTRAT · N° {contract.meta.number} · SUITE</SectionLabel>
          <div className="text-[10px] tracking-[1.4px]" style={{ color: '#8B7A3E' }}>
            {contract.customer.name || 'Client'} · {formatContractDate(contract.meta.date, contract.lang)}
          </div>
        </div>

        <div className="my-5 h-px" style={{ backgroundColor: '#B8922F' }} />

        <div className="space-y-5">
          <ArticleBlock title={copy.article4Title}>
            <p>{copy.article4Content1}</p>
            <p>{copy.article4Content2}</p>
          </ArticleBlock>

          <ArticleBlock title={copy.article5Title}>
            <p>{copy.article5Intro}</p>
            <ul className="space-y-1.5 pl-5">
              <li>{copy.article5a}</li>
              <li>{copy.article5b}</li>
              <li>{copy.article5c}</li>
            </ul>
          </ArticleBlock>

          <ArticleBlock title={copy.article6Title}>
            <p>{copy.article6Content}</p>
          </ArticleBlock>

          <ArticleBlock title={copy.article7Title}>
            <p>{copy.article7Intro}</p>
            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <div className="space-y-2 text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
                {priceLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>

            <p>{copy.article7Note}</p>

            <div className="grid grid-cols-[1.45fr_0.95fr] gap-4">
              <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                <SectionLabel>
                  {copy.article7ClientChoice} · {contract.selectedServices.length} SERVICES
                </SectionLabel>
                <div className="mt-3 space-y-1.5 text-[11px] leading-[1.65]" style={{ color: '#2A2620' }}>
                  {selectedServices.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-[2px] border p-4"
                style={{ borderColor: '#B8922F', backgroundColor: '#1C1611' }}
              >
                <SectionLabel>{copy.article7FinalPrice}</SectionLabel>
                <div
                  className="mt-4 text-[31px] font-bold italic leading-none"
                  style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                >
                  {formatEuroCompact(contract.finalTotal)}
                </div>
                <div className="mt-2 text-[10px] tracking-[1.6px]" style={{ color: '#F8F1E0' }}>
                  {getPaymentModeLabel(contract)} · {getTotalUnitLabel(contract)}
                </div>
                <div className="mt-5 text-[11px]" style={{ color: '#D9CFB8' }}>
                  {copy.total}: {formatEuroCompact(contract.subtotalDisplay)}
                </div>
              </div>
            </div>
          </ArticleBlock>

          <ArticleBlock title={copy.article8Title}>
            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <p>{contract.specialConditions || copy.article8Placeholder}</p>
            </div>
          </ArticleBlock>
        </div>

        <div className="mt-7 space-y-5">
          <p className="text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
            {copy.madeIn} {copy.madeOn} {formatContractDate(contract.meta.date, contract.lang)} {copy.inParis}.
          </p>

          <div className="h-px" style={{ backgroundColor: '#B8922F' }} />

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.clientSignatureLabel}</SectionLabel>
              <div className="mt-3 space-y-3 text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
                <div>{contract.customer.name || '—'}</div>
                <div>{copy.clientSignatureHint}</div>
                <div className="h-[92px] rounded-[2px] border border-dashed" style={{ borderColor: '#C8B987' }} />
                <div className="border-t pt-2" style={{ borderColor: '#D9CFB8' }}>
                  {formatContractDate(contract.meta.date, contract.lang)}
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border p-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.providerSignatureLabel}</SectionLabel>
              <div className="mt-3 space-y-3 text-[11px] leading-[1.7]" style={{ color: '#2A2620' }}>
                <div>SAS OKO · M. Shengmao KE, Président</div>
                <div>{formatContractDate(contract.meta.date, contract.lang)} · Paris</div>
                <Image src="/oko-signature.png" alt="OKO signature" width={120} height={56} className="h-auto w-[120px]" />
                <div className="border-t pt-2" style={{ borderColor: '#D9CFB8' }}>
                  support@joinoko.com
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[9px] tracking-[1.2px]" style={{ color: '#8B7A3E' }}>
            {copy.frenchLegalNote}
          </p>
        </div>
      </Paper>
    </div>
  )
}
