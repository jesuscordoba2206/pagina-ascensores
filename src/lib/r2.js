import { S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 credentials missing. Define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY in .env.local'
    );
  }

  // NodeHttpHandler is forced explicitly so @aws-sdk/client-s3 does not fall
  // back to the patched global fetch used by Next.js, which can break the
  // TLS handshake toward Cloudflare R2 (ssl alert 40 / EPROTO).
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 10000,
      socketTimeout: 60000,
    }),
  });
}