import type { Wallet } from '@/types'; // Assuming Wallet type will be defined
import { LogoIcon } from '@/components/icons/logo-icon';
import { ConnectWalletButton } from '@/components/wallet/connect-wallet-button';

type AppHeaderProps = {
  walletConnected: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function AppHeader({ walletConnected, walletAddress, onConnect, onDisconnect }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <LogoIcon />
        <ConnectWalletButton
          connected={walletConnected}
          address={walletAddress}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>
    </header>
  );
}
