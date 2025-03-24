'use client';
import { Suspense, useEffect } from 'react';
import { AuthComponent } from './auth/auth-component';
import { AuthCard } from './auth/auth-card';
import { AuthErrorBoundary } from './auth/auth-error-boundary';
import { Skeleton } from './ui/skeleton';
import { useRouter } from 'next/navigation';

// Skeleton component for the auth form loading state
function AuthFormSkeleton() {
  return (
    <AuthCard description="Loading authentication...">
      <div className="space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </AuthCard>
  );
}

// Optimized OtpAuthForm using Suspense and Error Boundaries
export function OtpAuthForm() {
  const router = useRouter();

  // Pre-fetch the home page to speed up navigation after authentication
  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  return (
    <AuthErrorBoundary>
      <Suspense fallback={<AuthFormSkeleton />}>
        <AuthComponent />
      </Suspense>
    </AuthErrorBoundary>
  );
}