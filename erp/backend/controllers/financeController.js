import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import * as xlsx from 'xlsx';

export const uploadFinanceData = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Assume data is in first sheet
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data || data.length === 0) {
            return res.status(400).json({ error: 'Excel file is empty' });
        }

        // Assume columns: Description, Amount, Type (Income/Expense), date (optional)
        // Mapping 'Type' to 'reference' column since 'type' doesn't exist in schema.
        const stmt = db.prepare(`INSERT INTO transactions (id, description, amount, reference, date) VALUES (?, ?, ?, ?, ?)`);

        let count = 0;
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            // Fuzzy match helper
            const getValue = (row, ...keys) => {
                const rowKeys = Object.keys(row);
                for (const key of keys) {
                    const match = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
                    if (match) return row[match];
                }
                return undefined;
            };

            data.forEach(row => {
                const id = uuidv4();
                const description = getValue(row, 'Description', 'desc', 'Narration') || 'Imported Transaction';
                const amount = parseFloat(getValue(row, 'Amount', 'amt', 'value', 'total') || 0);
                const type = getValue(row, 'Type', 'category', 'ref') || 'Expense';
                const dateRaw = getValue(row, 'Date', 'dt', 'time');
                const date = dateRaw ? new Date(dateRaw).toISOString() : new Date().toISOString();

                stmt.run(id, description, amount, type, date); // id, desc, amount, reference (type), date
                count++;
            });
            db.run("COMMIT");
            stmt.finalize();
        });

        res.json({ message: `Successfully imported ${count} transactions`, data });

    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Failed to process Excel file' });
    }
};

export const getTransactions = (req, res) => {
    // Basic query, can be expanded with filters
    const sql = `SELECT * FROM transactions ORDER BY date DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// --- Invoices ---
// --- Invoices ---
export const getInvoices = (req, res) => {
    const sql = `SELECT 
        id, 
        invoice_number as invoiceNumber, 
        customer_name as customer, 
        date, 
        due_date as dueDate, 
        amount, 
        status, 
        items_count as items 
    FROM invoices ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createInvoice = (req, res) => {
    const { customer, date, dueDate, items } = req.body;

    // Auto-generate ID and Invoice Number if not provided
    const id = uuidv4();
    const invoiceNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;

    // Calculate totals
    const itemsCount = items ? items.length : 0;
    const totalAmount = items ? items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;

    const sqlInvoice = `INSERT INTO invoices (id, invoice_number, customer_name, date, due_date, amount, status, items_count) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    const paramsInvoice = [id, invoiceNumber, customer, date, dueDate, totalAmount, 'Pending', itemsCount];

    // Transaction-like approach
    db.serialize(() => {
        db.run(sqlInvoice, paramsInvoice, function (err) {
            if (err) {
                console.error("Error creating invoice:", err);
                return res.status(500).json({ error: err.message });
            }

            if (items && items.length > 0) {
                const sqlItem = `INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?, ?)`;

                const stmt = db.prepare(sqlItem);
                items.forEach(item => {
                    const itemId = uuidv4();
                    const itemAmount = item.price * item.quantity;
                    // item might be just { name, price, quantity } from simple form
                    stmt.run(itemId, id, item.id || null, item.name || 'Item', item.quantity, item.price, itemAmount);
                });
                stmt.finalize();
            }

            res.status(201).json({
                id,
                invoiceNumber,
                customer,
                date,
                dueDate,
                amount: totalAmount,
                status: 'Pending',
                items: itemsCount
            });
        });
    });
};

export const updateInvoiceStatus = (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE invoices SET status = ? WHERE id = ?`;

    db.run(sql, [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, status });
    });
};

export const deleteInvoice = (req, res) => {
    db.run("DELETE FROM invoices WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};

// --- Payments ---
export const getPayments = (req, res) => {
    const sql = `SELECT 
        id, 
        payment_number as paymentNumber, 
        vendor, 
        amount, 
        date, 
        method, 
        status 
    FROM payments ORDER BY created_at DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createPayment = (req, res) => {
    const { vendor, amount, method, status } = req.body;
    const id = uuidv4();
    const paymentNumber = `PAY-${Math.floor(10000 + Math.random() * 90000)}`; // Simple auto-gen
    const date = new Date().toISOString();

    const sql = `INSERT INTO payments (id, payment_number, vendor, amount, date, method, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const params = [id, paymentNumber, vendor, amount, date, method, status || 'Completed'];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, paymentNumber, vendor, amount, date, method, status });
    });
};

export const updatePaymentStatus = (req, res) => {
    const { status } = req.body;
    const sql = `UPDATE payments SET status = ? WHERE id = ?`;

    db.run(sql, [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, status });
    });
};

export const deletePayment = (req, res) => {
    db.run("DELETE FROM payments WHERE id = ?", [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted successfully' });
    });
};
