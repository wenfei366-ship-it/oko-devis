'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ContractPreview from './ContractPreview'
import { CATALOG } from '@/app/lib/catalog'
import { formatEuroCompact } from '@/app/lib/calculations'
import {
  CONTRACT_LANGUAGE_LABELS,
  CONTRACT_SENT_CHANNEL_LABELS,
  CONTRACT_STATUS_LABELS,
  getContractReferenceTotal,
  getSelectedServiceSummaries,
} from '@/app/lib/contractContent'
import {
  cloneContractForEdit,
  createContractLineItemFromService,
  createContractFromDevis,
  createEmptyContract,
  loadContract,
  saveContract,
  updateContractStatus,
} from '@/app/lib/contractStorage'
import { buildContractPdfPath } from '@/app/lib/fileStorage'
import { loadFromHistory } from '@/app/lib/storage'
import { useMounted } from '@/app/lib/useMounted'
import type { Contract, ContractSentChannel, ContractStatus, Lang } from '@/app/lib/types'

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
  const previewRef = useRef<HTMLDivElement>(null)

  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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
          setError('没找到对应的报价单，先回历史记录重新点一次。')
          setContract(createEmptyContract())
        } else {
          setContract(createContractFromDevis(devis))
        }
        return
      }

      setContract(createEmptyContract())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '合同加载失败。')
    } finally {
      setLoading(false)
    }
  }, [contractId, fromDevisId, mounted])

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
      const shouldSyncFinal = current.finalTotal === 0 || current.finalTotal === current.subtotalDisplay
      return {
        ...current,
        selectedServices: nextServices,
        subtotalDisplay: nextSubtotal,
        finalTotal: shouldSyncFinal ? nextSubtotal : current.finalTotal,
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
        updatedAt: new Date().toISOString(),
      }
      await saveContract(nextContract)
      setContract(nextContract)
      setSaveMessage('已保存到共享历史。')
      if (!contractId) {
        router.replace(`/contract/${nextContract.id}`)
      }
    } catch (saveError) {
      setSaveMessage(saveError instanceof Error ? saveError.message : '保存失败。')
    } finally {
      setSaving(false)
    }
  }, [contract, contractId, router])

  const handleStatusChange = useCallback(async (status: ContractStatus, sentChannel?: ContractSentChannel) => {
    if (!contract) return
    const nextContract = updateContractStatus(contract, status, sentChannel)
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
  }, [contract])

  const handleDuplicate = useCallback(async () => {
    if (!contractId) return
    try {
      const cloned = await cloneContractForEdit(contractId)
      await saveContract(cloned)
      router.push(`/contract/${cloned.id}`)
    } catch (duplicateError) {
      setSaveMessage(duplicateError instanceof Error ? duplicateError.message : '复制失败。')
    }
  }, [contractId, router])

  const handleExport = useCallback(() => {
    if (!contract || exporting) return

    void (async () => {
      if (!contract.customer.name.trim()) {
        setSaveMessage('先把客户名称填好，再导出合同。')
        return
      }

      if (contract.selectedServices.length === 0) {
        setSaveMessage('先从报价单或产品目录里选好服务，再导出合同。')
        return
      }

      if (contract.finalTotal <= 0) {
        setSaveMessage('先填好最终成交价，再导出合同。')
        return
      }

      setExporting(true)
      setSaveMessage(null)

      try {
        const [{ pdf }, { ContractPDF }, { registerPdfFonts }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/app/lib/pdf/ContractPDF'),
          import('@/app/lib/pdf/fonts'),
        ])

        registerPdfFonts()
        const blob = await pdf(<ContractPDF contract={contract} />).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Contract-${contract.meta.number}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        const nextContract = contract.status === 'draft'
          ? updateContractStatus(contract, 'generated')
          : {
              ...contract,
              updatedAt: new Date().toISOString(),
            }

        nextContract.pdfPath = buildContractPdfPath(nextContract.id, nextContract.meta.number)
        nextContract.pdfUrl = undefined

        try {
          const formData = new FormData()
          formData.set('file', new File([blob], `Contract-${contract.meta.number}.pdf`, { type: 'application/pdf' }))
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
  }, [contract, exporting])

  const statusTone = useMemo(() => {
    if (!contract) return '#9B8550'
    if (contract.status === 'confirmed') return '#6B8E4E'
    if (contract.status === 'completed') return '#4A6B3A'
    if (contract.status === 'cancelled') return '#9B2A2A'
    if (contract.status === 'sent') return '#C9A35B'
    return '#9B8550'
  }, [contract])

  const selectedServiceSummaries = useMemo(
    () => (contract ? getSelectedServiceSummaries(contract) : []),
    [contract],
  )

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
          <Link href="/history" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A8702E' }}>
            返回历史记录
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6EFDC' }}>
      <header className="flex items-center justify-between border-b px-8 py-4" style={{ borderColor: 'rgba(212, 197, 142, 0.6)', backgroundColor: '#F8EFDC' }}>
        <div>
          <div className="text-[16px] font-bold tracking-[0.4px]" style={{ color: '#1C1611' }}>
            OKO Contract 工作台
          </div>
          <div className="text-[11px] font-medium" style={{ color: '#8B7A3E' }}>
            合同编辑 · 共享历史 · 固定模板
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="rounded-[10px] px-4 py-2 text-[12px] font-semibold"
            style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
          >
            ← 历史记录
          </Link>
          {!readOnly && (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="rounded-[10px] px-4 py-2 text-[12px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#F6EFDC', color: '#1C1611' }}
            >
              {saving ? '保存中…' : '保存草稿'}
            </button>
          )}
          {contract?.id && (
            <Link
              href={`/contract/${contract.id}/detail`}
              className="rounded-[10px] border px-4 py-2 text-[12px] font-semibold"
              style={{ borderColor: '#1C1611', color: '#1C1611' }}
            >
              查看跟进页
            </Link>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="rounded-[10px] px-5 py-2 text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1C1611', color: '#F8EFDC', opacity: exporting ? 0.72 : 1 }}
          >
            {exporting ? '导出中…' : '导出 PDF →'}
          </button>
        </div>
      </header>

      <div className="flex items-center justify-between border-b px-8 py-3 text-[12px]" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
        <div className="flex items-center gap-3">
          <span style={{ color: '#8B7A3E' }}>合同编号</span>
          <span className="font-semibold" style={{ color: '#1C1611' }}>{contract.meta.number}</span>
          {contract.meta.devisNumber && (
            <>
              <span style={{ color: '#C8B987' }}>·</span>
              <span style={{ color: '#8B7A3E' }}>关联报价单</span>
              <span className="font-semibold" style={{ color: '#1C1611' }}>{contract.meta.devisNumber}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {saveMessage && <span style={{ color: saveMessage.includes('失败') ? '#9B2A2A' : '#6B8E4E' }}>{saveMessage}</span>}
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold"
            style={{ borderColor: '#B8922F', backgroundColor: '#1C1611', color: '#F5D48A' }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusTone }} />
            {CONTRACT_STATUS_LABELS[contract.status]}
          </span>
        </div>
      </div>

      <div
        className="grid min-h-[calc(100vh-134px)]"
        style={{
          padding: '24px 20px',
          gap: 12,
          gridTemplateColumns: 'clamp(270px, 20vw, 310px) minmax(0, 1fr) clamp(340px, 25vw, 388px)',
        }}
      >
        <aside className="space-y-3 overflow-y-auto">
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>来源</div>
            <div className="mt-3 rounded-[10px] border px-4 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
              <div className="text-[11px] font-semibold" style={{ color: '#8B7A3E' }}>
                {contract.meta.devisNumber ? '从报价单生成' : '独立创建'}
              </div>
              <div className="mt-2 text-[22px] font-bold leading-tight" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}>
                {contract.customer.name || '未填写客户'}
              </div>
              <div className="mt-2 text-[12px]" style={{ color: '#5C5142' }}>
                {contract.meta.devisNumber || '无关联报价单'}
              </div>
              {contract.devisId && (
                <Link href="/history" className="mt-3 inline-block text-[12px] font-semibold" style={{ color: '#A8702E' }}>
                  返回历史记录查看原始报价单 →
                </Link>
              )}
            </div>
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
              {!readOnly && (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => void handleStatusChange('generated')} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    标记已生成
                  </button>
                  <button type="button" onClick={() => void handleStatusChange('sent', 'email')} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    标记已发送
                  </button>
                  <button type="button" onClick={() => void handleStatusChange('confirmed')} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    标记已确认
                  </button>
                  <button type="button" onClick={() => void handleStatusChange('completed')} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    标记完成
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>目录</div>
            <div className="mt-3 space-y-2 text-[12px]" style={{ color: '#3A3228' }}>
              <div>Parties contractantes</div>
              <div>1 · Objet du contrat</div>
              <div>2 · Durée</div>
              <div>3 · Exécution</div>
              <div>4 · Résiliation</div>
              <div>5 · Restitution des données</div>
              <div>6 · Référencement</div>
              <div>7 · Facturation et prix</div>
              <div>8 · Conditions spécifiques</div>
            </div>
          </div>

          {readOnly && (
            <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
              <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#8B7A3E' }}>跟进记录</div>
              <div className="mt-3 space-y-2 text-[12px]" style={{ color: '#3A3228' }}>
                <div>发送渠道：{contract.sentChannel ? CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel] : '未记录'}</div>
                <div>发送时间：{contract.sentAt ? new Date(contract.sentAt).toLocaleString('zh-CN') : '未记录'}</div>
                <div>确认方式：{contract.confirmationMethod || '未记录'}</div>
                <div>确认时间：{contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleString('zh-CN') : '未记录'}</div>
                <div>附件数：{contract.attachments.length}</div>
              </div>
            </div>
          )}
        </aside>

        <main className="overflow-hidden rounded-[14px]" style={{ backgroundColor: '#EFE3C6', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
          <div className="flex items-center justify-between px-5 pt-6 pb-3">
            <div>
              <div className="text-[14px] font-bold" style={{ color: '#1C1611' }}>
                正式合同预览
              </div>
              <div className="mt-1 text-[9px] font-semibold tracking-[1.4px]" style={{ color: '#9B8550' }}>
                APERÇU A4 · 2 PAGES · 模板固定
              </div>
            </div>
            <div
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: '#FEFBF2', color: '#1C1611' }}
            >
              {CONTRACT_LANGUAGE_LABELS[contract.lang]}
            </div>
          </div>

          <ScaledContract contract={contract} previewRef={previewRef} />
        </main>

        <aside className="space-y-3 overflow-y-auto">
          {readOnly ? (
            <>
              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>合同概览</InputLabel>
                <div className="mt-3 space-y-2 text-[12px]" style={{ color: '#3A3228' }}>
                  <div>导出语言：{CONTRACT_LANGUAGE_LABELS[contract.lang]}</div>
                  <div>付款方式：{contract.paymentMode === 'annual' ? '按年' : '按月'}</div>
                  <div>最终总价：{formatEuroCompact(contract.finalTotal)}</div>
                  <div>服务数量：{contract.selectedServices.length}</div>
                  <div>签署日期：{contract.meta.date || '未填'}</div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>状态时间线</InputLabel>
                <div className="mt-4 space-y-4">
                  {STATUS_FLOW.map((step) => {
                    const active = STATUS_FLOW.findIndex((item) => item.key === contract.status) >= STATUS_FLOW.findIndex((item) => item.key === step.key)
                    const isCurrent = contract.status === step.key
                    return (
                      <div key={step.key} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: active ? '#B8922F' : '#D9CFB8' }} />
                          {step.key !== 'completed' && <span className="mt-1 h-8 w-px" style={{ backgroundColor: active ? '#B8922F' : '#E4D9BE' }} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-[12px] font-semibold" style={{ color: isCurrent ? '#1C1611' : '#5C5142' }}>
                            {step.title}
                          </div>
                          <div className="mt-1 text-[11px] leading-[1.6]" style={{ color: '#6B5A3D' }}>
                            {step.description}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>发送与确认</InputLabel>
                <div className="mt-3 space-y-2 text-[12px]" style={{ color: '#3A3228' }}>
                  <div>PDF 路径：{contract.pdfPath || '未上传'}</div>
                  <div>
                    PDF 地址：
                    {contract.pdfUrl ? (
                      <a href={contract.pdfUrl} target="_blank" rel="noreferrer" className="ml-1 font-semibold" style={{ color: '#A8702E' }}>
                        打开云端文件
                      </a>
                    ) : ' 未上传'}
                  </div>
                  <div>发送渠道：{contract.sentChannel ? CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel] : '未记录'}</div>
                  <div>发送时间：{contract.sentAt ? new Date(contract.sentAt).toLocaleString('zh-CN') : '未记录'}</div>
                  <div>确认方式：{contract.confirmationMethod || '未记录'}</div>
                  <div>确认时间：{contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleString('zh-CN') : '未记录'}</div>
                  <div>确认备注：{contract.confirmationNote || '未记录'}</div>
                  <div>内部备注：{contract.internalNote || '未记录'}</div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>活动记录</InputLabel>
                <div className="mt-3 space-y-3">
                  {contract.activityLog.length === 0 ? (
                    <div className="text-[12px]" style={{ color: '#6B5A3D' }}>还没有活动记录。</div>
                  ) : (
                    [...contract.activityLog].reverse().map((item) => (
                      <div key={`${item.at}-${item.event}`} className="rounded-[10px] border px-3 py-3" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4' }}>
                        <div className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{item.event}</div>
                        {item.meta && <div className="mt-1 text-[11px]" style={{ color: '#5C5142' }}>{item.meta}</div>}
                        <div className="mt-2 text-[10px] uppercase tracking-[1.4px]" style={{ color: '#8B7A3E' }}>
                          {item.actor} · {new Date(item.at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>下一步</InputLabel>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/contract/${contract.id}`} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    进入编辑页
                  </Link>
                  <button type="button" onClick={handleExport} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                    再导出一次
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>合同导出语言</InputLabel>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {(Object.keys(CONTRACT_LANGUAGE_LABELS) as Lang[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      disabled={readOnly}
                      onClick={() => updateContract((current) => ({ ...current, lang }))}
                      className="rounded-[8px] border px-2 py-2 text-[11px] font-bold disabled:cursor-default"
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
                <p className="mt-3 text-[11px] leading-[1.6]" style={{ color: '#5C5142' }}>
                  合同支持多语言，但法语版始终是法律依据版本。
                </p>
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
                          const shouldSyncFinal = current.finalTotal === 0 || current.finalTotal === current.subtotalDisplay
                          return {
                            ...current,
                            paymentMode,
                            totalUnit: paymentMode,
                            subtotalDisplay: nextSubtotal,
                            finalTotal: shouldSyncFinal ? nextSubtotal : current.finalTotal,
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
                    className="rounded-[10px] border px-4 py-4"
                    style={{ borderColor: '#B8922F', backgroundColor: '#1C1611' }}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#F5D48A' }}>
                      最终成交价
                    </div>
                    <div className="mt-2 flex items-end gap-2">
                      <input
                        type="number"
                        value={String(contract.finalTotal)}
                        disabled={readOnly}
                        onChange={(event) => updateContract((current) => ({ ...current, finalTotal: Number(event.target.value || 0) }))}
                        className="w-full border-0 bg-transparent p-0 text-[28px] font-bold italic outline-none"
                        style={{ color: '#F5D48A', fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
                      />
                      <span className="pb-1 text-[11px] tracking-[1.4px]" style={{ color: '#F8F1E0' }}>
                        {contract.totalUnit === 'monthly' ? '€/mois' : '€/an'}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px]" style={{ color: '#D9CFB8' }}>
                      自动带入参考价：{formatEuroCompact(contract.subtotalDisplay)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>{contract.devisId ? '服务内容（来自报价单）' : '服务目录（同 devis）'}</InputLabel>
                {contract.devisId ? (
                  <>
                    <p className="mt-3 text-[12px] leading-[1.7]" style={{ color: '#5C5142' }}>
                      这份合同直接引用原报价单里的服务内容，不再单独维护一份合同价格表。
                    </p>
                    <div className="mt-3 space-y-2">
                      {selectedServiceSummaries.map((line) => (
                        <div key={line} className="rounded-[10px] border px-3 py-3 text-[12px] font-semibold" style={{ borderColor: '#E4D9BE', backgroundColor: '#FBF5E4', color: '#1C1611' }}>
                          {line}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-[12px] leading-[1.7]" style={{ color: '#5C5142' }}>
                      新建合同也用和 devis 一样的产品目录。点一下添加，再点一次移除。
                    </p>
                    <div className="mt-3 space-y-2">
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
                            className="flex w-full items-start justify-between rounded-[10px] border px-3 py-3 text-left transition-opacity hover:opacity-90"
                            style={{
                              borderColor: isAdded ? '#B8922F' : '#E4D9BE',
                              backgroundColor: isAdded ? '#F8EFDC' : '#FBF5E4',
                              color: '#1C1611',
                            }}
                          >
                            <div>
                              <div className="text-[12px] font-semibold">{service.name.zh}</div>
                              <div className="mt-1 text-[10px]" style={{ color: '#6B5A3D' }}>
                                {service.name.fr}
                              </div>
                            </div>
                            <div className="text-[11px] font-bold" style={{ color: isAdded ? '#A8702E' : '#9B8550' }}>
                              {isAdded ? '已选' : '添加'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>特别备注</InputLabel>
                <textarea
                  value={contract.specialConditions}
                  disabled={readOnly}
                  onChange={(event) => updateContract((current) => ({ ...current, specialConditions: event.target.value }))}
                  rows={5}
                  className={`${fieldClassName(readOnly)} resize-none`}
                  style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                />
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>跟进与确认</InputLabel>
                <div className="mt-3 space-y-3">
                  <div>
                    <InputLabel>发送方式</InputLabel>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        ['email', '邮件'],
                        ['wechat', '微信'],
                        ['whatsapp', 'WhatsApp'],
                        ['in_person', '当面'],
                      ].map(([value, label]) => {
                        const active = contract.sentChannel === value
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => updateContract((current) => ({
                              ...current,
                              sentChannel: (current.sentChannel === value ? undefined : value) as ContractSentChannel | undefined,
                            }))}
                            className="rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                            style={{
                              borderColor: active ? '#B8922F' : '#E4D9BE',
                              backgroundColor: active ? '#1C1611' : '#FBF5E4',
                              color: active ? '#F5D48A' : '#1C1611',
                            }}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <InputLabel>确认备注</InputLabel>
                    <textarea
                      value={contract.confirmationNote || ''}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({
                        ...current,
                        confirmationMethod: current.sentChannel ? CONTRACT_SENT_CHANNEL_LABELS[current.sentChannel] : current.confirmationMethod,
                        confirmationNote: event.target.value,
                      }))}
                      rows={4}
                      className={`${fieldClassName(readOnly)} resize-none`}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                  <div>
                    <InputLabel>截图说明</InputLabel>
                    <textarea
                      value={contract.internalNote || ''}
                      disabled={readOnly}
                      onChange={(event) => updateContract((current) => ({ ...current, internalNote: event.target.value }))}
                      rows={4}
                      className={`${fieldClassName(readOnly)} resize-none`}
                      style={{ borderColor: '#E4D9BE', color: '#1C1611' }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', boxShadow: '4px 0 16px rgba(28,22,17,0.08)' }}>
                <InputLabel>下一步</InputLabel>
                <p className="mt-3 text-[12px] leading-[1.7]" style={{ color: '#5C5142' }}>
                  先把客户信息、金额和备注补完，再点“导出 PDF”。如果客户已经回复，也在这里把确认方式记下来。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {!readOnly && (
                    <button type="button" onClick={() => void handleSave()} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                      再保存一次
                    </button>
                  )}
                  {contractId && !readOnly && (
                    <button type="button" onClick={() => void handleDuplicate()} className="rounded-[8px] border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: '#E4D9BE', color: '#1C1611' }}>
                      复制成新合同
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
