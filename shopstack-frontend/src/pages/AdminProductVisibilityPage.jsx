import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  Package,
  Search,
  RefreshCw,
  AlertTriangle,
  ImageOff,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

const statusColor = (status) => {
  if (!status) return 'bg-slate-700 text-slate-300';
  switch (status) {
    case 'APPROVED': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'PENDING': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'REJECTED': return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    default: return 'bg-slate-700 text-slate-300';
  }
};

const AdminProductVisibilityPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/admin/products');
      setProducts(res.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load products.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline ml-0.5" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-0.5" />
    );
  };

  const filtered = products
    .filter((p) =>
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'category') { valA = a.category?.name; valB = b.category?.name; }
      if (sortField === 'vendor') { valA = a.vendor?.businessName; valB = b.vendor?.businessName; }
      if (typeof valA === 'string') {
        return sortDir === 'asc' ? valA?.localeCompare(valB) : valB?.localeCompare(valA);
      }
      if (typeof valA === 'number') {
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Product Catalog...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Error Loading Products</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={fetchProducts} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const approvedCount = products.filter((p) => p.approvalStatus === 'APPROVED').length;
  const pendingCount = products.filter((p) => p.approvalStatus === 'PENDING').length;
  const outOfStock = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Package className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Product List</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              All {products.length} products in PostgreSQL — including vendor-created products
            </p>
          </div>
          <button
            onClick={fetchProducts}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Total Products</p>
            <p className="text-2xl font-black text-white mt-1">{products.length}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Approved</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Pending Review</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Out of Stock</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{outOfStock}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, brand, category, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Products Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('name')}>
                  Product Name <SortIcon field="name" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('category')}>
                  Category <SortIcon field="category" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('brand')}>
                  Brand <SortIcon field="brand" />
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:text-slate-200" onClick={() => handleSort('price')}>
                  Price <SortIcon field="price" />
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:text-slate-200" onClick={() => handleSort('stockQuantity')}>
                  Stock <SortIcon field="stockQuantity" />
                </th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('vendor')}>
                  Vendor <SortIcon field="vendor" />
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 cursor-pointer hover:text-slate-200" onClick={() => handleSort('createdAt')}>
                  Created <SortIcon field="createdAt" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3">
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <ImageOff className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white max-w-[180px] truncate">{p.name}</p>
                      {p.discountPercentage > 0 && (
                        <span className="text-[10px] text-rose-400">{p.discountPercentage}% off</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.category?.name || '—'}</td>
                    <td className="py-3 px-3 text-slate-400">{p.brand || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-white">₹{Number(p.finalPrice || p.price || 0).toFixed(2)}</div>
                      {p.discountPercentage > 0 && (
                        <div className="text-[10px] text-slate-500 line-through">₹{Number(p.price || 0).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`font-bold text-sm ${
                          p.stockQuantity === 0 ? 'text-rose-400' : p.stockQuantity <= 5 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[10px] font-bold flex-shrink-0">
                          {p.vendor?.businessName?.charAt(0)}
                        </div>
                        <span className="text-slate-300 truncate max-w-[100px]">{p.vendor?.businessName || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(p.approvalStatus)}`}>
                        {p.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 text-right">
          Showing {filtered.length} of {products.length} products
        </p>
      </div>
    </div>
  );
};

export default AdminProductVisibilityPage;
