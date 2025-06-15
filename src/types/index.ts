// This file can be used for shared type definitions across the application.

// Example: Define a Wallet type if it involves more than just an address
export type Wallet = {
  address: string;
  provider?: string; // e.g., 'Phantom', 'Solflare'
  // other wallet-specific details
};

// You can also re-export types from other modules for easier access
export type { Token } from '@/lib/tokens';
// NOTE: FindOptimalRouteOutput no longer includes 'fees'
export type { FindOptimalRouteInput, FindOptimalRouteOutput } from '@/ai/flows/optimal-route-finder';
