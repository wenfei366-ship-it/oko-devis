import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`缺少环境变量 ${name}`)
  return value
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim()
  return value || undefined
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, text, pdfUrl, pdfFileName, pdfBase64 } = await request.json() as {
      to?: string
      subject?: string
      html?: string
      text?: string
      pdfUrl?: string
      pdfFileName?: string
      pdfBase64?: string
    }

    if (!to?.trim()) {
      return NextResponse.json({ error: '缺少收件人邮箱。' }, { status: 400 })
    }

    if (!subject?.trim() || !html?.trim()) {
      return NextResponse.json({ error: '缺少邮件主题或正文。' }, { status: 400 })
    }

    const host = getRequiredEnv('LARK_SMTP_HOST')
    const port = Number(getRequiredEnv('LARK_SMTP_PORT'))
    const user = getRequiredEnv('LARK_SMTP_USER')
    const pass = getRequiredEnv('LARK_SMTP_PASS')
    const from = getRequiredEnv('LARK_SMTP_FROM')
    const replyTo = getOptionalEnv('LARK_SMTP_REPLY_TO')

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: { user, pass },
    })

    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

    if (pdfBase64?.trim()) {
      attachments.push({
        filename: pdfFileName?.trim() || 'devis.pdf',
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      })
    } else if (pdfUrl?.trim()) {
      const response = await fetch(pdfUrl)
      if (!response.ok) {
        throw new Error('报价单 PDF 下载失败，无法作为附件发送。')
      }
      const pdfBuffer = Buffer.from(await response.arrayBuffer())
      attachments.push({
        filename: pdfFileName?.trim() || 'devis.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    const info = await transporter.sendMail({
      from: `OKO <${from}>`,
      replyTo,
      to: to.trim(),
      subject: subject.trim(),
      html,
      text: text?.trim() || undefined,
      attachments,
    })

    return NextResponse.json({
      ok: true,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      messageId: info.messageId,
    })
  } catch (error) {
    // Surface the failure in Vercel runtime logs so we can diagnose without
    // having to roundtrip through the UI toast.
    const message = error instanceof Error ? error.message : '报价单邮件发送失败。'
    const errCode =
      error && typeof error === 'object' && 'code' in error ? (error as { code?: string }).code : undefined
    console.error('devis send failed', {
      message,
      code: errCode,
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: message, code: errCode }, { status: 500 })
  }
}
