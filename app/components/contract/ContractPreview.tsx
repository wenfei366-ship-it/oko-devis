'use client'

import Image from 'next/image'
import type { Contract, DevisItem } from '@/app/lib/types'
import { formatEuroCompact } from '@/app/lib/calculations'
import {
  buildProviderLines,
  formatContractDate,
  getContractChargeSummary,
  getContractCopy,
  getContractPriceHint,
  getContractServicePrice,
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
      className="text-[9px] font-bold uppercase tracking-[1.8px]"
      style={{ color: '#9B8550' }}
    >
      {children}
    </div>
  )
}

function ArticleBlock({
  title,
  children,
  compact = false,
}: {
  title: string
  children: React.ReactNode
  compact?: boolean
}) {
  return (
    <section className="space-y-2">
      <h3
        className={compact ? 'text-[17px] font-bold italic leading-tight' : 'text-[19px] font-bold italic leading-tight'}
        style={{
          color: '#1C1611',
          fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif',
          ...(compact
            ? {
                display: 'inline-block',
                paddingRight: 10,
                backgroundColor: '#FEFBF2',
              }
            : {}),
        }}
      >
        {title}
      </h3>
      <div className={compact ? 'space-y-1 text-[9px] leading-[1.45]' : 'space-y-1.5 text-[10px] leading-[1.6]'} style={{ color: '#2A2620', fontFamily: 'var(--font-inter), Inter, sans-serif' }}>
        {children}
      </div>
    </section>
  )
}

function displayCustomerField(value?: string) {
  return value?.trim() || ''
}

function PartyLine({
  value,
  muted = false,
}: {
  value: string
  muted?: boolean
}) {
  return (
    <div className="text-[11px] leading-[1.7]" style={{ color: muted ? '#8B7A3E' : '#2A2620' }}>
      {value}
    </div>
  )
}

