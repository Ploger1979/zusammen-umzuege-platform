import mongoose from 'mongoose';

// MONGODB_URI is read dynamically in dbConnect to allow test overrides

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    // CRITICAL SAFETY CHECK: Prevent tests from touching production database
    if (process.env.NODE_ENV === 'test' && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
        throw new Error('CRITICAL SAFETY: Tests attempted to connect to a non-local database!');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
