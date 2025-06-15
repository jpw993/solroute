
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

const DEX_POOL = ['Raydium', 'Orca', 'Jupiter', 'Serum', 'Aldrin', 'Saber', 'Lifinity', 'Cropper'];
const ALL_TOKEN_SYMBOLS = mockTokens.map(t => t.symbol);

// Mock exchange rates relative to USDC
const MOCK_RATES_USD: Record<string, number> = {
  SOL: 150,    // 1 SOL = 150 USDC
  USDC: 1,     // 1 USDC = 1 USDC
  USDT: 1,     // 1 USDT = 1 USDC
  BONK: 0.000020, // 1 BONK = 0.000020 USDC
  JUP: 0.75,   // 1 JUP = 0.75 USDC
  RAY: 1.5,    // 1 RAY = 1.5 USDC
  BTC: 60000,  // 1 BTC (Wrapped) = 60000 USDC
  ETH: 3000,   // 1 ETH (Wrapped) = 3000 USDC
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
  // This provides some dynamic behavior but isn't based on real market data
  // For a more robust mock, more direct rates or a more complex graph traversal would be needed.
  // For this example, let's use a small random factor to simulate some price difference.
  // Prioritize USDC as a quote if one of them is USDC.
  if (tokenInSymbol === 'USDC' && rateOutToUsd) return 1 / rateOutToUsd;
  if (tokenOutSymbol === 'USDC' && rateInToUsd) return rateInToUsd;
  
  // Simple pseudo-random factor if no clear path through USDC
  // This part is less "realistic" but ensures the function returns a number.
  // A hash function on symbols could make this deterministic.
  const inVal = tokenInSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const outVal = tokenOutSymbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (outVal === 0) return 1; // Avoid division by zero
  const baseRate = (inVal / outVal);
  // Add some slight randomness around a base derived from symbol character codes, capped and floored
  const randomFactor = 0.8 + Math.random() * 0.4; // between 0.8 and 1.2
  const pseudoRate = baseRate * randomFactor;
  
  // If one of the tokens is significantly "larger" in char code sum, it might lead to extreme rates.
  // This is a very rough heuristic. For production mocks, define all pair rates or use a proper library.
  // For now, let's just use a simpler random factor if not involving USDC.
  if (!rateInToUsd || !rateOutToUsd) {
     return 0.5 + Math.random(); // Arbitrary rate between 0.5 and 1.5
  }

  return pseudoRate > 0 ? pseudoRate : 1; // Ensure positive rate
}


