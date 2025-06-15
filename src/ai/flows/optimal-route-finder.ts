
'use server';

/**
 * @fileOverview Finds a basic route for swapping tokens using a simple internal model.
 *
 * - findOptimalRoute - A function that handles the process of finding a token swap route.
 * - FindOptimalRouteInput - The input type for the findOptimalRoute function.
 * - FindOptimalRouteOutput - The return type for the findOptimalRoute function.
 */

import {z} from 'genkit';
import { mockTokens } from '@/lib/tokens'; // For accessing token symbols

const FindOptimalRouteInputSchema = z.object({
  inputToken: z.string().describe('The symbol or address of the input token.'),
  outputToken: z.string().describe('The symbol or address of the output token.'),
  amount: z.number().describe('The amount of the input token to swap.'),
});
export type FindOptimalRouteInput = z.infer<typeof FindOptimalRouteInputSchema>;

const RouteHopSchema = z.object({
  dex: z.string().describe('The decentralized exchange used in this hop.'),
  tokenIn: z.string().describe('The symbol or address of the input token for this hop.'),
  tokenOut: z.string().describe('The symbol or address of the output token for this hop.'),
});

const FindOptimalRouteOutputSchema = z.object({
  route: z.array(RouteHopSchema).describe('The optimal route for the swap.'),
  estimatedOutput: z.number().describe('The estimated output amount of the output token.'),
  slippage: z.number().describe('The estimated slippage for the entire route'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

const DEX_POOL = ['Raydium', 'Orca', 'Serum', 'Aldrin', 'Saber', 'Lifinity', 'Cropper'];
const ALL_TOKEN_SYMBOLS = mockTokens.map(t => t.symbol);

// Mock exchange rates relative to USDC
const MOCK_RATES_USD: Record<string, number> = {
  SOL: 150,    // 1 SOL = 150 USDC
  USDC: 1,     // 1 USDC = 1 USDC
  USDT: 1,     // 1 USDT = 1 USDC
  BONK: 0.000020, // 1 BONK = 0.000020 USDC
  RAY: 1.5,    // 1 RAY = 1.5 USDC
  BTC: 60000,  // 1 BTC (Wrapped) = 60000 USDC
};

function getExchangeRate(tokenInSymbol: string, tokenOutSymbol: string): number {
  if (tokenInSymbol === tokenOutSymbol) {
    return 1;
  }

  const rateInToUsd = MOCK_RATES_USD[tokenInSymbol];
  const rateOutToUsd = MOCK_RATES_USD[tokenOutSymbol];

  if (rateInToUsd && rateOutToUsd) {
    // Convert tokenIn to USD, then USD to tokenOut
    return rateInToUsd / rateOutToUsd;
  }
  
  // Fallback for pairs not directly convertible via USDC with defined rates
  // Prioritize USDC as a quote if one of them is USDC.
  if (tokenInSymbol === 'USDC' && rateOutToUsd) return 1 / rateOutToUsd;
  if (tokenOutSymbol === 'USDC' && rateInToUsd) return rateInToUsd;
  
  // Simple pseudo-random factor if no clear path through USDC
  // A hash function on symbols could make this deterministic.
  const inVal = tokenInSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const outVal = tokenOutSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (outVal === 0) return 1; // Avoid division by zero
  const baseRate = (inVal / outVal);
  const randomFactor = 0.8 + Math.random() * 0.4; // between 0.8 and 1.2
  const pseudoRate = baseRate * randomFactor;
  
  if (!rateInToUsd || !rateOutToUsd) {
     return 0.5 + Math.random(); // Arbitrary rate between 0.5 and 1.5 if no path through USDC
  }

  return pseudoRate > 0 ? pseudoRate : 1; // Ensure positive rate
}


function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Cannot get random element from empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { inputToken, outputToken, amount } = input;
  const route: Array<z.infer<typeof RouteHopSchema>> = [];
  let currentAmount = amount;
  let totalSlippageFactor = 1.0;

  // Always generate 3 total hops, which means 2 intermediate tokens.
  const numHops = 3; 

  const availableIntermediateTokens = ALL_TOKEN_SYMBOLS.filter(
    t => t !== inputToken && t !== outputToken
  );
  
  // Path construction: input -> inter1 -> inter2 -> output
  const path = [inputToken];
  
  let lastAddedToken = inputToken;

  // Select first intermediate token
  let inter1Candidates = availableIntermediateTokens.filter(t => t !== lastAddedToken);
  if (inter1Candidates.length === 0) { // Fallback if not enough unique tokens
      inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== outputToken);
      if (inter1Candidates.length === 0) inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken); // Relax further if needed
      if (inter1Candidates.length === 0) inter1Candidates = [outputToken]; // Absolute fallback
  }
  const intermediateToken1 = getRandomElement(inter1Candidates);
  path.push(intermediateToken1);
  lastAddedToken = intermediateToken1;

  // Select second intermediate token
  let inter2Candidates = availableIntermediateTokens.filter(t => t !== lastAddedToken && t !== intermediateToken1);
   if (inter2Candidates.length === 0) { // Fallback
      inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== outputToken && t !== intermediateToken1);
      if (inter2Candidates.length === 0) inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== intermediateToken1);
      if (inter2Candidates.length === 0) inter2Candidates = [outputToken]; // Absolute fallback
  }
  const intermediateToken2 = getRandomElement(inter2Candidates);
  path.push(intermediateToken2);
  
  path.push(outputToken); // Final destination

  // Build route from the constructed path
  let tempCurrentToken = inputToken; // Used to track current token in the loop if needed for complex logic
  
  for (let i = 0; i < numHops; i++) {
    const hopDex = getRandomElement(DEX_POOL);
    const tokenInThisHop = path[i];
    const tokenOutThisHop = path[i+1];

    // Ensure we don't have A->A unless it's the last hop AND tokenOutThisHop is indeed the final outputToken
    // or if the path necessarily implies it due to lack of distinct tokens
    if (tokenInThisHop === tokenOutThisHop && tokenInThisHop !== outputToken && i < numHops -1) {
        // This case should ideally be avoided by smart path construction.
        // If it occurs, it means the intermediate token selection was constrained.
        // Forcing a different intermediate here might break the "exactly 2 intermediate" rule.
        // Let's assume path construction handled this well enough for a mock.
        // The getExchangeRate will return 1, and fees/slippage will apply.
    }


    const exchangeRate = getExchangeRate(tokenInThisHop, tokenOutThisHop);
    currentAmount *= exchangeRate;
    
    const hopFeePercent = 0.002 + Math.random() * 0.002; // e.g., 0.2% to 0.4%
    // Ensure total slippage is < 0.1%. So for 3 hops, avg < 0.033% per hop.
    // Max per hop: 0.1% / 3 = 0.000333
    const hopSlippagePercent = (0.00001 + Math.random() * 0.0002); // 0.001% to 0.021% to stay well below target

    const amountAfterFee = currentAmount * (1 - hopFeePercent);
    currentAmount = amountAfterFee * (1 - hopSlippagePercent); 
    totalSlippageFactor *= (1 - hopSlippagePercent);

    route.push({
      dex: hopDex,
      tokenIn: tokenInThisHop,
      tokenOut: tokenOutThisHop,
    });
    tempCurrentToken = tokenOutThisHop; // Update for next iteration if complex logic was needed
  }

  return {
    route,
    estimatedOutput: currentAmount,
    slippage: 1 - totalSlippageFactor, // Total accumulated slippage factor
  };
}
