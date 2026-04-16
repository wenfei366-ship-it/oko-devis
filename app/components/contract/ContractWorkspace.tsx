'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ContractPreview from './ContractPreview'
import { CATALOG } from '@/app/lib/catalog'
import { formatEuroCompact } from '@/app/lib/calculations'
import { packNameWithCount } from '@/app/lib/i18n'
import { createNodeExportImage } from '@/app/lib/png/exportLong'
import {
  CONTRACT_LANGUAGE_LABELS,
  CONTRACT_SENT_CHANNEL_LABELS,
  CONTRACT_STATUS_LABELS,
  getContractChargeSummary,
  getContractReferenceTotal,
} from '@/app/lib/contractContent'
import {
  createContractLineItemFromService,
  createContractFromDevis,
  createEmptyContract,
  loadContract,
  saveContract,
  updateContractStatus,
} from '@/app/lib/contractStorage'
import { buildContractPdfPath, buildDocumentFileStem } from '@/app/lib/fileStorage'
import { uuid } from '@/app/lib/numbering'
import { loadFromHistory } from '@/app/lib/storage'
import { useMounted } from '@/app/lib/useMounted'
import type { Contract, ContractEvidenceFile, ContractSentChannel, ContractStatus, Country, Lang, PackageLine, Service } from '@/app/lib/types'
import { useAuth } from '@/app/components/AuthContext'

interface ContractWorkspaceProps {
  contractId?: string
  readOnly?: boolean
  fromDevisId?: string
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[1.8px]" style={{ color: '#8B7A3E' }}>
      {children}
    </label>
  )
}

function fieldClassName(disabled?: boolean) {
  return `mt-2 w-full rounded-[8px] border px-3 py-2.5 text-[13px] outline-none transition-colors ${
    disabled ? 'cursor-default bg-[#F6EFDC]' : 'bg-white'
  }`
}

function smallFieldClassName(disabled?: boolean) {
  return `mt-2 w-full rounded-[8px] border px-3 py-2 text-[12px] outline-none transition-colors ${
    disabled ? 'cursor-default bg-[#F6EFDC]' : 'bg-white'
  }`
}

const STATUS_FLOW: Array<{
  key: ContractStatus
  title: string
  description: string
}> = [
  { key: 'draft', title: '草稿', description: '合同还在补信息和确认金额。' },
  { key: 'generated', title: '已生成', description: '正式版 PDF 已生成，可随时发给客户。' },
  { key: 'sent', title: '已发送', description: '已经发给客户，等待对方确认。' },
  { key: 'confirmed', title: '已确认', description: '客户已经明确同意。' },
  { key: 'completed', title: '已完成', description: '这份合同已经归档完成。' },
]

const CONTRACT_EMAIL_COPY = {
  fr: {
    subject: (number: string, customer: string) => `Contrat OKO ${number} · ${customer}`,
    greeting: 'Bonjour,',
    body: (number: string) => `Veuillez trouver ci-joint le contrat ${number} préparé pour votre établissement.`,
    confirm: 'Si ce document vous convient, il vous suffit de répondre à cet email pour nous confirmer votre accord.',
    closing: 'Cordialement,',
  },
  it: {
    subject: (number: string, customer: string) => `Contratto OKO ${number} · ${customer}`,
    greeting: 'Buongiorno,',
    body: (number: string) => `In allegato trova il contratto ${number} preparato per la sua attività.`,
    confirm: 'Se il documento è conforme alle sue aspettative, le basta rispondere a questa email per confermare il suo accordo.',
    closing: 'Cordiali saluti,',
  },
  es: {
    subject: (number: string, customer: string) => `Contrato OKO ${number} · ${customer}`,
    greeting: 'Hola,',
    body: (number: string) => `Adjuntamos el contrato ${number} preparado para su establecimiento.`,
    confirm: 'Si el documento le parece correcto, solo tiene que responder a este correo para confirmarnos su acuerdo.',
    closing: 'Un saludo,',
  },
  de: {
    subject: (number: string, customer: string) => `OKO Vertrag ${number} · ${customer}`,
    greeting: 'Guten Tag,',
    body: (number: string) => `Im Anhang finden Sie den Vertrag ${number}, den wir für Ihr Unternehmen vorbereitet haben.`,
    confirm: 'Wenn das Dokument für Sie passt, genügt eine Antwort auf diese E-Mail, um Ihre Zustimmung zu bestätigen.',
    closing: 'Freundliche Grüße,',
  },
  zh: {
    subject: (number: string, customer: string) => `OKO 合同 ${number} · ${customer}`,
    greeting: '您好，',
    body: (number: string) => `附件是为贵店准备的合同 ${number}，请您查收。`,
    confirm: '如果内容确认无误，直接回复这封邮件即可确认同意。',
    closing: '此致，',
  },
} as const

function getContractEmailLang(country: Country, fallback: Lang): Lang {
  if (country === 'IT') return 'it'
  if (country === 'ES') return 'es'
  if (country === 'DE') return 'de'
  if (country === 'FR' || country === 'BE' || country === 'CH' || country === 'LU') return 'fr'
  return fallback
}

function createPackageFromServices(services: Service[]): PackageLine {
  const baselineMonthly = services.reduce((sum, service) => sum + service.defaultPrice, 0)
  const baselineAnnual = baselineMonthly * 12

  return {
    kind: 'package',
    id: uuid(),
    nameSnapshot: {
      fr: packNameWithCount(services.length, 'fr'),
      zh: packNameWithCount(services.length, 'zh'),
      it: packNameWithCount(services.length, 'it'),
      de: packNameWithCount(services.length, 'de'),
      es: packNameWithCount(services.length, 'es'),
    },
    childServiceIds: services.map((service) => service.id),
    childNamesSnapshot: services.map((service) => ({ ...service.name })),
    childDescsSnapshot: services.map((service) => ({ ...service.description })),
    childMonthlyPricesSnapshot: services.map((service) => service.defaultPrice),
    monthlyPrice: baselineMonthly,
    annualPrice: baselineAnnual,
    baselineMonthly,
    baselineAnnual,
    preferredMode: 'annual',
    recurringEligible: true,
  }
}

