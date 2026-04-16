'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import DevisLivePreview from '@/app/components/DevisLivePreview'
import { DevisProvider, useDevis } from '@/app/components/DevisContext'
import IdentityBar, { NavButton } from '@/app/components/IdentityBar'
import { loadFromHistory } from '@/app/lib/storage'
import { createExportImage, exportLongPng } from '@/app/lib/png/exportLong'
import { buildDocumentFileStem } from '@/app/lib/fileStorage'
import { useMounted } from '@/app/lib/useMounted'
import type { Devis } from '@/app/lib/types'

const FLAG_MAP: Record<string, string> = { fr: '🇫🇷', it: '🇮🇹', es: '🇪🇸', de: '🇩🇪', zh: '🇨🇳' }

function DevisDetailLoader({ devis }: { devis: Devis }) {
  const { dispatch } = useDevis()
  useEffect(() => { dispatch({ type: 'LOAD_DEVIS', devis }) }, [devis, dispatch])
  return <DevisDetailInner devis={devis} />
}

function DevisDetailInner({ devis }: { devis: Devis }) {
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sentAt, setSentAt] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingPng, setExportingPng] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = async () => {
    if (exportingPdf) return
    const element = previewRef.current
    if (!element) { setMessage('预览还没准备好。'); return }
    setExportingPdf(true)
    setMessage(null)
    try {
      const image = await createExportImage(element)
      const [{ Document, Image, Page, StyleSheet, pdf }] = await Promise.all([import('@react-pdf/renderer')])
      const styles = StyleSheet.create({ page: { padding: 0, margin: 0, backgroundColor: '#F8F1E0' } })
      const blob = await pdf(
        <Document>
          <Page size={[image.width, image.height]} style={styles.page}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={image.dataUrl} style={{ width: image.width, height: image.height }} />
          </Page>
        </Document>
      ).toBlob()
      const fileName = `${buildDocumentFileStem('报价单', devis.customer.name, devis.meta.number)}.pdf`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setMessage('PDF 已下载。')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'PDF 导出失败。')
    } finally {
      setExportingPdf(false)
    }
  }

  const handleDownloadPng = async () => {
    if (exportingPng) return
    const element = previewRef.current
    if (!element) { setMessage('预览还没准备好。'); return }
    setExportingPng(true)
    setMessage(null)
    try {
      const fileStem = buildDocumentFileStem('报价单', devis.customer.name, devis.meta.number)
      await exportLongPng(element, fileStem)
      setMessage('长图已下载。')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '长图导出失败。')
    } finally {
      setExportingPng(false)
    }
  }

  const handleSendEmail = async () => {
    if (sendingEmail) return
    if (!devis.customer.email.trim()) { setMessage('请先填写客户邮箱。'); return }
    setSendingEmail(true)
    setMessage(null)
    try {
      const customerName = devis.customer.name.trim() || 'Client'
      const subject = `Devis OKO ${devis.meta.number} · ${customerName}`
      const html = `<div style="font-family:Arial,sans-serif;color:#1C1611;line-height:1.7"><p>Bonjour,</p><p>Veuillez trouver ci-joint le devis ${devis.meta.number} préparé pour votre établissement.</p><p>Cordialement,<br/>OKO</p></div>`
      const res = await fetch('/api/devis/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: devis.customer.email.trim(), subject, html, text: subject }),
      })
      if (!res.ok) throw new Error('邮件发送失败。')
      const now = new Date().toISOString()
      setSentAt(now)
      setMessage(`报价单已发送到 ${devis.customer.email}。`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '邮件发送失败。')
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F8F1E0' }}>
      <IdentityBar
        label={`${devis.meta.number}  ·  ${devis.customer.name || '未命名'}  ·  报价单详情`}
        actions={<NavButton href="/" label="← 返回项目档案" />}
      />

      {/* Action bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-3" style={{ borderBottom: '1px solid rgba(212,197,142,0.3)' }}>
        <button
          type="button"
          onClick={() => { sessionStorage.setItem('oko-devis-pending', JSON.stringify(devis)); window.location.href = '/devis/new' }}
          className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold"
          style={{ borderColor: '#1C1611', color: '#1C1611' }}
        >
          ✎ 编辑报价单
        </button>
        <button
          type="button"
          onClick={() => void handleDownloadPdf()}
          disabled={exportingPdf}
          className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold disabled:opacity-60"
          style={{ borderColor: '#1C1611', color: '#1C1611' }}
        >
          {exportingPdf ? '导出中…' : '↓ 下载 PDF'}
        </button>
        <button
          type="button"
          onClick={() => void handleDownloadPng()}
          disabled={exportingPng}
          className="flex items-center h-[32px] px-[14px] rounded-[10px] border text-[11px] font-bold disabled:opacity-60"
          style={{ borderColor: '#1C1611', color: '#1C1611' }}
        >
          {exportingPng ? '导出中…' : '导出长图'}
        </button>
        <Link
          href={`/contract/new?fromDevis=${devis.id}`}
          className="flex items-center h-[32px] px-[18px] rounded-[10px] text-[11px] font-bold"
          style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}
        >
          制作合同 →
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-7 px-10 py-8 overflow-auto" style={{ alignItems: 'flex-start' }}>
        {/* Left: preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: '#A8702E' }}>报价单预览</span>
            <span className="text-[10px] font-medium tracking-[1px]" style={{ color: '#9B8550' }}>
              {FLAG_MAP[devis.lang] || '🇫🇷'} {devis.lang.toUpperCase()}  ·  A4
            </span>
          </div>
          <div ref={previewRef} className="rounded-[4px] border overflow-hidden" style={{ borderColor: '#D9CFB8', backgroundColor: '#F8F1E0' }}>
            <DevisLivePreview />
          </div>
        </div>

        {/* Right: cards */}
        <div className="w-[440px] shrink-0 flex flex-col gap-5">

          {/* Send email card */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-1" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>发送报价单</div>
            <div className="text-[9px] font-semibold tracking-[1.4px] mb-4" style={{ color: '#8B7A3E' }}>
              ENVOYER PAR EMAIL  ·  收件人已从报价单自动带入
            </div>
            <div className="h-px mb-4" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />
            <div className="text-[9px] font-medium mb-1.5" style={{ color: '#9B8550', letterSpacing: '0.6px' }}>收件人邮箱</div>
            <div className="flex items-center justify-between rounded-[10px] px-3.5 py-3 mb-4" style={{ backgroundColor: '#F6EFDC' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#1C1611' }}>
                {devis.customer.email || '未填写'}
              </span>
              <Link href="/devis/new" className="text-[14px]" style={{ color: '#9B8550' }}>✎</Link>
            </div>
            {sentAt ? (
              <div className="text-[11px] italic py-2" style={{ color: '#4A6B3A' }}>
                ✓ 已于 {new Date(sentAt).toLocaleString('zh-CN')} 发送
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
              发送后将自动记录发送时间。
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-3" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>报价单信息</div>
            <div className="h-px mb-3" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />
            <div className="flex flex-col gap-3">
              {[
                ['编号', devis.meta.number],
                ['客户', devis.customer.name || '—'],
                ['地址', `${devis.customer.postalCode} ${devis.customer.city}`],
                ['联系人', devis.customer.contactName || '—'],
                ['邮箱', devis.customer.email || '—'],
                ['日期', devis.meta.date],
                ['服务项', String(devis.items.length)],
                ['创建人', (devis as Devis & { createdBy?: string }).createdBy || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[10px] font-medium" style={{ color: '#8B7A3E' }}>{label}</span>
                  <span className="text-[12px] font-semibold" style={{ color: '#1C1611' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions card */}
          <div className="rounded-[14px] p-5" style={{ backgroundColor: '#FEFBF2', border: '1px solid #D9CFB8' }}>
            <div className="text-[18px] font-bold italic mb-3" style={{ color: '#1C1611', fontFamily: 'var(--font-playfair)' }}>操作</div>
            <div className="h-px mb-4" style={{ backgroundColor: '#D4C58E', opacity: 0.5 }} />
            <div className="flex flex-col gap-3">
              <Link
                href={`/contract/new?fromDevis=${devis.id}`}
                className="w-full py-3 rounded-[10px] text-center text-[13px] font-bold"
                style={{ backgroundColor: '#1C1611', color: '#F5D48A', border: '1px solid #B8922F' }}
              >
                制作合同 →
              </Link>
              <button
                type="button"
                onClick={() => { sessionStorage.setItem('oko-devis-pending', JSON.stringify(devis)); window.location.href = '/devis/new' }}
                className="w-full py-3 rounded-[10px] text-center text-[13px] font-bold border"
                style={{ borderColor: '#1C1611', color: '#1C1611' }}
              >
                复制并编辑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-[10px] text-[12px] font-semibold shadow-lg" style={{ backgroundColor: '#1C1611', color: '#F5D48A' }}>
          {message}
          <button type="button" onClick={() => setMessage(null)} className="ml-4 opacity-60">×</button>
        </div>
      )}
    </div>
  )
}

export default function DevisDetailClient({ devisId }: { devisId: string }) {
  const mounted = useMounted()
  const [devis, setDevis] = useState<Devis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mounted) return
    void (async () => {
      try {
        const d = await loadFromHistory(devisId)
        if (!d) { setError('报价单不存在。'); return }
        setDevis(d)
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败。')
      } finally {
        setLoading(false)
      }
    })()
  }, [devisId, mounted])

  if (!mounted || loading) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="animate-pulse text-sm" style={{ color: '#9B8550' }}>加载中…</div></main>
  }
  if (error || !devis) {
    return <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F1E0' }}><div className="text-center"><p className="text-sm" style={{ color: '#9B2A2A' }}>{error || '报价单不存在。'}</p><Link href="/" className="mt-4 inline-block text-sm font-semibold" style={{ color: '#A8702E' }}>返回项目档案</Link></div></main>
  }

  return (
    <DevisProvider>
      <DevisDetailLoader devis={devis} />
    </DevisProvider>
  )
}
