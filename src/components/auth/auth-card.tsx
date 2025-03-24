import { ReactNode } from 'react';
import { LockIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AuthCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function AuthCard({ 
  title = "Authentication",
  description,
  children 
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-lg mx-auto p-6 sm:p-12 shadow-lg">
      <CardHeader className='mb-2'>
        <CardTitle className='flex items-center justify-center text-2xl mb-4'>
          <div className="bg-primary/10 p-3 rounded-full mr-3">
            <LockIcon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className='text-center text-lg'>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}