async function generateContractPdfBlob(container: HTMLDivElement | null, contract: Contract): Promise<Blob> {
  const pageElements = Array.from(container?.querySelectorAll<HTMLElement>('[data-contract-page]') || [])
  if (pageElements.length !== 2) {
    throw new Error('合同预览页还没准备好，请稍后再试。')
  }

  const exportImages = await Promise.all(
    pageElements.map((pageElement) =>
      createNodeExportImage(pageElement, {
        pixelRatio: 3,
        backgroundColor: '#FEFBF2',
        width: 800,
        height: 1132,
      })
    )
  )

  const [{ Document, Image, Page, StyleSheet, pdf }] = await Promise.all([
    import('@react-pdf/renderer'),
  ])

  const styles = StyleSheet.create({
    page: {
      padding: 0,
      margin: 0,
      backgroundColor: '#FEFBF2',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  })

  function ContractImagePdf() {
    return (
      <Document>
        {exportImages.map((image, index) => (
          <Page key={`${contract.id}-${index}`} size="A4" style={styles.page}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={image.dataUrl} style={styles.image} />
          </Page>
        ))}
      </Document>
    )
  }

  return pdf(<ContractImagePdf />).toBlob()
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('PDF 编码失败。'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('PDF 编码失败。'))
    reader.readAsDataURL(blob)
  })

  const [, base64 = ''] = dataUrl.split(',', 2)
  if (!base64) {
    throw new Error('PDF 编码失败。')
  }
  return base64
}

