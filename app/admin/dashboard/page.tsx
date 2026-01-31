'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthGuard } from '@/lib/components/AuthGuard';
import { DashboardLayout } from '@/lib/components/DashboardLayout';
import { useAuth } from '@/lib/context/AuthContext';
import { adminAPI, UserListItem } from '@/lib/api/admin';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { HeaderHero } from '@/lib/components/HeaderHero';

function AdminDashboardContent() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const locale = language === 'en' ? 'en-US' : 'id-ID';
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
      label: t('admin.dashboard.quickActions.invoices.label'),
      description: t('admin.dashboard.quickActions.invoices.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'purple',
    },
    {
      href: '/admin/dashboard/pools',
      label: t('admin.dashboard.quickActions.pools.label'),
      description: t('admin.dashboard.quickActions.pools.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'cyan',
    },
    {
      href: '/admin/dashboard/mitra',
      label: t('admin.dashboard.quickActions.mitra.label'),
      description: t('admin.dashboard.quickActions.mitra.description'),
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
      investor: { label: t('admin.dashboard.roles.investor'), className: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' },
      mitra: { label: t('admin.dashboard.roles.mitra'), className: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30' },
      admin: { label: t('admin.dashboard.roles.admin'), className: 'bg-violet-500/10 text-violet-400 border border-violet-500/30' },
    };
    const c = config[role] || { label: role, className: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30' };
    return <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${c.className}`}>{c.label}</span>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <HeaderHero
          imageSrc="/assets/general/admin.png"
          title={`${t('admin.dashboard.hero.welcome')} ${user?.username || t('admin.dashboard.hero.defaultName')}`}
          subtitle={t('admin.dashboard.hero.subtitle')}
          color="violet"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-violet-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-violet-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">{t('admin.dashboard.stats.totalUsers.badge')}</span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{t('admin.dashboard.stats.totalUsers.label')}</p>
              <p className="text-3xl font-bold text-white">{loading ? '...' : (stats.totalUsers ?? 0).toLocaleString(locale)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{t('admin.dashboard.stats.investors.label')}</p>
              <p className="text-3xl font-bold text-white">{loading ? '...' : (stats.investors ?? 0).toLocaleString(locale)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-fuchsia-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-fuchsia-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+8%</span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{t('admin.dashboard.stats.mitras.label')}</p>
              <p className="text-3xl font-bold text-white">{loading ? '...' : (stats.mitras ?? 0).toLocaleString(locale)}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-emerald-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{t('admin.dashboard.stats.system.label')}</p>
              <p className="text-3xl font-bold text-emerald-400">{t('admin.dashboard.stats.system.value')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">{t('admin.dashboard.quickActions.title')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/admin/dashboard/invoices"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-violet-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-3 bg-violet-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('admin.dashboard.quickActions.invoices.label')}</h3>
                <p className="text-sm text-zinc-400">{t('admin.dashboard.quickActions.invoices.description')}</p>
                <div className="mt-4 flex items-center text-violet-400 text-sm font-medium">
                  <span>{t('admin.dashboard.quickActions.invoices.cta')}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/pools"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-3 bg-blue-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('admin.dashboard.quickActions.pools.label')}</h3>
                <p className="text-sm text-zinc-400">{t('admin.dashboard.quickActions.pools.description')}</p>
                <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                  <span>{t('admin.dashboard.quickActions.pools.cta')}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/mitra"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-fuchsia-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-3 bg-fuchsia-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('admin.dashboard.quickActions.mitra.label')}</h3>
                <p className="text-sm text-zinc-400">{t('admin.dashboard.quickActions.mitra.description')}</p>
                <div className="mt-4 flex items-center text-fuchsia-400 text-sm font-medium">
                  <span>{t('admin.dashboard.quickActions.mitra.cta')}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/dashboard/mitra/list"
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-teal-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="p-3 bg-teal-500/10 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{t('admin.dashboard.quickActions.mitraList.label')}</h3>
                <p className="text-sm text-zinc-400">{t('admin.dashboard.quickActions.mitraList.description')}</p>
                <div className="mt-4 flex items-center text-teal-400 text-sm font-medium">
                  <span>{t('admin.dashboard.quickActions.mitraList.cta')}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white">{t('admin.dashboard.recent.title')}</h2>
              <p className="text-sm text-zinc-400 mt-1">{t('admin.dashboard.recent.subtitle')}</p>
            </div>
            <Link
              href="/admin/dashboard/balance"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-sm font-medium transition-all border border-violet-500/20"
            >
              <span>{t('admin.dashboard.recent.viewAll')}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
              </div>
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 mb-4">
                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-zinc-400">{t('admin.dashboard.recent.empty')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-zinc-400 text-xs font-semibold uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-4">{t('admin.dashboard.recent.columns.user')}</th>
                    <th className="px-6 py-4">{t('admin.dashboard.recent.columns.role')}</th>
                    <th className="px-6 py-4">{t('admin.dashboard.recent.columns.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-violet-400">
                              {(u.full_name || u.username || u.email)[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{u.email}</p>
                            <p className="text-zinc-500 text-xs">{u.full_name || u.username || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.is_verified
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                        >
                          <div className={`h-1.5 w-1.5 rounded-full ${u.is_verified ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {u.is_verified ? t('admin.dashboard.recent.status.verified') : t('admin.dashboard.recent.status.pending')}
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
