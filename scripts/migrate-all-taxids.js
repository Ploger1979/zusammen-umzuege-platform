const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set in .env.local!');
    process.exit(1);
}

async function run() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        console.log('Connected to DB:', db.databaseName);

        const collections = await db.listCollections().toArray();
        console.log('Collections in DB:', collections.map(c => c.name));

        for (const colInfo of collections) {
            const col = db.collection(colInfo.name);
            const res = await col.updateMany(
                {
                    $or: [
                        { companyTaxId: '4080538293' },
                        { taxId: '4080538293' },
                        { companyTaxId: '' },
                        { companyTaxId: null }
                    ]
                },
                {
                    $set: { companyTaxId: '040 805 3416 8' }
                }
            );
            console.log(`Collection "${colInfo.name}": Matched ${res.matchedCount}, Modified ${res.modifiedCount}`);
        }

        // Also search by text content if any
        for (const colInfo of collections) {
            const col = db.collection(colInfo.name);
            const docsWithOldId = await col.find({
                $or: [
                    { companyTaxId: '4080538293' },
                    { 'invoice.companyTaxId': '4080538293' }
                ]
            }).toArray();
            if (docsWithOldId.length > 0) {
                console.log(`Found ${docsWithOldId.length} docs in "${colInfo.name}" with old ID:`, docsWithOldId);
            }
        }
    } catch (err) {
        console.error('Error during migration:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
