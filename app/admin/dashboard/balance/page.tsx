'use client';

import React from "react";

import { useEffect, useState } from 'react';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { adminAPI, UserListItem, GrantBalanceResponse } from '@/lib/api/admin';

function AdminBalanceContent() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.listUsers(page, 10, roleFilter, search);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.total_pages);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleGrantBalance = async () => {
    if (!selectedUser || !amount) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setMessage({ type: 'error', text: 'Jumlah tidak valid' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await adminAPI.grantBalance({
        user_id: selectedUser.id,
        amount: amountNum,
      });

      if (res.success && res.data) {
        setMessage({
          type: 'success',
          text: `Berhasil memberikan Rp ${amountNum.toLocaleString('id-ID')} ke ${selectedUser.email}. Saldo baru: Rp ${res.data.new_balance.toLocaleString('id-ID')}`,
        });
        setAmount('');
        setSelectedUser(null);
        loadUsers();
      } else {
        setMessage({ type: 'error', text: res.error?.message || 'Gagal memberikan balance' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      investor: { label: 'Investor', className: 'bg-cyan-500/10 text-cyan-400' },
      mitra: { label: 'Mitra', className: 'bg-teal-500/10 text-teal-400' },
      admin: { label: 'Admin', className: 'bg-purple-500/10 text-purple-400' },
    };
    const c = config[role] || { label: role, className: 'bg-slate-500/10 text-slate-400' };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${c.className}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-transparent border border-violet-500/20 p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Grant Balance</h1>
              <p className="text-violet-200/70 mt-1">Manage user balances and transactions</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`relative overflow-hidden rounded-2xl p-4 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Grant Form - if user selected */}
        {selectedUser && (
          <div className="relative overflow-hidden rounded-2xl bg-[rgb(15,15,15)] border border-violet-500/30 p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-violet-500/20">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Grant Balance to User</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">User</p>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                  <p className="text-sm text-slate-400">{selectedUser.full_name || selectedUser.username || '-'}</p>
                  <div className="mt-2">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Saldo Saat Ini</p>
                  <p className="text-xl font-bold text-white">
                    Rp {selectedUser.balance_idr.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">Jumlah yang Diberikan (IDR)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Contoh: 1000000"
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleGrantBalance}
                    disabled={submitting || !amount}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      submitting || !amount
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white'
                    }`}
                  >
                    {submitting ? 'Memproses...' : 'Grant Balance'}
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all"
                  >
                    Batal
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Masukkan nilai negatif untuk mengurangi saldo. Contoh: -500000
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari email, username, atau nama..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-all"
            >
              Cari
            </button>
          </form>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">Semua Role</option>
            <option value="investor">Investor</option>
            <option value="mitra">Mitra</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Tidak ada user ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Saldo</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-sm text-slate-400">{user.full_name || user.username || '-'}</p>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium">
                          Rp {user.balance_idr.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs w-fit ${
                              user.is_verified
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                          >
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs w-fit ${
                              user.profile_completed
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {user.profile_completed ? 'Profile OK' : 'Incomplete'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-medium transition-all"
                        >
                          Grant Balance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  page === 1
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Sebelumnya
              </button>
              <span className="text-sm text-slate-400">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  page === totalPages
                    ? 'text-slate-500 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminBalancePage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminBalanceContent />
    </AuthGuard>
  );
}
