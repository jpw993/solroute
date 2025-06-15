import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, Percent, Info } from 'lucide-react';

type RouteDetailsCardProps = {
  routeOutput: FindOptimalRouteOutput | null;
  isLoading: boolean;
};

export function RouteDetailsCard({ routeOutput, isLoading }: RouteDetailsCardProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg mt-6 animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 rounded" />
          <Skeleton className="h-4 w-3/4 rounded mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-1/4 rounded mb-2" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routeOutput) {
    return null; // Don't render if no route data and not loading
  }

  const { route, estimatedOutput, fees, slippage } = routeOutput;
  const outputTokenSymbol = route.length > 0 ? route[route.length - 1].tokenOut : 'Output Token';


  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Zap className="h-6 w-6 text-primary" />
          Optimal Swap Route
        </CardTitle>
        <CardDescription>
          Best path found for your token swap.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Route Details</h3>
          {route.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 text-sm md:text-base bg-secondary p-3 rounded-lg">
              {route.map((hop, index) => (
                <React.Fragment key={index}>
                  <span className="font-medium text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">
                    {hop.tokenIn}
                  </span>
                  <div className="flex flex-col items-center mx-1">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-0.5">{hop.dex}</span>
                  </div>
                  {index === route.length - 1 && (
                     <span className="font-medium text-primary-foreground bg-primary px-3 py-1 rounded-md shadow">
                      {hop.tokenOut}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Direct swap or no complex route needed.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 pt-4 border-t">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Estimated Output</span>
            <span className="text-lg font-semibold text-green-600">
              {estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 6 })} {outputTokenSymbol}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Estimated Fees</span>
            <span className="text-lg font-semibold text-foreground">
              {fees.toLocaleString(undefined, { maximumFractionDigits: 6 })} units
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Estimated Slippage</span>
            <span className="text-lg font-semibold text-foreground">
              {(slippage * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-sm text-blue-700">
          <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
          <p>This is an estimated route. Actual output may vary due to market volatility and network conditions. Always verify transaction details in your wallet before confirming.</p>
        </div>
      </CardContent>
    </Card>
  );
}
