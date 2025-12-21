import { faker } from '@faker-js/faker';
import { chartOfAccounts } from '../data/chartOfAccounts';

const STORAGE_KEYS = {
    EMPLOYEES: 'erp_mock_employees',
    PRODUCTS: 'erp_mock_products',
    CUSTOMERS: 'erp_mock_customers',
    VENDORS: 'erp_mock_vendors',
};

// Helper to get or seed data
const getOrSeed = (key, seedFn, count = 10) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.warn(`Failed to parse ${key}, reseeding.`);
        }
    }
    const data = Array.from({ length: count }, seedFn);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
};

export const mockDataService = {
    // Users (RBAC)
    getUsers: () => {
        const key = 'erp_mock_users';
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Auto-recovery for corrupted nested array bug
            if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
                console.warn('Detected corrupted mock user data, re-seeding...');
                localStorage.removeItem(key);
            } else {
                return parsed;
            }
        }

        const users = [
            {
                id: '1',
                name: 'Super Admin',
                email: 'admin@test.com',
                password: 'password',
                role: 'super_admin',
                avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff'
            },
            {
                id: '2',
                name: 'E-commerce Manager',
                email: 'ecom@test.com',
                password: 'password',
                role: 'ecommerce_admin',
                avatar: 'https://ui-avatars.com/api/?name=Ecom+Admin&background=10b981&color=fff'
            },
            {
                id: '3',
                name: 'Dev Admin',
                email: 'dev@test.com',
                password: 'password',
                role: 'dev_admin',
                avatar: 'https://ui-avatars.com/api/?name=Dev+Admin&background=f59e0b&color=fff'
            }
        ];

        localStorage.setItem(key, JSON.stringify(users));
        return users;
    },

    // Employees
    getEmployees: () => {
        return getOrSeed(STORAGE_KEYS.EMPLOYEES, () => ({
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            position: faker.person.jobTitle(),
            department: faker.commerce.department(),
            salary: faker.finance.amount({ min: 30000, max: 120000, dec: 0 }),
            joinDate: faker.date.past({ years: 5 }).toISOString(),
            status: faker.helpers.arrayElement(['Active', 'On Leave', 'Terminated']),
            avatar: faker.image.url(),
            phone: faker.phone.number(),
            address: faker.location.city() + ', ' + faker.location.country(),
        }), 15);
    },

    // Products
    getProducts: () => {
        return getOrSeed(STORAGE_KEYS.PRODUCTS, () => ({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            sku: faker.string.alphanumeric(8).toUpperCase(),
            category: faker.commerce.department(),
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({ min: 0, max: 500 }),
            minStock: faker.number.int({ min: 10, max: 50 }),
            supplier: faker.company.name(),
            lastUpdated: faker.date.recent().toISOString(),
        }), 20);
    },

    // Invoices
    getInvoices: () => {
        return getOrSeed('erp_mock_invoices', () => ({
            id: faker.string.uuid(),
            invoiceNumber: `INV-${faker.string.numeric(5)}`,
            customer: faker.person.fullName(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            dueDate: faker.date.soon({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
            status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
            items: faker.number.int({ min: 1, max: 5 })
        }), 15);
    },

    // Payments
    getPayments: () => {
        return getOrSeed('erp_mock_payments', () => ({
            id: faker.string.uuid(),
            paymentNumber: `PAY-${faker.string.numeric(5)}`,
            vendor: faker.company.name(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 50, max: 2000, dec: 2 })),
            method: faker.helpers.arrayElement(['Bank Transfer', 'Credit Card', 'Cash']),
            status: 'Completed'
        }), 15);
    },

    addPayment: (payment) => {
        const payments = mockDataService.getPayments();
        const newPayment = {
            id: faker.string.uuid(),
            paymentNumber: `PAY-${faker.string.numeric(5)}`,
            date: new Date().toISOString(),
            status: 'Completed',
            ...payment
        };
        payments.unshift(newPayment);
        localStorage.setItem('erp_mock_payments', JSON.stringify(payments));
        return { success: true, data: newPayment };
    },

    // Vendors
    getVendors: () => {
        return getOrSeed(STORAGE_KEYS.VENDORS, () => ({
            id: faker.string.uuid(),
            companyName: faker.company.name(),
            contactPerson: faker.person.fullName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress(),
            rating: faker.number.int({ min: 1, max: 5 }),
            status: faker.helpers.arrayElement(['Active', 'Inactive'])
        }), 8);
    },

    addVendor: (vendor) => {
        const vendors = mockDataService.getVendors();
        const newVendor = {
            id: faker.string.uuid(),
            status: 'Active',
            rating: 5,
            ...vendor
        };
        vendors.unshift(newVendor);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
        return { success: true, data: newVendor };
    },

    updateVendor: (id, updates) => {
        const vendors = mockDataService.getVendors();
        const index = vendors.findIndex(v => v.id === id);
        if (index !== -1) {
            vendors[index] = { ...vendors[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
            return { success: true, data: vendors[index] };
        }
        return { success: false, error: 'Vendor not found' };
    },

    deleteVendor: (id) => {
        const vendors = mockDataService.getVendors();
        const newVendors = vendors.filter(v => v.id !== id);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(newVendors));
        return { success: true };
    },

    // Purchase Orders
    getPurchaseOrders: () => {
        return getOrSeed('erp_mock_purchase_orders', () => ({
            id: faker.string.uuid(),
            poNumber: `PO-${faker.string.numeric(5)}`,
            vendor: faker.company.name(),
            date: faker.date.recent({ days: 45 }).toISOString(),
            expectedDate: faker.date.soon({ days: 15 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 500, max: 10000, dec: 2 })),
            status: faker.helpers.arrayElement(['Draft', 'Ordered', 'Received', 'Cancelled']),
        }), 15);
    },

    addPurchaseOrder: (order) => {
        const orders = mockDataService.getPurchaseOrders();
        const newOrder = {
            id: faker.string.uuid(),
            poNumber: `PO-${faker.string.numeric(5)}`,
            status: 'Draft',
            ...order
        };
        orders.unshift(newOrder);
        localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(orders));
        return { success: true, data: newOrder };
    },

    updatePurchaseOrder: (id, updates) => {
        const orders = mockDataService.getPurchaseOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...updates };
            localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Order not found' };
    },

    deletePurchaseOrder: (id) => {
        const orders = mockDataService.getPurchaseOrders();
        const newOrders = orders.filter(o => o.id !== id);
        localStorage.setItem('erp_mock_purchase_orders', JSON.stringify(newOrders));
        return { success: true };
    },

    // Bills
    getBills: () => {
        return getOrSeed('erp_mock_bills', () => ({
            id: faker.string.uuid(),
            billNumber: `BILL-${faker.string.numeric(5)}`,
            vendor: faker.company.name(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            dueDate: faker.date.soon({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
            status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
        }), 15);
    },

    addBill: (bill) => {
        const bills = mockDataService.getBills();
        const newBill = {
            id: faker.string.uuid(),
            billNumber: `BILL-${faker.string.numeric(5)}`,
            status: 'Pending',
            ...bill
        };
        bills.unshift(newBill);
        localStorage.setItem('erp_mock_bills', JSON.stringify(bills));
        return { success: true, data: newBill };
    },

    updateBill: (id, updates) => {
        const bills = mockDataService.getBills();
        const index = bills.findIndex(b => b.id === id);
        if (index !== -1) {
            bills[index] = { ...bills[index], ...updates };
            localStorage.setItem('erp_mock_bills', JSON.stringify(bills));
            return { success: true, data: bills[index] };
        }
        return { success: false, error: 'Bill not found' };
    },

    deleteBill: (id) => {
        const bills = mockDataService.getBills();
        const newBills = bills.filter(b => b.id !== id);
        localStorage.setItem('erp_mock_bills', JSON.stringify(newBills));
        return { success: true };
    },

    // Customers (for Sales)
    getCustomers: () => {
        return getOrSeed(STORAGE_KEYS.CUSTOMERS, () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            company: faker.company.name(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            address: faker.location.streetAddress() + ', ' + faker.location.city(),
            status: faker.helpers.arrayElement(['Active', 'Inactive', 'Lead']),
            notes: faker.lorem.paragraph(),
            totalOrders: faker.number.int({ min: 0, max: 20 }),
            lastOrderDate: faker.date.recent().toISOString()
        }), 12);
    },

    addCustomer: (customer) => {
        const customers = mockDataService.getCustomers();
        const newCustomer = {
            id: faker.string.uuid(),
            totalOrders: 0,
            lastOrderDate: null,
            status: 'Active',
            ...customer
        };
        customers.unshift(newCustomer);
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        return { success: true, data: newCustomer };
    },

    updateCustomer: (id, updates) => {
        const customers = mockDataService.getCustomers();
        const index = customers.findIndex(c => c.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
            return { success: true, data: customers[index] };
        }
        return { success: false, error: 'Customer not found' };
    },

    // Orders (Sales)
    getOrders: () => {
        return getOrSeed('erp_mock_orders', () => ({
            id: faker.string.uuid(),
            orderNumber: `ORD-${faker.string.numeric(6)}`,
            customer: faker.person.fullName(),
            date: faker.date.recent({ days: 60 }).toISOString(),
            formattedDate: faker.date.recent().toLocaleDateString(),
            amount: parseFloat(faker.finance.amount({ min: 50, max: 3000, dec: 2 })),
            status: faker.helpers.arrayElement(['Processing', 'Shipped', 'Delivered', 'Cancelled']),
            paymentStatus: faker.helpers.arrayElement(['Paid', 'Unpaid'])
        }), 20);
    },

    // Leads
    getLeads: () => {
        return getOrSeed('erp_mock_leads', () => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            company: faker.company.name(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
            source: faker.helpers.arrayElement(['Website', 'Referral', 'Social Media', 'Cold Call']),
            status: faker.helpers.arrayElement(['New', 'Contacted', 'Qualified', 'Lost']),
            value: parseFloat(faker.finance.amount({ min: 1000, max: 50000, dec: 0 }))
        }), 15);
    },

    addLead: (lead) => {
        const leads = mockDataService.getLeads();
        const newLead = {
            id: faker.string.uuid(),
            status: 'New',
            ...lead
        };
        leads.unshift(newLead);
        localStorage.setItem('erp_mock_leads', JSON.stringify(leads));
        return { success: true, data: newLead };
    },

    updateLead: (id, updates) => {
        const leads = mockDataService.getLeads();
        const index = leads.findIndex(l => l.id === id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...updates };
            localStorage.setItem('erp_mock_leads', JSON.stringify(leads));
            return { success: true, data: leads[index] };
        }
        return { success: false, error: 'Lead not found' };
    },

    deleteLead: (id) => {
        const leads = mockDataService.getLeads();
        const newLeads = leads.filter(l => l.id !== id);
        localStorage.setItem('erp_mock_leads', JSON.stringify(newLeads));
        return { success: true };
    },

    convertLead: (id) => {
        const leads = mockDataService.getLeads();
        const lead = leads.find(l => l.id === id);
        if (lead) {
            // Add to customers
            mockDataService.addCustomer({
                name: lead.name,
                company: lead.company,
                email: lead.email,
                phone: lead.phone,
                status: 'Active',
                notes: `Converted from lead. Source: ${lead.source}`
            });
            // Remove from leads
            return mockDataService.deleteLead(id);
        }
        return { success: false, error: 'Lead not found' };
    },

    // Follow-ups
    getFollowUps: () => {
        return getOrSeed('erp_mock_followups', () => ({
            id: faker.string.uuid(),
            contact: faker.person.fullName(),
            type: faker.helpers.arrayElement(['Call', 'Email', 'Meeting']),
            date: faker.date.future({ days: 14 }).toISOString(),
            status: faker.helpers.arrayElement(['Scheduled', 'Pending', 'Done']),
            notes: faker.lorem.sentence()
        }), 10);
    },

    // Files (Documents)
    getFiles: () => {
        return getOrSeed('erp_mock_files', () => ({
            id: faker.string.uuid(),
            name: faker.system.commonFileName(faker.helpers.arrayElement(['pdf', 'docx', 'xlsx', 'jpg'])),
            type: faker.system.fileType(),
            size: faker.number.int({ min: 100, max: 10000 }) + ' KB',
            uploadedBy: faker.person.fullName(),
            date: faker.date.recent().toISOString()
        }), 20);
    },

    addFile: (file) => {
        const files = mockDataService.getFiles();
        const newFile = {
            id: faker.string.uuid(),
            date: new Date().toISOString(),
            uploadedBy: 'Current User', // Mocked
            size: (Math.random() * 5000 + 500).toFixed(0) + ' KB',
            ...file
        };
        files.unshift(newFile);
        localStorage.setItem('erp_mock_files', JSON.stringify(files));
        return { success: true, data: newFile };
    },

    deleteFile: (id) => {
        const files = mockDataService.getFiles();
        const newFiles = files.filter(f => f.id !== id);
        localStorage.setItem('erp_mock_files', JSON.stringify(newFiles));
        return { success: true };
    },

    // Activity Logs
    getLogs: () => {
        return getOrSeed('erp_mock_logs', () => ({
            id: faker.string.uuid(),
            user: faker.person.fullName(),
            action: faker.helpers.arrayElement(['Created Invoice', 'Updated Employee', 'Deleted Product', 'Logged In', 'Exported Report']),
            module: faker.helpers.arrayElement(['Finance', 'HR', 'Inventory', 'Auth']),
            timestamp: faker.date.recent().toISOString(),
            ip: faker.internet.ipv4()
        }), 25);
    },

    // Attendance
    getAttendance: () => {
        return getOrSeed('erp_mock_attendance', () => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            date: faker.date.recent({ days: 14 }).toLocaleDateString(),
            checkIn: '09:00 AM',
            checkOut: '05:00 PM',
            status: faker.helpers.arrayElement(['Present', 'Absent', 'Late', 'Half Day']),
            workHours: '8h 0m'
        }), 20);
    },

    updateAttendance: (id, updates) => {
        const attendance = mockDataService.getAttendance();
        const index = attendance.findIndex(p => p.id === id);
        if (index !== -1) {
            attendance[index] = { ...attendance[index], ...updates };

            // Persist to localStorage
            const records = JSON.parse(localStorage.getItem('erp_mock_attendance'));
            if (records) {
                const storageIndex = records.findIndex(r => r.id === id);
                if (storageIndex !== -1) {
                    records[storageIndex] = { ...records[storageIndex], ...updates };
                    localStorage.setItem('erp_mock_attendance', JSON.stringify(records));
                }
            }
            return attendance[index];
        }
        return null;
    },

    addAttendance: (newRecord) => {
        const attendance = mockDataService.getAttendance();
        const record = {
            id: newRecord.id || Math.floor(Math.random() * 10000),
            workHours: '8h 0m', // Default or calculated
            ...newRecord
        };

        attendance.unshift(record);

        // Persist
        localStorage.setItem('erp_mock_attendance', JSON.stringify(attendance));
        return record;
    },

    // Salaries (Payroll)
    getSalaries: () => {
        return getOrSeed('erp_mock_salaries', () => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            paymentDate: faker.date.recent({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 3000, max: 10000, dec: 2 })),
            method: faker.helpers.arrayElement(['Bank Transfer', 'Check']),
            status: faker.helpers.arrayElement(['Paid', 'Pending'])
        }), 15);
    },

    updateSalary: (id, updates) => {
        const salaries = mockDataService.getSalaries();
        const index = salaries.findIndex(s => s.id === id);
        if (index !== -1) {
            salaries[index] = { ...salaries[index], ...updates };
            localStorage.setItem('erp_mock_salaries', JSON.stringify(salaries));
            return { success: true, data: salaries[index] };
        }
        return { success: false, error: 'Salary record not found' };
    },

    // Company Profile
    getCompanyProfile: () => {
        return getOrSeed('erp_mock_company_profile', () => ({
            id: faker.string.uuid(),
            name: 'Financa Tech Global',
            legalName: 'Financa Technologies Pvt Ltd',
            logo: faker.image.url({ width: 200, height: 200 }),
            website: 'www.financa-tech.com',
            email: 'contact@financa-tech.com',
            phone: '+1 (555) 123-4567',
            foundedYear: '2015',
            description: 'Leading provider of enterprise ERP solutions and global e-commerce development. Bridging the gap between modern tech and business efficiency.',
            taxId: 'US-EIN-98-7654321',
            registrationNumber: 'REG-2015-8899',
            vatNumber: 'EU998877665',

            // International Commerce
            currencies: ['USD', 'EUR', 'GBP', 'INR'],
            primaryLanguage: 'English',
            timeZone: 'GMT-5 (EST)',
            operatingRegions: ['North America', 'Europe', 'Asia Pacific'],

            // Dev & Tech
            type: 'Technology & Retail',
            techStack: ['React', 'Node.js', 'Python', 'AWS', 'Shopify Plus'],

            // Address
            headquarters: {
                street: '123 Innovation Drive, Tech Park',
                city: 'San Francisco',
                state: 'CA',
                country: 'USA',
                zip: '94043'
            },

            socials: {
                linkedin: 'linkedin.com/company/financa',
                github: 'github.com/financa-dev',
                twitter: '@financa_tech'
            }
        }), 1)[0]; // Return single object
    },

    // Leave Management
    getAllLeaves: () => {
        const key = 'erp_mock_all_leaves_v3'; // Increment version to clear broken data
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse leaves, regenerating.');
            }
        }

        // Generation Logic
        const employees = mockDataService.getEmployees() || [];
        if (employees.length === 0) return [];

        const leaves = [];

        // History
        employees.forEach(emp => {
            const count = faker.number.int({ min: 1, max: 5 });
            for (let i = 0; i < count; i++) {
                leaves.push({
                    id: faker.string.uuid(),
                    employeeId: emp.id,
                    employeeName: `${emp.firstName} ${emp.lastName}`,
                    type: faker.helpers.arrayElement(['Sick Leave', 'Vacation', 'Personal', 'Emergency']),
                    startDate: faker.date.past({ years: 1 }).toISOString(),
                    endDate: faker.date.past({ years: 1 }).toISOString(),
                    days: faker.number.int({ min: 1, max: 5 }),
                    reason: faker.lorem.sentence(),
                    status: faker.helpers.arrayElement(['Approved', 'Rejected']),
                    requestedOn: faker.date.past({ years: 1 }).toISOString()
                });
            }
        });

        // Pending
        for (let i = 0; i < 5; i++) {
            const emp = faker.helpers.arrayElement(employees);
            leaves.push({
                id: faker.string.uuid(),
                employeeId: emp.id,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                type: faker.helpers.arrayElement(['Sick Leave', 'Vacation', 'Personal', 'Emergency']),
                startDate: faker.date.soon({ days: 10 }).toISOString(),
                endDate: faker.date.soon({ days: 15 }).toISOString(),
                days: faker.number.int({ min: 1, max: 5 }),
                reason: faker.lorem.sentence(),
                status: 'Pending',
                requestedOn: faker.date.recent({ days: 2 }).toISOString()
            });
        }

        const sortedLeaves = leaves.sort((a, b) => new Date(b.requestedOn) - new Date(a.requestedOn));
        localStorage.setItem(key, JSON.stringify(sortedLeaves));
        return sortedLeaves;
    },

    getLeaveRequests: () => {
        // Return only pending
        const all = mockDataService.getAllLeaves();
        return all.filter(l => l.status === 'Pending');
    },

    getEmployeeLeaves: (employeeId) => {
        const all = mockDataService.getAllLeaves();
        return all.filter(l => l.employeeId === employeeId).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    },

    updateLeaveStatus: (id, status) => {
        const all = mockDataService.getAllLeaves();
        const index = all.findIndex(l => l.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], status };
            localStorage.setItem('erp_mock_all_leaves_v3', JSON.stringify(all));
            return all[index];
        }
        return null;
    },

    processPayroll: (period) => { // period is YYYY-MM
        const salaries = mockDataService.getSalaries();
        // Generate mock records for the new period
        const newRecords = Array.from({ length: 5 }).map(() => ({
            id: faker.string.uuid(),
            employeeName: faker.person.fullName(),
            paymentDate: new Date().toISOString(), // Today
            amount: parseFloat(faker.finance.amount({ min: 3000, max: 10000, dec: 2 })),
            method: 'Bank Transfer',
            status: 'Pending'
        }));

        salaries.unshift(...newRecords);
        localStorage.setItem('erp_mock_salaries', JSON.stringify(salaries));
        return newRecords;
    },

    // Salary History
    getSalaryHistory: (employeeId) => {
        const key = `erp_mock_salary_history_${employeeId || 'default'}`;
        return getOrSeed(key, () => ({
            id: faker.string.uuid(),
            employeeId: employeeId,
            amount: parseFloat(faker.finance.amount({ min: 40000, max: 90000, dec: 0 })),
            effectiveDate: faker.date.past({ years: 3 }).toISOString(),
            reason: faker.helpers.arrayElement(['Initial Offer', 'Annual Review', 'Promotion', 'Market Adjustment']),
        }), 5).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    },

    // Accounts (Finance)
    getAccounts: () => {
        return getOrSeed('erp_mock_accounts', null, 0) || (() => {
            // Initial seed if empty
            localStorage.setItem('erp_mock_accounts', JSON.stringify(chartOfAccounts));
            return chartOfAccounts;
        })();
    },

    // Transactions (Finance)
    getTransactions: () => {
        return getOrSeed('erp_mock_transactions', () => {
            const accounts = chartOfAccounts;
            const debitAccount = faker.helpers.arrayElement(accounts.filter(a => a.normalBalance === 'Debit'));
            const creditAccount = faker.helpers.arrayElement(accounts.filter(a => a.normalBalance === 'Credit'));

            return {
                id: faker.string.uuid(),
                date: faker.date.recent({ days: 90 }).toISOString(),
                description: faker.finance.transactionDescription(),
                amount: parseFloat(faker.finance.amount({ min: 100, max: 10000, dec: 2 })),
                debit_account_id: debitAccount.id,
                credit_account_id: creditAccount.id,
                debitAccount: debitAccount, // Include full object for simpler UI
                creditAccount: creditAccount
            };
        }, 50);
    },

    // Add Transaction
    addTransaction: (transaction) => {
        const transactions = mockDataService.getTransactions();
        const newTransaction = {
            id: faker.string.uuid(),
            ...transaction,
            date: transaction.date || new Date().toISOString()
        };
        transactions.unshift(newTransaction);
        localStorage.setItem('erp_mock_transactions', JSON.stringify(transactions));
        return { success: true, data: newTransaction };
    },

    // Clear all mock data
    resetData: () => {
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        const customKeys = [
            'erp_mock_accounts', 'erp_mock_files', 'erp_mock_logs', 'erp_mock_transactions',
            'erp_mock_admins', 'erp_mock_branches', 'erp_mock_departments', 'erp_mock_attendance',
            'erp_mock_salaries', 'erp_mock_leave', 'erp_mock_warehouses', 'erp_mock_stock_movements'
        ];
        customKeys.forEach(key => localStorage.removeItem(key));
        window.location.reload();
    },

    // --- Phase 2: New Modules ---

    // --- Branches ---
    getBranches: () => {
        return getOrSeed('erp_mock_branches', () => ({
            id: faker.string.uuid(),
            name: faker.location.city() + ' Branch',
            manager: faker.person.fullName(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number(),
            status: 'Active'
        }), 5);
    },

    addBranch: (branch) => {
        const branches = mockDataService.getBranches();
        const newBranch = {
            id: faker.string.uuid(),
            ...branch,
            status: 'Active'
        };
        branches.push(newBranch);
        localStorage.setItem('erp_mock_branches', JSON.stringify(branches));
        return { success: true, data: newBranch };
    },

    updateBranch: (id, updates) => {
        const branches = mockDataService.getBranches();
        const index = branches.findIndex(b => b.id === id);
        if (index !== -1) {
            branches[index] = { ...branches[index], ...updates };
            localStorage.setItem('erp_mock_branches', JSON.stringify(branches));
            return { success: true, data: branches[index] };
        }
        return { success: false, error: 'Branch not found' };
    },

    // --- Departments ---
    getDepartments: () => {
        return getOrSeed('erp_mock_departments', () => ({
            id: faker.string.uuid(),
            name: faker.commerce.department(),
            head: faker.person.fullName(),
            employeeCount: faker.number.int({ min: 5, max: 50 }),
            budget: parseFloat(faker.finance.amount({ min: 50000, max: 500000, dec: 2 }))
        }), 8);
    },

    addDepartment: (dept) => {
        const departments = mockDataService.getDepartments();
        const newDept = {
            id: faker.string.uuid(),
            ...dept,
            employeeCount: 0
        };
        departments.push(newDept);
        localStorage.setItem('erp_mock_departments', JSON.stringify(departments));
        return { success: true, data: newDept };
    },

    updateDepartment: (id, updates) => {
        const departments = mockDataService.getDepartments();
        const index = departments.findIndex(d => d.id === id);
        if (index !== -1) {
            departments[index] = { ...departments[index], ...updates };
            localStorage.setItem('erp_mock_departments', JSON.stringify(departments));
            return { success: true, data: departments[index] };
        }
        return { success: false, error: 'Department not found' };
    },

    // --- Warehouses ---
    getWarehouses: () => {
        return getOrSeed('erp_mock_warehouses', () => ({
            id: faker.string.uuid(),
            name: faker.location.city() + ' Warehouse',
            location: faker.location.streetAddress(),
            capacity: faker.number.int({ min: 1000, max: 10000 }) + ' units',
            manager: faker.person.fullName(),
            status: 'Active'
        }), 4);
    },

    addWarehouse: (warehouse) => {
        const warehouses = mockDataService.getWarehouses();
        const newWarehouse = {
            id: faker.string.uuid(),
            ...warehouse,
            status: 'Active'
        };
        warehouses.push(newWarehouse);
        localStorage.setItem('erp_mock_warehouses', JSON.stringify(warehouses));
        return { success: true, data: newWarehouse };
    },

    updateWarehouse: (id, updates) => {
        const warehouses = mockDataService.getWarehouses();
        const index = warehouses.findIndex(w => w.id === id);
        if (index !== -1) {
            warehouses[index] = { ...warehouses[index], ...updates };
            localStorage.setItem('erp_mock_warehouses', JSON.stringify(warehouses));
            return { success: true, data: warehouses[index] };
        }
        return { success: false, error: 'Warehouse not found' };
    },

    // --- Delete Helpers ---
    deleteBranch: (id) => {
        const branches = mockDataService.getBranches();
        const filtered = branches.filter(b => b.id !== id);
        if (filtered.length === branches.length) return { success: false, error: 'Not found' };
        localStorage.setItem('erp_mock_branches', JSON.stringify(filtered));
        return { success: true };
    },

    deleteDepartment: (id) => {
        const departments = mockDataService.getDepartments();
        const filtered = departments.filter(d => d.id !== id);
        if (filtered.length === departments.length) return { success: false, error: 'Not found' };
        localStorage.setItem('erp_mock_departments', JSON.stringify(departments));
        return { success: true };
    },

    deleteWarehouse: (id) => {
        const warehouses = mockDataService.getWarehouses();
        const filtered = warehouses.filter(w => w.id !== id);
        if (filtered.length === warehouses.length) return { success: false, error: 'Not found' };
        localStorage.setItem('erp_mock_warehouses', JSON.stringify(filtered));
        return { success: true };
    },

    deleteProduct: (id) => {
        const products = mockDataService.getProducts();
        const filtered = products.filter(p => p.id !== id);
        if (filtered.length === products.length) return { success: false, error: 'Not found' };
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
        return { success: true };
    },

    deleteEmployee: (id) => {
        const employees = mockDataService.getEmployees();
        const filtered = employees.filter(e => e.id !== id);
        if (filtered.length === employees.length) return { success: false, error: 'Not found' };
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
        return { success: true };
    },

    addEmployee: (employee) => {
        const employees = mockDataService.getEmployees();
        const newEmployee = {
            id: faker.string.uuid(),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.firstName + ' ' + employee.lastName)}&background=random`,
            joinDate: new Date().toISOString(),
            status: 'Active',
            ...employee
        };
        employees.unshift(newEmployee);
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
        return { success: true, data: newEmployee };
    },

    updateEmployee: (id, updates) => {
        const employees = mockDataService.getEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updates };
            // Update avatar if name changes
            if (updates.firstName || updates.lastName) {
                const fname = updates.firstName || employees[index].firstName;
                const lname = updates.lastName || employees[index].lastName;
                employees[index].avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fname + ' ' + lname)}&background=random`;
            }
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
            return { success: true, data: employees[index] };
        }
        return { success: false, error: 'Employee not found' };
    },

    deleteCustomer: (id) => {
        const customers = mockDataService.getCustomers();
        const filtered = customers.filter(c => c.id !== id);
        if (filtered.length === customers.length) return { success: false, error: 'Not found' };
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
        return { success: true };
    },

    deleteVendor: (id) => {
        const vendors = mockDataService.getVendors();
        const filtered = vendors.filter(v => v.id !== id);
        if (filtered.length === vendors.length) return { success: false, error: 'Not found' };
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(filtered));
        return { success: true };
    },

    deleteInvoice: (id) => {
        const invoices = mockDataService.getInvoices();
        const filtered = invoices.filter(i => i.id !== id);
        if (filtered.length === invoices.length) return { success: false, error: 'Not found' };
        localStorage.setItem('erp_mock_invoices', JSON.stringify(filtered));
        return { success: true };
    },

    deleteOrder: (id) => {
        const orders = mockDataService.getOrders();
        const filtered = orders.filter(o => o.id !== id);
        if (filtered.length === orders.length) return { success: false, error: 'Not found' };
        localStorage.setItem('erp_mock_orders', JSON.stringify(filtered));
        return { success: true };
    },

    updateInvoiceStatus: (id, status) => {
        const invoices = mockDataService.getInvoices();
        const index = invoices.findIndex(i => i.id === id);
        if (index !== -1) {
            invoices[index].status = status;
            localStorage.setItem('erp_mock_invoices', JSON.stringify(invoices));
            return { success: true, data: invoices[index] };
        }
        return { success: false, error: 'Not found' };
    },

    updateOrderStatus: (id, status) => {
        const orders = mockDataService.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].status = status;
            localStorage.setItem('erp_mock_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Not found' };
    },

    updateOrderPaymentStatus: (id, status) => {
        const orders = mockDataService.getOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index !== -1) {
            orders[index].paymentStatus = status;
            localStorage.setItem('erp_mock_orders', JSON.stringify(orders));
            return { success: true, data: orders[index] };
        }
        return { success: false, error: 'Not found' };
    },

    addInvoice: (invoice) => {
        const invoices = mockDataService.getInvoices();
        const newInvoice = {
            id: faker.string.uuid(),
            invoiceNumber: `INV-${faker.string.numeric(5)}`,
            date: new Date().toISOString(),
            status: 'Pending',
            ...invoice
        };
        invoices.unshift(newInvoice);
        localStorage.setItem('erp_mock_invoices', JSON.stringify(invoices));
        return { success: true, data: newInvoice };
    },

    addOrder: (order) => {
        const orders = mockDataService.getOrders();
        const newOrder = {
            id: faker.string.uuid(),
            orderNumber: `ORD-${faker.string.numeric(5)}`,
            date: new Date().toISOString(),
            status: 'Pending',
            ...order
        };
        orders.unshift(newOrder);
        localStorage.setItem('erp_mock_orders', JSON.stringify(orders));

        // Update Customer Stats
        const customers = mockDataService.getCustomers();
        const customerIndex = customers.findIndex(c => c.name.toLowerCase() === order.customer?.toLowerCase());
        if (customerIndex !== -1) {
            customers[customerIndex].totalOrders = (customers[customerIndex].totalOrders || 0) + 1;
            customers[customerIndex].lastOrderDate = newOrder.date;
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        }

        return { success: true, data: newOrder };
    },

    // Stock Movements
    getStockMovements: () => {
        return getOrSeed('erp_mock_stock_movements', () => ({
            id: faker.string.uuid(),
            productName: faker.commerce.productName(),
            type: faker.helpers.arrayElement(['In', 'Out']),
            quantity: faker.number.int({ min: 10, max: 500 }),
            warehouse: faker.location.city() + ' Warehouse',
            date: faker.date.recent({ days: 10 }).toISOString(),
            reference: 'REF-' + faker.string.alphanumeric(6).toUpperCase()
        }), 30);
    },

    // Admin Management (RBAC)
    getAdmins: () => {
        const stored = localStorage.getItem('erp_mock_admins');
        if (stored) return JSON.parse(stored);

        const initialAdmins = [
            {
                id: '1',
                name: 'Super Admin',
                email: 'admin@example.com',
                role: 'super_admin',
                password: 'password', // For demo purposes only
                status: 'Active',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('erp_mock_admins', JSON.stringify(initialAdmins));
        return initialAdmins;
    },

    addAdmin: (admin) => {
        const admins = mockDataService.getAdmins();

        // Role Limits
        const LIMITS = {
            'ecommerce_admin': 5,
            'dev_admin': 5
        };

        const currentCount = admins.filter(a => a.role === admin.role).length;
        if (LIMITS[admin.role] && currentCount >= LIMITS[admin.role]) {
            return { success: false, error: `Limit reached for ${admin.role}. Max allowed: ${LIMITS[admin.role]}` };
        }

        const newAdmin = {
            id: faker.string.uuid(),
            ...admin,
            password: 'password', // Default password for new users
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        admins.push(newAdmin);
        localStorage.setItem('erp_mock_admins', JSON.stringify(admins));
        return { success: true, data: newAdmin };
    },

    // --- Finance / Accounting ---
    getReturns: () => {
        return getOrSeed('erp_mock_returns', () => ({
            id: faker.string.uuid(),
            returnNumber: `RET-${faker.string.numeric(5)}`,
            referenceInvoice: `INV-${faker.string.numeric(5)}`,
            entityName: faker.company.name(), // Customer or Vendor
            type: faker.helpers.arrayElement(['Credit Note', 'Debit Note']), // Credit = Sales Return, Debit = Purchase Return
            date: faker.date.recent({ days: 30 }).toISOString(),
            amount: parseFloat(faker.finance.amount({ min: 50, max: 1000, dec: 2 })),
            status: faker.helpers.arrayElement(['Approved', 'Pending', 'Processed']),
            reason: faker.helpers.arrayElement(['Damaged Goods', 'Incorrect Item', 'Overcharged'])
        }), 8);
    },

    addReturn: (returnData) => {
        const returns = mockDataService.getReturns();
        const newReturn = {
            id: faker.string.uuid(),
            returnNumber: `RET-${faker.string.numeric(5)}`,
            date: new Date().toISOString(),
            status: 'Pending',
            ...returnData
        };
        returns.unshift(newReturn);
        localStorage.setItem('erp_mock_returns', JSON.stringify(returns));
        return { success: true, data: newReturn };
    },

    updateReturnStatus: (id, status) => {
        const returns = mockDataService.getReturns();
        const index = returns.findIndex(r => r.id === id);
        if (index !== -1) {
            returns[index].status = status;
            localStorage.setItem('erp_mock_returns', JSON.stringify(returns));
            return { success: true, data: returns[index] };
        }
        return { success: false, message: 'Return not found' };
    },

    getAccounts: () => {
        // Return static chart of accounts or from local storage if editable
        return chartOfAccounts;
    },

    getTransactions: () => {
        return getOrSeed('erp_mock_journal_entries', () => {
            // Seed with some initial data using random accounts
            const account = faker.helpers.arrayElement(chartOfAccounts);
            const offsetAccount = faker.helpers.arrayElement(chartOfAccounts.filter(a => a.id !== account.id));

            return {
                id: faker.string.uuid(),
                date: faker.date.recent({ days: 60 }).toISOString(),
                description: faker.finance.transactionDescription(),
                debit_account_id: account.id,
                credit_account_id: offsetAccount.id,
                debitAccount: account,
                creditAccount: offsetAccount,
                amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 }))
            };
        }, 15);
    },

    addTransaction: (transaction) => {
        const transactions = mockDataService.getTransactions();
        const newTransaction = {
            id: faker.string.uuid(),
            ...transaction
        };
        transactions.unshift(newTransaction);
        localStorage.setItem('erp_mock_journal_entries', JSON.stringify(transactions));
        return { success: true, data: newTransaction };
    },

    deleteAdmin: (id) => {
        const admins = mockDataService.getAdmins();
        const filtered = admins.filter(a => a.id !== id);
        if (filtered.length === admins.length) return { success: false, error: 'Admin not found' };

        localStorage.setItem('erp_mock_admins', JSON.stringify(filtered));
        return { success: true };
    },

    updateAdmin: (id, updates) => {
        const admins = mockDataService.getAdmins();
        const index = admins.findIndex(a => a.id === id);
        if (index !== -1) {
            admins[index] = { ...admins[index], ...updates };
            localStorage.setItem('erp_mock_admins', JSON.stringify(admins));
            return { success: true, data: admins[index] };
        }
        return { success: false, error: 'Admin not found' };
    },

    // Compensation Config
    getCompensationConfig: () => {
        const stored = localStorage.getItem('erp_mock_compensation_config');
        if (stored) return JSON.parse(stored);

        const initial = { basePool: 50000 }; // Default base pool
        localStorage.setItem('erp_mock_compensation_config', JSON.stringify(initial));
        return initial;
    },

    updateCompensationConfig: (updates) => {
        const current = mockDataService.getCompensationConfig();
        const updated = { ...current, ...updates };
        localStorage.setItem('erp_mock_compensation_config', JSON.stringify(updated));
        return updated;
    },

    // --- Phase 2: New Modules ---
};
