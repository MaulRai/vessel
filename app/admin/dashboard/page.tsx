'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { useAuth } from '@/lib/context/AuthContext';
import { adminAPI, UserListItem } from '@/lib/api/admin';

function AdminDashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    investors: 0,
    mitras: 0,
    admins: 0,
  });
  const [recentUsers, setRecentUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all users to get stats
        const [allRes, investorRes, mitraRes] = await Promise.all([
          adminAPI.listUsers(1, 5, '', ''),
          adminAPI.listUsers(1, 1, 'investor', ''),
          adminAPI.listUsers(1, 1, 'mitra', ''),
        ]);

        if (allRes.success && allRes.data) {
          setRecentUsers(allRes.data.users || []);
          setStats((prev) => ({ ...prev, totalUsers: allRes.data!.total }));
        }
        if (investorRes.success && investorRes.data) {
          setStats((prev) => ({ ...prev, investors: investorRes.data!.total }));
        }
        if (mitraRes.success && mitraRes.data) {
          setStats((prev) => ({ ...prev, mitras: mitraRes.data!.total }));
        }
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const quickActions = [
    {
      href: '/admin/dashboard/invoices',
      label: 'Invoice Review',
      description: 'Review permohonan invoice',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      href: '/admin/dashboard/pools',
      label: 'Funding Pools',
      description: 'Kelola pool pendanaan',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'cyan',
    },
    {
      href: '/admin/dashboard/mitra',
      label: 'Mitra Review',
      description: 'Review aplikasi mitra',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'teal',
    },
  ];

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
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Selamat datang, {user?.username || 'Admin'}!
          </h1>
          <p className="text-slate-400 mt-1">Panel administrasi VESSEL</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Total Users</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? '-' : stats.totalUsers}</p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Investor</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? '-' : stats.investors}</p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Mitra</p>
            <p className="text-2xl font-bold text-white mt-1">{loading ? '-' : stats.mitras}</p>
          </div>

          <div className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Status</p>
            <p className="text-2xl font-bold text-green-400 mt-1">Active</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:border-${action.color}-500/30 hover:bg-${action.color}-500/5 transition-all group`}
            >
              <div className={`p-2 bg-${action.color}-500/10 rounded-lg text-${action.color}-400 w-fit mb-3`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-white group-hover:text-white">{action.label}</h3>
              <p className="text-sm text-slate-400 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Users */}
        <div className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">User Terbaru</h2>
            <Link
              href="/admin/dashboard/balance"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              Lihat Semua
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Belum ada user</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-sm border-b border-slate-700/50">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Saldo</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="text-sm">
                      <td className="py-3">
                        <p className="text-white font-medium">{u.email}</p>
                        <p className="text-slate-400 text-xs">{u.full_name || u.username || '-'}</p>
                      </td>
                      <td className="py-3">{getRoleBadge(u.role)}</td>
                      <td className="py-3 text-slate-300">Rp {u.balance_idr.toLocaleString('id-ID')}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${u.is_verified
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                            }`}
                        >
                          {u.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <AdminDashboardContent />
    </AuthGuard>
  );
}
