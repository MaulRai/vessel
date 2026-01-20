'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { UserRole } from '@/lib/types/auth';

type RegistrationStep = 'email' | 'otp' | 'details';

export default function RegisterPage() {
  // Step state
  const [step, setStep] = useState<RegistrationStep>('email');

  // Form fields
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('mitra');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooperativeAgreement, setCooperativeAgreement] = useState(false);

  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>('');

  const router = useRouter();
  const { sendOTP, verifyOTP, register } = useAuth();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await sendOTP({
      email: email,
      purpose: 'registration',
    });

    setIsLoading(false);

    if (response.success && response.data) {
      setOtpExpiresAt(response.data.expires_at);
      setStep('otp');
    } else {
      setError(response.error?.message || 'Gagal mengirim OTP. Silakan coba lagi.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await verifyOTP({
      email: email,
      code: otpCode,
    });

    setIsLoading(false);

    if (response.success && response.data) {
      setOtpToken(response.data.token);
      setStep('details');
    } else {
      setError(response.error?.message || 'Kode OTP tidak valid. Silakan coba lagi.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (!cooperativeAgreement) {
      setError('Anda harus menyetujui ketentuan keanggotaan koperasi');
      return;
    }

    setIsLoading(true);

    const response = await register({
      email: email,
      username: username,
      password: password,
      confirm_password: confirmPassword,
      role: role,
      cooperative_agreement: cooperativeAgreement,
      otp_token: otpToken,
    });

    setIsLoading(false);

    if (response.success) {
      // Registrasi berhasil, redirect ke login page
      router.push('/login?registered=true');
    } else {
      setError(response.error?.message || 'Registrasi gagal. Silakan coba lagi.');
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);

    const response = await sendOTP({
      email: email,
      purpose: 'registration',
    });

    setIsLoading(false);

    if (response.success && response.data) {
      setOtpExpiresAt(response.data.expires_at);
      setOtpCode('');
      setError('');
    } else {
      setError(response.error?.message || 'Gagal mengirim ulang OTP.');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 space-x-2">
      {['email', 'otp', 'details'].map((s, index) => (
        <div key={s} className="flex items-center">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${step === s
                ? 'bg-cyan-500 text-white'
                : ['email', 'otp', 'details'].indexOf(step) > index
                  ? 'bg-cyan-500/30 text-cyan-300'
                  : 'bg-slate-700 text-slate-400'
              }`}
          >
            {index + 1}
          </div>
          {index < 2 && (
            <div
              className={`w-8 h-0.5 ${['email', 'otp', 'details'].indexOf(step) > index
                  ? 'bg-cyan-500/50'
                  : 'bg-slate-700'
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderEmailStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100 mb-2">
        Daftar sebagai Mitra/Eksportir
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Halaman ini untuk eksportir yang ingin mengajukan pendanaan. Investor dapat langsung{' '}
        <Link href="/pendana/connect" className="text-cyan-400 hover:text-cyan-300 underline">connect wallet</Link>.
      </p>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Google Sign Up Button */}
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
        Daftar dengan Google
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

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
          placeholder="nama@perusahaan.com"
          required
          disabled={isLoading}
        />
      </div>

      <p className="text-xs text-slate-400">
        Kami akan mengirim kode verifikasi ke email Anda
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-lg shadow-cyan-900/50"
      >
        {isLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
      </button>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100 mb-2">
        Verifikasi Email
      </h2>
      <p className="text-slate-400 text-sm mb-4">
        Masukkan kode 6 digit yang dikirim ke <span className="text-cyan-400">{email}</span>
      </p>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* OTP Field */}
      <div>
        <label htmlFor="otpCode" className="block text-sm font-medium text-slate-300 mb-1.5">
          Kode OTP
        </label>
        <input
          type="text"
          id="otpCode"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-3 py-2.5 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500 text-center tracking-[0.5em] font-mono text-lg"
          placeholder="000000"
          required
          maxLength={6}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-slate-400 hover:text-slate-300"
        >
          Ubah email
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading}
          className="text-cyan-400 hover:text-cyan-300 disabled:text-slate-500"
        >
          Kirim ulang kode
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || otpCode.length !== 6}
        className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-lg shadow-cyan-900/50"
      >
        {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
      </button>
    </form>
  );

  const renderDetailsStep = () => (
    <form onSubmit={handleRegister} className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-100 mb-3">
        Lengkapi Data Anda
      </h2>

      {/* Error Message */}
      {error && (
        <div className="p-2.5 bg-red-500/10 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
          placeholder="username_anda"
          required
          minLength={3}
          maxLength={50}
          disabled={isLoading}
        />
        <p className="text-xs text-slate-500 mt-1">3-50 karakter, huruf kecil, angka, dan underscore</p>
      </div>

      {/* Info: Mitra Only */}
      <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-lg">
        <p className="text-xs text-teal-200">
          <span className="font-semibold">Anda mendaftar sebagai Eksportir/Mitra.</span> Setelah registrasi, Anda dapat mengajukan pendanaan untuk invoice ekspor Anda.
        </p>
      </div>

      {/* Password Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
            placeholder="Min 8 karakter"
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1">
            Konfirmasi
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-100 text-sm placeholder:text-slate-500"
            placeholder="Ulangi password"
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Cooperative Agreement Checkbox */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="cooperativeAgreement"
          checked={cooperativeAgreement}
          onChange={(e) => setCooperativeAgreement(e.target.checked)}
          className="mt-1 w-4 h-4 bg-slate-900/50 border-slate-600 rounded text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-0"
          required
        />
        <label htmlFor="cooperativeAgreement" className="text-xs text-slate-300 leading-relaxed cursor-pointer">
          Saya setuju mendaftar menjadi Anggota Koperasi Jasa VESSEL dan tunduk pada AD/ART yang berlaku.
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-lg shadow-cyan-900/50"
      >
        {isLoading ? 'Memproses...' : 'Daftar & Lanjutkan'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[700px] bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left Column - Form */}
          <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
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

              {/* Step Indicator */}
              {renderStepIndicator()}

              {/* Form Steps */}
              {step === 'email' && renderEmailStep()}
              {step === 'otp' && renderOTPStep()}
              {step === 'details' && renderDetailsStep()}

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-slate-400 text-sm">
                  Sudah punya akun?{' '}
                  <Link
                    href="/login"
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    Masuk
                  </Link>
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-4 pt-4 border-t border-slate-700">
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
