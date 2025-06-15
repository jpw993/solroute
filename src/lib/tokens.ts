
import type { SVGProps } from 'react';
import type React from 'react';

// Import newly created SVG icon components
import { SolanaIcon } from '@/components/icons/tokens/SolanaIcon';
import { UsdcIcon } from '@/components/icons/tokens/UsdcIcon';
import { UsdtIcon } from '@/components/icons/tokens/UsdtIcon';
import { BonkIcon } from '@/components/icons/tokens/BonkIcon';
import { JupiterIcon } from '@/components/icons/tokens/JupiterIcon';
import { RaydiumIcon } from '@/components/icons/tokens/RaydiumIcon';
import { BitcoinIcon } from '@/components/icons/tokens/BitcoinIcon';
import { EthereumIcon } from '@/components/icons/tokens/EthereumIcon';

export type Token = {
  id: string;
  symbol: string;
  name: string;
  icon: React.ComponentType<SVGProps<SVGSVGElement>>; // Updated icon type
  decimals: number;
  balance?: number; // Optional: for displaying user's token balance
};

export const mockTokens: Token[] = [
  { id: 'SOL', symbol: 'SOL', name: 'Solana', icon: SolanaIcon, decimals: 9, balance: 10.5 },
  { id: 'USDC', symbol: 'USDC', name: 'USD Coin', icon: UsdcIcon, decimals: 6, balance: 1500.75 },
  { id: 'USDT', symbol: 'USDT', name: 'Tether', icon: UsdtIcon, decimals: 6, balance: 800.00 },
  { id: 'BONK', symbol: 'BONK', name: 'Bonk', icon: BonkIcon, decimals: 5, balance: 5000000 },
  { id: 'JUP', symbol: 'JUP', name: 'Jupiter', icon: JupiterIcon, decimals: 6, balance: 250 },
  { id: 'RAY', symbol: 'RAY', name: 'Raydium', icon: RaydiumIcon, decimals: 6, balance: 120 },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin (Wrapped)', icon: BitcoinIcon, decimals: 8, balance: 0.5 },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum (Wrapped)', icon: EthereumIcon, decimals: 8, balance: 2.1 },
];
