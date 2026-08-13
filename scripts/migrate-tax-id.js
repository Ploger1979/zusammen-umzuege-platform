const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set in .env.local!');
    process.exit(1);
}

async function migrate() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(uri);
        console.log('Connected successfully!');

        const db = mongoose.connection.db;
        const collection = db.collection('invoices');

        const result = await collection.updateMany(
            {
                $or: [
                    { companyTaxId: '4080538293' },
                    { companyTaxId: '' },
                    { companyTaxId: null },
                    { companyTaxId: { $exists: false } }
                ]
            },
            {
                $set: { companyTaxId: '040 805 3416 8' }
            }
        );

        console.log(`Migration complete! Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

migrate();
