import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  /** Réinitialise l'erreur quand ces clés changent (ex: pathname) */
  resetKeys?: unknown[];
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
    if (import.meta.env.DEV) console.error("ErrorBoundary caught:", error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKeys?.[0] !== this.props.resetKeys?.[0]) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6" aria-hidden>
            <RefreshCw size={32} className="text-destructive" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-primary mb-2">Oups, quelque chose s'est mal passé</h1>
          <p className="text-primary/70 text-sm mb-8 max-w-sm">
            Une erreur inattendue s'est produite. Vous pouvez réessayer ou retourner à l'accueil.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="text-xs text-destructive mb-4 max-w-sm overflow-auto p-2 bg-destructive/10 rounded">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px]">
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full h-12 gap-2"
            >
              <RefreshCw size={18} strokeWidth={1.5} />
              Réessayer
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-full h-12 gap-2 border-2 border-primary text-primary bg-transparent"
            >
              <Link to="/home">
                <Home size={18} strokeWidth={1.5} />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
