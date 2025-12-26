import db from './db.js';

db.serialize(() => {
    db.run("DELETE FROM transactions", (err) => {
        if (err) {
            console.error("Error clearing transactions:", err.message);
        } else {
            console.log("Transactions table cleared.");
        }
    });
});
