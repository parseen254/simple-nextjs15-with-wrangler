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
  const [isPending, startTransition] = useTransition();

  const handleEmailSubmit = (submittedEmail: string) => {
    startTransition(() => {
      setEmail(submittedEmail);
      setStage('otp');
    });
  };

  const handleBackToEmail = () => {
    setStage('email');
    setEmail(null);
    toast.info('Back to Email', {
      description: 'Enter a different email address',
      duration: 4000,
    });
  };

  const description = stage === 'email'
    ? "Sign in or create an account to continue"
    : "We've sent you a verification code";

  return (
    <Suspense fallback={<AuthSkeleton />}>
      <AuthCard 
        description={description}
        onBack={stage === 'otp' ? handleBackToEmail : undefined}
      >
        {stage === 'email' ? (
          <EmailForm onComplete={handleEmailSubmit} />
        ) : (
          email && <OtpForm email={email} onBack={handleBackToEmail} />
        )}
      </AuthCard>
    </Suspense>
  );
}