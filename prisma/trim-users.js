const { MongoClient } = require('mongodb');

const candidateCollections = ['User', 'users', 'user'];
const stringFields = ['email', 'password', 'role', 'name', 'building'];

function buildTrimStage() {
  return Object.fromEntries(
    stringFields.map((field) => [
      field,
      {
        $cond: [
          { $eq: [{ $type: `$${field}` }, 'string'] },
          { $trim: { input: `$${field}` } },
          `$${field}`,
        ],
      },
    ]),
  );
}

async function resolveUserCollection(db) {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();
  const collectionNames = new Set(collections.map((collection) => collection.name));
  return candidateCollections.find((name) => collectionNames.has(name)) || null;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();
    const db = client.db();
    const collectionName = await resolveUserCollection(db);

    if (!collectionName) {
      throw new Error(`User collection not found. Checked: ${candidateCollections.join(', ')}`);
    }

    const users = db.collection(collectionName);
    const result = await users.updateMany({}, [{ $set: buildTrimStage() }]);

    console.log(`Trimmed user strings in collection ${collectionName}.`);
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});