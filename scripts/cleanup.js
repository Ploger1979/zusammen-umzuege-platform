const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://zusammen:zusammen123@kartenlegendb.vg5sa6r.mongodb.net/zusammen-umzuege?appName=KartenlegenDB";

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Access the collections directly
        const db = mongoose.connection.db;
        const requestsCol = db.collection('requests');
        const invoicesCol = db.collection('invoices');

        // Find Uwe's request
        const uweRequest = await requestsCol.findOne({ "customer.firstName": "Uwe", "customer.lastName": "Müller" });
        
        if (uweRequest) {
            console.log('Found Uwe Request:', uweRequest._id);
            // Delete all requests EXCEPT Uwe
            const delReqRes = await requestsCol.deleteMany({ _id: { $ne: uweRequest._id } });
            console.log('Deleted requests:', delReqRes.deletedCount);
            
            // Delete invoices not matching Uwe's request ID
            const delInvRes = await invoicesCol.deleteMany({ requestId: { $ne: uweRequest._id.toString() } });
            console.log('Deleted invoices:', delInvRes.deletedCount);
        } else {
            console.log('Uwe Request not found.');
        }

        console.log('Cleanup complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
