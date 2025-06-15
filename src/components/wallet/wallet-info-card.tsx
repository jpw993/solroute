import type { Token } from '@/lib/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WalletMinimal } from 'lucide-react';

type WalletInfoCardProps = {
  walletConnected: boolean;
  walletAddress?: string;
  tokens: Token[];
};

export function WalletInfoCard({ walletConnected, walletAddress, tokens }: WalletInfoCardProps) {
  if (!walletConnected) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-headline">
            <WalletMinimal className="h-6 w-6 text-primary" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please connect your wallet to view balances and execute swaps.</p>
        </CardContent>
      </Card>
    );
  }

  const shortAddress = walletAddress ? `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 6)}` : '';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline">
          <WalletMinimal className="h-6 w-6 text-primary" />
          My Wallet
        </CardTitle>
        <CardDescription>Address: {shortAddress}</CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="mb-2 text-lg font-medium text-foreground">Token Balances</h3>
        <Separator className="mb-4" />
        <ScrollArea className="h-[200px] pr-4">
          {tokens.filter(token => token.balance && token.balance > 0).length > 0 ? (
            <ul className="space-y-3">
              {tokens.filter(token => token.balance && token.balance > 0).map((token) => (
                <li key={token.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <token.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{token.symbol}</span>
                  </div>
                  <span className="text-foreground">
                    {token.balance?.toLocaleString(undefined, { maximumFractionDigits: token.decimals })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No token balances to display or balances are zero.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
