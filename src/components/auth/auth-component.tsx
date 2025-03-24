'use client';
import { useState, useTransition, Suspense, startTransition } from 'react';
import { AuthCard } from './auth-card';
import { EmailForm } from './email-form';
import { OtpForm } from './otp-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// Component to render while suspense is loading
function AuthSkeleton() {
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

// Main authentication component with improved suspense handling
export function AuthComponent() {
  const [email, setEmail] = useState<string | null>(null);
  const [stage, setStage] = useState<'email' | 'otp'>('email');
  const [isPending, startFormTransition] = useTransition();

  const handleEmailSubmit = (submittedEmail: string) => {
    // Use React 19's startTransition for smoother UI updates
    startTransition(() => {
      setEmail(submittedEmail);
      setStage('otp');
      
      // Pre-fetch relevant resources for the next step
      // This helps reduce the delay in OTP verification flow
      const img = new Image();
      img.src = '/notification.mp3'; // Prefetch audio notification if used
    });
  };

  const handleBackToEmail = () => {
    // No need for transition here as it's an immediate UI change
    setStage('email');
    toast.info('Enter a different email address');
  };

  // Determine the correct description based on current stage
  const description = stage === 'email'
    ? "Enter your email to receive a verification code"
    : "Enter the verification code sent to your email";

  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthCard description={description}>
        {stage === 'email' ? (
          <EmailForm onComplete={handleEmailSubmit} />
        ) : (
          email && <OtpForm email={email} onBack={handleBackToEmail} />
        )}
      </AuthCard>
    </Suspense>
  );
}