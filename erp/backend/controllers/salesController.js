import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export const getOrders = (req, res) => {
    const sql = `SELECT * FROM sales_orders ORDER BY date DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

export const createOrder = (req, res) => {
    const { customerId, amount, status, paymentStatus } = req.body;
    const id = uuidv4();
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const date = new Date().toISOString();

    const sql = `INSERT INTO sales_orders (id, order_number, customer_id, date, amount, status, payment_status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [id, orderNumber, customerId, date, amount, status || 'Processing', paymentStatus || 'Pending'], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id, orderNumber, customerId, date, amount, status, paymentStatus });
    });
};
