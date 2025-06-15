
'use client';

import React, { useState, useEffect } from 'react';
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

export default function HomePage() {
  const { toast } = useToast();

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState<FindOptimalRouteOutput | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
  useEffect(() => {
    const storedWalletState = localStorage.getItem('solroute-wallet-connected');
    const storedWalletAddress = localStorage.getItem('solroute-wallet-address');
    if (storedWalletState === 'true' && storedWalletAddress) {
      setWalletConnected(true);
      setWalletAddress(storedWalletAddress);
    }
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
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    });
  };

  const handleFindRoute = async (data: SwapFormValues) => {
    setIsLoadingRoute(true);
    setRouteError(null);
    setRouteData(null);

    const inputTokenDetails = mockTokens.find(t => t.id === data.inputTokenId);
    const outputTokenDetails = mockTokens.find(t => t.id === data.outputTokenId);

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

    const artificialDelay = new Promise(resolve => setTimeout(resolve, 3000));
    const findRoutePromise = findOptimalRoute(aiInput);

    try {
      // Wait for both the API call and the artificial delay
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
      toast({ title: "Route Finding Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleSimulateSwap = () => {
    if (!routeData) return;
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      toast({
        title: "Swap Simulated",
        description: `Expected output: ${routeData.estimatedOutput.toFixed(4)} ${routeData.route[routeData.route.length-1].tokenOut}.`,
        variant: "default",
      });
    }, 1500);
  };

  const handleExecuteSwap = () => {
     if (!routeData) return;
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: "Swap Executed!",
        description: `Successfully swapped tokens. Check your wallet for updates.`,
        variant: "default",
        className: "bg-green-500 text-white dark:bg-green-600"
      });
      setRouteData(null); 
    }, 2500);
  };
  

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
              tokens={mockTokens}
              onSubmit={handleFindRoute}
              isLoading={isLoadingRoute}
              walletConnected={walletConnected}
            />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <WalletInfoCard 
              walletConnected={walletConnected} 
              walletAddress={walletAddress} 
              tokens={mockTokens} 
            />
            <SwapConfirmationCard
              onSimulate={handleSimulateSwap}
              onExecute={handleExecuteSwap}
              isSimulating={isSimulating}
              isExecuting={isExecuting}
              isRouteAvailable={!!routeData && !isLoadingRoute && !routeError}
              walletConnected={walletConnected}
            />
          </div>
        </div>
        
        <div className="mt-8">
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
            tokens={mockTokens} 
          />
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        SolRoute &copy; {new Date().getFullYear()} - Your Solana DEX Navigator
      </footer>
    </div>
  );
}
