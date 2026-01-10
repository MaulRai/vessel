'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Jika memerlukan autentikasi tapi user belum login
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Jika ada pembatasan role dan user tidak memiliki role yang diizinkan
    if (allowedRoles && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect ke dashboard sesuai role
        if (user.role === 'investor') {
          router.push('/pendana/dashboard');
        } else if (user.role === 'mitra') {
          router.push('/eksportir/dashboard');
        } else if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, requireAuth, redirectTo, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Belum login tapi memerlukan autentikasi
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  // Role tidak diizinkan
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400">Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher Order Component untuk protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    allowedRoles?: UserRole[];
    redirectTo?: string;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <AuthGuard
        allowedRoles={options?.allowedRoles}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </AuthGuard>
    );
  };
}
