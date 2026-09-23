import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  resetKey?: any;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex w-full items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="flex mb-4 gap-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <h1 className="text-2xl font-bold text-foreground">
                  System Exception
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                An unexpected error occurred in the operational interface.
              </p>
              <div className="bg-muted p-4 rounded-md mb-4 overflow-auto max-h-[200px] border border-border">
                <code className="text-xs text-foreground font-mono">
                  {this.state.error?.message || "Unknown error"}
                </code>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                Reload Interface
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
