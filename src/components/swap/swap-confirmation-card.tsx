'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, PlayCircle, Loader2 } from 'lucide-react';

type SwapConfirmationCardProps = {
  onSimulate: () => void;
  onExecute: () => void;
  isSimulating: boolean;
  isExecuting: boolean;
  isRouteAvailable: boolean;
  walletConnected: boolean;
};

export function SwapConfirmationCard({
  onSimulate,
  onExecute,
  isSimulating,
  isExecuting,
  isRouteAvailable,
  walletConnected,
}: SwapConfirmationCardProps) {
  const canInteract = isRouteAvailable && walletConnected && !isSimulating && !isExecuting;

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-headline">Confirm Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isRouteAvailable 
            ? "Review the route details and proceed with simulation or execution."
            : "Find an optimal route first to enable swap actions."
          }
           {!walletConnected && " Please connect your wallet."}
        </p>
        <Button
          onClick={onSimulate}
          disabled={!canInteract || isSimulating}
          className="w-full h-11 bg-secondary text-secondary-foreground hover:bg-secondary/80"
          aria-live="polite"
        >
          {isSimulating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <PlayCircle className="mr-2 h-5 w-5" />
          )}
          {isSimulating ? 'Simulating...' : 'Simulate Swap'}
        </Button>
        <Button
          onClick={onExecute}
          disabled={!canInteract || isExecuting}
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
