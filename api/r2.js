// Cloudflare R2 (S3-compatible) helper — reusable object storage for images/files.
// Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let _client = null;
function client() {
  if (_client) return _client;
  if (!process.env.R2_ACCOUNT_ID) throw new Error('R2_ACCOUNT_ID not set');
  _client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

// Upload a base64 data URL (data:<mime>;base64,<data>) to R2, return the public URL.
export async function uploadDataUrl(dataUrl, keyBase) {
  const m = /^data:(.+?);base64,(.+)$/s.exec(dataUrl);
  if (!m) throw new Error('not a base64 data URL');
  const [, mediaType, b64] = m;
  const ext = EXT[mediaType.toLowerCase()] || 'png';
  const key = `${keyBase}.${ext}`;
  await client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: Buffer.from(b64, 'base64'),
    ContentType: mediaType,
  }));
  return `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}

// Delete an object by its public URL (best-effort; ignores errors).
export async function deleteByUrl(url) {
  try {
    if (!url || !url.startsWith(process.env.R2_PUBLIC_URL)) return;
    const key = url.slice(process.env.R2_PUBLIC_URL.replace(/\/$/, '').length + 1);
    await client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
  } catch (e) { /* best-effort */ }
}
