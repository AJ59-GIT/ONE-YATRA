import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-500 max-w-md mb-8">
            We encountered an unexpected error. Our team has been notified. 
            Please try refreshing the page.
          </p>
          <div className="flex gap-4">
             <Button onClick={() => this.setState({ hasError: false })} variant="outline">
                Try Again
             </Button>
             <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reload App
             </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
             <pre className="mt-8 p-4 bg-gray-100 rounded text-left text-xs text-red-600 overflow-auto max-w-lg">
                {this.state.error.toString()}
             </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}