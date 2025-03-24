'use client';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MailIcon } from 'lucide-react';
import { toast } from 'sonner';

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
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
        toast.success('Verification code sent', {
          description: 'Please check your email for the 6-digit code'
        });
        onComplete(values.email);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
        
        toast.error('Error', {
          description: errorMessage
        });
        
        // Set specific field errors for better UX
        if (errorMessage.toLowerCase().includes('email')) {
          form.setError('email', { type: 'manual', message: errorMessage });
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email"
                  disabled={isPending}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton 
          type="submit" 
          className="w-full h-11"
          isLoading={isPending}
          loadingText="Sending..."
        >
          Request Code
        </LoadingButton>
      </form>
    </Form>
  );
}