
import type { SVGProps } from 'react';
import type React from 'react';

// SVG icon components are no longer directly used here.
// They will be replaced by image URLs.

export type Token = {
  id: string;
  symbol: string;
  name: string;
  iconSrc: string; // Changed from 'icon' component to 'iconSrc' string (URL)
  decimals: number;
  balance?: number; // Optional: for displaying user's token balance
};

export const mockTokens: Token[] = [
  { id: 'SOL', symbol: 'SOL', name: 'Solana', iconSrc: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png', decimals: 9, balance: 10.5 },
  { id: 'USDC', symbol: 'USDC', name: 'USD Coin', iconSrc: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png', decimals: 6, balance: 1500.75 },
  { id: 'USDT', symbol: 'USDT', name: 'Tether', iconSrc: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', decimals: 6, balance: 800.00 },
  { id: 'BONK', symbol: 'BONK', name: 'Bonk', iconSrc: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I', decimals: 5, balance: 5000000 },
  { id: 'RAY', symbol: 'RAY', name: 'Raydium', iconSrc: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png', decimals: 6, balance: 120 },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin (Wrapped)', iconSrc: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png', decimals: 8, balance: 0.5 }, // Wormhole BTC
];
