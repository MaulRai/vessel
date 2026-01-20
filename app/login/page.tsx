'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';

function LoginForm() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginAsDemo } = useAuth();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registrasi berhasil! Silakan login dengan akun Anda.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const response = await login({
      email_or_username: emailOrUsername,
      password: password,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      const user = response.data.user;
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (!user.profile_completed) {
        router.push('/complete-profile');
      } else if (user.role === 'investor') {
        router.push('/pendana/dashboard');
      } else if (user.role === 'mitra') {
        router.push('/eksportir/dashboard');
      } else {
        router.push('/');
      }
    } else {
      setError(response.error?.message || 'Login gagal. Silakan coba lagi.');
    }
  };

  const handleDemoLogin = async (role: 'investor' | 'mitra') => {
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    try {
      await loginAsDemo(role);
      if (role === 'investor') {
        router.push('/pendana/dashboard');
      } else {
        router.push('/eksportir/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal masuk sebagai demo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto w-full">
      {/* Logo/Brand */}
      <div className="mb-6 flex items-center space-x-2">
        <Image
          src="/vessel-logo.png"
          alt="VESSEL Logo"
          width={120}
          height={32}
          className="h-12 w-auto object-contain"
          priority
        />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          Masuk ke Akun Mitra
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Halaman ini khusus untuk eksportir/mitra. Investor dapat langsung{' '}
          <Link href="/pendana/connect" className="text-cyan-400 hover:text-cyan-300 underline">connect wallet</Link>.
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-medium rounded-lg transition-all border border-slate-300 shadow-sm text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Masuk dengan Google
        </button>

        {/* Demo Account - Eksportir Only */}
        <button
          type="button"
          onClick={() => handleDemoLogin('mitra')}
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-teal-600/20 border border-teal-500/40 text-teal-100 hover:bg-teal-600/30 rounded-lg text-sm font-medium transition-all"
        >
          Login dengan akun demo Eksportir
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800/50 text-slate-400 text-xs">atau</span>
          </div>
        </div>

        {/* Email or Username Field */}
        <div>
          <label
            htmlFor="emailOrUsername"
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            Email atau Username
          </label>
          <input
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
            placeholder="nama@perusahaan.com atau username"
            required
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-300 mb-1.5"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
            placeholder="Masukkan password"
            required
            disabled={isLoading}
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Lupa password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-lg shadow-cyan-900/50"
        >
          {isLoading ? 'Memproses...' : 'Masuk'}
        </button>

        {/* Register Link */}
        <div className="text-center pt-2">
          <p className="text-slate-400 text-sm">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Daftar
            </Link>
          </p>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-center space-x-6 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Koneksi Aman</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Terdaftar & Berizin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="max-w-sm mx-auto w-full animate-pulse">
      <div className="mb-6">
        <div className="h-8 bg-slate-700 rounded w-40 mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-56"></div>
      </div>
      <div className="space-y-4">
        <div className="h-6 bg-slate-700 rounded w-48"></div>
        <div className="h-10 bg-slate-700 rounded"></div>
        <div className="h-10 bg-slate-700 rounded"></div>
        <div className="h-10 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[700px] bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left Column - Form */}
          <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Right Column - Image */}
          <div className="hidden md:block relative bg-gradient-to-br from-slate-800 via-cyan-900 to-teal-900">
            <div className="absolute inset-0">
              <Image
                src="/assets/auth/auth-image-4.png"
                alt="Platform pembiayaan ekspor"
                fill
                className="object-cover object-left"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
