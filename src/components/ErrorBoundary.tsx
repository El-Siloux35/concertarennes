import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <p className="text-primary font-medium mb-2">Une erreur s'est produite</p>
          <p className="text-primary/70 text-sm mb-6 max-w-md">
            Rechargez la page pour réessayer.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-full"
          >
            Recharger la page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
