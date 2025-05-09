import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle errors in React components
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 border border-red-200 rounded-lg bg-red-50 text-red-800 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h2 className="text-xl font-semibold">發生錯誤</h2>
          <p className="text-center max-w-md">
            {this.state.error?.message || "發生未知錯誤，請重試或聯繫技術支持。"}
          </p>
          <Button onClick={this.resetErrorBoundary} variant="outline">
            重試
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for ErrorBoundary with retry functionality
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  const displayName = Component.displayName || Component.name || "Component";
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}
