'use client';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MailCheckIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { LoadingButton } from './loading-button';
import { requestOtp } from '@/app/signin/actions';

// Email validation schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormProps = {
  onComplete: (email: string) => void;
};

export function EmailForm({ onComplete }: EmailFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  function onSubmit(values: z.infer<typeof emailSchema>) {
    startTransition(async () => {
      try {
        await requestOtp(values.email);
        toast.success('Verification Code Sent', {
          description: 'Please check your inbox for the 6-digit code',
          duration: 5000,
          icon: <MailCheckIcon />
        });
        onComplete(values.email);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';

        toast.error('Error Sending Code', {
          description: errorMessage,
          duration: 5000
        });

        if (errorMessage.toLowerCase().includes('email')) {
          form.setError('email', {
            type: 'manual',
            message: errorMessage
          });
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Sign In or Sign Up</p>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a verification code
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="name@example.com"
                    disabled={isPending}
                    className="h-11"
                    autoFocus
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LoadingButton
          type="submit"
          className="w-full h-11"
          isLoading={isPending}
          loadingText="Sending..."
        >
          Continue with Email
        </LoadingButton>
      </form>
    </Form>
  );
}