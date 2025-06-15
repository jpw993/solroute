
import React from 'react';
import Image from 'next/image';
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import type { Token } from '@/lib/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, Percent, Info } from 'lucide-react';

type RouteDetailsCardProps = {
  routeOutput: FindOptimalRouteOutput | null;
  isLoading: boolean;
  tokens: Token[]; // Added to access token icons
};

export function RouteDetailsCard({ routeOutput, isLoading, tokens }: RouteDetailsCardProps) {
  const getTokenBySymbol = (symbol: string): Token | undefined => {
    return tokens.find(t => t.symbol === symbol);
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg mt-6 animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-1/2 rounded" />
          <Skeleton className="h-4 w-3/4 rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Route Details</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 bg-secondary rounded-lg">
              {[...Array(3)].map((_, i) => ( // Skeleton for a 3-hop route (e.g., T1 -> D1 -> T2 -> D2 -> T3)
                <React.Fragment key={`skel-hop-${i}`}>
                  <div className="flex items-center space-x-1.5 p-2 bg-muted/50 rounded-md border">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  {i < 2 && ( // For 2 DEX/arrow segments
                    <div className="flex flex-col items-center text-muted-foreground mx-1">
                      <Skeleton className="h-5 w-5 rounded" /> {/* Arrow placeholder */}
                      <Skeleton className="h-3 w-10 rounded mt-1" /> {/* DEX placeholder */}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t">
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 rounded mb-1" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 rounded mb-1" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
          </div>
           <div className="mt-6 p-3 bg-muted/50 border rounded-lg">
            <Skeleton className="h-4 w-5 rounded-full inline-block mr-2" />
            <Skeleton className="h-4 w-full rounded inline-block" />
            <Skeleton className="h-4 w-3/4 rounded mt-1 inline-block" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routeOutput) {
    return null; // Don't render if no route data and not loading
  }

  const { route, estimatedOutput, slippage } = routeOutput;
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm md:text-base bg-secondary p-3 rounded-lg">
              {route.map((hop, index) => {
                const tokenInDetails = getTokenBySymbol(hop.tokenIn);
                const tokenOutDetails = index === route.length - 1 ? getTokenBySymbol(hop.tokenOut) : null;

                return (
                  <React.Fragment key={index}>
                    <div className="flex items-center space-x-1.5 p-2 bg-background/70 rounded-md shadow-sm border">
                      {tokenInDetails && (
                        <Image
                          src={tokenInDetails.iconSrc}
                          alt={`${tokenInDetails.name} icon`}
                          width={20}
                          height={20}
                          className="rounded-full"
                          data-ai-hint={`${tokenInDetails.symbol.toLowerCase()} logo`}
                        />
                      )}
                      <span className="font-medium text-primary">{hop.tokenIn}</span>
                    </div>

                    {index < route.length && ( // Don't show arrow/dex after the final token
                      <div className="flex flex-col items-center text-muted-foreground mx-1">
                        <ArrowRight className="h-5 w-5" />
                        <span className="text-xs mt-0.5 bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-sm shadow-sm">{hop.dex}</span>
                      </div>
                    )}

                    {index === route.length - 1 && tokenOutDetails && (
                      <div className="flex items-center space-x-1.5 p-2 bg-background/70 rounded-md shadow-sm border">
                        <Image
                          src={tokenOutDetails.iconSrc}
                          alt={`${tokenOutDetails.name} icon`}
                          width={20}
                          height={20}
                          className="rounded-full"
                          data-ai-hint={`${tokenOutDetails.symbol.toLowerCase()} logo`}
                        />
                        <span className="font-medium text-primary">{hop.tokenOut}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Direct swap or no complex route needed.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Estimated Output</span>
            <span className="text-lg font-semibold text-green-600">
              {estimatedOutput.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {outputTokenSymbol}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground mb-1">Estimated Slippage</span>
            <span className="text-lg font-semibold text-foreground">
              {(slippage * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-sm text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
          <p>This is an estimated route. Actual output may vary due to market volatility and network conditions. Always verify transaction details in your wallet before confirming.</p>
        </div>
      </CardContent>
    </Card>
  );
}
