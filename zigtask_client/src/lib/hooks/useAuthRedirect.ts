'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuthRedirect(redirectTo: string = '/login') {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || !token) {
      router.push(redirectTo);
    }
  }, [user, token, router, redirectTo]);

  return { user, token, isAuthenticated: !!(user && token) };
}

export function useGuestRedirect(redirectTo: string = '/dashboard') {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && token) {
      router.push(redirectTo);
    }
  }, [user, token, router, redirectTo]);

  return { user, token, isAuthenticated: !!(user && token) };
}
