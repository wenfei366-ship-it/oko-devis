'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import ContractPreview from '@/app/components/contract/ContractPreview'
import IdentityBar, { NavButton } from '@/app/components/IdentityBar'
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_SENT_CHANNEL_LABELS,
} from '@/app/lib/contractContent'
import {
  loadContract,
  saveContract,
  updateContractStatus,
} from '@/app/lib/contractStorage'
import { buildDocumentFileStem, buildContractPdfPath } from '@/app/lib/fileStorage'
import { useMounted } from '@/app/lib/useMounted'
import type { Contract, ContractEvidenceFile, ContractStatus } from '@/app/lib/types'
import { useAuth } from '@/app/components/AuthContext'

/* ── Status flow ── */
const STATUS_STEPS: ContractStatus[] = ['draft', 'generated', 'sent', 'confirmed', 'completed']
const STEP_LABELS: Record<string, string> = { draft: '草稿', generated: '已生成', sent: '已发送', confirmed: '已确认', completed: '已完成' }

const STATUS_DOT_COLORS: Record<ContractStatus, string> = {
  draft: '#9B8550',
  generated: '#9B8550',
  sent: '#C9A35B',
  confirmed: '#6B8E4E',
  completed: '#4A6B3A',
  cancelled: '#9B2A2A',
}

const EMAIL_COPY: Record<string, { subject: (n: string, c: string) => string; greeting: string; body: (n: string) => string; confirm: string; closing: string }> = {
  fr: {
    subject: (n, c) => `Contrat OKO ${n} · ${c}`,
    greeting: 'Bonjour,',
    body: (n) => `Veuillez trouver ci-joint le contrat ${n} préparé pour votre établissement.`,
    confirm: 'Si ce document vous convient, il vous suffit de répondre à cet email pour nous confirmer votre accord.',
    closing: 'Cordialement,',
  },
  zh: {
    subject: (n, c) => `OKO 合同 ${n} · ${c}`,
    greeting: '您好，',
    body: (n) => `附件是为您准备的合同 ${n}。`,
    confirm: '如果您同意合同内容，请回复此邮件确认。',
    closing: '此致敬礼，',
  },
}

function getEmailLang(country: string, lang: string): 'fr' | 'it' | 'es' | 'de' | 'zh' {
  const map: Record<string, 'fr' | 'it' | 'es' | 'de' | 'zh'> = { IT: 'it', ES: 'es', DE: 'de' }
  if (map[country]) return map[country]
  if (lang === 'zh') return 'zh'
  return 'fr'
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} 天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