function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { inputToken, outputToken, amount } = input;
  const route: Array<z.infer<typeof RouteHopSchema>> = [];
  let currentToken = inputToken;
  let currentAmount = amount;
  let totalSlippageFactor = 1.0;

  // Always generate 3 total hops, which means 2 intermediate tokens.
  const numHops = 3; 

  // Filter out input and output tokens for intermediate selection
  const availableIntermediateTokens = ALL_TOKEN_SYMBOLS.filter(
    t => t !== inputToken && t !== outputToken
  );

  // Ensure we have enough unique intermediate tokens.
  // If not, this mock will have issues. For this example, assume enough tokens exist.
  if (availableIntermediateTokens.length < 2 && numHops > 1) {
    // This case should be handled if the token list is very small.
    // For now, we proceed, but the route might not be as "complex" as desired.
    console.warn("Not enough unique intermediate tokens available for a 2-intermediate-hop route.");
  }
  
  let intermediateToken1: string;
  let intermediateToken2: string;

  if (availableIntermediateTokens.length >= 2) {
    intermediateToken1 = getRandomElement(availableIntermediateTokens);
    const remainingIntermediateTokens = availableIntermediateTokens.filter(t => t !== intermediateToken1);
    intermediateToken2 = getRandomElement(remainingIntermediateTokens);
  } else if (availableIntermediateTokens.length === 1) {
    // Only one intermediate token available, use it twice conceptually or make one hop direct to output
    intermediateToken1 = availableIntermediateTokens[0];
    intermediateToken2 = outputToken; // Force second "intermediate" to be output, effectively making it a 2-hop
     // Adjust numHops if we can't make 3 distinct hops
     // This part of the logic can be complex to make it always "look" like 3 hops
     // For this iteration, let's stick to the structure based on numHops and let token selection guide.
  } else {
    // No intermediate tokens available, implies a direct swap (or input=output)
    intermediateToken1 = outputToken; // Force first intermediate to output
    intermediateToken2 = outputToken; // And second as well
  }


  const hopTokens = [inputToken, intermediateToken1, intermediateToken2, outputToken];
  // Ensure the sequence makes sense if outputToken was picked early.
  // The goal is: input -> inter1 -> inter2 -> output

  let actualHops = 0;
  let tempCurrentToken = inputToken;
  let tempCurrentAmount = amount;

  // Construct the route ensuring it eventually reaches the outputToken over numHops
  // The intermediate tokens chosen might already include outputToken if not enough unique available
  const chosenPathTokens = [inputToken];
  if (numHops > 1) chosenPathTokens.push(intermediateToken1);
  if (numHops > 2) chosenPathTokens.push(intermediateToken2);
  chosenPathTokens.push(outputToken); // Last token is always the desired output

  // Deduplicate and ensure path length (this is getting complex for a mock)
  // Simplified path construction for 3 hops:
  const path = [inputToken];
  if (intermediateToken1 !== inputToken && intermediateToken1 !== outputToken) {
    path.push(intermediateToken1);
  } else { // try to pick another if first pick was bad
     const otherOptions = ALL_TOKEN_SYMBOLS.filter(t => t !== inputToken && t !== outputToken && t !== intermediateToken1);
     if (otherOptions.length > 0) path.push(getRandomElement(otherOptions));
     else path.push(intermediateToken1); // fallback to original potentially bad pick
  }

  if (intermediateToken2 !== inputToken && intermediateToken2 !== outputToken && intermediateToken2 !== path[1]) {
     path.push(intermediateToken2);
  } else {
     const otherOptions = ALL_TOKEN_SYMBOLS.filter(t => t !== inputToken && t !== outputToken && t !== path[1] && t !== intermediateToken2);
     if (otherOptions.length > 0) path.push(getRandomElement(otherOptions));
     else path.push(intermediateToken2); // fallback
  }
  path.push(outputToken);
  
  //Ensure path has 4 distinct elements for 3 hops if possible, or gracefully degrade
  const uniquePathTokens = [...new Set(path)];
  
  // Reconstruct path to ensure 3 hops if possible.
  // This is a mock, so we can be a bit artificial.
  const finalPath = [inputToken];
  let lastAdded = inputToken;
  
  // Pick first intermediate
  let inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAdded && t !== outputToken);
  if (inter1Candidates.length === 0) inter1Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAdded); // Relax constraint if needed
  const inter1 = getRandomElement(inter1Candidates.length > 0 ? inter1Candidates : [outputToken]); // Default to output if no other choice
  finalPath.push(inter1);
  lastAdded = inter1;

  // Pick second intermediate
  let inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAdded && t !== outputToken);
  if (inter2Candidates.length === 0) inter2Candidates = ALL_TOKEN_SYMBOLS.filter(t => t !== lastAdded);
  const inter2 = getRandomElement(inter2Candidates.length > 0 ? inter2Candidates : [outputToken]);
  finalPath.push(inter2);
  
  finalPath.push(outputToken); // Ensure final destination

  // Build route from finalPath, ensuring 3 segments
  for (let i = 0; i < numHops; i++) {
    const hopDex = getRandomElement(DEX_POOL);
    const tokenInThisHop = finalPath[i];
    const tokenOutThisHop = finalPath[i+1];

    if (tokenInThisHop === tokenOutThisHop && i < numHops -1) {
        // Avoid A->A hop unless it's the last conceptual segment leading to no change.
        // For a mock, this can happen if token pool is small or choices align badly.
        // Let's try to recover by picking a different next token if it's not the final hop.
        const recoveryCandidates = ALL_TOKEN_SYMBOLS.filter(t => t !== tokenInThisHop && (i+1 === numHops-1 ? t === outputToken : t !== outputToken) );
        if (recoveryCandidates.length > 0) {
            finalPath[i+1] = getRandomElement(recoveryCandidates);
        }
        // If still A->A, the rate will be 1, fee and slip applied.
    }

    const exchangeRate = getExchangeRate(tokenInThisHop, finalPath[i+1]);
    tempCurrentAmount *= exchangeRate;
    
    const hopFeePercent = 0.002 + Math.random() * 0.002; // e.g., 0.2% to 0.4%
    const hopSlippagePercent = 0.0001 + Math.random() * 0.0001; // Max 0.02% per hop

    const amountAfterFee = tempCurrentAmount * (1 - hopFeePercent);
    tempCurrentAmount = amountAfterFee * (1 - hopSlippagePercent); // Apply slippage after fee on exchanged amount
    totalSlippageFactor *= (1 - hopSlippagePercent);

    route.push({
      dex: hopDex,
      tokenIn: tokenInThisHop,
      tokenOut: finalPath[i+1],
    });
    
    if (finalPath[i+1] === outputToken && i < numHops - 1) {
        // Reached output token early, but we need to show 3 hops.
        // The loop will continue, subsequent hops might be outputToken -> outputToken
        // or forced to a different intermediate if logic above tried to fix it.
        // For a strict 3-hop mock, the path construction should guarantee 3 distinct stages if possible.
    }
  }


  return {
    route,
    estimatedOutput: tempCurrentAmount,
    slippage: 1 - totalSlippageFactor,
  };
}

