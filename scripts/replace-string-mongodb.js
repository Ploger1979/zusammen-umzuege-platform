const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

async function run() {
    try {
        await mongoose.connect(uri);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const colInfo of collections) {
            const col = db.collection(colInfo.name);
            const docs = await col.find({}).toArray();
            
            for (const doc of docs) {
                let jsonStr = JSON.stringify(doc);
                if (jsonStr.includes('4080538293') || jsonStr.includes('040 805 3416 8')) {
                    console.log(`Found old tax ID in collection "${colInfo.name}" doc ID: ${doc._id}`);
                    jsonStr = jsonStr.replace(/4080538293/g, '040 805 34168').replace(/040 805 3416 8/g, '040 805 34168');
                    const updatedDoc = JSON.parse(jsonStr);
                    delete updatedDoc._id; // Keep original _id
                    await col.replaceOne({ _id: doc._id }, updatedDoc);
                    console.log(`Successfully updated doc ID: ${doc._id} in "${colInfo.name}"`);
                }
            }
        }
        console.log('Deep scan and replacement in MongoDB Atlas completed!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

run();
