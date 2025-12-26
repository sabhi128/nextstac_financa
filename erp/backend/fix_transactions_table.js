import db from './db.js';

const createTableSql = `
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    description TEXT,
    amount REAL,
    reference TEXT,
    debit_account_id TEXT,
    credit_account_id TEXT,
    type TEXT,
    date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`;

db.serialize(() => {
    db.run(createTableSql, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'transactions' check/creation successful.");
        }
    });
});
