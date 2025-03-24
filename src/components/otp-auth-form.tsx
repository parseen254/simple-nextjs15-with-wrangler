'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { requestOtp } from '@/app/actions';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function OtpAuthForm() {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      if (!isOtpSent) {
        await requestOtp(values.email);
        setIsOtpSent(true);
        toast.success('OTP sent to your email');
      } else {
        if (!values.otp) {
          toast.error('Please enter the OTP');
          return;
        }
        
        // Sign in using NextAuth
        const result = await signIn('otp-auth', {
          email: values.email,
          otp: values.otp,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success('Successfully authenticated!');
          router.push('/'); // Redirect to home page
          router.refresh(); // Refresh the page to update session
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Authentication</CardTitle>
        <CardDescription>
          {isOtpSent
            ? 'Enter the verification code sent to your email'
            : 'Enter your email to receive a verification code'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      disabled={isOtpSent}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isOtpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter verification code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full">
              {isOtpSent ? 'Verify' : 'Request Code'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}