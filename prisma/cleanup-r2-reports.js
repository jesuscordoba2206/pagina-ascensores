const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials. Define R2_ACCOUNT_ID, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

async function listAllKeys(client, bucket, prefix) {
  const keys = [];
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    for (const obj of response.Contents || []) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

async function deleteInBatches(client, bucket, keys, batchSize = 1000) {
  let deleted = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: false,
        },
      })
    );

    deleted += Array.isArray(response.Deleted) ? response.Deleted.length : batch.length;

    if (Array.isArray(response.Errors) && response.Errors.length > 0) {
      for (const err of response.Errors) {
        console.error(`Delete error for ${err.Key || 'unknown-key'}: ${err.Code || 'Unknown'} ${err.Message || ''}`);
      }
      throw new Error('Some objects could not be deleted from R2.');
    }
  }

  return deleted;
}

async function main() {
  const bucket = process.env.R2_BUCKET_NAME;
  const prefix = process.env.R2_REPORTS_PREFIX || 'reports/';

  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not defined');
  }

  const client = getR2Client();

  const keys = await listAllKeys(client, bucket, prefix);
  console.log(`Objects found in ${bucket} with prefix ${prefix}: ${keys.length}`);

  if (keys.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  const deleted = await deleteInBatches(client, bucket, keys);
  console.log(`Deleted objects: ${deleted}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
