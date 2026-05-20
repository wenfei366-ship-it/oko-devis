const R2_BUCKET_NAME = 'oko-devis-files-dev'

export type FileStorageKind =
  | 'contract-pdf'
  | 'contract-evidence'
  | 'contract-attachment'
  | 'devis-pdf'
  | 'devis-screenshot'

export const FILE_STORAGE = {
  provider: 'cloudflare-r2',
  bucket: R2_BUCKET_NAME,
  roots: {
    contractPdf: 'contracts/pdf',
    contractEvidence: 'contracts/evidence',
    contractAttachments: 'contracts/attachments',
    devisPdf: 'devis/pdf',
    devisScreenshots: 'devis/screenshots',
  },
} as const

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildDocumentFileStem(prefix: string, customerName: string, number: string): string {
  const sanitizeFileNameSegment = (value: string) =>
    value
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]+/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const cleanCustomer = sanitizeFileNameSegment(customerName) || 'client'
  const cleanNumber = sanitizeFileNameSegment(number) || 'document'
  const cleanPrefix = sanitizeFileNameSegment(prefix) || 'document'
  return `${cleanPrefix}-${cleanCustomer}-${cleanNumber}`
}

export function buildContractPdfPath(contractId: string, fileName: string): string {
  return `${FILE_STORAGE.roots.contractPdf}/${sanitizeSegment(contractId)}/${sanitizeSegment(fileName) || 'contract'}.pdf`
}

export function buildContractAttachmentPath(contractId: string, fileName: string): string {
  const cleanName = sanitizeSegment(fileName) || 'file'
  return `${FILE_STORAGE.roots.contractAttachments}/${sanitizeSegment(contractId)}/${cleanName}`
}

export function buildContractEvidencePath(contractId: string, fileName: string): string {
  const cleanName = sanitizeSegment(fileName) || 'evidence'
  return `${FILE_STORAGE.roots.contractEvidence}/${sanitizeSegment(contractId)}/${cleanName}`
}

export function getPublicFileUrl(path: string): string | undefined {
  // Vercel env 偶发被污染（双引号 / 字面 `\n` / trailing newline）—— sanitize 防御。
  // 不 sanitize 的话 pdfUrl 会拼成非法 URL，邮件附件 fetch 失败。
  const raw = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim()
  if (!raw) return undefined
  const base = raw
    .replace(/^"|"$/g, '') // 去外层双引号
    .replace(/\\n/g, '') // 去字面 \n（两字符）
    .replace(/[\r\n]+/g, '') // 去真换行
    .replace(/\/$/, '') // 去末尾斜杠
    .trim()
  if (!base) return undefined
  return `${base}/${path.replace(/^\//, '')}`
}
