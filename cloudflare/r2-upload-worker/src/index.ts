export interface Env {
  FILES_BUCKET: R2Bucket
  UPLOAD_TOKEN: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildPath(kind: string, entityId: string, fileName: string) {
  const safeId = sanitizeSegment(entityId)
  const safeFile = sanitizeSegment(fileName) || 'file'

  if (kind === 'contract-pdf') return `contracts/pdf/${safeId}/${safeFile}.pdf`
  if (kind === 'contract-evidence') return `contracts/evidence/${safeId}/${safeFile}`
  if (kind === 'contract-attachment') return `contracts/attachments/${safeId}/${safeFile}`

  throw new Error('Unsupported file kind.')
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405)
    }

    const token = request.headers.get('x-upload-token')
    if (!token || token !== env.UPLOAD_TOKEN) {
      return json({ error: 'Unauthorized.' }, 401)
    }

    try {
      const formData = await request.formData()
      const file = formData.get('file')
      const kind = String(formData.get('kind') || '')
      const entityId = String(formData.get('entityId') || '')
      const fileName = String(formData.get('fileName') || '')

      if (!(file instanceof File)) return json({ error: 'Missing file.' }, 400)
      if (!kind || !entityId) return json({ error: 'Missing kind or entityId.' }, 400)

      const key = buildPath(kind, entityId, fileName || file.name || 'file')
      await env.FILES_BUCKET.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
      })

      return json({
        success: true,
        path: key,
        url: `https://pub-e77f9dd7afa446adacc8a3a8899b9d0f.r2.dev/${key}`,
      })
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Upload failed.' }, 500)
    }
  },
} satisfies ExportedHandler<Env>
