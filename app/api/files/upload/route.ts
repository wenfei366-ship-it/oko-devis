import { NextResponse } from 'next/server'
import { uploadFileToR2 } from '@/app/lib/fileStorage.server'
import type { FileStorageKind } from '@/app/lib/fileStorage'

export const runtime = 'nodejs'

function isSupportedKind(value: string): value is FileStorageKind {
  return value === 'contract-pdf'
    || value === 'contract-evidence'
    || value === 'contract-attachment'
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const kind = String(formData.get('kind') || '')
    const entityId = String(formData.get('entityId') || '')
    const fileName = String(formData.get('fileName') || '')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: '缺少文件。' }, { status: 400 })
    }

    if (!isSupportedKind(kind)) {
      return NextResponse.json({ error: '文件类型不支持。' }, { status: 400 })
    }

    if (!entityId.trim()) {
      return NextResponse.json({ error: '缺少业务编号。' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadFileToR2({
      kind,
      entityId: entityId.trim(),
      fileName: fileName.trim() || file.name || 'file',
      body: buffer,
      contentType: file.type || 'application/octet-stream',
    })

    return NextResponse.json(uploaded)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传失败。' },
      { status: 500 },
    )
  }
}
