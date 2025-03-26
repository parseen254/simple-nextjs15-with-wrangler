"use client";
import { Component, ReactNode } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { AuthCard } from "./auth-card";
import { RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  private handleRetry = () => {
    toast.info("Retrying authentication...", {
      duration: 3000,
    });
    this.setState({ hasError: false });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <AuthCard description="Something went wrong during authentication">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message ||
                "An unexpected error occurred. Please try again."}
            </p>
            <Button
              onClick={this.handleRetry}
              className="w-full h-11"
              variant="outline"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </AuthCard>
      );
    }

    return this.props.children;
  }
}
