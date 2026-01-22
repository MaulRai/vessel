'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useAccount, useDisconnect, useChainId, useSwitchChain, useChains } from 'wagmi';
import { Identity, Address, Avatar, Name } from '@coinbase/onchainkit/identity';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserRole } from '../types/auth';
import { base, baseSepolia } from 'wagmi/chains';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const getInvestorNavItems = (t: (key: string) => string): NavItem[] => [
  {
    href: '/pendana/dashboard',
    label: t('nav.dashboard'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/pendana/marketplace',
    label: t('nav.marketplace'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/pendana/portfolio',
    label: t('nav.portfolio'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/pendana/risk-assessment',
    label: t('nav.riskAssessment'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

const getAdminNavItems = (t: (key: string) => string): NavItem[] => [
  {
    href: '/dashboard/admin',
    label: t('nav.dashboard'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin/invoices',
    label: t('nav.invoiceReview'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin/pools',
    label: t('nav.fundingPools'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin/balance',
    label: t('nav.grantBalance'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin/users',
    label: t('nav.users'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/admin/mitra',
    label: t('nav.mitraReview'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const getMitraNavItems = (t: (key: string) => string): NavItem[] => [
  {
    href: '/eksportir/dashboard',
    label: t('nav.dashboard'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/eksportir/invoices',
    label: t('nav.invoice'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/eksportir/pendanaan',
    label: t('nav.funding'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/eksportir/company',
    label: t('nav.company'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/eksportir/profile',
    label: t('nav.profile'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const currentChain = chains.find((item) => item.id === chainId);

  const isOnBase = chainId === base.id || chainId === baseSepolia.id;

  const navItems = role === 'investor' ? getInvestorNavItems(t) : role === 'admin' ? getAdminNavItems(t) : getMitraNavItems(t);
  const roleLabel = role === 'investor' ? t('role.investor') : role === 'admin' ? t('role.admin') : t('role.exporter');
  const roleColor = role === 'investor' ? 'cyan' : role === 'admin' ? 'purple' : 'teal';
  const dashboardHref = role === 'investor' ? '/pendana/dashboard' : role === 'admin' ? '/dashboard/admin' : '/eksportir/dashboard';
  const isOnDashboard = pathname === dashboardHref;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDisconnectWallet = () => {
    disconnect();
    router.push('/pendana/connect');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 border-r border-slate-800/50 backdrop-blur-xl z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/vessel-logo.png"
              alt="VESSEL Logo"
              width={120}
              height={32}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-6 py-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-${roleColor}-500/10 border border-${roleColor}-500/20 rounded-full`}>
            <span className={`w-2 h-2 bg-${roleColor}-400 rounded-full`} />
            <span className={`text-xs font-medium text-${roleColor}-400`}>{roleLabel}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                      ? `bg-${roleColor}-500/10 text-${roleColor}-400 border border-${roleColor}-500/20`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User/Wallet Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
          {role === 'investor' ? (
            // Wallet info for investors
            <>
              <div className="flex items-center space-x-3 mb-3">
                {address ? (
                  <Identity address={address}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500">{t('dashboard.walletConnected')}</p>
                        <p className="text-sm font-mono font-medium text-cyan-400 truncate">
                          <Address className="text-cyan-300" />
                        </p>
                        {!isOnBase && (
                          <p className="text-[11px] text-amber-300 mt-0.5">{currentChain?.name || 'Jaringan lain'} • Switch ke Base untuk transaksi</p>
                        )}
                      </div>
                    </div>
                  </Identity>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">{t('dashboard.walletConnected')}</p>
                    <p className="text-sm font-mono font-medium text-cyan-400 truncate">{t('dashboard.notConnected')}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all min-w-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="font-medium">{t('dashboard.disconnect')}</span>
              </button>
            </>
          ) : (
            // User info for mitra/admin
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-linear-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-300">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all min-w-35"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">{t('auth.logout')}</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isOnDashboard && (
                <Link
                  href={dashboardHref}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all group"
                  title={t('dashboard.backToDashboard')}
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
              )}
              <h1 className="text-lg font-semibold text-slate-100">
                {navItems.find((item) => item.href === pathname)?.label || t('nav.dashboard')}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {role === 'investor' && address && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 max-w-xs">
                  <span className="text-sm font-mono text-cyan-200 truncate">
                    <Address address={address} className="truncate" />
                  </span>
                </div>
              )}

              {/* Chain notice for investors when off Base */}
              {role === 'investor' && address && !isOnBase && (
                <div className="flex items-center space-x-3 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-100 text-xs">
                  <span>Jaringan saat ini: {currentChain?.name ?? 'Unknown'}. Ganti ke Base untuk transaksi.</span>
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    disabled={isSwitching}
                    className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-md border border-amber-500/40 text-amber-50 text-[11px] font-semibold disabled:opacity-60"
                  >
                    {isSwitching ? 'Mengganti…' : 'Switch ke Base Sepolia'}
                  </button>
                </div>
              )}

              {/* Balance - only show for non-investors (mitra/admin) */}
              {role !== 'investor' && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-200">
                    Rp {(user?.balance_idr || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {/* Language Switcher */}
              <LanguageSwitcher />
              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
