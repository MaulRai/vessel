'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'investor') return '/dashboard/investor';
    if (user.role === 'mitra') return '/dashboard/mitra';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      <nav className="fixed w-full z-50 border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
                <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                VESSEL
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide">How It Works</a>
              <a href="#security" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide">Security</a>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  href={getDashboardLink()}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 ring-1 ring-white/10"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 ring-1 ring-white/10"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex items-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full mb-8 backdrop-blur-sm shadow-xl shadow-cyan-900/10 hover:border-cyan-500/30 transition-colors">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="text-sm text-slate-300 font-medium">Powered by Lisk Blockchain</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                <span className="text-white">Decentralized</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                  Export Financing
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed border-l-0 lg:border-l-2 border-slate-800 pl-0 lg:pl-6 text-center lg:text-left">
                Indonesia&apos;s first Web3 platform connecting exporters with global investors.
                Full on-chain transparency, smart contract security, and competitive returns.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-16">
                <Link
                  href="/register"
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-lg transition-all shadow-xl shadow-cyan-500/20 ring-1 ring-white/20 flex items-center justify-center space-x-2"
                >
                  <span>Start Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl font-bold text-lg transition-all backdrop-blur-sm text-center text-slate-300 hover:text-white"
                >
                  Learn More
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/50">
                {[
                  { value: '$3M+', label: 'Total Volume' },
                  { value: '500+', label: 'Exporters' },
                  { value: '12%', label: 'Avg. Return' },
                  { value: '100%', label: 'On-Chain' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block h-full min-h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 rounded-full blur-[100px] animate-pulse" />
              <div className="relative bg-slate-900/80 border border-slate-800/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto mt-12">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Current Yield</div>
                    <div className="text-3xl font-bold text-cyan-400">12.5% APY</div>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Pool Filled</span>
                    <span className="text-white font-medium">75%</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Risk Rating</div>
                    <div className="text-lg font-bold text-emerald-400">A+ (Low)</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Term</div>
                    <div className="text-lg font-bold text-white">45 Days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Two Sides, <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">One Platform</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Whether you are an exporter needing working capital or an investor seeking yields, VESSEL is built for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="group relative p-10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm hover:border-cyan-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">For Investors</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Invest in verified export invoices with annual returns up to 15%. Direct access to real-world asset (RWA) yields.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Choose tranches matching your risk profile',
                    'Automated portfolio diversification',
                    'Real-time on-chain transparency',
                    'Flexible withdrawal options',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-bold tracking-wide transition-colors"
                >
                  <span>Start Investing</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative p-10 bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm hover:border-teal-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold mb-4 text-white">For Exporters</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                  Get fast working capital by collateralizing your export invoices. Quick approval, competitive rates, no extra collateral.
                </p>
                <ul className="space-y-4 mb-10">
                  {[
                    'Funding disbursement within 48 hours',
                    'Invoices tokenized as NFTs',
                    'Rates starting from 8% p.a.',
                    'No additional collateral required',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center space-x-3 text-slate-300">
                      <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-2 text-teal-400 hover:text-teal-300 font-bold tracking-wide transition-colors"
                >
                  <span>Apply for Funding</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              How It <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Simple process powered by blockchain technology for maximum efficiency and trust.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Verification',
                desc: 'Exporters register and undergo strict identity and document verification.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
              },
              {
                step: '02',
                title: 'Tokenization',
                desc: 'Invoices are validated and tokenized as NFTs on the Lisk blockchain.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                ),
              },
              {
                step: '03',
                title: 'Funding',
                desc: 'Investors select pools and tranches that match their investment goals.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
              },
              {
                step: '04',
                title: 'Distribution',
                desc: 'Funds are disbursed to exporters, and returns are automatically distributed.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-sm h-full hover:bg-slate-800/50 transition-colors">
                  <div className="absolute top-6 right-6 text-slate-800 text-6xl font-bold opacity-50 group-hover:text-cyan-900/50 transition-colors pointer-events-none select-none">{item.step}</div>
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/20">
                    <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white relative z-10">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8">
                Enterprise-Grade <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Security</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Built on the Lisk blockchain with audited smart contracts,
                providing security and transparency that traditional finance can&apos;t match.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Smart Contract Audited', desc: 'Code audited by top-tier security firms.' },
                  { title: 'Multi-Signature Wallets', desc: 'Funds secured by multi-sig mechanisms.' },
                  { title: 'Regulatory Compliance', desc: 'Verified users compliant with local regulations.' },
                  { title: 'RWA Backing', desc: 'Every investment backed by real invoice assets.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-5 p-4 rounded-xl hover:bg-slate-800/30 transition-colors">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-full blur-[80px]" />
              <div className="relative p-1 bg-gradient-to-br from-slate-700/50 to-slate-900/50 rounded-3xl backdrop-blur-xl">
                <div className="bg-slate-950/90 rounded-[22px] p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: '🔒', label: 'E2E Encryption' },
                      { icon: '⛓️', label: 'On-Chain Verify' },
                      { icon: '🛡️', label: 'DDoS Guard' },
                      { icon: '📝', label: 'Immutable Logs' },
                    ].map((item, i) => (
                      <div key={i} className="aspect-square flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-colors group">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <div className="text-sm font-medium text-slate-300">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-500/20 blur-[100px] group-hover:bg-cyan-500/30 transition-colors duration-700" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-slate-300 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of exporters and investors leveraging the power of blockchain for trade finance.
                Experience the future of financing today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 hover:bg-cyan-50 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-slate-600 hover:border-white text-white rounded-xl font-bold text-lg transition-all hover:bg-white/5"
                >
                  Login to Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">VESSEL</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Indonesia&apos;s first decentralized export financing platform. Bridging the gap between global capital and local potential.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Products</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">For Investors</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">For Exporters</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">DeFi Protocol</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <p>&copy; 2024 VESSEL Finance. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span>Compliance First</span>
              <span>Powered by Lisk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
