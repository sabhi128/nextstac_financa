import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    AlertTriangle,
    Trash2
} from 'lucide-react';


export default function ProductList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: mockDataService.getProducts,
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteProduct(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
        }
    });

    // Derive unique categories from products
    const categories = ['All', ...new Set(products?.map(p => p.category) || [])];

    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) return <div className="p-8 text-center">Loading products...</div>;

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Products</h2>
                        <p className="text-slate-500 text-sm">Manage inventory items and stock levels</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-medium transition-all ${categoryFilter !== 'All'
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {categoryFilter === 'All' ? 'Category' : categoryFilter}
                        </button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {categories.map((category) => (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    setCategoryFilter(category);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${categoryFilter === category
                                                    ? 'bg-indigo-50 text-indigo-700'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {category}
                                                {categoryFilter === category && (
                                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Table View */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Product Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">SKU</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Price</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-center">Stock</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts?.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-slate-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{product.sku}</td>
                                        <td className="px-6 py-4 text-slate-600">{product.category}</td>
                                        <td className="px-6 py-4 text-slate-900 font-semibold text-right">${product.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${product.stock < product.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock < product.minStock ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Are you sure you want to delete this product?')) {
                                                            deleteProductMutation.mutate(product.id);
                                                        }
                                                    }}
                                                    className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProducts?.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No products found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
