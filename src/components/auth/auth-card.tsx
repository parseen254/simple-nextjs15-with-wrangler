import { ReactNode } from 'react';
import { ArrowLeft, LockIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';

type AuthCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
};

export function AuthCard({ 
  title = "Authentication",
  description,
  children,
  onBack 
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-lg mx-auto p-6 sm:p-12 shadow-lg">
      <CardHeader className='mb-2'>
        {/* Back button above the title */}
        {onBack && (
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go back</span>
            </Button>
          </div>
        )}
        
        {/* Title centered */}
          <CardTitle className='flex items-center text-2xl'>
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