
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

type SwapConfirmationCardProps = {
  onExecute: () => void;
  isExecuting: boolean;
  isRouteAvailable: boolean;
  walletConnected: boolean;
};

export function SwapConfirmationCard({
  onExecute,
  isExecuting,
  isRouteAvailable,
  walletConnected,
}: SwapConfirmationCardProps) {
  const canExecute = isRouteAvailable && walletConnected && !isExecuting;

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Confirm Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isRouteAvailable 
            ? "Review the route details and proceed with execution."
            : "Find an optimal route first to enable swap actions."
          }
           {!walletConnected && " Please connect your wallet."}
        </p>
        <Button
          onClick={onExecute}
          disabled={!canExecute || isExecuting}
          className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90"
          aria-live="polite"
        >
          {isExecuting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-5 w-5" />
          )}
          {isExecuting ? 'Executing...' : 'Execute Swap'}
        </Button>
      </CardContent>
    </Card>
  );
}