/* ── Main component ── */
export default function ContractSendClient({ contractId }: { contractId: string }) {
  const mounted = useMounted()
  const { user } = useAuth()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [uploading, setUploading] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load contract
  useEffect(() => {
    if (!mounted) return
    void (async () => {
      try {
        const c = await loadContract(contractId)
        if (!c) { setError('合同不存在。'); return }
        setContract(c)
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败。')
      } finally {
        setLoading(false)
      }
    })()
  }, [contractId, mounted])

  const actorName = user?.displayName || contract?.createdBy || 'OKO'

  // Status advance
  const handleAdvanceStatus = useCallback(async (nextStatus: ContractStatus) => {
    if (!contract) return
    const next = updateContractStatus(contract, nextStatus, actorName)
    setContract(next)
    await saveContract(next)
    setMessage(`状态已更新为「${STEP_LABELS[nextStatus]}」。`)
  }, [contract, actorName])

  // Send email
  const handleSendEmail = useCallback(async () => {
    if (!contract || sendingEmail) return
    if (!contract.customer.email.trim()) { setMessage('请先填写客户邮箱。'); return }
    setSendingEmail(true)
    setMessage(null)
    try {
      const emailLang = getEmailLang(contract.customer.country, contract.lang)
      const copy = EMAIL_COPY[emailLang] || EMAIL_COPY.fr
      const customerName = contract.customer.name.trim() || 'Client'
      const subject = copy.subject(contract.meta.number, customerName)
      const html = `<div style="font-family:Arial,sans-serif;color:#1C1611;line-height:1.7"><p>${copy.greeting}</p><p>${copy.body(contract.meta.number)}</p><p>${copy.confirm}</p><p>${copy.closing}<br/>OKO</p></div>`

      const res = await fetch('/api/contract/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: contract.customer.email.trim(), subject, html, text: subject, pdfUrl: contract.pdfUrl }),
      })
      if (!res.ok) throw new Error('邮件发送失败。')

      const next = updateContractStatus(contract, 'sent', actorName, 'email')
      await saveContract(next)
      setContract(next)
      setMessage(`邮件已发送到 ${contract.customer.email}。`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '邮件发送失败。')
    } finally {
      setSendingEmail(false)
    }
  }, [contract, sendingEmail, actorName])

  // Upload evidence
  const handleUploadEvidence = useCallback(async (file: File) => {
    if (!contract) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.set('file', file)
      formData.set('kind', 'contract-evidence')
      formData.set('entityId', contract.id)
      formData.set('fileName', file.name)
      const res = await fetch('/api/files/upload', { method: 'POST', body: formData })
      const payload = await res.json() as { path?: string; url?: string }

      const evidence: ContractEvidenceFile = { name: file.name, url: payload.url, path: payload.path }
      const next: Contract = {
        ...contract,
        evidenceFiles: [...contract.evidenceFiles, evidence],
        activityLog: [...contract.activityLog, { at: new Date().toISOString(), actor: actorName, event: '上传了确认证据', meta: file.name }],
        updatedAt: new Date().toISOString(),
      }
      await saveContract(next)
      setContract(next)
      setMessage(`已上传 ${file.name}。`)
    } catch {
      setMessage('上传失败。')
    } finally {
      setUploading(false)
    }
  }, [contract, actorName])

  if (!mounted || loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="animate-pulse text-sm" style={{ color: '#9B8550' }}>加载中…</div></main>
  }
  if (error || !contract) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="text-center"><p className="text-sm" style={{ color: '#9B2A2A' }}>{error || '合同不存在。'}</p><Link href="/" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A8702E' }}>返回项目档案</Link></div></main>
  }

  const currentIndex = STATUS_STEPS.indexOf(contract.status)
  const nextStatus = currentIndex < STATUS_STEPS.length - 1 ? STATUS_STEPS[currentIndex + 1] : null

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F1E0' }}>
      {/* Layer 1: Identity bar */}
      <IdentityBar
        label={`${contract.meta.number}  ·  ${contract.customer.name || '未命名'}  ·  发送与跟进`}
        actions={<NavButton href="/" label="← 返回项目档案" />}
      />

      {/* Layer 2: Action bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-3" style={{ backgroundColor: '#F8F1E0', borderBottom: '1px solid rgba(212,197,142,0.3)' }}>
        <Link href={`/contract/${contractId}`} className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold" style={{ borderColor: '#1C1611', color: '#1C1611' }}>
          ✎ 返回编辑
        </Link>
        <button type="button" className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold" style={{ borderColor: '#1C1611', color: '#1C1611' }} onClick={() => { /* PDF download handled by existing export logic */ setMessage('请从编辑页导出 PDF。') }}>
          ↓ 下载 PDF
        </button>
      </div>

      {/* Body: 2 columns */}
      <div className="flex-1 flex gap-7 px-10 py-8 overflow-auto" style={{ alignItems: 'flex-start' }}>
        {/* Left: Contract preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#A8702E' }}>合同预览</span>
            <span className="text-[10px] font-medium tracking-[1px]" style={{ color: '#9B8550' }}>
              {contract.lang.toUpperCase()}  ·  A4  ·  PDF {contract.pdfUrl ? '就绪' : '未生成'}
            </span>
          </div>
          <div ref={exportRef} className="rounded-[4px] border overflow-hidden" style={{ borderColor: '#D9CFB8', backgroundColor: '#FBF5E4' }}>
            <ContractPreview contract={contract} />
          </div>
        </div>

        {/* Right: 4 cards */}
        <div className="w-[440px] shrink-0 flex flex-col gap-5">

          {/* Card 1: Status progress */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[18px] font-bold italic" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>合同进度</span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] text-[10px] font-bold tracking-[1px]" style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT_COLORS[contract.status] }} />
                {STEP_LABELS[contract.status] || contract.status}
              </span>
            </div>
            {/* Progress steps */}
            <div className="flex gap-1 mb-4">
              {STATUS_STEPS.map((step, i) => {
                const isCurrent = step === contract.status
                const isDone = i < currentIndex
                return (
                  <div
                    key={step}
                    className="flex-1 flex items-center justify-center py-2 rounded-[6px] text-[9px] font-bold tracking-[0.5px]"
                    style={
                      isCurrent
                        ? { backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }
                        : isDone
                          ? { backgroundColor: '#4A6B3A', color: '#FFFFFF' }
                          : { backgroundColor: '#F6EFDC', color: '#9B8550', border: '0.5px solid #D9CFB8' }
                    }
                  >
                    {STEP_LABELS[step]}
                  </div>
                )
              })}
            </div>
            {nextStatus && (
              <button
                type="button"
                onClick={() => void handleAdvanceStatus(nextStatus)}
                className="w-full py-3 rounded-[10px] text-[13px] font-bold text-white"
                style={{ backgroundColor: '#4A6B3A' }}
              >
                标记为{STEP_LABELS[nextStatus]}  →
              </button>
            )}
            {contract.status === 'completed' && (
              <div className="text-center text-[12px] font-medium py-2" style={{ color: '#4A6B3A' }}>
                ✓ 合同已完成归档
              </div>
            )}
          </div>

          {/* Card 2: Send email */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-1" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>发送合同</div>
            <div className="text-[9px] font-semibold tracking-[1.4px] mb-4" style={{ color: '#8B7A3E' }}>
              ENVOYER PAR EMAIL  ·  收件人已从合同自动带入
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />
            <div className="text-[9px] font-medium mb-1.5" style={{ color: '#9B8550', letterSpacing: '0.6px' }}>收件人邮箱</div>
            <div className="flex items-center justify-between rounded-[10px] px-3.5 py-3 mb-4" style={{ backgroundColor: '#F6EFDC' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#1C1611' }}>
                {contract.customer.email || '未填写'}
              </span>
              <Link href={`/contract/${contractId}`} className="text-[14px]" style={{ color: '#9B8550' }}>✎</Link>
            </div>
            {contract.sentAt ? (
              <div className="text-[11px] italic py-2" style={{ color: '#9B8550' }}>
                ✓ 已于 {new Date(contract.sentAt).toLocaleString('zh-CN')} 发送
                {contract.sentChannel ? ` · ${CONTRACT_SENT_CHANNEL_LABELS[contract.sentChannel]}` : ''}
              </div>
            ) : (
              <button
                type="button"
                disabled={sendingEmail}
                onClick={() => void handleSendEmail()}
                className="w-full py-3 rounded-[10px] text-[13px] font-bold"
                style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}
              >
                {sendingEmail ? '发送中…' : '发送邮件  →'}
              </button>
            )}
            <div className="text-[10px] italic mt-3" style={{ color: '#9B8550' }}>
              发送后将自动记录时间，合同状态变为「已发送」。
            </div>
          </div>

          {/* Card 3: Evidence upload */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-1" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>确认证据</div>
            <div className="text-[9px] font-semibold tracking-[1.4px] mb-4" style={{ color: '#8B7A3E' }}>
              PREUVES  ·  上传客户回复截图作为留档
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />

            {/* Upload area */}
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleUploadEvidence(f) }} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex flex-col items-center gap-2 py-6 rounded-[10px] border border-dashed mb-4"
              style={{ borderColor: '#D9CFB8', backgroundColor: '#F6EFDC' }}
            >
              <span className="text-[28px] font-bold" style={{ color: '#A8702E' }}>↑</span>
              <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>
                {uploading ? '上传中…' : '点击上传截图或文件'}
              </span>
              <span className="text-[10px] italic" style={{ color: '#9B8550' }}>
                支持 PNG / JPG / PDF  ·  最大 10MB
              </span>
            </button>

            {/* Uploaded files */}
            {contract.evidenceFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[10px] px-4 py-3 mb-2" style={{ backgroundColor: '#F8F1E0', border: '0.5px solid #D9CFB8' }}>
                <div className="w-8 h-8 rounded-[6px] flex items-center justify-center text-[8px] font-bold" style={{ backgroundColor: '#1C1611', color: '#F5D48A' }}>
                  {f.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold truncate" style={{ color: '#1C1611' }}>{f.name}</div>
                  <div className="text-[10px] italic" style={{ color: '#9B8550' }}>已上传</div>
                </div>
              </div>
            ))}

            {/* Note input */}
            <div className="mt-3">
              <div className="text-[9px] font-medium mb-1.5" style={{ color: '#9B8550' }}>备注（可选）</div>
              <div className="rounded-[10px] px-3.5 py-2.5" style={{ backgroundColor: '#F6EFDC', border: '0.5px solid #D9CFB8' }}>
                <div className="text-[11px] italic" style={{ color: '#9B8550' }}>
                  {contract.confirmationNote || '客户确认后在此记录备注…'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Activity log */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[18px] font-bold italic" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>操作记录</span>
              <span className="text-[10px] font-bold tracking-[1.5px]" style={{ color: '#8B7A3E' }}>{contract.activityLog.length} 条</span>
            </div>
            <div className="h-px mb-3" style={{ backgroundColor: '#B8922F', opacity: 0.4 }} />
            <div className="flex flex-col gap-4">
              {[...contract.activityLog].reverse().map((entry, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ backgroundColor: '#B8922F', color: '#1C1611' }}>
                    {entry.actor.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium" style={{ color: '#1C1611' }}>
                      {entry.actor} {entry.event}
                    </div>
                    <div className="text-[10px] italic" style={{ color: '#9B8550' }}>
                      {relativeTime(entry.at)}{entry.meta ? `  ·  ${entry.meta}` : ''}
                    </div>
                  </div>
                </div>
              ))}
              {contract.activityLog.length === 0 && (
                <div className="text-[11px] italic text-center py-2" style={{ color: '#9B8550' }}>暂无操作记录。</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-[10px] text-[12px] font-semibold shadow-lg" style={{ backgroundColor: '#1C1611', color: '#F5D48A' }}>
          {message}
          <button type="button" onClick={() => setMessage(null)} className="ml-4 opacity-60">×</button>
        </div>
      )}
    </div>
  )
}
