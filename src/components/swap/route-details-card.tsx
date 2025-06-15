
import React from 'react';
import Image from 'next/image';
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import type { Token } from '@/lib/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, Info, ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type RouteDetailsCardProps = {
  routeOutput: FindOptimalRouteOutput | null;
  isLoading: boolean;
  tokens: Token[];
};

export function RouteDetailsCard({ routeOutput, isLoading, tokens }: RouteDetailsCardProps) {
  const getTokenBySymbol = (symbol: string): Token | undefined => {
    return tokens.find(t => t.symbol === symbol);
  };

  const renderSavings = (savings: NonNullable<FindOptimalRouteOutput['savingsComparedToSingleDex']>, outputTokenSymbol: string) => {
    const isPositiveSaving = savings.amount >= 0;
    const savingTextClass = isPositiveSaving ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const percentageText = Number.isFinite(savings.percentage) ? `${savings.percentage.toFixed(2)}%` : "significantly";
    
    return (
      <div className={cn(
        "mt-6 p-4 rounded-lg flex items-start text-sm",
        isPositiveSaving ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300" 
                         : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
      )}>
        <TrendingUp className={cn("h-5 w-5 mr-3 shrink-0 mt-0.5", savingTextClass)} />
        <div>
          <h4 className="font-semibold mb-1">Route Comparison</h4>
          <p>
            {isPositiveSaving ? "Using the multi-hop route, you get an extra " : "The single DEX route is better by "}
            <strong className={savingTextClass}>
              {Math.abs(savings.amount).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} {outputTokenSymbol}
            </strong>
            {` (${percentageText}${isPositiveSaving ? " more" : " less"})`} compared to the best single DEX swap.
          </p>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg mt-6 animate-pulse">
        <CardHeader>
          <Skeleton className="h-7 w-3/5 rounded" />
          <Skeleton className="h-4 w-4/5 rounded mt-1" />
        </CardHeader>
        <CardContent>
          {/* Multi-hop route skeleton */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Optimal Route</h3>
            <div className="flex flex-nowrap items-center gap-x-4 p-4 bg-secondary rounded-lg overflow-x-auto">
              {[...Array(3)].map((_, i) => (
                <React.Fragment key={`skel-hop-${i}`}>
                  <div className="flex items-center space-x-2 px-4 py-3 bg-muted/50 rounded-lg border">
                    <Skeleton className="h-7 w-7 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                  {i < 2 && (
                    <div className="flex flex-col items-center text-muted-foreground mx-2 shrink-0">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-5 w-16 rounded mt-1 bg-muted/80 border" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t">
              <div><Skeleton className="h-4 w-24 rounded mb-1" /><Skeleton className="h-7 w-28 rounded" /></div>
              <div><Skeleton className="h-4 w-24 rounded mb-1" /><Skeleton className="h-7 w-28 rounded" /></div>
            </div>
          </div>
          {/* Single DEX route skeleton */}
          <div className="mb-6 pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Best Single Exchange Route</h3>
             <div className="flex items-center gap-x-3 p-4 bg-secondary rounded-lg">
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg border"><Skeleton className="h-7 w-7 rounded-full" /> <Skeleton className="h-6 w-16 rounded" /></div>
                <div className="flex flex-col items-center text-muted-foreground mx-1 shrink-0"><Skeleton className="h-7 w-7 rounded" /> <Skeleton className="h-5 w-14 rounded mt-1" /></div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg border"><Skeleton className="h-7 w-7 rounded-full" /> <Skeleton className="h-6 w-16 rounded" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t">
              <div><Skeleton className="h-4 w-24 rounded mb-1" /><Skeleton className="h-7 w-28 rounded" /></div>
              <div><Skeleton className="h-4 w-24 rounded mb-1" /><Skeleton className="h-7 w-28 rounded" /></div>
            </div>
          </div>
          {/* Savings skeleton */}
          <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
            <Skeleton className="h-5 w-32 rounded mb-2" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded mt-1" />
          </div>
          <div className="mt-6 p-3 bg-muted/50 border rounded-lg">
            <Skeleton className="h-5 w-5 rounded-full inline-block mr-2" />
            <Skeleton className="h-4 w-full rounded inline-block" />
            <Skeleton className="h-4 w-3/4 rounded mt-1 inline-block" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!routeOutput) {
    return (
      <Card className="shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
             <HelpCircle className="h-6 w-6 text-muted-foreground" />
            Route Not Found
          </CardTitle>
          <CardDescription>
            Enter your swap details above to find a route.
          </CardDescription>
        </CardHeader>
         <CardContent>
          <p className="text-muted-foreground text-center py-4">No route data available.</p>
        </CardContent>
      </Card>
    );
  }

  const { route, estimatedOutput, slippage, bestSingleDexRoute, savingsComparedToSingleDex } = routeOutput;
  const multiHopOutputTokenSymbol = route.length > 0 ? route[route.length - 1].tokenOut : 'Output Token';

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <Zap className="h-6 w-6 text-primary" />
          Swap Route Analysis
        </CardTitle>
        <CardDescription>
          Comparing the optimal multi-hop route with the best single exchange option.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Multi-hop route */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Optimal Multi-Hop Route</h3>
          {route.length > 0 ? (
            <div className="flex flex-nowrap items-center gap-x-4 text-base bg-secondary p-4 rounded-lg overflow-x-auto">
              {route.map((hop, index) => {
                const tokenInDetails = getTokenBySymbol(hop.tokenIn);
                const isFinalTokenInRoute = index === route.length - 1;
                const tokenOutDetailsForDisplay = isFinalTokenInRoute ? getTokenBySymbol(hop.tokenOut) : null;

                return (
                  <React.Fragment key={`multi-hop-${index}`}>
                    <div className="flex items-center space-x-2 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                      {tokenInDetails && (
                        <Image src={tokenInDetails.iconSrc} alt={`${tokenInDetails.name} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${tokenInDetails.symbol.toLowerCase()} logo`} />
                      )}
                      <span className="text-lg font-medium text-primary">{hop.tokenIn}</span>
                    </div>

                    {index < route.length -1 && ( 
                      <div className="flex flex-col items-center text-muted-foreground mx-2 shrink-0">
                        <ArrowRight className="h-7 w-7" />
                        <span className="text-base mt-1 bg-muted border border-border px-3 py-1 rounded-md shadow-sm font-medium">{hop.dex}</span>
                      </div>
                    )}
                    {isFinalTokenInRoute && index > 0 && ( 
                       <div className="flex flex-col items-center text-muted-foreground mx-2 shrink-0">
                        <ArrowRight className="h-7 w-7" />
                        <span className="text-base mt-1 bg-muted border border-border px-3 py-1 rounded-md shadow-sm font-medium">{hop.dex}</span>
                      </div>
                    )}

                    {isFinalTokenInRoute && tokenOutDetailsForDisplay && (
                      <div className="flex items-center space-x-2 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                        <Image src={tokenOutDetailsForDisplay.iconSrc} alt={`${tokenOutDetailsForDisplay.name} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${tokenOutDetailsForDisplay.symbol.toLowerCase()} logo`} />
                        <span className="text-lg font-medium text-primary">{hop.tokenOut}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Direct swap or no complex route needed for multi-hop.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Est. Output (Multi-Hop)</span>
              <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                {estimatedOutput.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 6 })} {multiHopOutputTokenSymbol}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Est. Slippage (Multi-Hop)</span>
              <span className="text-xl font-semibold text-foreground">
                {(slippage * 100).toFixed(3)}%
              </span>
            </div>
          </div>
        </div>

        {/* Best Single DEX route */}
        {bestSingleDexRoute && (
          <div className="mb-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Best Single Exchange Route</h3>
            <div className="flex flex-nowrap items-center gap-x-4 text-base bg-secondary p-4 rounded-lg overflow-x-auto">
                {getTokenBySymbol(bestSingleDexRoute.tokenIn) && (
                    <div className="flex items-center space-x-2 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                        <Image src={getTokenBySymbol(bestSingleDexRoute.tokenIn)!.iconSrc} alt={`${bestSingleDexRoute.tokenIn} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${bestSingleDexRoute.tokenIn.toLowerCase()} logo`} />
                        <span className="text-lg font-medium text-primary">{bestSingleDexRoute.tokenIn}</span>
                    </div>
                )}
                <div className="flex flex-col items-center text-muted-foreground mx-2 shrink-0">
                    <ArrowRight className="h-7 w-7" />
                    <span className="text-base mt-1 bg-muted border border-border px-3 py-1 rounded-md shadow-sm font-medium">{bestSingleDexRoute.dex}</span>
                </div>
                {getTokenBySymbol(bestSingleDexRoute.tokenOut) && (
                     <div className="flex items-center space-x-2 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                        <Image src={getTokenBySymbol(bestSingleDexRoute.tokenOut)!.iconSrc} alt={`${bestSingleDexRoute.tokenOut} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${bestSingleDexRoute.tokenOut.toLowerCase()} logo`} />
                        <span className="text-lg font-medium text-primary">{bestSingleDexRoute.tokenOut}</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Est. Output (Single DEX)</span>
                <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {bestSingleDexRoute.estimatedOutput.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 6 })} {bestSingleDexRoute.tokenOut}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground mb-1">Est. Slippage (Single DEX)</span>
                <span className="text-xl font-semibold text-foreground">
                  {(bestSingleDexRoute.slippage * 100).toFixed(3)}%
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Savings Comparison */}
        {savingsComparedToSingleDex && bestSingleDexRoute && renderSavings(savingsComparedToSingleDex, bestSingleDexRoute.tokenOut)}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-sm text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
          <p>This is an estimated route. Actual output may vary due to market volatility and network conditions. Always verify transaction details in your wallet before confirming.</p>
        </div>
      </CardContent>
    </Card>
  );
}
