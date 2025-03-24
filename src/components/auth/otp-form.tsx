'use client';
import { useTransition, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyIcon, MailCheckIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form';
import { Button } from '../ui/button';
import { LoadingButton } from './loading-button';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp';
import { requestOtp } from '@/app/signin/actions';

// OTP validation schema
const otpSchema = z.object({
  otp: z.string()
    .min(6, 'Verification code must be exactly 6 digits')
    .max(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only digits')
});

type OtpFormProps = {
  email: string;
  onBack: () => void;
};

export function OtpForm({ email, onBack }: OtpFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const { update: updateSession } = useSession();

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onChange',
  });

  // Handle the countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Function to handle resending OTP
  async function handleResendOtp() {
    if (countdown > 0) return;

    setIsResending(true);
    try {
      await requestOtp(email);
      toast.success('Verification Code Sent', {
        description: 'Please check your inbox for the new 6-digit code',
        duration: 5000,
        icon: <MailCheckIcon />
      });
      setCountdown(60); // Start with 60 seconds
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code';
      toast.error('Error Sending Code', {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsResending(false);
    }
  }

  // Format the countdown for display
  const formatCountdown = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  async function onSubmit(values: z.infer<typeof otpSchema>) {
    startTransition(async () => {
      try {
        const result = await signIn('otp-auth', {
          email,
          otp: values.otp,
          redirect: false,
        });

        if (result?.error) {
          const errorMessage = result.error || 'Authentication failed';
          form.setError('otp', {
            type: 'manual',
            message: errorMessage
          });
          toast.error('Verification Failed', {
            description: errorMessage,
            duration: 5000
          });
        } else {
          await updateSession();

          toast.success('Authentication Successful', {
            description: 'Redirecting to your dashboard...',
            duration: 4000
          });

          await Promise.all([
            router.refresh(),
            new Promise(resolve => setTimeout(resolve, 100))
          ]);

          router.push('/todos');
          router.refresh();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Verification failed';

        toast.error('Verification Failed', {
          description: errorMessage,
          duration: 5000
        });

        form.setError('otp', {
          type: 'manual',
          message: errorMessage
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Verification Code</p>
              <p className="text-sm text-muted-foreground">
                Enter the code sent to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    containerClassName="justify-center gap-2"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <InputOTPSlot key={index + 3} index={index + 3} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-center" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <LoadingButton
            type="submit"
            className="w-full h-11"
            isLoading={isPending}
            loadingText="Verifying..."
          >
            Verify Code
          </LoadingButton>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={onBack}
            disabled={isPending}
          >
            Use a different email address
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full text-sm"
            onClick={handleResendOtp}
            disabled={isPending || isResending || countdown > 0}
          >
            {countdown > 0 ? `Resend Code in ${formatCountdown(countdown)}` : 'Resend Code'}
          </Button>
        </div>
      </form>
    </Form>
  );
}