import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
  buildContractAttachmentPath,
  buildContractEvidencePath,
  buildContractPdfPath,
  FILE_STORAGE,
  getPublicFileUrl,
  type FileStorageKind,
} from './fileStorage'

let client: S3Client | null = null

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`缺少 ${name}，R2 上传暂时不可用。`)
  }
  return value
}

function getR2Client(): S3Client {
  if (client) return client

  const accountId = getRequiredEnv('R2_ACCOUNT_ID')
  const accessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY')

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return client
}

export function resolveUploadPath(kind: FileStorageKind, entityId: string, fileName: string): string {
  switch (kind) {
    case 'contract-pdf':
      return buildContractPdfPath(entityId, fileName)
    case 'contract-evidence':
      return buildContractEvidencePath(entityId, fileName)
    case 'contract-attachment':
      return buildContractAttachmentPath(entityId, fileName)
    default:
      throw new Error(`暂不支持的文件类型：${kind}`)
  }
}

export async function uploadFileToR2(params: {
  kind: FileStorageKind
  entityId: string
  fileName: string
  body: Buffer
  contentType: string
}) {
  const path = resolveUploadPath(params.kind, params.entityId, params.fileName)
  const s3 = getR2Client()

  await s3.send(
    new PutObjectCommand({
      Bucket: FILE_STORAGE.bucket,
      Key: path,
      Body: params.body,
      ContentType: params.contentType,
    }),
  )

  return {
    bucket: FILE_STORAGE.bucket,
    path,
    url: getPublicFileUrl(path),
  }
}
