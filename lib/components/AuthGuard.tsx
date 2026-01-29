'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useAccount } from 'wagmi';
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
  const { isConnected } = useAccount();
  const router = useRouter();

  // Determine if user has valid access
  const isInvestorRoute = allowedRoles?.includes('investor') && allowedRoles.length === 1;
  const isMitraRoute = allowedRoles?.includes('mitra') && allowedRoles.length === 1;

  // For investor-only routes, check wallet connection
  const hasInvestorAccess = isInvestorRoute && isConnected;

  // For mitra routes or mixed routes, check traditional auth
  const hasTraditionalAccess = isAuthenticated && user;

  // Combined access check
  const hasAccess = hasInvestorAccess || hasTraditionalAccess;

  useEffect(() => {
    if (isLoading) return;

    // For investor-only routes
    if (isInvestorRoute) {
      if (!isConnected && !isAuthenticated) {
        router.push('/pendana/connect');
        return;
      }
      // If authenticating, check role if available
      if (isAuthenticated && user && user.role !== 'investor') {
        router.push('/');
        return;
      }

      // Investor is connected via wallet OR has valid session
      return;
    }

    // For mitra-only routes
    if (isMitraRoute) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }
      if (user && user.role !== 'mitra') {
        // Redirect to appropriate dashboard
        if (user.role === 'investor') {
          router.push('/pendana/dashboard');
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
        return;
      }
      return;
    }

    // For general protected routes
    if (requireAuth && !hasAccess) {
      router.push(redirectTo);
      return;
    }

    // Role-based access check for traditional auth
    if (allowedRoles && allowedRoles.length > 0 && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to dashboard based on role
        if (user.role === 'investor') {
          router.push('/pendana/dashboard');
        } else if (user.role === 'mitra') {
          router.push('/eksportir/dashboard');
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, isConnected, allowedRoles, requireAuth, redirectTo, router, isInvestorRoute, isMitraRoute, hasAccess]);

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

  // For investor routes - check wallet connection or session
  if (isInvestorRoute) {
    if (!isConnected && !isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-400">Mengalihkan ke halaman connect wallet...</p>
          </div>
        </div>
      );
    }
    // Access granted
    return <>{children}</>;
  }

  // For mitra routes - check traditional auth
  if (isMitraRoute) {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-400">Mengalihkan ke halaman login...</p>
          </div>
        </div>
      );
    }
    if (user && user.role !== 'mitra') {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-400">Mengalihkan...</p>
          </div>
        </div>
      );
    }
  }

  // General auth check
  if (requireAuth && !hasAccess) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  // Role check for traditional auth
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


