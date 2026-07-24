import { describe, it, expect } from 'vitest';
import dbConnect from './mongodb';
import mongoose from 'mongoose';

describe('Integration Test Safety Mechanism', () => {
    it('ensures NODE_ENV is test', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    it('ensures MONGODB_URI points to localhost or 127.0.0.1', () => {
        const uri = process.env.MONGODB_URI || '';
        expect(uri.includes('127.0.0.1') || uri.includes('localhost')).toBe(true);
        expect(uri).not.toContain('cluster'); // Make sure it's not a Mongo Atlas URI
    });

    it('successfully connects to the ephemeral memory database', async () => {
        const conn = await dbConnect();
        expect(conn.connection.readyState).toBe(1); // 1 = connected
        expect(conn.connection.host).toBe('127.0.0.1');
    });

    it('strictly prevents connecting to production databases during tests', async () => {
        const originalUri = process.env.MONGODB_URI;
        
        // Temporarily clear cached mongoose instance properties to force a fresh connection attempt
        const originalConn = global.mongoose.conn;
        const originalPromise = global.mongoose.promise;
        global.mongoose.conn = null;
        global.mongoose.promise = null;

        // Attempt to connect with a fake production URI
        process.env.MONGODB_URI = 'mongodb+srv://admin:password@cluster0.mongodb.net/prod';

        await expect(dbConnect()).rejects.toThrow('CRITICAL SAFETY: Tests attempted to connect to a non-local database!');

        // Restore everything
        process.env.MONGODB_URI = originalUri;
        global.mongoose.conn = originalConn;
        global.mongoose.promise = originalPromise;
    });
});
