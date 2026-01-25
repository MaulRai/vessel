'use client';

import React from "react"

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useAccount, useDisconnect, useChainId, useSwitchChain, useChains } from 'wagmi';
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
    href: '/admin/dashboard',
    label: t('nav.dashboard'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/invoices',
    label: t('nav.invoiceReview'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/pools',
    label: t('nav.fundingPools'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/balance',
    label: t('nav.grantBalance'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/users',
    label: t('nav.users'),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/mitra',
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
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  const isOnBase = chainId === base.id || chainId === baseSepolia.id;

  const navItems = role === 'investor' ? getInvestorNavItems(t) : role === 'admin' ? getAdminNavItems(t) : getMitraNavItems(t);
  const roleLabel = role === 'investor' ? t('roles.investor') : role === 'admin' ? t('roles.admin') : t('roles.exporter');
  const roleColor = role === 'investor' ? 'cyan' : role === 'admin' ? 'purple' : 'teal';
  const dashboardHref = role === 'investor' ? '/pendana/dashboard' : role === 'admin' ? '/admin/dashboard' : '/eksportir/dashboard';
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
      <aside className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-r border-slate-700/50 backdrop-blur-2xl z-40 shadow-2xl shadow-black/20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        
        {/* Logo */}
        <div className="relative h-20 flex items-center px-6 border-b border-slate-700/50 bg-slate-900/50">
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/vessel-logo.png"
              alt="VESSEL Logo"
              width={120}
              height={32}
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="relative px-6 py-5">
          <div className={`inline-flex items-center space-x-2.5 px-4 py-2 bg-gradient-to-r ${roleColor === 'cyan' ? 'from-cyan-500/15 to-cyan-600/10' : roleColor === 'purple' ? 'from-purple-500/15 to-purple-600/10' : 'from-teal-500/15 to-teal-600/10'} border ${roleColor === 'cyan' ? 'border-cyan-400/30' : roleColor === 'purple' ? 'border-purple-400/30' : 'border-teal-400/30'} rounded-xl backdrop-blur-sm shadow-lg ${roleColor === 'cyan' ? 'shadow-cyan-500/10' : roleColor === 'purple' ? 'shadow-purple-500/10' : 'shadow-teal-500/10'}`}>
            <span className={`w-2.5 h-2.5 ${roleColor === 'cyan' ? 'bg-cyan-400' : roleColor === 'purple' ? 'bg-purple-400' : 'bg-teal-400'} rounded-full animate-pulse shadow-lg ${roleColor === 'cyan' ? 'shadow-cyan-400/50' : roleColor === 'purple' ? 'shadow-purple-400/50' : 'shadow-teal-400/50'}`} />
            <span className={`text-xs font-semibold tracking-wide uppercase ${roleColor === 'cyan' ? 'text-cyan-300' : roleColor === 'purple' ? 'text-purple-300' : 'text-teal-300'}`}>{roleLabel}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative px-4 py-2">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${roleColor === 'cyan' ? 'from-cyan-500/20 to-cyan-600/10' : roleColor === 'purple' ? 'from-purple-500/20 to-purple-600/10' : 'from-teal-500/20 to-teal-600/10'} ${roleColor === 'cyan' ? 'text-cyan-300' : roleColor === 'purple' ? 'text-purple-300' : 'text-teal-300'} border ${roleColor === 'cyan' ? 'border-cyan-400/30' : roleColor === 'purple' ? 'border-purple-400/30' : 'border-teal-400/30'} shadow-lg ${roleColor === 'cyan' ? 'shadow-cyan-500/10' : roleColor === 'purple' ? 'shadow-purple-500/10' : 'shadow-teal-500/10'}`
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${roleColor === 'cyan' ? 'bg-cyan-400' : roleColor === 'purple' ? 'bg-purple-400' : 'bg-teal-400'} rounded-r-full shadow-lg ${roleColor === 'cyan' ? 'shadow-cyan-400/50' : roleColor === 'purple' ? 'shadow-purple-400/50' : 'shadow-teal-400/50'}`} />
                    )}
                    <span className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm tracking-wide">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User/Wallet Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-slate-700/50 bg-gradient-to-t from-slate-950/80 to-transparent backdrop-blur-sm">
          {role === 'investor' ? (
            // Wallet info for investors
            <>
              <div className="mb-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                {address ? (
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500/30 to-teal-500/30 ring-2 ring-cyan-500/30 flex items-center justify-center text-sm font-semibold text-slate-900">
                        {address.slice(2, 4).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-400/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium mb-0.5">{t('common.walletConnected')}</p>
                      <p className="text-sm font-mono font-semibold text-cyan-300 truncate">{shortAddress}</p>
                      {!isOnBase && (
                        <p className="text-[10px] text-amber-300 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                          {currentChain?.name || 'Jaringan lain'}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium">{t('common.walletConnected')}</p>
                      <p className="text-sm font-medium text-slate-500">{t('common.walletNotConnected')}</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleDisconnectWallet}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-slate-300 hover:text-red-300 bg-slate-800/40 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/30 rounded-xl transition-all duration-300 font-medium text-sm group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>{t('nav.disconnectWallet')}</span>
              </button>
            </>
          ) : (
            // User info for mitra/admin
            <>
              <div className="mb-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-600/50 shadow-lg">
                      <span className="text-base font-bold text-slate-100">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-400/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{user?.username || 'User'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-slate-300 hover:text-red-300 bg-slate-800/40 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/30 rounded-xl transition-all duration-300 font-medium text-sm group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{t('auth.logout')}</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-72">
        {/* Top Bar */}
        <header className="h-20 bg-gradient-to-r from-slate-900/50 via-slate-900/40 to-slate-900/50 border-b border-slate-700/50 backdrop-blur-2xl sticky top-0 z-30 shadow-xl shadow-black/10">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {!isOnDashboard && (
                <Link
                  href={dashboardHref}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 rounded-xl transition-all duration-300 group"
                  title={t('dashboard.backToDashboard')}
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-50 tracking-tight">
                  {navItems.find((item) => item.href === pathname)?.label || t('nav.dashboard')}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {role === 'investor' && address && (
                <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm shadow-lg max-w-xs">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span className="text-sm font-mono font-semibold text-cyan-300 truncate">{shortAddress}</span>
                </div>
              )}

              {/* Chain notice for investors when off Base */}
              {role === 'investor' && address && !isOnBase && (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/40 rounded-xl text-amber-100 text-xs backdrop-blur-sm shadow-lg shadow-amber-500/10">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{currentChain?.name ?? 'Unknown'}</span>
                  </div>
                  <button
                    onClick={() => switchChain({ chainId: baseSepolia.id })}
                    disabled={isSwitching}
                    className="px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 rounded-lg border border-amber-400/40 text-amber-50 text-[11px] font-bold disabled:opacity-50 transition-all duration-200"
                  >
                    {isSwitching ? 'Switching...' : 'Switch to Base'}
                  </button>
                </div>
              )}

              {/* Balance - only show for non-investors (mitra/admin) */}
              {role !== 'investor' && (
                <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500/15 to-teal-500/10 rounded-xl border border-cyan-400/30 backdrop-blur-sm shadow-lg shadow-cyan-500/10">
                  <div className="w-9 h-9 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-cyan-300 font-medium uppercase tracking-wider">Balance</p>
                    <p className="text-sm font-bold text-cyan-100">
                      Rp {(user?.balance_idr || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* Notifications */}
              <button className="relative p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 rounded-xl transition-all duration-300 group">
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-slate-900 shadow-lg shadow-cyan-400/50 animate-pulse" />
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
