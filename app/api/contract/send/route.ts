import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`缺少环境变量 ${name}`)
  return value
}

export async function POST(request: Request) {
  try {
    const { to, subject, html, pdfUrl, pdfFileName } = await request.json() as {
      to?: string
      subject?: string
      html?: string
      pdfUrl?: string
      pdfFileName?: string
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

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })

    const attachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

    if (pdfUrl?.trim()) {
      const response = await fetch(pdfUrl)
      if (!response.ok) {
        throw new Error('合同 PDF 下载失败，无法作为附件发送。')
      }
      const pdfBuffer = Buffer.from(await response.arrayBuffer())
      attachments.push({
        filename: pdfFileName?.trim() || 'contract.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      })
    }

    await transporter.sendMail({
      from,
      to: to.trim(),
      subject: subject.trim(),
      html,
      attachments,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '邮件发送失败。' },
      { status: 500 },
    )
  }
}
