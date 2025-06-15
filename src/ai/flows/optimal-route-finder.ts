
'use server';

/**
 * @fileOverview Finds a basic route for swapping tokens using a simple internal model.
 * Also calculates the best single DEX route for comparison.
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

const SingleDexRouteInfoSchema = z.object({
  dex: z.string().describe('The decentralized exchange used for the direct swap.'),
  tokenIn: z.string().describe('The input token for the direct swap.'),
  tokenOut: z.string().describe('The output token for the direct swap.'),
  estimatedOutput: z.number().describe('The estimated output amount from this single DEX.'),
  slippage: z.number().describe('The estimated slippage for this single DEX swap.')
});

const FindOptimalRouteOutputSchema = z.object({
  route: z.array(RouteHopSchema).describe('The optimal multi-hop route for the swap.'),
  estimatedOutput: z.number().describe('The estimated output amount of the output token from the multi-hop route.'),
  slippage: z.number().describe('The estimated slippage for the entire multi-hop route.'),
  bestSingleDexRoute: SingleDexRouteInfoSchema.nullable().describe('Details of the best route found using a single DEX. Null if no direct route is possible.'),
  savingsComparedToSingleDex: z.object({
    amount: z.number().describe('The additional amount gained by using the multi-hop route compared to the best single DEX route. Can be negative if single DEX is better.'),
    percentage: z.number().describe('The percentage gain (or loss) compared to the best single DEX route.'),
  }).nullable().describe('Comparison of savings. Null if no single DEX route to compare against.')
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

const DEX_POOL = ['Raydium', 'Orca', 'Serum', 'Aldrin', 'Saber', 'Lifinity', 'Cropper'];
const ALL_TOKEN_SYMBOLS = mockTokens.map(t => t.symbol);

// Mock exchange rates relative to USDC
const MOCK_RATES_USD: Record<string, number> = {
  SOL: 150,
  USDC: 1,
  USDT: 1,
  BONK: 0.000020,
  RAY: 1.5,
  BTC: 60000,
};

function getExchangeRate(tokenInSymbol: string, tokenOutSymbol: string): number {
  if (tokenInSymbol === tokenOutSymbol) {
    return 1;
  }

  const rateInToUsd = MOCK_RATES_USD[tokenInSymbol];
  const rateOutToUsd = MOCK_RATES_USD[tokenOutSymbol];

  if (rateInToUsd && rateOutToUsd) {
    return rateInToUsd / rateOutToUsd;
  }
  
  if (tokenInSymbol === 'USDC' && rateOutToUsd) return 1 / rateOutToUsd;
  if (tokenOutSymbol === 'USDC' && rateInToUsd) return rateInToUsd;
  
  const inVal = tokenInSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const outVal = tokenOutSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (outVal === 0) return 1; 
  const baseRate = (inVal / outVal);
  const randomFactor = 0.8 + Math.random() * 0.4; 
  const pseudoRate = baseRate * randomFactor;
  
  if (!rateInToUsd || !rateOutToUsd) {
     return 0.5 + Math.random(); 
  }

  return pseudoRate > 0 ? pseudoRate : 1;
}


function getRandomElement<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("Cannot get random element from empty array");
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { inputToken, outputToken, amount } = input;
  
  // Calculate multi-hop route
  const route: Array<z.infer<typeof RouteHopSchema>> = [];
  let currentAmountMultiHop = amount;
  let totalSlippageFactorMultiHop = 1.0;
  const numHops = 3;
  const path = [inputToken];
  const availableIntermediateTokens = ALL_TOKEN_SYMBOLS.filter(t => t !== inputToken && t !== outputToken);
  
  let lastAddedToken = inputToken;
  let inter1Candidates = availableIntermediateTokens.filter(t => t !== lastAddedToken);
  if (inter1Candidates.length === 0) inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== outputToken);
  if (inter1Candidates.length === 0) inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken);
  if (inter1Candidates.length === 0) inter1Candidates = [outputToken];
  const intermediateToken1 = getRandomElement(inter1Candidates);
  path.push(intermediateToken1);
  lastAddedToken = intermediateToken1;

  let inter2Candidates = availableIntermediateTokens.filter(t => t !== lastAddedToken && t !== intermediateToken1);
  if (inter2Candidates.length === 0) inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== outputToken && t !== intermediateToken1);
  if (inter2Candidates.length === 0) inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAddedToken && t !== intermediateToken1);
  if (inter2Candidates.length === 0) inter2Candidates = [outputToken];
  const intermediateToken2 = getRandomElement(inter2Candidates);
  path.push(intermediateToken2);
  path.push(outputToken);

  for (let i = 0; i < numHops; i++) {
    const hopDex = getRandomElement(DEX_POOL);
    const tokenInThisHop = path[i];
    const tokenOutThisHop = path[i+1];
    const exchangeRate = getExchangeRate(tokenInThisHop, tokenOutThisHop);
    currentAmountMultiHop *= exchangeRate;
    
    const hopFeePercent = 0.002 + Math.random() * 0.002; // 0.2% to 0.4%
    const hopSlippagePercent = (0.00001 + Math.random() * 0.0002); // 0.001% to 0.021%
    
    currentAmountMultiHop = currentAmountMultiHop * (1 - hopFeePercent) * (1 - hopSlippagePercent);
    totalSlippageFactorMultiHop *= (1 - hopSlippagePercent);

    route.push({ dex: hopDex, tokenIn: tokenInThisHop, tokenOut: tokenOutThisHop });
  }
  const multiHopEstimatedOutput = currentAmountMultiHop;
  const multiHopSlippage = 1 - totalSlippageFactorMultiHop;

  // Calculate best single DEX route
  let bestSingleDexOutput = -1;
  let bestSingleDexDetails: z.infer<typeof SingleDexRouteInfoSchema> | null = null;

  for (const dex of DEX_POOL) {
    let currentAmountSingleDex = amount;
    const exchangeRate = getExchangeRate(inputToken, outputToken);
    currentAmountSingleDex *= exchangeRate;

    const singleDexFeePercent = 0.005; // Slightly higher fixed fee for single DEX e.g. 0.5%
    const singleDexSlippagePercent = 0.001; // Slightly higher fixed slippage e.g. 0.1%
    
    currentAmountSingleDex = currentAmountSingleDex * (1 - singleDexFeePercent) * (1 - singleDexSlippagePercent);
    const currentSingleDexSlippage = singleDexSlippagePercent;


    if (currentAmountSingleDex > bestSingleDexOutput) {
      bestSingleDexOutput = currentAmountSingleDex;
      bestSingleDexDetails = {
        dex: dex,
        tokenIn: inputToken,
        tokenOut: outputToken,
        estimatedOutput: currentAmountSingleDex,
        slippage: currentSingleDexSlippage,
      };
    }
  }

  // Calculate savings
  let savingsComparedToSingleDex: z.infer<typeof FindOptimalRouteOutputSchema.shape.savingsComparedToSingleDex> = null;
  if (bestSingleDexDetails) {
    const amountSaved = multiHopEstimatedOutput - bestSingleDexDetails.estimatedOutput;
    let percentageSaved = 0;
    if (bestSingleDexDetails.estimatedOutput > 0) {
      percentageSaved = (amountSaved / bestSingleDexDetails.estimatedOutput) * 100;
    } else if (multiHopEstimatedOutput > 0) {
      percentageSaved = Infinity; // Represent as a very large gain if baseline is zero
    }
    
    savingsComparedToSingleDex = {
      amount: amountSaved,
      percentage: percentageSaved,
    };
  }

  return {
    route,
    estimatedOutput: multiHopEstimatedOutput,
    slippage: multiHopSlippage,
    bestSingleDexRoute: bestSingleDexDetails,
    savingsComparedToSingleDex: savingsComparedToSingleDex,
  };
}
