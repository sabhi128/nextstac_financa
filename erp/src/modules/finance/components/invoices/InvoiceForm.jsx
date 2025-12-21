import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Calculator, Save } from 'lucide-react';

const InvoiceForm = ({ onSave, onCancel, products = [] }) => {
    const [customer, setCustomer] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState([
        { id: 1, productId: '', quantity: 1, price: 0, tradeDiscount: 0 }
    ]);
    const [cashDiscount, setCashDiscount] = useState(0); // Percentage
    const [paymentTerms, setPaymentTerms] = useState('Net 30');

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        const itemTotal = (item.quantity * item.price) * (1 - (item.tradeDiscount / 100));
        return sum + itemTotal;
    }, 0);

    const cashDiscountAmount = subtotal * (cashDiscount / 100);
    const totalAmount = subtotal - cashDiscountAmount;

    useEffect(() => {
        // Set default due date based on payment terms
        const d = new Date(date);
        if (paymentTerms === 'Net 30') d.setDate(d.getDate() + 30);
        else if (paymentTerms === 'Net 15') d.setDate(d.getDate() + 15);
        else if (paymentTerms === 'Due on Receipt') d.setDate(d.getDate());
        setDueDate(d.toISOString().split('T')[0]);
    }, [date, paymentTerms]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), productId: '', quantity: 1, price: 0, tradeDiscount: 0 }]);
    };

    const handleRemoveItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updates = { [field]: value };
                if (field === 'productId') {
                    const product = products.find(p => p.id === value);
                    if (product) {
                        updates.price = product.price;
                    }
                }
                return { ...item, ...updates };
            }
            return item;
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            customer,
            date,
            dueDate,
            items,
            subtotal,
            cashDiscount,
            cashDiscountAmount,
            totalAmount,
            paymentTerms,
            status: 'Pending'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-auto">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">New Invoice</h2>
                            <p className="text-slate-500">Create a new invoice with discounts</p>
                        </div>
                        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {/* Customer & Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Customer Name</label>
                            <input
                                type="text"
                                value={customer}
                                onChange={(e) => setCustomer(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                placeholder="Enter customer..."
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Date Issued</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Payment Terms</label>
                            <select
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                            >
                                <option>Net 30</option>
                                <option>Net 15</option>
                                <option>Due on Receipt</option>
                            </select>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-12 gap-4 text-sm font-semibold text-slate-700">
                            <div className="col-span-4">Product</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Trade Disc %</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                            {items.map((item) => (
                                <div key={item.id} className="px-6 py-3 grid grid-cols-12 gap-4 items-center group hover:bg-slate-50">
                                    <div className="col-span-4">
                                        {products.length > 0 ? (
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                                                className="w-full p-1.5 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none"
                                            >
                                                <option value="">Select Product...</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Item name..."
                                                value={item.productId}
                                                onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                                                className="w-full p-1.5 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none"
                                            />
                                        )}
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value))}
                                            className="w-full text-right p-1.5 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.price}
                                            onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                                            className="w-full text-right p-1.5 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2 relative">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={item.tradeDiscount}
                                            onChange={(e) => handleItemChange(item.id, 'tradeDiscount', parseFloat(e.target.value))}
                                            className="w-full text-right p-1.5 bg-transparent border-b border-transparent focus:border-indigo-500 outline-none pr-6" // Space for % sign
                                        />
                                        <span className="absolute right-2 top-1.5 text-slate-400 text-sm">%</span>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end gap-3">
                                        <span className="font-mono font-medium">
                                            ${((item.quantity * item.price) * (1 - (item.tradeDiscount / 100))).toFixed(2)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Line Item
                            </button>
                        </div>
                    </div>

                    {/* Footer / Totals */}
                    <div className="flex flex-col md:flex-row justify-end items-end gap-6">
                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600">
                                <span className="flex items-center gap-2">
                                    Cash Discount
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={cashDiscount}
                                        onChange={(e) => setCashDiscount(parseFloat(e.target.value))}
                                        className="w-16 p-1 text-center border border-slate-200 rounded text-sm focus:border-indigo-500 outline-none"
                                        placeholder="0"
                                    />
                                    %
                                </span>
                                <span className="text-red-500">-${cashDiscountAmount.toFixed(2)}</span>
                            </div>

                            <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                                <div>
                                    <span className="text-sm font-semibold text-slate-900 block">Total Due</span>
                                    <span className="text-xs text-slate-400">Due: {dueDate}</span>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-lg border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceForm;
