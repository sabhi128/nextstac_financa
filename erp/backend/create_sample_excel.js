import * as xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = [
    { Description: "Client Payment - Project X", Amount: 5000, Type: "Income", Date: "2024-01-15" },
    { Description: "Office Rent", Amount: -1200, Type: "Expense", Date: "2024-01-01" },
    { Description: "Consulting Fees", Amount: 3000, Type: "Income", Date: "2024-02-10" },
    { Description: "Software Subscription", Amount: -50, Type: "Expense", Date: "2024-02-05" },
    { Description: "Q1 Bonus", Amount: 10000, Type: "Income", Date: "2024-03-20" },
    { Description: "Travel Expenses", Amount: -400, Type: "Expense", Date: "2024-03-12" },
    { Description: "Client Retainer", Amount: 2500, Type: "Income", Date: "2024-04-01" },
    { Description: "Equipment Purchase", Amount: -3000, Type: "Expense", Date: "2024-04-15" },
    { Description: "Web Hosting", Amount: -100, Type: "Expense", Date: "2024-05-01" },
    { Description: "Main Project Milestone", Amount: 15000, Type: "Income", Date: "2024-05-20" }
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);

xlsx.utils.book_append_sheet(wb, ws, "Financial Data");

const outputPath = path.resolve(__dirname, '../sample_financial_data.xlsx');
xlsx.writeFile(wb, outputPath);

console.log(`Sample Excel file created at: ${outputPath}`);
