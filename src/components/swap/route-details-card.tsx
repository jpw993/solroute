
import React from 'react';
import Image from 'next/image';
import type { FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import type { Token } from '@/lib/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Zap, Info, TrendingUp, HelpCircle, GitCompareArrows, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PathfindingAnimation from '@/components/animations/pathfinding-animation'; // Import the new animation component

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
              {Math.abs(savings.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {outputTokenSymbol}
            </strong>
            {` (${percentageText}${isPositiveSaving ? " more" : " less"})`} compared to the best single DEX swap.
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg mt-6">
        <CardHeader>
           <CardTitle className="flex items-center gap-2 text-xl font-headline">
             <GitCompareArrows className="h-6 w-6 text-primary" />
            Swap Route Analysis
          </CardTitle>
          <CardDescription>
            Searching for the best routes for your swap...
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <PathfindingAnimation />
          
          <div className="mt-4 pt-4 border-t border-muted/50">
            <h3 className="text-xs font-semibold text-muted-foreground/60 mb-2 uppercase tracking-wider">Also checking single exchange alternatives...</h3>
             <div className="flex flex-nowrap items-center gap-x-3 p-3 bg-muted/20 border border-muted/30 rounded-lg overflow-x-auto">
                <Skeleton className="h-7 w-7 rounded-full bg-muted/30 shrink-0" /> 
                <Skeleton className="h-5 w-16 rounded bg-muted/30 shrink-0" />
                <Skeleton className="h-6 w-6 rounded bg-muted/30 mx-1 shrink-0" /> {/* Arrow */}
                <Skeleton className="h-5 w-16 rounded bg-muted/30 shrink-0" />
                <Skeleton className="h-7 w-7 rounded-full bg-muted/30 shrink-0" />
            </div>
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
          <GitCompareArrows className="h-6 w-6 text-primary" />
          Swap Route Analysis
        </CardTitle>
        <CardDescription>
          Comparing the best single exchange option with the optimal multi-hop route.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bestSingleDexRoute && (
          <div className="mb-6 pb-6 border-b border-muted/50">
            <h3 className="text-sm font-semibold text-muted-foreground/70 mb-3 uppercase tracking-wider">Best Single Exchange Route (Alternative)</h3>
            <div className="flex flex-nowrap items-center gap-x-3 text-base bg-muted/30 border border-muted/50 p-4 rounded-lg overflow-x-auto shadow-sm">
                {getTokenBySymbol(bestSingleDexRoute.tokenIn) && (
                    <div className="flex items-center space-x-2 px-3 py-2 bg-muted/20 rounded-lg shadow-sm border border-muted/40 shrink-0">
                        <Image src={getTokenBySymbol(bestSingleDexRoute.tokenIn)!.iconSrc} alt={`${bestSingleDexRoute.tokenIn} icon`} width={24} height={24} className="rounded-full opacity-75" data-ai-hint={`${bestSingleDexRoute.tokenIn.toLowerCase()} logo`} />
                        <span className="text-lg font-medium text-muted-foreground">{bestSingleDexRoute.tokenIn}</span>
                    </div>
                )}
                <div className="flex flex-col items-center text-muted-foreground/50 mx-2 shrink-0">
                    <ArrowRight className="h-8 w-8" />
                    <span className="text-base mt-1.5 bg-muted/20 border border-muted/40 px-3.5 py-1.5 rounded-md shadow-sm font-medium">{bestSingleDexRoute.dex}</span>
                </div>
                {getTokenBySymbol(bestSingleDexRoute.tokenOut) && (
                     <div className="flex items-center space-x-2 px-3 py-2 bg-muted/20 rounded-lg shadow-sm border border-muted/40 shrink-0">
                        <Image src={getTokenBySymbol(bestSingleDexRoute.tokenOut)!.iconSrc} alt={`${bestSingleDexRoute.tokenOut} icon`} width={24} height={24} className="rounded-full opacity-75" data-ai-hint={`${bestSingleDexRoute.tokenOut.toLowerCase()} logo`} />
                        <span className="text-lg font-medium text-muted-foreground">{bestSingleDexRoute.tokenOut}</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t border-muted/50">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground/80 mb-1">Est. Output (Single DEX)</span>
                <span className="text-xl font-semibold text-muted-foreground">
                  {bestSingleDexRoute.estimatedOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {bestSingleDexRoute.tokenOut}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground/80 mb-1">Est. Slippage (Single DEX)</span>
                <span className="text-xl font-semibold text-muted-foreground">
                  {(bestSingleDexRoute.slippage * 100).toFixed(3)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            <Zap className="inline-block h-4 w-4 mr-1.5 relative -top-px text-primary" />
            Optimal Multi-Hop Route (Recommended)
          </h3>
          {route.length > 0 ? (
            <div className="flex flex-nowrap items-center gap-x-4 text-base bg-secondary p-4 rounded-lg overflow-x-auto">
              {route.map((hop, index) => {
                const tokenInDetails = getTokenBySymbol(hop.tokenIn);
                const isFinalTokenInRoute = index === route.length - 1;
                const tokenOutDetailsForDisplay = isFinalTokenInRoute ? getTokenBySymbol(hop.tokenOut) : null;

                return (
                  <React.Fragment key={`multi-hop-${index}`}>
                    <div className="flex items-center space-x-3 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                      {tokenInDetails && (
                        <Image src={tokenInDetails.iconSrc} alt={`${tokenInDetails.name} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${tokenInDetails.symbol.toLowerCase()} logo`} />
                      )}
                      <span className="text-xl font-medium text-primary">{hop.tokenIn}</span>
                    </div>

                    {index < route.length -1 && ( 
                      <div className="flex flex-col items-center text-foreground mx-2 shrink-0">
                        <ArrowRight className="h-8 w-8" />
                        <span className="text-lg mt-1.5 bg-muted border border-border px-3.5 py-1.5 rounded-md shadow-sm font-medium">{hop.dex}</span>
                      </div>
                    )}
                    {isFinalTokenInRoute && index > 0 && ( 
                       <div className="flex flex-col items-center text-foreground mx-2 shrink-0">
                        <ArrowRight className="h-8 w-8" />
                        <span className="text-lg mt-1.5 bg-muted border border-border px-3.5 py-1.5 rounded-md shadow-sm font-medium">{hop.dex}</span>
                      </div>
                    )}

                    {isFinalTokenInRoute && tokenOutDetailsForDisplay && (
                      <div className="flex items-center space-x-3 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                        <Image src={tokenOutDetailsForDisplay.iconSrc} alt={`${tokenOutDetailsForDisplay.name} icon`} width={28} height={28} className="rounded-full" data-ai-hint={`${tokenOutDetailsForDisplay.symbol.toLowerCase()} logo`} />
                        <span className="text-xl font-medium text-primary">{hop.tokenOut}</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
             <div className="flex flex-nowrap items-center gap-x-4 text-base bg-secondary p-4 rounded-lg overflow-x-auto">
                <div className="flex items-center space-x-3 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                  {getTokenBySymbol(routeOutput.route[0]?.tokenIn || bestSingleDexRoute?.tokenIn || "") && <Image src={getTokenBySymbol(routeOutput.route[0]?.tokenIn || bestSingleDexRoute?.tokenIn || "")!.iconSrc} alt="token in icon" width={28} height={28} className="rounded-full" data-ai-hint="token logo"/>}
                  <span className="text-xl font-medium text-primary">{routeOutput.route[0]?.tokenIn || bestSingleDexRoute?.tokenIn}</span>
                </div>
                <div className="flex flex-col items-center text-foreground mx-2 shrink-0">
                  <ArrowRight className="h-8 w-8" />
                  <span className="text-lg mt-1.5 bg-muted border border-border px-3.5 py-1.5 rounded-md shadow-sm font-medium">Direct</span>
                </div>
                <div className="flex items-center space-x-3 px-4 py-3 bg-background/70 rounded-lg shadow-sm border shrink-0">
                   {getTokenBySymbol(routeOutput.route[0]?.tokenOut || bestSingleDexRoute?.tokenOut || "") && <Image src={getTokenBySymbol(routeOutput.route[0]?.tokenOut || bestSingleDexRoute?.tokenOut || "")!.iconSrc} alt="token out icon" width={28} height={28} className="rounded-full" data-ai-hint="token logo"/>}
                  <span className="text-xl font-medium text-primary">{routeOutput.route[0]?.tokenOut || bestSingleDexRoute?.tokenOut}</span>
                </div>
              </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4 mt-4 border-t">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Est. Output (Recommended Route)</span>
              <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                {estimatedOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {multiHopOutputTokenSymbol}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground mb-1">Est. Slippage (Recommended Route)</span>
              <span className="text-xl font-semibold text-foreground">
                {(slippage * 100).toFixed(3)}%
              </span>
            </div>
          </div>
        </div>
        
        {savingsComparedToSingleDex && bestSingleDexRoute && renderSavings(savingsComparedToSingleDex, bestSingleDexRoute.tokenOut)}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start text-sm text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
          <Info className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
          <p>This is an estimated route. Actual output may vary due to market volatility and network conditions. Always verify transaction details in your wallet before confirming.</p>
        </div>
      </CardContent>
    </Card>
  );
}

    

    