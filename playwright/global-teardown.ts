import type { MongoMemoryServer } from 'mongodb-memory-server';

async function globalTeardown() {
  const instance = (global as any).__MONGOINSTANCE as MongoMemoryServer;
  if (instance) {
    await instance.stop();
    console.log('🛑 [Playwright Teardown] Stopped mongodb-memory-server');
  }
}

export default globalTeardown;
