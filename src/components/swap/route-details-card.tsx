
import React from 'react';
import Image from 'next/image';
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import type { Token } from '@/lib/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, Info } from 'lucide-react';

type RouteDetailsCardProps = {
  routeOutput: FindOptimalRouteOutput | null;
  isLoading: boolean;
  tokens: Token[];
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
            <div className="flex flex-nowrap items-center gap-x-3 p-4 bg-secondary rounded-lg overflow-x-auto">
              {[...Array(3)].map((_, i) => ( 
                <React.Fragment key={`skel-hop-${i}`}>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg border">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                  {i < 2 && ( 
                    <div className="flex flex-col items-center text-muted-foreground mx-1 shrink-0">
                      <Skeleton className="h-6 w-6 rounded" /> 
                      <Skeleton className="h-5 w-14 rounded mt-1" /> 
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
    return null; 
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
            <div className="flex flex-nowrap items-center gap-x-3 text-base bg-secondary p-4 rounded-lg overflow-x-auto">
              {route.map((hop, index) => {
                const tokenInDetails = getTokenBySymbol(hop.tokenIn);
                const isFinalTokenInRoute = index === route.length - 1;
                const tokenOutDetailsForDisplay = isFinalTokenInRoute ? getTokenBySymbol(hop.tokenOut) : null;

                return (
                  <React.Fragment key={index}>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-background/70 rounded-lg shadow-sm border shrink-0">
                      {tokenInDetails && (
                        <Image
                          src={tokenInDetails.iconSrc}
                          alt={`${tokenInDetails.name} icon`}
                          width={24}
                          height={24}
                          className="rounded-full"
                          data-ai-hint={`${tokenInDetails.symbol.toLowerCase()} logo`}
                        />
                      )}
                      <span className="text-base font-medium text-primary">{hop.tokenIn}</span>
                    </div>

                    {index < route.length -1 && ( 
                      <div className="flex flex-col items-center text-muted-foreground mx-1 shrink-0">
                        <ArrowRight className="h-6 w-6" />
                        <span className="text-sm mt-1 bg-muted border border-border px-2 py-1 rounded-md shadow">{hop.dex}</span>
                      </div>
                    )}
                    {isFinalTokenInRoute && index > 0 && ( 
                       <div className="flex flex-col items-center text-muted-foreground mx-1 shrink-0">
                        <ArrowRight className="h-6 w-6" />
                        <span className="text-sm mt-1 bg-muted border border-border px-2 py-1 rounded-md shadow">{hop.dex}</span>
                      </div>
                    )}

                    {isFinalTokenInRoute && tokenOutDetailsForDisplay && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-background/70 rounded-lg shadow-sm border shrink-0">
                        <Image
                          src={tokenOutDetailsForDisplay.iconSrc}
                          alt={`${tokenOutDetailsForDisplay.name} icon`}
                          width={24}
                          height={24}
                          className="rounded-full"
                          data-ai-hint={`${tokenOutDetailsForDisplay.symbol.toLowerCase()} logo`}
                        />
                        <span className="text-base font-medium text-primary">{hop.tokenOut}</span>
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