function ScaledContract({ contract, previewRef }: { contract: Contract; previewRef: React.RefObject<HTMLDivElement | null> }) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)
  const baseWidth = 800

  const recalc = useCallback(() => {
    if (!wrapperRef.current) return
    const width = Math.max(wrapperRef.current.clientWidth - 40, 320)
    const nextScale = Math.min(width / baseWidth, 1)
    setScale(nextScale)
    const content = wrapperRef.current.querySelector('[data-contract-preview]') as HTMLElement | null
    if (content) setHeight(content.scrollHeight)
  }, [])

  useEffect(() => {
    recalc()
    const observer = new ResizeObserver(recalc)
    if (wrapperRef.current) observer.observe(wrapperRef.current)
    window.addEventListener('resize', recalc)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recalc)
    }
  }, [recalc])

  return (
    <div ref={wrapperRef} className="h-full overflow-y-auto px-6 pb-6">
      <div className="mx-auto flex justify-center">
        <div style={{ width: baseWidth * scale, minHeight: height ? height * scale : undefined }}>
          <div
            ref={previewRef}
            style={{
              width: baseWidth,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <ContractPreview contract={contract} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContractWorkspace({ contractId, readOnly = false, fromDevisId }: ContractWorkspaceProps) {
  const mounted = useMounted()
  const router = useRouter()
  const { user } = useAuth()
  const previewRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const evidenceInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [packDraft, setPackDraft] = useState<Set<string>>(new Set())
  const chargeSummary = contract ? getContractChargeSummary(contract) : null

  const loadData = useCallback(async () => {
    if (!mounted) return

    setLoading(true)
    setError(null)

    try {
      if (contractId) {
        const existing = await loadContract(contractId)
        if (!existing) {
          setError('没找到这份合同。')
          setContract(null)
        } else {
          setContract(existing)
        }
        return
      }

      if (fromDevisId) {
        const devis = await loadFromHistory(fromDevisId)
        if (!devis) {
          setError('没找到对应的报价单，先回项目档案重新点一次。')
          setContract(createEmptyContract(user?.displayName))
        } else {
          setContract(createContractFromDevis(devis, user?.displayName))
        }
        return
      }

      setContract(createEmptyContract(user?.displayName))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '合同加载失败。')
    } finally {
      setLoading(false)
    }
  }, [contractId, fromDevisId, mounted, user?.displayName])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const updateContract = useCallback((updater: (current: Contract) => Contract) => {
    setContract((current) => {
      if (!current) return current
      return {
        ...updater(current),
        updatedAt: new Date().toISOString(),
      }
    })
    setSaveMessage(null)
  }, [])

  const applyServiceSelection = useCallback((nextServices: Contract['selectedServices']) => {
    updateContract((current) => {
      const nextSubtotal = getContractReferenceTotal(nextServices, current.paymentMode)
      return {
        ...current,
        selectedServices: nextServices,
        subtotalDisplay: nextSubtotal,
        finalTotal: nextSubtotal,
      }
    })
  }, [updateContract])

  const handleSave = useCallback(async () => {
    if (!contract) return

    setSaving(true)
    setSaveMessage(null)

    try {
      const nextContract = {
        ...contract,
        createdBy: contract.createdBy || user?.displayName,
        updatedAt: new Date().toISOString(),
      }
      await saveContract(nextContract)
      setContract(nextContract)
      setSaveMessage('已保存到共享历史。')
      if (!contractId) {
        router.replace(`/contract/${nextContract.id}/send`)
      }
    } catch (saveError) {
      setSaveMessage(saveError instanceof Error ? saveError.message : '保存失败。')
    } finally {
      setSaving(false)
    }
  }, [contract, contractId, router, user?.displayName])

  const handleStatusChange = useCallback(async (status: ContractStatus, sentChannel?: ContractSentChannel) => {
    if (!contract) return
    const nextContract = updateContractStatus(contract, status, user?.displayName || contract.createdBy || 'OKO', sentChannel)
    setContract(nextContract)
    setSaving(true)
    setSaveMessage(null)
    try {
      await saveContract(nextContract)
      setSaveMessage(`状态已更新为“${CONTRACT_STATUS_LABELS[status]}”。`)
    } catch (statusError) {
      setSaveMessage(statusError instanceof Error ? statusError.message : '状态更新失败。')
    } finally {
      setSaving(false)
    }
  }, [contract, user?.displayName])

  const handleExport = useCallback(() => {
    if (!contract || exporting) return

    void (async () => {
      const contractSnapshot = contract

      if (!contractSnapshot.customer.name.trim()) {
        setSaveMessage('先把客户名称填好，再导出合同。')
        return
      }

      if (contractSnapshot.selectedServices.length === 0) {
        setSaveMessage('先从报价单或产品目录里选好服务，再导出合同。')
        return
      }

      if (contractSnapshot.finalTotal <= 0) {
        setSaveMessage('先填好最终成交价，再导出合同。')
        return
      }

      setExporting(true)
      setSaveMessage(null)

      try {
        const blob = await generateContractPdfBlob(exportRef.current, contractSnapshot)
        const contractPdfName = `${buildDocumentFileStem('合同', contractSnapshot.customer.name, contractSnapshot.meta.number)}.pdf`
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = contractPdfName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        const nextContract = contractSnapshot.status === 'draft'
          ? updateContractStatus(contractSnapshot, 'generated', user?.displayName || contractSnapshot.createdBy || 'OKO')
          : {
              ...contractSnapshot,
              createdBy: contractSnapshot.createdBy || user?.displayName,
              updatedAt: new Date().toISOString(),
            }

        nextContract.pdfPath = buildContractPdfPath(nextContract.id, nextContract.meta.number)
        nextContract.pdfUrl = undefined

        try {
          const formData = new FormData()
          formData.set('file', new File([blob], contractPdfName, { type: 'application/pdf' }))
          formData.set('kind', 'contract-pdf')
          formData.set('entityId', nextContract.id)
          formData.set('fileName', nextContract.meta.number)

          const uploadResponse = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
          })

          if (uploadResponse.ok) {
            const payload = await uploadResponse.json() as { path?: string; url?: string }
            nextContract.pdfPath = payload.path || nextContract.pdfPath
            nextContract.pdfUrl = payload.url
          }
        } catch {
          // Keep local download working even if cloud upload is not ready.
        }

        await saveContract(nextContract)
        setContract(nextContract)
        setSaveMessage(nextContract.pdfUrl ? 'PDF 已导出并上传到云端。' : 'PDF 已导出。云端文件未上传。')
      } catch (exportError) {
        setSaveMessage(exportError instanceof Error ? exportError.message : 'PDF 导出失败。')
      } finally {
        setExporting(false)
      }
    })()
  }, [contract, exporting, user?.displayName])

  const handleSendEmail = useCallback(() => {
    if (!contract || sendingEmail) return

    void (async () => {
      const contractSnapshot = contract

      if (!contractSnapshot.customer.email.trim()) {
        setSaveMessage('先填写客户邮箱，再发送合同。')
        return
      }

      if (!contractSnapshot.pdfUrl?.trim()) {
        setSaveMessage('先导出 PDF，再发送邮件。')
        return
      }

      setSendingEmail(true)
      setSaveMessage(null)

      try {
        const pdfBlob = await generateContractPdfBlob(exportRef.current, contractSnapshot)
        const pdfBase64 = await blobToBase64(pdfBlob)
        const contractPdfName = `${buildDocumentFileStem('合同', contractSnapshot.customer.name, contractSnapshot.meta.number)}.pdf`
        const emailLang = getContractEmailLang(contractSnapshot.customer.country, contractSnapshot.lang)
        const emailCopy = CONTRACT_EMAIL_COPY[emailLang] || CONTRACT_EMAIL_COPY.fr
        const customerName = contractSnapshot.customer.name.trim() || 'Client'
        const subject = emailCopy.subject(contractSnapshot.meta.number, customerName)
        const html = `
          <div style="font-family: Arial, sans-serif; color: #1C1611; line-height: 1.7;">
            <p>${emailCopy.greeting}</p>
            <p>${emailCopy.body(contractSnapshot.meta.number)}</p>
            <p>${emailCopy.confirm}</p>
            <p>${emailCopy.closing}<br/>OKO</p>
          </div>
        `
        const text = [
          emailCopy.greeting,
          '',
          emailCopy.body(contractSnapshot.meta.number),
          emailCopy.confirm,
          '',
          emailCopy.closing,
          'OKO',
        ].join('\n')

        const response = await fetch('/api/contract/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contractSnapshot.customer.email.trim(),
            subject,
            html,
            text,
            pdfBase64,
            pdfUrl: contractSnapshot.pdfUrl,
            pdfFileName: contractPdfName,
          }),
        })

        const payload = await response.json() as {
          error?: string
          accepted?: string[]
          rejected?: string[]
          response?: string
        }
        if (!response.ok) {
          throw new Error(payload.error || '邮件发送失败。')
        }
        if (payload.rejected?.length) {
          throw new Error(`收件服务器拒收：${payload.rejected.join(', ')}`)
        }

        const nextContract = updateContractStatus(
          contractSnapshot,
          'sent',
          user?.displayName || contractSnapshot.createdBy || 'OKO',
          'email',
        )
        await saveContract(nextContract)
        setContract(nextContract)
        setSaveMessage(
          payload.accepted?.length
            ? `邮件服务器已接收：${payload.accepted.join(', ')}`
            : `合同已发送到 ${contractSnapshot.customer.email}。`,
        )
      } catch (sendError) {
        setSaveMessage(sendError instanceof Error ? sendError.message : '邮件发送失败。')
      } finally {
        setSendingEmail(false)
      }
    })()
  }, [contract, sendingEmail, user?.displayName])

  const uploadContractFile = useCallback(async (
    file: File,
    kind: 'contract-evidence' | 'contract-attachment',
  ): Promise<ContractEvidenceFile> => {
    const formData = new FormData()
    formData.set('file', file)
    formData.set('kind', kind)
    formData.set('entityId', contract!.id)
    formData.set('fileName', file.name)

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    })

    const payload = await response.json() as { error?: string; path?: string; url?: string }
    if (!response.ok) {
      throw new Error(payload.error || '文件上传失败。')
    }

    return {
      name: file.name,
      path: payload.path,
      url: payload.url,
    }
  }, [contract])

  const handleEvidenceUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !contract || uploadingEvidence) return

    void (async () => {
      setUploadingEvidence(true)
      setSaveMessage(null)

      try {
        const uploaded = await uploadContractFile(file, 'contract-evidence')
        const now = new Date().toISOString()
        const nextContract: Contract = {
          ...contract,
          status: 'completed',
          confirmedAt: contract.confirmedAt || now,
          confirmationMethod: contract.confirmationMethod || '已上传确认凭证',
          evidenceFiles: [...contract.evidenceFiles, uploaded],
          updatedAt: now,
          activityLog: [
            ...contract.activityLog,
            {
              at: now,
              actor: user?.displayName || contract.createdBy || 'OKO',
              event: 'Uploaded confirmation evidence',
              meta: uploaded.name,
            },
            {
              at: now,
              actor: user?.displayName || contract.createdBy || 'OKO',
              event: 'Status changed to completed',
            },
          ],
        }

        await saveContract(nextContract)
        setContract(nextContract)
        setSaveMessage('确认凭证已上传，合同已自动标记完成。')
      } catch (uploadError) {
        setSaveMessage(uploadError instanceof Error ? uploadError.message : '凭证上传失败。')
      } finally {
        event.target.value = ''
        setUploadingEvidence(false)
      }
    })()
  }, [contract, uploadContractFile, uploadingEvidence, user?.displayName])

  const handleAttachmentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !contract || uploadingAttachment) return

    void (async () => {
      setUploadingAttachment(true)
      setSaveMessage(null)

      try {
        const uploaded = await uploadContractFile(file, 'contract-attachment')
        const now = new Date().toISOString()
        const nextContract: Contract = {
          ...contract,
          attachments: [...contract.attachments, uploaded],
          updatedAt: now,
          activityLog: [
            ...contract.activityLog,
            {
              at: now,
              actor: user?.displayName || contract.createdBy || 'OKO',
              event: 'Uploaded attachment',
              meta: uploaded.name,
            },
          ],
        }

        await saveContract(nextContract)
        setContract(nextContract)
        setSaveMessage('附件已上传并保存到合同记录。')
      } catch (uploadError) {
        setSaveMessage(uploadError instanceof Error ? uploadError.message : '附件上传失败。')
      } finally {
        event.target.value = ''
        setUploadingAttachment(false)
      }
    })()
  }, [contract, uploadContractFile, uploadingAttachment, user?.displayName])

  const statusTone = useMemo(() => {
    if (!contract) return '#9B8550'
    if (contract.status === 'confirmed') return '#6B8E4E'
    if (contract.status === 'completed') return '#4A6B3A'
    if (contract.status === 'cancelled') return '#9B2A2A'
    if (contract.status === 'sent') return '#C9A35B'
    return '#9B8550'
  }, [contract])

  const recurringCatalog = useMemo(
    () => CATALOG.filter((service) => service.recurringEligible),
    [],
  )
  const draftPackServices = useMemo(
    () => recurringCatalog.filter((service) => packDraft.has(service.id)),
    [packDraft, recurringCatalog],
  )

  const togglePackDraft = useCallback((serviceId: string) => {
    setPackDraft((current) => {
      const next = new Set(current)
      if (next.has(serviceId)) next.delete(serviceId)
      else next.add(serviceId)
      return next
    })
  }, [])

  const addDraftPackage = useCallback(() => {
    if (!contract || draftPackServices.length === 0) return

    const nextServices = [
      ...contract.selectedServices,
      createPackageFromServices(draftPackServices),
    ]
    applyServiceSelection(nextServices)
    setPackDraft(new Set())
  }, [applyServiceSelection, contract, draftPackServices])

  if (!mounted || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-pulse text-[var(--ink-muted)] text-sm">合同加载中…</div>
      </main>
    )
  }

  if (!contract) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <p className="text-sm text-[var(--danger)]">{error || '合同不存在。'}</p>
          <Link href="/" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A8702E' }}>
            返回项目档案
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: readOnly ? '#F8F1E0' : '#F4EBD1' }}>
      <header className="flex items-center justify-between border-b px-12 py-[22px]" style={{ borderColor: '#E4D9BE', backgroundColor: '#F4ECD6' }}>
        <div className="flex items-center gap-[18px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#1C1611' }}>
            <span className="text-[18px] font-bold" style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>O</span>
          </div>
          <div className="text-[20px] font-bold tracking-[1px]" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>OKO</div>
          <div className="h-5 w-px" style={{ backgroundColor: '#C8B987' }} />
          <div className="text-[11px] font-medium tracking-[1.2px]" style={{ color: '#6B5A3D' }}>
            {readOnly ? '合同详情  ·  归档与跟进' : '合同编辑  ·  草稿'}
          </div>
        </div>

        <div className="flex items-center gap-[14px]">
          {readOnly ? (
            <Link href="/" className="px-[14px] py-[10px] text-[11px] font-medium" style={{ color: '#A8702E' }}>
              全部合同 →
            </Link>
          ) : (
            <Link href="/" className="px-[14px] py-[10px] text-[11px] font-medium" style={{ color: '#A8702E' }}>
              全部合同 →
            </Link>
          )}
        </div>
      </header>

      {!readOnly && (
        <div className="flex items-center justify-between border-b px-12 py-5 text-[12px]" style={{ borderColor: '#E4D9BE', backgroundColor: '#F8F1E0' }}>
          <div className="flex items-center gap-[14px]">
            <span className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>← 项目档案</span>
            <span style={{ color: '#C8B987' }}>/</span>
            <span style={{ color: '#6B5A3D' }}>{contract.customer.name || '未填写客户'}</span>
            <span style={{ color: '#C8B987' }}>/</span>
            <span className="font-bold" style={{ color: '#1C1611' }}>{contract.meta.number}</span>
          </div>
          <div className="flex items-center gap-[10px]">
            {saveMessage && <span className="text-[11px]" style={{ color: saveMessage.includes('失败') ? '#9B2A2A' : '#6B8E4E' }}>{saveMessage}</span>}
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-[2px] border px-[18px] py-[10px] text-[10px] font-bold tracking-[1.4px] transition-opacity disabled:opacity-60"
              style={{ borderColor: '#1C1611', color: '#1C1611' }}
            >
              {saving ? '保存中…' : '保存草稿'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-[2px] px-5 py-[10px] text-[10px] font-bold tracking-[1.4px] transition-opacity"
              style={{ backgroundColor: '#1C1611', color: '#F5D48A', opacity: exporting ? 0.72 : 1 }}
            >
              {exporting ? '导出中…' : '导出 PDF →'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!contract) return
                void (async () => {
                  setSaving(true)
                  try {
                    const next = { ...contract, createdBy: contract.createdBy || user?.displayName, updatedAt: new Date().toISOString() }
                    await saveContract(next)
                    setContract(next)
                    router.push(`/contract/${next.id}/send`)
                  } catch { setSaveMessage('保存失败。') }
                  finally { setSaving(false) }
                })()
              }}
              disabled={saving}
              className="rounded-[2px] px-5 py-[10px] text-[10px] font-bold tracking-[1.4px] transition-opacity"
              style={{ backgroundColor: '#4A6B3A', color: '#FFFFFF', opacity: saving ? 0.72 : 1 }}
            >
              创建合同 →
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="rounded-[2px] border px-[18px] py-[10px] text-[10px] font-bold tracking-[1.4px] transition-opacity disabled:opacity-60"
              style={{ borderColor: '#B8922F', color: '#A8702E' }}
            >
              {sendingEmail ? '发送中…' : '发送合同邮件'}
            </button>
          </div>
        </div>
      )}

      <div
        className="grid min-h-[calc(100vh-134px)]"
        style={{
          padding: readOnly ? '48px 64px 56px 64px' : '40px 48px',
          gap: readOnly ? 28 : 28,
          gridTemplateColumns: readOnly ? 'minmax(0, 1fr)' : '300px minmax(0, 780px) 368px',
        }}
      >
        {!readOnly && (
        <aside className="space-y-5 overflow-y-auto">
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>来源</div>
            <div className="mt-3 rounded-[2px] border px-4 py-4" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <div className="text-[11px] font-semibold" style={{ color: '#8B7A3E' }}>
                {contract.meta.devisNumber ? '从报价单生成' : '独立创建'}
              </div>
              <div className="mt-2 text-[22px] font-bold leading-tight" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                {contract.customer.name || '未填写客户'}
              </div>
              <div className="mt-2 text-[12px]" style={{ color: '#5C5142' }}>{contract.meta.devisNumber || '无关联报价单'}</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]" style={{ color: '#5C5142' }}>
                <div>
                  <div style={{ color: '#9B8550' }}>日期</div>
                  <div className="mt-1 font-semibold" style={{ color: '#1C1611' }}>{contract.meta.date || '—'}</div>
                </div>
                <div>
                  <div style={{ color: '#9B8550' }}>金额</div>
                  <div className="mt-1 font-semibold" style={{ color: '#1C1611' }}>{formatEuroCompact(contract.finalTotal)}</div>
                </div>
                <div>
                  <div style={{ color: '#9B8550' }}>服务数</div>
                  <div className="mt-1 font-semibold" style={{ color: '#1C1611' }}>{contract.selectedServices.length}</div>
                </div>
              </div>
              {contract.devisId && (
                <Link href="/" className="mt-3 inline-block text-[12px] font-semibold" style={{ color: '#A8702E' }}>
                  返回项目档案查看原始报价单 →
                </Link>
              )}
            </div>
            {!contract.devisId && (
              <div className="mt-3 space-y-4">
                <div className="space-y-2">
                  {CATALOG.map((service) => {
                    const isAdded = contract.selectedServices.some(
                      (item) => item.kind === 'line' && item.serviceId === service.id,
                    )
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            applyServiceSelection(
                              contract.selectedServices.filter(
                                (item) => !(item.kind === 'line' && item.serviceId === service.id),
                              ),
                            )
                            return
                          }

                          applyServiceSelection([
                            ...contract.selectedServices,
                            createContractLineItemFromService(service),
                          ])
                        }}
                        className="flex w-full items-start justify-between rounded-[2px] border px-3 py-3 text-left"
                        style={{
                          borderColor: isAdded ? '#B8922F' : '#E4D9BE',
                          backgroundColor: isAdded ? '#F8EFDC' : '#FEFBF2',
                          color: '#1C1611',
                        }}
                      >
                        <div>
                          <div className="text-[12px] font-semibold">{service.name.fr}</div>
                          <div className="mt-1 text-[10px]" style={{ color: '#6B5A3D' }}>{service.name.zh}</div>
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: isAdded ? '#A8702E' : '#9B8550' }}>{isAdded ? '已选' : '添加'}</div>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-[2px] border px-3 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[1.6px]" style={{ color: '#8B7A3E' }}>打包服务</div>
                      <div className="mt-1 text-[11px]" style={{ color: '#5C5142' }}>把月费服务打成一个套餐，再带进合同。</div>
                    </div>
                    <button
                      type="button"
                      onClick={addDraftPackage}
                      disabled={draftPackServices.length === 0}
                      className="shrink-0 rounded-[2px] border px-3 py-2 text-[10px] font-bold tracking-[1.2px] disabled:opacity-50"
                      style={{ borderColor: '#1C1611', color: '#1C1611' }}
                    >
                      添加套餐
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {recurringCatalog.map((service) => {
                      const active = packDraft.has(service.id)
                      return (
                        <button
                          key={`pack-${service.id}`}
                          type="button"
                          onClick={() => togglePackDraft(service.id)}
                          className="rounded-[2px] border px-3 py-3 text-left"
                          style={{
                            borderColor: active ? '#B8922F' : '#E4D9BE',
                            backgroundColor: active ? '#1C1611' : '#FEFBF2',
                            color: active ? '#F5D48A' : '#1C1611',
                          }}
                        >
                          <div className="text-[11px] font-semibold">{service.name.zh}</div>
                          <div className="mt-1 text-[9px]" style={{ color: active ? '#D9CFB8' : '#6B5A3D' }}>{service.name.fr}</div>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-[11px]" style={{ color: '#5C5142' }}>
                    {draftPackServices.length > 0
                      ? `${packNameWithCount(draftPackServices.length, contract.lang)} · ${formatEuroCompact(draftPackServices.reduce((sum, service) => sum + service.defaultPrice * 12, 0))} / an`
                      : '先勾选要打包的月费服务。'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>状态</div>
            <div className="mt-3 space-y-3">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{ borderColor: '#B8922F', backgroundColor: '#1C1611', color: '#F5D48A' }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusTone }} />
                {CONTRACT_STATUS_LABELS[contract.status]}
              </div>
              <p className="text-[12px] leading-[1.6]" style={{ color: '#5C5142' }}>
                {contract.status === 'draft' && '还在整理内容，适合继续补信息和修改金额。'}
                {contract.status === 'generated' && '已经整理好，可继续导出或发送给客户。'}
                {contract.status === 'sent' && '合同已发出，等待客户确认。'}
                {contract.status === 'confirmed' && '客户已经同意，下一步可以标记完成。'}
                {contract.status === 'completed' && '这份合同已经归档完成。'}
                {contract.status === 'cancelled' && '这份合同已取消。'}
              </p>
            </div>
          </div>

          <div className="rounded-[2px] border border-dashed px-[18px] py-4" style={{ borderColor: '#C8B987', backgroundColor: '#F4ECD6' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>下一步</div>
            <div className="mt-2 text-[12px] leading-[1.65]" style={{ color: '#5C5142' }}>
              完成客户信息后点击「导出 PDF」，状态会自动变成「已生成」。
            </div>
          </div>
        </aside>
        )}

        {readOnly ? (
          <div className="space-y-7">
            <section className="space-y-6 border-b pb-8" style={{ borderColor: 'rgba(184,146,47,0.5)' }}>
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-[14px] text-[11px] font-semibold tracking-[1.1px]">
                  <Link href="/" style={{ color: '#A8702E' }}>← 项目档案</Link>
                  <span style={{ color: '#C8B987' }}>/</span>
                  <span style={{ color: '#6B5A3D' }}>{contract.customer.name || '未填写客户'}</span>
                  <span style={{ color: '#C8B987' }}>/</span>
                  <span style={{ color: '#1C1611' }}>{contract.meta.number}</span>
                  <span style={{ color: '#C8B987' }}>·</span>
                  <span style={{ color: '#A8702E' }}>来源报价单 {contract.meta.devisNumber || '—'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-[2px] border px-4 py-3 text-[10px] font-bold tracking-[1.4px]" style={{ borderColor: '#B8922F', backgroundColor: '#1C1611', color: '#F5D48A' }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusTone }} />
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </div>
                  {contract.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => void handleStatusChange('completed')}
                      className="rounded-[2px] border px-4 py-3 text-[10px] font-bold tracking-[1.4px]"
                      style={{ borderColor: '#1C1611', color: '#1C1611' }}
                    >
                      标记完成 →
                    </button>
                  )}
                  <Link href={`/contract/${contract.id}`} className="rounded-[2px] border px-4 py-3 text-[10px] font-bold tracking-[1.4px]" style={{ borderColor: '#D9CFB8', color: '#A8702E' }}>
                    编辑合同 ↗
                  </Link>
                </div>
              </div>

              <div className="flex items-end justify-between gap-10">
                <div className="space-y-4">
                  <div className="text-[72px] font-bold leading-[0.92] tracking-[-1.8px]" style={{ color: '#2A2620', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                    {contract.customer.name || '未填写客户'}
                  </div>
                  <div className="text-[13px]" style={{ color: '#6B5A3D' }}>
                    {[contract.customer.postalCode, contract.customer.city].filter(Boolean).join(' ')} · {contract.customer.contactName || '—'} · {contract.customer.email || '—'}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-semibold tracking-[2px]" style={{ color: '#9B8550' }}>
                    <span className="h-px w-8" style={{ backgroundColor: '#B8922F' }} />
                    <span>ARCHIVE · AVRIL 2026</span>
                    <span className="h-px w-8" style={{ backgroundColor: '#B8922F' }} />
                  </div>
                </div>

                <div className="flex items-end gap-6">
                  <div className="rounded-[2px] border px-5 py-4 text-right" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                    <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>发送记录</div>
                    <div className="mt-2 text-[12px] font-semibold leading-[1.6]" style={{ color: '#1C1611' }}>
                      {contract.sentAt ? new Date(contract.sentAt).toLocaleDateString('zh-CN') : '尚未发送'}
                    </div>
                    <div className="mt-1 text-[11px]" style={{ color: '#6B5A3D' }}>
                      {contract.sentChannel ? CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel] : '待记录'}
                    </div>
                  </div>
                  <div className="rounded-[2px] border px-5 py-4 text-right" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                    <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>年度总额</div>
                    <div className="mt-2 text-[34px] font-bold italic leading-none" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                      {formatEuroCompact(contract.finalTotal)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-t pt-6" style={{ borderColor: 'rgba(184,146,47,0.5)' }}>
              <div className="text-[10px] font-bold tracking-[2px]" style={{ color: '#A8702E' }}>流程进度</div>
              <div className="mt-6 grid grid-cols-5 gap-4">
                {STATUS_FLOW.map((step, index) => {
                  const currentIndex = STATUS_FLOW.findIndex((item) => item.key === contract.status)
                  const active = index <= currentIndex
                  return (
                    <div key={step.key} className="relative">
                      {index < STATUS_FLOW.length - 1 && (
                        <div className="absolute left-[18px] top-[12px] h-px w-[calc(100%-8px)]" style={{ backgroundColor: active ? '#B8922F' : '#D9CFB8' }} />
                      )}
                      <div className="relative z-10 flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded-full border-2" style={{ borderColor: active ? '#1C1611' : '#D9CFB8', backgroundColor: active ? '#1C1611' : '#FEFBF2' }} />
                        <div>
                          <div className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{step.title}</div>
                          <div className="mt-1 text-[10px]" style={{ color: '#6B5A3D' }}>
                            {index === 0 ? contract.createdAt.slice(0, 10) : index === 1 ? (contract.pdfPath ? contract.updatedAt.slice(0, 10) : '—') : step.key === 'sent' ? (contract.sentAt?.slice(0, 10) || '—') : step.key === 'confirmed' ? (contract.confirmedAt?.slice(0, 10) || '—') : (contract.status === 'completed' ? contract.updatedAt.slice(0, 10) : '—')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_400px] gap-7">
              <div className="space-y-5">
                <div className="rounded-[2px] border px-7 py-6" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                  <div className="flex items-start justify-between">
                    <div className="text-[28px] font-bold italic" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>确认留痕</div>
                    <div className="rounded-full px-3 py-1 text-[10px] font-semibold" style={{ backgroundColor: '#F4ECD6', color: '#9B8550' }}>
                      {contract.confirmedAt ? '已确认' : '待客户确认'}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>确认方式</div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {[
                          ['email', '邮件'],
                          ['social', '微信 / WhatsApp'],
                        ].map(([value, label]) => {
                          const active = value === 'social'
                            ? contract.sentChannel === 'wechat' || contract.sentChannel === 'whatsapp'
                            : contract.sentChannel === value
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => {
                                if (value === 'social') {
                                  updateContract((current) => ({
                                    ...current,
                                    sentChannel: current.sentChannel === 'wechat' || current.sentChannel === 'whatsapp' ? undefined : 'whatsapp',
                                    confirmationMethod: current.sentChannel === 'wechat' || current.sentChannel === 'whatsapp' ? undefined : '微信 / WhatsApp',
                                  }))
                                  return
                                }

                                updateContract((current) => ({
                                  ...current,
                                  sentChannel: current.sentChannel === value ? undefined : value as ContractSentChannel,
                                  confirmationMethod: current.sentChannel === value ? undefined : label,
                                }))
                              }}
                              className="rounded-[2px] border px-6 py-3 text-[11px] font-semibold"
                              style={{
                                borderColor: active ? '#B8922F' : '#D9CFB8',
                                backgroundColor: active ? '#1C1611' : '#FEFBF2',
                                color: active ? '#F5D48A' : '#3A3228',
                              }}
                            >
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>确认方式与时间</div>
                      <div className="mt-2 text-[12px] font-semibold" style={{ color: '#1C1611' }}>
                        {contract.confirmationMethod || contract.sentChannel
                          ? `${contract.confirmationMethod || CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel as ContractSentChannel]}`
                          : '— 尚未记录确认方式'}
                      </div>
                      <div className="mt-2 text-[12px] font-semibold" style={{ color: '#1C1611' }}>
                        {contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleString('zh-CN') : '— 尚未确认'}
                      </div>
                      <div className="mt-2 text-[11px] leading-[1.6]" style={{ color: '#6B5A3D' }}>
                        {contract.confirmedAt
                          ? '这里记录的是手动标记为“已确认”时的时间。'
                          : contract.sentAt
                            ? `最近一次联系：${new Date(contract.sentAt).toLocaleString('zh-CN')}`
                            : '最近一次联系尚未记录。'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>确认备注 / 截图说明</div>
                    <textarea
                      value={[contract.confirmationNote, contract.internalNote].filter(Boolean).join('\n\n')}
                      onChange={(event) => {
                        updateContract((current) => ({
                          ...current,
                          confirmationNote: event.target.value,
                          internalNote: event.target.value,
                        }))
                      }}
                      rows={5}
                      className="mt-3 w-full resize-none rounded-[2px] border px-4 py-4 text-[12px] leading-[1.7] outline-none"
                      style={{ borderColor: '#D9CFB8', backgroundColor: '#FBF5E4', color: '#5C5142' }}
                      placeholder="待合同发送后填写。"
                    />
                  </div>
                  <div className="mt-5 rounded-[2px] border border-dashed px-4 py-4" style={{ borderColor: '#D9CFB8', backgroundColor: '#FBF5E4' }}>
                    <input
                      ref={evidenceInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleEvidenceUpload}
                    />
                    <input
                      ref={attachmentInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAttachmentUpload}
                    />
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold" style={{ color: '#1C1611' }}>证据与备注</div>
                        <div className="mt-1 text-[11px] leading-[1.6]" style={{ color: '#6B5A3D' }}>
                          上传客户确认截图后，流程会自动进入“已完成”。普通附件只做留档。
                        </div>
                        {contract.sentAt && (
                          <div className="mt-4 rounded-[2px] border px-3 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FEFBF2' }}>
                            <div className="text-[10px] font-bold uppercase tracking-[1.3px]" style={{ color: '#8B7A3E' }}>
                              系统发送记录
                            </div>
                            <div className="mt-2 text-[11px] leading-[1.7]" style={{ color: '#3A3228' }}>
                              <div>发送时间：{new Date(contract.sentAt).toLocaleString('zh-CN')}</div>
                              <div>发送方式：{contract.sentChannel ? CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel] : '邮件'}</div>
                              <div>收件邮箱：{contract.customer.email || '未记录'}</div>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => evidenceInputRef.current?.click()}
                            className="rounded-[2px] border px-4 py-2 text-[10px] font-bold tracking-[1.2px]"
                            style={{ borderColor: '#1C1611', color: '#1C1611' }}
                          >
                            {uploadingEvidence ? '上传凭证中…' : '上传确认凭证'}
                          </button>
                          <button
                            type="button"
                            onClick={() => attachmentInputRef.current?.click()}
                            className="rounded-[2px] border px-4 py-2 text-[10px] font-bold tracking-[1.2px]"
                            style={{ borderColor: '#B8922F', color: '#A8702E' }}
                          >
                            {uploadingAttachment ? '上传附件中…' : '上传补充附件'}
                          </button>
                        </div>
                        {(contract.evidenceFiles.length > 0 || contract.attachments.length > 0) && (
                          <div className="mt-4 space-y-2 text-[11px]" style={{ color: '#5C5142' }}>
                            {contract.evidenceFiles.map((file, index) => (
                              <div key={`${file.path || file.url || file.name}-e-${index}`}>
                                凭证 · <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#A8702E' }}>{file.name}</a>
                              </div>
                            ))}
                            {contract.attachments.map((file, index) => (
                              <div key={`${file.path || file.url || file.name}-a-${index}`}>
                                附件 · <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#A8702E' }}>{file.name}</a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2px] border px-7 py-6" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[28px] font-bold italic" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>活动记录</div>
                    <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>{contract.activityLog.length} 条</div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {[...contract.activityLog].reverse().map((item) => (
                      <div key={`${item.at}-${item.event}`} className="flex gap-4">
                        <div className="w-16 shrink-0 text-right">
                          <div className="text-[20px] font-bold italic leading-none" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                            {new Date(item.at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }).replace('/', ' — ')}
                          </div>
                        </div>
                        <div className="flex-1 border-t pt-1" style={{ borderColor: '#E4D9BE' }}>
                          <div className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{item.event}</div>
                          {item.meta && <div className="mt-1 text-[11px]" style={{ color: '#6B5A3D' }}>{item.meta}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2px] border px-5 py-5" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>合同预览</div>
                    <div className="text-[10px]" style={{ color: '#9B8550' }}>{CONTRACT_LANGUAGE_LABELS[contract.lang]} · 第 1 / 2 页</div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-[2px] border" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                    <div style={{ transform: 'scale(0.43)', transformOrigin: 'top left', width: 800, height: 486 }}>
                      <ContractPreview contract={contract} />
                    </div>
                  </div>
                  <button type="button" onClick={handleExport} className="mt-4 w-full rounded-[2px] px-5 py-3 text-[10px] font-bold tracking-[1.4px]" style={{ backgroundColor: '#1C1611', color: '#F5D48A' }}>
                    导出 PDF →
                  </button>
                </div>

                <div className="rounded-[2px] border px-5 py-5" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                  <div className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#A8702E' }}>关联单据</div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-[2px] border px-4 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                      <div className="text-[11px] font-semibold" style={{ color: '#1C1611' }}>报价单 · {contract.meta.devisNumber || '无'}</div>
                      <div className="mt-1 text-[10px]" style={{ color: '#6B5A3D' }}>创建日期 / 金额 / 服务数</div>
                    </div>
                    <div className="rounded-[2px] border px-4 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                      <div className="text-[11px] font-semibold" style={{ color: '#1C1611' }}>合同 · {contract.meta.number}</div>
                      <div className="mt-1 text-[10px]" style={{ color: '#6B5A3D' }}>当前合同 · {CONTRACT_STATUS_LABELS[contract.status]}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <>
            <main className="overflow-hidden rounded-[2px] border" style={{ borderColor: '#D9CFB8', backgroundColor: '#EFE3C6' }}>
              <div className="flex items-center justify-between px-5 pt-6 pb-3">
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>
                    正式合同预览
                  </div>
                  <div className="mt-1 text-[9px] font-semibold tracking-[1.4px]" style={{ color: '#9B8550' }}>
                    APERÇU A4 · 2 PAGES · 模板固定
                  </div>
                </div>
                <div className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: '#FEFBF2', color: '#1C1611' }}>
                  {CONTRACT_LANGUAGE_LABELS[contract.lang]}
                </div>
              </div>

              <ScaledContract contract={contract} previewRef={previewRef} />
            </main>

            <aside className="space-y-[18px] overflow-y-auto">
              <div className="rounded-[2px] border px-5 py-5" style={{ borderColor: '#D9CFB8', backgroundColor: '#FEFBF2' }}>
                <div className="text-[10px] font-bold uppercase tracking-[1.7px]" style={{ color: '#8B7A3E' }}>合同导出语言 · 法语版作为法律依据</div>
                <div className="mt-3 grid grid-cols-5 gap-[6px] rounded-[2px] border p-[6px]" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                  {(Object.keys(CONTRACT_LANGUAGE_LABELS) as Lang[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateContract((current) => ({ ...current, lang }))}
                      className="rounded-[2px] border px-2 py-[10px] text-[10px] font-bold tracking-[1.2px] disabled:cursor-default"
                      style={{
                        borderColor: contract.lang === lang ? '#B8922F' : '#E4D9BE',
                        backgroundColor: contract.lang === lang ? '#1C1611' : '#FBF5E4',
                        color: contract.lang === lang ? '#F5D48A' : '#1C1611',
                      }}
                    >
                      {CONTRACT_LANGUAGE_LABELS[lang]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>客户信息</InputLabel>
                <div className="mt-3 space-y-3">
                  <div>
                    <InputLabel>公司 / 餐厅名</InputLabel>
                    <input
                      value={contract.customer.name}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, name: event.target.value } }))}
                      className={fieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                  <div>
                    <InputLabel>地址</InputLabel>
                    <input
                      value={contract.customer.address}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, address: event.target.value } }))}
                      className={fieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <InputLabel>邮编</InputLabel>
                      <input
                        value={contract.customer.postalCode}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, postalCode: event.target.value } }))}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      />
                    </div>
                    <div>
                      <InputLabel>城市</InputLabel>
                      <input
                        value={contract.customer.city}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, city: event.target.value } }))}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      />
                    </div>
                  </div>
                  <div>
                    <InputLabel>国家</InputLabel>
                    <select
                      value={contract.customer.country}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, country: event.target.value as Country } }))}
                      className={smallFieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611', appearance: 'none', cursor: readOnly ? 'default' : 'pointer' }}
                    >
                      <option value="FR">France</option>
                      <option value="IT">Italie</option>
                      <option value="ES">Espagne</option>
                      <option value="DE">Allemagne</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="LU">Luxembourg</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  <div>
                    <InputLabel>联系人</InputLabel>
                    <input
                      value={contract.customer.contactName}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, contactName: event.target.value } }))}
                      className={fieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={contract.customer.email}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, email: event.target.value } }))}
                      placeholder="邮箱"
                      className={smallFieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                    <input
                      value={contract.customer.phone}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, customer: { ...current.customer, phone: event.target.value } }))}
                      placeholder="电话"
                      className={smallFieldClassName(readOnly)}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                  <div className="text-[10px]" style={{ color: '#9B8550' }}>
                    这里填写的邮箱，就是发送合同邮件时会用到的收件人邮箱。
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>合同信息</InputLabel>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <InputLabel>签订日期</InputLabel>
                      <input
                        type="date"
                        value={contract.meta.date}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, meta: { ...current.meta, date: event.target.value } }))}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      />
                    </div>
                    <div>
                      <InputLabel>启动日期</InputLabel>
                      <input
                        type="date"
                        value={contract.meta.serviceStartDate || ''}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, meta: { ...current.meta, serviceStartDate: event.target.value } }))}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <InputLabel>签署地点</InputLabel>
                      <input
                        value={contract.meta.signingPlace}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, meta: { ...current.meta, signingPlace: event.target.value } }))}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      />
                    </div>
                    <div>
                      <InputLabel>付款方式</InputLabel>
                      <select
                        value={contract.paymentMode}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => {
                          const paymentMode = event.target.value as Contract['paymentMode']
                          const nextSubtotal = getContractReferenceTotal(current.selectedServices, paymentMode)
                          return {
                            ...current,
                            paymentMode,
                            totalUnit: paymentMode,
                            subtotalDisplay: nextSubtotal,
                            finalTotal: nextSubtotal,
                          }
                        })}
                        className={smallFieldClassName(readOnly)}
                        style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                      >
                        <option value="annual">按年</option>
                        <option value="monthly">按月</option>
                      </select>
                    </div>
                  </div>
                  <div
                    className="rounded-[2px] border px-4 py-4"
                    style={{ borderColor: '#B8922F', backgroundColor: '#1C1611' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#F5D48A' }}>
                        {contract.paymentMode === 'monthly' ? '总金额（月）' : '总金额（年）'}
                      </div>
                      <div className="text-[9px] tracking-[1.1px]" style={{ color: '#D9CFB8' }}>
                        自动带入
                      </div>
                    </div>
                    <div className="mt-3 flex items-end gap-2">
                      <input
                        type="number"
                        value={String(chargeSummary?.primaryAmount ?? 0)}
                        disabled
                        onChange={() => {}}
                        className="w-full border-0 bg-transparent p-0 text-[38px] font-bold italic leading-none outline-none"
                        style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                      />
                      <span className="pb-1 text-[10px] tracking-[1.4px]" style={{ color: '#F8F1E0' }}>
                        {chargeSummary?.primaryUnit === 'monthly' ? '€/mois' : '€/an'}
                      </span>
                    </div>
                    {chargeSummary && chargeSummary.annualCharges > 0 && (
                      <div className="mt-2 text-[10px]" style={{ color: '#D9CFB8' }}>
                        年度费用：{formatEuroCompact(chargeSummary.annualCharges)}
                      </div>
                    )}
                    {chargeSummary && chargeSummary.oneOffCharges > 0 && (
                      <div className="mt-1 text-[10px]" style={{ color: '#D9CFB8' }}>
                        一次性费用：{formatEuroCompact(chargeSummary.oneOffCharges)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>特别备注（可选）</InputLabel>
                <textarea
                  value={contract.specialConditions}
                  disabled={readOnly}
                  onChange={(event) => updateContract((current) => ({ ...current, specialConditions: event.target.value }))}
                  rows={6}
                  className={`${fieldClassName(readOnly)} resize-none`}
                  style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                  placeholder="例如：赠送内容、特殊付款方式、上线时间备注。"
                />
              </div>
            </aside>
          </>
        )}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: 800,
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div ref={exportRef}>
          <ContractPreview contract={contract} />
        </div>
      </div>
    </div>
  )
}
