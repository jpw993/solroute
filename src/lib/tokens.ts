
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

const placeholderBaseUrl = 'https://placehold.co/24x24.png'; // Using 24x24 as a common icon size

export const mockTokens: Token[] = [
  { id: 'SOL', symbol: 'SOL', name: 'Solana', iconSrc: placeholderBaseUrl, decimals: 9, balance: 10.5 },
  { id: 'USDC', symbol: 'USDC', name: 'USD Coin', iconSrc: placeholderBaseUrl, decimals: 6, balance: 1500.75 },
  { id: 'USDT', symbol: 'USDT', name: 'Tether', iconSrc: placeholderBaseUrl, decimals: 6, balance: 800.00 },
  { id: 'BONK', symbol: 'BONK', name: 'Bonk', iconSrc: placeholderBaseUrl, decimals: 5, balance: 5000000 },
  { id: 'JUP', symbol: 'JUP', name: 'Jupiter', iconSrc: placeholderBaseUrl, decimals: 6, balance: 250 },
  { id: 'RAY', symbol: 'RAY', name: 'Raydium', iconSrc: placeholderBaseUrl, decimals: 6, balance: 120 },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin (Wrapped)', iconSrc: placeholderBaseUrl, decimals: 8, balance: 0.5 },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum (Wrapped)', iconSrc: placeholderBaseUrl, decimals: 8, balance: 2.1 },
];
