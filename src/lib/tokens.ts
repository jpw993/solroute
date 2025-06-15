import type { LucideIcon } from 'lucide-react';
import { Coins, CircleDollarSign, Bitcoin,Waves } from 'lucide-react'; // Example icons

export type Token = {
  id: string;
  symbol: string;
  name: string;
  icon: LucideIcon;
  decimals: number;
  balance?: number; // Optional: for displaying user's token balance
};

// Using a generic icon for all tokens for now
const GenericTokenIcon = CircleDollarSign;

export const mockTokens: Token[] = [
  { id: 'SOL', symbol: 'SOL', name: 'Solana', icon: Waves, decimals: 9, balance: 10.5 },
  { id: 'USDC', symbol: 'USDC', name: 'USD Coin', icon: Coins, decimals: 6, balance: 1500.75 },
  { id: 'USDT', symbol: 'USDT', name: 'Tether', icon: Coins, decimals: 6, balance: 800.00 },
  { id: 'BONK', symbol: 'BONK', name: 'Bonk', icon: GenericTokenIcon, decimals: 5, balance: 5000000 },
  { id: 'JUP', symbol: 'JUP', name: 'Jupiter', icon: GenericTokenIcon, decimals: 6, balance: 250 },
  { id: 'RAY', symbol: 'RAY', name: 'Raydium', icon: GenericTokenIcon, decimals: 6, balance: 120 },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin (Wrapped)', icon: Bitcoin, decimals: 8, balance: 0.5 },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum (Wrapped)', icon: GenericTokenIcon, decimals: 8, balance: 2.1 },
];
