import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex w-full items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              The requested operational resource could not be located in the current environment.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
