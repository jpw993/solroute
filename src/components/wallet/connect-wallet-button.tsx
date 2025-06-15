'use client';

import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Wallet as WalletIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


type ConnectWalletButtonProps = {
  connected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function ConnectWalletButton({ connected, address, onConnect, onDisconnect }: ConnectWalletButtonProps) {
  const shortAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';

  if (connected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            <span className="font-medium">{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Wallet Connected</p>
              <p className="text-xs leading-none text-muted-foreground">
                {address}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDisconnect} className="cursor-pointer text-red-500 hover:!text-red-500 hover:!bg-red-500/10">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={onConnect} className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <LogIn className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