function getServiceDetails(item: DevisItem, lang: Contract['lang']) {
  if (item.kind !== 'package') return []
  return item.childNamesSnapshot
    .map((name) => name[lang] || name.fr)
    .filter(Boolean)
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
      data-contract-page
      className="rounded-[2px] border px-[52px] py-[46px]"
      style={{
        width: 800,
        minHeight: 1132,
        position: 'relative',
        backgroundColor: '#FEFBF2',
        borderColor: '#D9CFB8',
        boxShadow: '8px 8px 24px rgba(28,22,17,0.18)',
      }}
    >
      {children}
      <div
        className="mt-7 flex items-center justify-between border-t pt-2 text-[9px] uppercase tracking-[1.5px]"
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
  const selectedServices = getSelectedServiceSummaries(contract)
  const chargeSummary = getContractChargeSummary(contract)

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
                className="text-[14px] italic"
                style={{ color: '#6B5A3D', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
              >
                {copy.subtitlePrefix} — Paris, {formatContractDate(contract.meta.date, contract.lang)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Image
              src="/oko-logo.png"
              alt="OKO"
              width={88}
              height={88}
              className="ml-auto h-auto w-[88px]"
              priority
              unoptimized
              loading="eager"
            />
            <div className="mt-2 text-[11px] font-semibold tracking-[1.6px]" style={{ color: '#8B7A3E' }}>
              joinoko.com
            </div>
          </div>
        </div>

        <div className="my-5 h-px" style={{ backgroundColor: '#B8922F' }} />

        <section className="space-y-4">
          <h2
            className="text-[22px] font-bold italic"
            style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
          >
            {copy.partiesTitle}
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-[2px] border p-5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.providerLabel}</SectionLabel>
              <div className="mt-4">
                <div
                  className="text-[26px] font-bold leading-none"
                  style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                >
                  SAS OKO
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
                  Société par actions simplifiée
                </div>
                <div className="my-4 h-px" style={{ backgroundColor: '#E4D9BE' }} />
                <div className="space-y-1.5">
                  <PartyLine value={providerLines[1]} />
                  <PartyLine value="R.C.S. Paris 881 648 323 00015" />
                  <PartyLine value="Représentée par M. Shengmao KE, Président" />
                  <PartyLine value="support@joinoko.com" />
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border p-5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.clientLabel}</SectionLabel>
              <div className="mt-4">
                <div
                  className="text-[24px] font-bold leading-[1.05]"
                  style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                >
                  {displayCustomerField(contract.customer.name) || 'Client à compléter'}
                </div>
                <div className="my-4 h-px" style={{ backgroundColor: '#E4D9BE' }} />
                <div className="space-y-1.5">
                  {displayCustomerField(contract.customer.address) && (
                    <PartyLine value={displayCustomerField(contract.customer.address)} />
                  )}
                  {displayCustomerField([contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ')) && (
                    <PartyLine value={displayCustomerField([contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' '))} />
                  )}
                  {displayCustomerField(contract.customer.contactName) && (
                    <PartyLine value={displayCustomerField(contract.customer.contactName)} />
                  )}
                  {displayCustomerField(contract.customer.email) && (
                    <PartyLine value={displayCustomerField(contract.customer.email)} />
                  )}
                  {displayCustomerField(contract.customer.phone) && (
                    <PartyLine value={displayCustomerField(contract.customer.phone)} />
                  )}
                  {!displayCustomerField(contract.customer.address)
                    && !displayCustomerField(contract.customer.contactName)
                    && !displayCustomerField(contract.customer.email)
                    && !displayCustomerField(contract.customer.phone)
                    && !displayCustomerField([contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ')) && (
                    <PartyLine value="Informations client à compléter" muted />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <p
          className="mt-6 text-[11px] italic leading-[1.75]"
          style={{ color: '#5C5142', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
        >
          {copy.intro}
        </p>

        <div className="mt-5 space-y-4">
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

        <div className="my-4 h-px" style={{ backgroundColor: '#B8922F' }} />

        <div className="space-y-4">
          <ArticleBlock title={copy.article4Title} compact>
            <p>{copy.article4Content1}</p>
            <p>{copy.article4Content2}</p>
          </ArticleBlock>

          <ArticleBlock title={copy.article5Title} compact>
            <p>{copy.article5Intro}</p>
            <ul className="space-y-1.5 pl-5">
              <li>{copy.article5a}</li>
              <li>{copy.article5b}</li>
              <li>{copy.article5c}</li>
            </ul>
          </ArticleBlock>

          <ArticleBlock title={copy.article6Title} compact>
            <p>{copy.article6Content}</p>
          </ArticleBlock>

          <ArticleBlock title={copy.article7Title} compact>
            <p>{copy.article7Intro}</p>
            <div className="overflow-hidden rounded-[2px] border" style={{ borderColor: '#E4D9BE', backgroundColor: '#FEFBF2' }}>
              <div className="grid grid-cols-[56px_minmax(0,1fr)_120px_120px] gap-4 px-4 py-1 text-[8px] font-bold uppercase tracking-[1.2px]" style={{ backgroundColor: '#F4ECD6', color: '#6B5A3D' }}>
                <div />
                <div>Désignation</div>
                <div className="text-right">Mensuel</div>
                <div className="text-right">Annuel</div>
              </div>
              {contract.selectedServices.length === 0 ? (
                <div className="px-4 py-3 text-[9px]" style={{ color: '#6B5A3D' }}>
                  {copy.noServices}
                </div>
              ) : (
                contract.selectedServices.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="grid grid-cols-[56px_minmax(0,1fr)_120px_120px] gap-4 px-4 py-1.5"
                    style={{
                      backgroundColor: index % 2 === 0 ? '#FEFBF2' : 'rgba(246,239,220,0.5)',
                    }}
                  >
                    <div className="text-[11px] font-bold italic" style={{ color: '#A8702E', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <div className="text-[9px] font-bold" style={{ color: '#1C1611' }}>{selectedServices[index]}</div>
                      {item.kind === 'package' && getServiceDetails(item, contract.lang).length > 0 && (
                        <div className="mt-0.5 text-[6px] leading-[1.3]" style={{ color: '#6B5A3D' }}>
                          包含：{getServiceDetails(item, contract.lang).join(' · ')}
                        </div>
                      )}
                      <div className="mt-0.5 text-[6px] italic leading-[1.25]" style={{ color: '#6B5A3D' }}>
                        {getContractPriceHint(item, contract.lang, contract.paymentMode)}
                      </div>
                    </div>
                    <div className="text-right text-[8px]" style={{ color: '#1C1611' }}>
                      {formatEuroCompact(getContractServicePrice(item, 'monthly'))}
                    </div>
                    <div className="text-right text-[9px] font-bold" style={{ color: '#1C1611' }}>
                      {formatEuroCompact(getContractServicePrice(item, 'annual'))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-[8px] leading-[1.25]" style={{ color: '#5C5142' }}>{copy.article7Note}</p>

            <div className="grid grid-cols-[1.45fr_0.95fr] items-start gap-2">
              <div className="rounded-[2px] border p-2.5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                <SectionLabel>
                  {copy.article7ClientChoice} · {contract.selectedServices.length} SERVICES
                </SectionLabel>
                <div className="mt-2 space-y-1 text-[9px] leading-[1.45]" style={{ color: '#2A2620' }}>
                  {contract.selectedServices.length === 0 ? (
                    <div className="rounded-[2px] border px-3 py-2" style={{ borderColor: '#E4D9BE', backgroundColor: '#FEFBF2' }}>
                      <div className="font-semibold">{copy.noServices}</div>
                    </div>
                  ) : (
                    contract.selectedServices.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="rounded-[2px] border px-2.5 py-1" style={{ borderColor: '#E4D9BE', backgroundColor: '#FEFBF2' }}>
                        <div className="font-semibold">{selectedServices[index]}</div>
                        {item.kind === 'package' && getServiceDetails(item, contract.lang).length > 0 && (
                          <div className="mt-0.5 text-[8px] leading-[1.35]" style={{ color: '#6B5A3D' }}>
                            包含：{getServiceDetails(item, contract.lang).join(' · ')}
                          </div>
                        )}
                        <div className="mt-0.5 text-[8px]" style={{ color: '#6B5A3D' }}>
                          {getContractPriceHint(item, contract.lang, contract.paymentMode)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div
                className="self-start rounded-[2px] border p-2.5"
                style={{ borderColor: '#B8922F', backgroundColor: '#1C1611' }}
              >
                <SectionLabel>{copy.article7FinalPrice}</SectionLabel>
                <div
                  className="mt-2 text-[23px] font-bold italic leading-none"
                  style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                >
                  {formatEuroCompact(chargeSummary.primaryAmount)}
                </div>
                <div className="mt-1.5 text-[9px] tracking-[1.4px]" style={{ color: '#F8F1E0' }}>
                  {chargeSummary.primaryUnit === 'monthly' ? copy.monthlyShort : copy.annualShort} · {getTotalUnitLabel(contract)}
                </div>
                {chargeSummary.annualCharges > 0 && (
                  <div className="mt-2.5 text-[8px]" style={{ color: '#D9CFB8' }}>
                    {copy.annualChargesLabel} : {formatEuroCompact(chargeSummary.annualCharges)}
                  </div>
                )}
                {chargeSummary.oneOffCharges > 0 && (
                  <div className="mt-1 text-[8px]" style={{ color: '#D9CFB8' }}>
                    {copy.oneOffChargesLabel} : {formatEuroCompact(chargeSummary.oneOffCharges)}
                  </div>
                )}
              </div>
            </div>
          </ArticleBlock>
        </div>

        <div className="mt-5 space-y-3">
          <ArticleBlock title={copy.article8Title}>
            <div className="rounded-[2px] border p-2.5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <p>{contract.specialConditions || copy.article8Placeholder}</p>
            </div>
          </ArticleBlock>

          <p className="text-[10px] leading-[1.6]" style={{ color: '#2A2620' }}>
            {copy.madeIn} {copy.madeOn} {formatContractDate(contract.meta.date, contract.lang)} {copy.inParis}.
          </p>

          <div className="h-px" style={{ backgroundColor: '#B8922F' }} />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-[2px] border p-2.5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.clientSignatureLabel}</SectionLabel>
              <div className="mt-1.5 space-y-1 text-[9px] leading-[1.45]" style={{ color: '#2A2620' }}>
                <div>{displayCustomerField(contract.customer.name)}</div>
                <div>{copy.clientSignatureHint}</div>
                <div className="h-[36px] rounded-[2px] border border-dashed" style={{ borderColor: '#C8B987' }} />
                <div className="border-t pt-2" style={{ borderColor: '#D9CFB8' }}>
                  {formatContractDate(contract.meta.date, contract.lang)}
                </div>
              </div>
            </div>

            <div className="rounded-[2px] border p-2.5" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <SectionLabel>{copy.providerSignatureLabel}</SectionLabel>
              <div className="mt-1.5 space-y-1 text-[9px] leading-[1.45]" style={{ color: '#2A2620' }}>
                <div>SAS OKO · M. Shengmao KE, Président</div>
                <div>{formatContractDate(contract.meta.date, contract.lang)} · Paris</div>
                <Image
                  src="/oko-signature.png"
                  alt="OKO signature"
                  width={62}
                  height={22}
                  className="h-auto w-[62px]"
                  priority
                  unoptimized
                  loading="eager"
                />
                <div className="border-t pt-2" style={{ borderColor: '#D9CFB8' }}>
                  support@joinoko.com
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[9px] tracking-[1.2px]" style={{ color: '#8B7A3E', marginTop: 2 }}>
            {copy.frenchLegalNote}
          </p>
        </div>
      </Paper>
    </div>
  )
}
