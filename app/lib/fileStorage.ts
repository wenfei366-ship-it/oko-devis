const R2_BUCKET_NAME = 'oko-devis-files-dev'

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
