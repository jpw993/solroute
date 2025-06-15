
'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SwapFormValues } from '@/schemas/swap-schema';
import { mockTokens, type Token } from '@/lib/tokens';
import { findOptimalRoute, type FindOptimalRouteInput, type FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
import { useToast } from "@/hooks/use-toast";

import { AppHeader } from '@/components/layout/app-header';
import { TokenSwapCard } from '@/components/swap/token-swap-card';
import { RouteDetailsCard } from '@/components/swap/route-details-card';
import { SwapConfirmationCard } from '@/components/swap/swap-confirmation-card';
import { WalletInfoCard } from '@/components/wallet/wallet-info-card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import { LandingAnimation } from '@/components/layout/landing-animation';

export default function HomePage() {
  const { toast } = useToast();
  const routeDetailsRef = useRef<HTMLDivElement>(null);

  const [showLandingAnimation, setShowLandingAnimation] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  
  const [displayTokens, setDisplayTokens] = useState<Token[]>(mockTokens);
  const [currentSwapInput, setCurrentSwapInput] = useState<FindOptimalRouteInput | null>(null);

  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState<FindOptimalRouteOutput | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  
  useEffect(() => {
    const landingTimer = setTimeout(() => {
      setShowLandingAnimation(false);
    }, 3000);

    const storedWalletState = localStorage.getItem('solroute-wallet-connected');
    const storedWalletAddress = localStorage.getItem('solroute-wallet-address');
    if (storedWalletState === 'true' && storedWalletAddress) {
      setWalletConnected(true);
      setWalletAddress(storedWalletAddress);
    }

    return () => {
      clearTimeout(landingTimer);
    };
  }, []);

  const handleConnectWallet = () => {
    const mockAddress = `mock${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`;
    setWalletConnected(true);
    setWalletAddress(mockAddress);
    localStorage.setItem('solroute-wallet-connected', 'true');
    localStorage.setItem('solroute-wallet-address', mockAddress);
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to wallet: ${mockAddress.substring(0,12)}...`,
      variant: "default", 
    });
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(undefined);
    localStorage.removeItem('solroute-wallet-connected');
    localStorage.removeItem('solroute-wallet-address');
    setRouteData(null); 
    setCurrentSwapInput(null);
    // Reset token balances to initial mock state if desired, or keep them as is
    // setDisplayTokens(mockTokens); 
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    });
  };

  const handleFindRoute = async (data: SwapFormValues) => {
    setIsLoadingRoute(true);
    setRouteError(null);
    setRouteData(null);
    setCurrentSwapInput(null);

    setTimeout(() => {
      if (routeDetailsRef.current) {
        routeDetailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);

    const inputTokenDetails = displayTokens.find(t => t.id === data.inputTokenId);
    const outputTokenDetails = displayTokens.find(t => t.id === data.outputTokenId);

    if (!inputTokenDetails || !outputTokenDetails) {
      setRouteError("Invalid token selection.");
      setIsLoadingRoute(false);
      toast({ title: "Error", description: "Invalid token selection.", variant: "destructive" });
      return;
    }

    const aiInput: FindOptimalRouteInput = {
      inputToken: inputTokenDetails.symbol,
      outputToken: outputTokenDetails.symbol,
      amount: data.amount,
    };
    setCurrentSwapInput(aiInput); // Store for use in execute swap

    const artificialDelay = new Promise(resolve => setTimeout(resolve, 3000));
    const findRoutePromise = findOptimalRoute(aiInput);

    try {
      const [_, result] = await Promise.all([
        artificialDelay,
        findRoutePromise
      ]);
      
      setRouteData(result as FindOptimalRouteOutput);
      toast({
        title: "Route Found!",
        description: `Optimal route from ${inputTokenDetails.symbol} to ${outputTokenDetails.symbol} calculated.`,
      });
    } catch (error) {
      console.error("Error finding optimal route:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to find optimal route.";
      setRouteError(errorMessage);
      setCurrentSwapInput(null);
      toast({ title: "Route Finding Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleExecuteSwap = () => {
     if (!routeData || !currentSwapInput) return;
    setIsExecuting(true);

    setTimeout(() => {
      // Simulate balance update
      const inputTokenSymbol = currentSwapInput.inputToken;
      const outputTokenSymbol = currentSwapInput.outputToken;
      const amountSwapped = currentSwapInput.amount;
      const amountReceived = routeData.estimatedOutput;

      setDisplayTokens(prevTokens => 
        prevTokens.map(token => {
          if (token.symbol === inputTokenSymbol) {
            const newBalance = (token.balance || 0) - amountSwapped;
            return { ...token, balance: Math.max(0, newBalance) }; // Ensure balance doesn't go negative
          }
          if (token.symbol === outputTokenSymbol) {
            return { ...token, balance: (token.balance || 0) + amountReceived };
          }
          return token;
        })
      );
      
      const inputTokenForToast = displayTokens.find(t => t.symbol === inputTokenSymbol);
      const outputTokenForToast = displayTokens.find(t => t.symbol === outputTokenSymbol);

      setIsExecuting(false);
      toast({
        title: "Swap Executed!",
        description: `Successfully swapped ${amountSwapped.toLocaleString(undefined, {maximumFractionDigits: inputTokenForToast?.decimals ?? 2})} ${inputTokenSymbol} for approx. ${amountReceived.toLocaleString(undefined, {maximumFractionDigits: outputTokenForToast?.decimals ?? 2})} ${outputTokenSymbol}. Balances updated.`,
        variant: "default",
        className: "bg-green-500 text-white dark:bg-green-600"
      });
      setRouteData(null); 
      setCurrentSwapInput(null); // Clear stored input
    }, 2500);
  };
  
  if (showLandingAnimation) {
    return <LandingAnimation />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader 
        walletConnected={walletConnected} 
        walletAddress={walletAddress}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <TokenSwapCard
              tokens={displayTokens} // Pass displayTokens
              onSubmit={handleFindRoute}
              isLoading={isLoadingRoute}
              walletConnected={walletConnected}
            />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <WalletInfoCard 
              walletConnected={walletConnected} 
              walletAddress={walletAddress} 
              tokens={displayTokens} // Pass displayTokens
            />
          </div>
        </div>
        
        <div className="mt-8" ref={routeDetailsRef}>
          {routeError && !isLoadingRoute && (
            <Alert variant="destructive" className="shadow-md mb-8">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Finding Route</AlertTitle>
              <AlertDescription>{routeError}</AlertDescription>
            </Alert>
          )}
          <RouteDetailsCard 
            routeOutput={routeData} 
            isLoading={isLoadingRoute} 
            tokens={displayTokens} // Pass displayTokens
          />
        </div>

        <div className="mt-8">
           <SwapConfirmationCard
              onExecute={handleExecuteSwap}
              isExecuting={isExecuting}
              isRouteAvailable={!!routeData && !isLoadingRoute && !routeError}
              walletConnected={walletConnected}
            />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        SolRoute &copy; {new Date().getFullYear()} - Your Solana DEX Navigator
      </footer>
    </div>
  );
}
