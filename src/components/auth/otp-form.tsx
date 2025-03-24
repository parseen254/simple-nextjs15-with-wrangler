'use client';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { KeyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';

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
  const router = useRouter();

  const form = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onChange',
  });

  function onSubmit(values: z.infer<typeof otpSchema>) {
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
          
          toast.error(errorMessage);
        } else {
          toast.success('Authentication successful');
          
          // Using router.refresh() before redirect ensures the session is updated
          router.refresh();
          router.push('/');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Verification failed';
        
        toast.error('Authentication Error', {
          description: errorMessage
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
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                Verification Code
              </FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isPending}
                  containerClassName="justify-center gap-2"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
        </div>
      </form>
    </Form>
  );
}