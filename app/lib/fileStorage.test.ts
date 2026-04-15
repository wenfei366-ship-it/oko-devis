import { describe, expect, it } from 'vitest'
import {
  buildContractAttachmentPath,
  buildContractEvidencePath,
  buildContractPdfPath,
  buildDocumentFileStem,
} from './fileStorage'

describe('fileStorage paths', () => {
  it('builds contract pdf path in dedicated folder', () => {
    expect(buildContractPdfPath('CT-2026-001', 'CT-2026-001')).toBe(
      'contracts/pdf/ct-2026-001/ct-2026-001.pdf',
    )
  })

  it('builds contract attachment path', () => {
    expect(buildContractAttachmentPath('CT-2026-001', 'Signed Proof.png')).toBe(
      'contracts/attachments/ct-2026-001/signed-proof-png',
    )
  })

  it('builds contract evidence path', () => {
    expect(buildContractEvidencePath('CT-2026-001', 'Chat Shot 01.png')).toBe(
      'contracts/evidence/ct-2026-001/chat-shot-01-png',
    )
  })

  it('builds customer-aware document file stem', () => {
    expect(buildDocumentFileStem('合同', 'Roma Bistro', 'CT-2026-001')).toBe(
      '合同-Roma-Bistro-CT-2026-001',
    )
  })
})
