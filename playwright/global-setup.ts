import { MongoMemoryServer } from 'mongodb-memory-server';

async function globalSetup() {
  // Start mongodb-memory-server with a fixed port and dbName
  const mongod = await MongoMemoryServer.create({ instance: { port: 65023, dbName: 'testdb' } });
  
  // Export the exact URI with testdb
  process.env.MONGODB_URI = 'mongodb://127.0.0.1:65023/testdb';
  
  // Also set MOCK_EXTERNAL_SERVICES globally just in case
  process.env.MOCK_EXTERNAL_SERVICES = 'true';
  // @ts-ignore
  process.env.NODE_ENV = 'test';
  
  // Store instance globally for teardown
  (global as any).__MONGOINSTANCE = mongod;
  
  console.log('🌍 [Playwright Setup] Started mongodb-memory-server at', process.env.MONGODB_URI);
}

export default globalSetup;
