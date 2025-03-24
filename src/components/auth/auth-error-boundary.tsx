'use client';
import { Component, ReactNode } from 'react';
import { AuthCard } from './auth-card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    console.error('Auth error boundary caught an error:', error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
    toast.info('Retrying authentication');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AuthCard 
          title="Authentication Error" 
          description={this.state.error?.message || "There was a problem with authentication"}
        >
          <div className="flex flex-col gap-4 items-center py-4">
            <p className="text-muted-foreground text-center">
              Please try again or contact support if the problem persists.
            </p>
            <Button 
              onClick={this.handleRetry}
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </AuthCard>
      );
    }

    return this.props.children;
  }
}