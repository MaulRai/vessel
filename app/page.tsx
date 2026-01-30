'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useMotionTemplate, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTime, useTransform } from 'framer-motion';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { LanguageSwitcher } from '@/lib/components/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ease = [0.16, 1, 0.3, 1];

const useReveal = (delay = 0, distance = 12) => {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  const animate = prefersReduced
    ? { opacity: 1, y: 0 }
    : inView
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: distance };

  const transition = { duration: 0.5, ease, delay };

  return { ref, animate, transition };
};

function CountUp({ target, start }: { target: number; start: boolean }) {
  const prefersReduced = useReducedMotion();
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1, bounce: 0 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    if (!start) {
      motionVal.set(0);
      return;
    }
    if (prefersReduced) {
      motionVal.set(target);
    } else {
      motionVal.set(0);
      // useSpring animates toward the latest set value
      requestAnimationFrame(() => motionVal.set(target));
    }
  }, [start, target, motionVal, prefersReduced]);

  return <motion.span>{rounded}</motion.span>;
}

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const prefersReduced = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const howRef = useRef<HTMLDivElement | null>(null);
  const securityRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [securityActive, setSecurityActive] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showGetStartedDropdown, setShowGetStartedDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const time = useTime();
  const heroHueA = useTransform(time, (t) => 185 + Math.sin(t / 450) * 14);
  const heroHueB = useTransform(time, (t) => 195 + Math.cos(t / 520) * 14);
  const heroParallax = useTransform(heroProgress, [0, 1], [0, -80]);

  const cardX = useMotionValue(0.5);
  const cardY = useMotionValue(0.5);
  const cardTiltX = useTransform(cardY, [0, 1], [8, -8]);
  const cardTiltY = useTransform(cardX, [0, 1], [-8, 8]);

  const { scrollYProgress: howProgress } = useScroll({ target: howRef, offset: ['start 80%', 'end 20%'] });

  const { scrollYProgress: featuresProgress } = useScroll({ target: featuresRef, offset: ['start end', 'end start'] });
  useMotionValueEvent(featuresProgress, 'change', (v) => {
    if (prefersReduced || !isMobile) return;
    setActiveFeature(v > 0.5 ? 1 : 0);
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowGetStartedDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statsInView = useInView(statsRef, { once: true, margin: '-10% 0px' });
  const securityInView = useInView(securityRef, { margin: '-20% 0px' });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setSecurityActive(securityInView);
  }, [securityInView]);

  const handleCardMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cardX.set(Math.min(Math.max(x, 0), 1));
    cardY.set(Math.min(Math.max(y, 0), 1));
  };

  const handleCardMouseLeave = () => {
    cardX.set(0.5);
    cardY.set(0.5);
  };

  const heroPill = useReveal(0);
  const heroTitle = useReveal(0.05);
  const heroSub = useReveal(0.1);
  const heroCta = useReveal(0.15);
  const getStats = () => [
    { value: 3, suffix: 'M+', labelKey: 'landing.totalVolume', prefix: '$' },
    { value: 500, suffix: '+', labelKey: 'landing.exporters' },
    { value: 12, suffix: '%', labelKey: 'landing.avgYield' },
    { value: 100, suffix: '%', labelKey: 'landing.onChain' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'investor') return '/pendana/dashboard';
    if (user.role === 'mitra') return '/eksportir/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-teal-500/10 via-transparent to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-size-[100px_100px]" />
      </div>

      <nav className="fixed w-full z-50 border-b border-slate-700/50 backdrop-blur-2xl bg-gradient-to-b from-slate-950/95 via-slate-950/90 to-slate-950/80 shadow-2xl shadow-black/20">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="group flex items-center space-x-2">
                <Image
                  src="/vessel-logo.png"
                  alt="VESSEL Logo"
                  width={120}
                  height={32}
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <a 
                href="#features" 
                className="relative px-4 py-2 text-slate-300 hover:text-cyan-300 transition-all duration-300 text-sm font-semibold tracking-wide group rounded-lg hover:bg-slate-800/50"
              >
                <span className="relative z-10">{t('landing.features')}</span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-teal-500/0 group-hover:from-cyan-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
              </a>
              <a 
                href="#how-it-works" 
                className="relative px-4 py-2 text-slate-300 hover:text-cyan-300 transition-all duration-300 text-sm font-semibold tracking-wide group rounded-lg hover:bg-slate-800/50"
              >
                <span className="relative z-10">{t('landing.howItWorks')}</span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-teal-500/0 group-hover:from-cyan-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
              </a>
              <a 
                href="#security" 
                className="relative px-4 py-2 text-slate-300 hover:text-cyan-300 transition-all duration-300 text-sm font-semibold tracking-wide group rounded-lg hover:bg-slate-800/50"
              >
                <span className="relative z-10">{t('landing.security')}</span>
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/0 to-teal-500/0 group-hover:from-cyan-500/10 group-hover:to-teal-500/10 transition-all duration-300" />
              </a>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {isAuthenticated ? (
                <Link
                  href={getDashboardLink()}
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl shadow-cyan-500/30 ring-1 ring-white/20 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Dashboard
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block px-5 py-2.5 text-slate-200 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50 rounded-xl transition-all duration-300 text-sm font-semibold"
                  >
                    {t('auth.login')}
                  </Link>
                  <div 
                    className="relative" 
                    ref={dropdownRef}
                    onMouseEnter={() => setShowGetStartedDropdown(true)}
                    onMouseLeave={() => setShowGetStartedDropdown(false)}
                  >
                    <button
                      onClick={() => setShowGetStartedDropdown(!showGetStartedDropdown)}
                      className="group relative px-4 sm:px-6 py-2.5 text-center bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-sm transition-all duration-300 shadow-xl shadow-cyan-500/30 ring-1 ring-white/20 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="hidden sm:inline">{t('landing.getStarted')}</span>
                        <span className="sm:hidden">{t('landing.getStartedMobile')}</span>
                        <svg className={`w-4 h-4 transition-transform duration-300 ${showGetStartedDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    </button>
                    {showGetStartedDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-1 w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-2 space-y-2">
                          <Link
                            href="/pendana/connect"
                            onClick={() => setShowGetStartedDropdown(false)}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-all group border border-transparent hover:border-blue-500/30"
                          >
                            <div className="flex-shrink-0 w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                              <Image src="/assets/general/investor.png" alt="Investor" width={48} height={48} className="w-12 h-12 object-contain" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors">{t('landing.startAsPendana')}</h4>
                              <p className="text-slate-400 text-xs leading-relaxed">{t('landing.pendanaDesc')}</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setShowGetStartedDropdown(false)}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-800/50 transition-all group border border-transparent hover:border-teal-500/30"
                          >
                            <div className="flex-shrink-0 w-16 h-16 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20">
                              <Image src="/assets/general/exporter.png" alt="Exporter" width={48} height={48} className="w-12 h-12 object-contain" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-bold mb-1 group-hover:text-teal-400 transition-colors">{t('landing.startAsExporter')}</h4>
                              <p className="text-slate-400 text-xs leading-relaxed">{t('landing.exporterDesc')}</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-600 group-hover:text-teal-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <motion.section
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center pt-20 px-4 sm:px-6 lg:px-8"
        style={{ opacity: securityActive ? 0.95 : 1 }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                {...heroPill}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-full mb-8 backdrop-blur-sm shadow-xl shadow-cyan-900/10 hover:border-cyan-500/30 transition-colors"
              >
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="text-sm text-slate-300 font-medium">{t('landing.poweredBy')}</span>
              </motion.div>

              <motion.h1
                ref={heroTitle.ref}
                initial={{ opacity: 0, y: 12 }}
                animate={heroTitle.animate}
                transition={heroTitle.transition}
                className="text-3xl md:text-6xl font-bold mb-6 leading-tight tracking-tight"
              >
                <motion.span
                  className="bg-clip-text text-transparent drop-shadow-sm bg-linear-to-r from-cyan-400 to-teal-400"
                  style={{
                    backgroundImage: useMotionTemplate`linear-gradient(90deg, hsl(${heroHueA} 80% 60%), hsl(${heroHueB} 75% 58%), hsl(${heroHueA} 70% 55%))`,
                  }}
                >
                  {t('landing.heroTitle1')}
                </motion.span>
                <br />
                <span className="text-white">{t('landing.heroTitle2')}</span>
              </motion.h1>

              <motion.p
                ref={heroSub.ref}
                initial={{ opacity: 0, y: 12 }}
                animate={heroSub.animate}
                transition={heroSub.transition}
                className="text-md md:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed border-l-0 lg:border-l-2 border-slate-800 pl-0 lg:pl-6 text-center lg:text-left"
              >
                {t('landing.heroSubtitle')}
              </motion.p>

              <motion.div
                ref={heroCta.ref}
                initial={{ opacity: 0, y: 12 }}
                animate={heroCta.animate}
                transition={heroCta.transition}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
              >
                <Link
                  href="/register"
                  className="group w-full sm:w-auto min-w-50 px-8 py-4 bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 rounded-xl font-bold text-lg transition-all shadow-xl shadow-cyan-500/20 ring-1 ring-white/20 flex items-center justify-center space-x-2"
                >
                  <span>{t('landing.startNow')}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto min-w-50 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl font-bold text-lg transition-all backdrop-blur-sm text-center text-slate-300 hover:text-white"
                >
                  {t('landing.learnMore')}
                </a>
              </motion.div>

              <motion.div
                ref={statsRef}
                initial={{ opacity: 0, y: 12 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/50"
              >
                {getStats().map((stat) => (
                  <div key={stat.labelKey} className="space-y-1">
                    <div className="text-2xl md:text-3xl font-bold text-white">
                      {stat.prefix || ''}<CountUp target={stat.value} start={statsInView} />{stat.suffix}
                    </div>
                    <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t(stat.labelKey)}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative hidden lg:block h-full min-h-150 perspective-[1400px]">
              <motion.div
                className="absolute inset-0 bg-linear-to-tr from-cyan-500/20 to-teal-500/20 rounded-full blur-[100px]"
                style={{ y: prefersReduced ? 0 : heroParallax }}
              />
              <motion.div
                initial={{ opacity: 0, y: 24, rotate: 3 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6, ease }}
                className="relative bg-slate-950/80 border border-slate-800/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md mx-auto mt-12 overflow-hidden ring-1 ring-cyan-500/10"
                style={{
                  rotateX: prefersReduced ? 0 : cardTiltX,
                  rotateY: prefersReduced ? 0 : cardTiltY,
                  transformStyle: 'preserve-3d',
                }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(45,212,191,0.06) 55%, rgba(14,165,233,0.04))',
                    opacity: 0.45,
                  }}
                />
                <motion.div
                  className="absolute -inset-px rounded-3xl opacity-60"
                  animate={{ opacity: prefersReduced ? 0.25 : [0.35, 0.55, 0.35] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    background: 'linear-gradient(145deg, rgba(34,211,238,0.1), rgba(45,212,191,0.06), rgba(15,118,110,0.04))',
                  }}
                />
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">{t('landing.currentYield')}</div>
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
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '75%' }}
                      transition={{ duration: 0.8, ease }}
                      className="h-full bg-linear-to-r from-cyan-500 to-teal-500 rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{t('landing.poolFilled')}</span>
                    <span className="text-white font-medium">75%</span>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease }}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="text-xs text-slate-400 mb-1">{t('landing.riskRating')}</div>
                    <div className="text-lg font-bold text-emerald-400">A+ (Low)</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease, delay: 0.06 }}
                    className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="text-xs text-slate-400 mb-1">{t('landing.term')}</div>
                    <div className="text-lg font-bold text-white">45 {t('common.days')}</div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="features"
        ref={featuresRef}
        className="relative z-10 py-12 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-transparent"
        style={{ opacity: securityActive ? 0.95 : 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            viewport={{ once: true, margin: '-10% 0px' }}
            className="text-center mb-8 md:sticky md:top-24"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-3">
              {t('landing.twoSides')} <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{t('landing.onePlatform')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('landing.twoSidesSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                titleKey: 'landing.forInvestor',
                color: 'cyan',
                blur: 'from-cyan-500/5',
                img: '/assets/landing/investor.png',
                bulletColor: 'cyan',
                bulletKeys: [
                  'landing.investorBullet1',
                  'landing.investorBullet2',
                  'landing.investorBullet3',
                  'landing.investorBullet4',
                ],
                descKey: 'landing.investorDesc',
                ctaKey: 'landing.connectWallet',
                href: '/pendana/connect',
              },
              {
                titleKey: 'landing.forExporter',
                color: 'teal',
                blur: 'from-teal-500/5',
                img: '/assets/landing/exporter.png',
                bulletColor: 'teal',
                bulletKeys: [
                  'landing.exporterBullet1',
                  'landing.exporterBullet2',
                  'landing.exporterBullet3',
                  'landing.exporterBullet4',
                ],
                descKey: 'landing.exporterDesc',
                ctaKey: 'landing.applyFunding',
                href: '/register',
              },
            ].map((card, idx) => {
              const active = activeFeature === idx;
              const dimClass = active ? 'opacity-100 blur-0 scale-[1.03] border-opacity-70' : 'opacity-70 blur-[1px]';
              return (
                <motion.div
                  key={card.titleKey}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: idx * 0.1 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  className={`group relative p-6 bg-linear-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-3xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl ${dimClass} ${card.color === 'cyan' ? 'hover:border-cyan-500/40 hover:shadow-cyan-900/20' : 'hover:border-teal-500/40 hover:shadow-teal-900/20'}`}
                  onMouseEnter={() => !isMobile && setActiveFeature(idx)}
                >
                  <div className={`absolute inset-0 bg-linear-to-br ${card.blur} to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} />
                  <div className="relative">
                    <motion.div
                      className={`w-16 h-16 bg-linear-to-br ${card.color === 'cyan' ? 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20' : 'from-teal-500/20 to-teal-500/5 border-teal-500/20'} border rounded-2xl flex items-center justify-center mb-4`}
                      animate={active ? { rotate: 0, y: 0, scale: 1.03 } : { rotate: 0, y: 4, scale: 1 }}
                      transition={{ duration: 0.45, ease }}
                    >
                      <Image src={card.img || "/placeholder.svg"} alt={t(card.titleKey)} width={64} height={64} className="w-12 h-12 object-contain" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2 text-white">{t(card.titleKey)}</h3>
                    <p className="text-slate-400 text-md mb-4 leading-relaxed">
                      {t(card.descKey)}
                    </p>
                    <ul className="space-y-4 mb-10">
                      {card.bulletKeys.map((key) => (
                        <li key={key} className="flex items-center space-x-3 text-slate-300">
                          <div className={`w-6 h-6 rounded-full ${card.color === 'cyan' ? 'bg-cyan-500/10' : 'bg-teal-500/10'} flex items-center justify-center shrink-0`}>
                            <svg className={`w-3.5 h-3.5 ${card.color === 'cyan' ? 'text-cyan-400' : 'text-teal-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium">{t(key)}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={card.href}
                      className={`inline-flex items-center space-x-2 font-bold tracking-wide transition-colors ${card.color === 'cyan' ? 'text-cyan-400 hover:text-cyan-300' : 'text-teal-400 hover:text-teal-300'} min-w-40`}
                    >
                      <span>{t(card.ctaKey)}</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="how-it-works"
        ref={howRef}
        className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
        style={{ opacity: securityActive ? 0.95 : 1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.5, ease }}
            className="text-center mb-8 md:mb-20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6">
              {t('landing.howItWorksTitle')} <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{t('landing.howItWorksHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('landing.howItWorksSubtitle')}
            </p>
          </motion.div>

          <div className="relative grid md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-0.5 bg-slate-800/60">
              <motion.div
                className="absolute left-0 top-0 w-full origin-top bg-linear-to-b from-cyan-400 via-teal-400 to-emerald-400"
                style={{ scaleY: howProgress }}
              />
            </div>
            {[
              {
                step: '01',
                titleKey: 'landing.step1Title',
                descKey: 'landing.step1Desc',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
              },
              {
                step: '02',
                titleKey: 'landing.step2Title',
                descKey: 'landing.step2Desc',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                ),
              },
              {
                step: '03',
                titleKey: 'landing.step3Title',
                descKey: 'landing.step3Desc',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
              },
              {
                step: '04',
                titleKey: 'landing.step4Title',
                descKey: 'landing.step4Desc',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
              },
            ].map((item, i) => {
              const faded = i < activeStep;
              return (
                <motion.div
                  key={item.step}
                  className="relative group"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ duration: 0.45, ease, delay: i * 0.08 }}
                  onViewportEnter={() => setActiveStep(i)}
                  animate={{ opacity: faded ? 0.4 : 1 }}
                >
                  <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl backdrop-blur-sm h-full transition-colors">
                    <div className="absolute top-6 right-6 text-slate-800 text-6xl font-bold opacity-40 pointer-events-none select-none">{item.step}</div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20% 0px' }}
                      transition={{ duration: 0.45, ease }}
                      className="w-14 h-14 bg-linear-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-900/20"
                    >
                      <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {item.icon}
                      </svg>
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-white relative z-10">{t(item.titleKey)}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed relative z-10">{t(item.descKey)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="security"
        ref={securityRef}
        className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:sticky lg:top-28 self-start">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.5, ease }}
                className="text-3xl md:text-5xl font-bold mb-4"
              >
                {t('landing.securityTitle')} <span className="bg-linear-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">{t('landing.securityHighlight')}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.5, ease, delay: 0.08 }}
                className="text-slate-400 text-md mb-2 leading-relaxed"
              >
                {t('landing.securitySubtitle')}
              </motion.p>
              <div className="space-y-2">
                {[
                  { titleKey: 'landing.security1Title', descKey: 'landing.security1Desc' },
                  { titleKey: 'landing.security2Title', descKey: 'landing.security2Desc' },
                  { titleKey: 'landing.security3Title', descKey: 'landing.security3Desc' },
                  { titleKey: 'landing.security4Title', descKey: 'landing.security4Desc' },
                ].map((item, i) => (
                  <motion.div
                    key={item.titleKey}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 0.45, ease, delay: i * 0.05 }}
                    className="flex items-start space-x-5 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40"
                  >
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{t(item.titleKey)}</h4>
                      <p className="text-slate-400">{t(item.descKey)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative max-w-lg mx-auto lg:mx-0 hidden md:block">
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-teal-500/10 rounded-full blur-[80px]" />
              <div className="relative p-1 bg-linear-to-br from-slate-700/50 to-slate-900/50 rounded-3xl backdrop-blur-xl">
                <div className="bg-slate-950/90 rounded-[22px] p-8">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { icon: '/assets/landing/landing-asset-1.png', label: 'E2E Encryption' },
                      { icon: '/assets/landing/landing-asset-2.png', label: 'On-Chain Verify' },
                      { icon: '/assets/landing/landing-asset-3.png', label: 'DDoS Guard' },
                      { icon: '/assets/landing/landing-asset-4.png', label: 'Immutable Logs' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-10% 0px' }}
                        transition={{ duration: 0.45, ease, delay: i * 0.08 }}
                        className="aspect-square flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-colors group"
                      >
                        <div className="flex items-center space-x-2">
                          <Image
                            src={item.icon || "/placeholder.svg"}
                            alt="VESSEL Logo"
                            width={120}
                            height={120}
                            className="h-32 w-auto object-contain"
                            priority
                          />
                        </div>
                        <div className="text-sm font-medium text-slate-300 mt-2">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        ref={ctaRef}
        className="relative z-10 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
        style={{ opacity: securityActive ? 0.95 : 1 }}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <div className="p-8 bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-colors duration-700">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            <motion.div
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-cyan-500/20 blur-[100px]"
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                {t('landing.ctaTitle')}
              </h2>
              <p className="text-slate-300 text-lg mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('landing.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/register"
                  className="relative w-full sm:w-auto rounded-xl p-0.75 bg-linear-to-r from-cyan-500 to-teal-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="block rounded-[10px] bg-white text-slate-900 px-10 py-5 font-bold text-lg transition-all duration-200 ease-out hover:bg-transparent hover:text-white min-w-60">
                    {t('landing.ctaExporter')}
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-10 py-5 bg-transparent border-2 border-slate-600 hover:border-white text-white rounded-xl font-bold text-lg transition-all hover:bg-white/5 min-w-50"
                >
                  {t('auth.login')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950 pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2">
                <Image
                  src="/vessel-logo.png"
                  alt="VESSEL Logo"
                  width={120}
                  height={32}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </div>
              <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                Platform pembiayaan ekspor terdesentralisasi pertama di Indonesia. Menjembatani modal global dengan potensi lokal.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Produk</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Untuk Investor</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Untuk Eksportir</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Protokol DeFi</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Perusahaan</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Tentang Kami</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Karier</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm text-slate-400">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
            <p>&copy; 2026 VESSEL Finance. All rights reserved.</p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <span>Kepatuhan Utama</span>
              <span>Powered by Base</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
