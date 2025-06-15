
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

const DEX_POOL = ['Raydium', 'Orca', 'Jupiter', 'Serum', 'Aldrin', 'Saber'];
const ALL_TOKEN_SYMBOLS = mockTokens.map(t => t.symbol);

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { inputToken, outputToken, amount } = input;
  const route: Array<z.infer<typeof RouteHopSchema>> = [];
  let currentToken = inputToken;
  let currentAmount = amount;
  let totalSlippageFactor = 1.0;

  const numHops = Math.floor(Math.random() * 3) + 2; // Generate 2, 3, or 4 hops

  const availableIntermediateTokens = ALL_TOKEN_SYMBOLS.filter(
    t => t !== inputToken && t !== outputToken
  );

  if (availableIntermediateTokens.length === 0 && numHops > 1) {
    // Cannot create multi-hop route if no intermediate tokens are available
    // Fallback to a simpler direct route or throw error, here we simplify.
     // This case should be rare with a decent token list
    const directDex = getRandomElement(DEX_POOL);
    const feePercent = 0.003; // 0.3%
    const slippagePercent = 0.005; // 0.5%
    const amountAfterFee = currentAmount * (1 - feePercent);
    currentAmount = amountAfterFee * (1 - slippagePercent);
    totalSlippageFactor *= (1 - slippagePercent);
    route.push({
        dex: directDex,
        tokenIn: inputToken,
        tokenOut: outputToken,
    });

    return {
        route,
        estimatedOutput: currentAmount,
        slippage: 1 - totalSlippageFactor,
    };
  }


  let previousIntermediateToken = '';

  for (let i = 0; i < numHops; i++) {
    const hopDex = getRandomElement(DEX_POOL);
    let nextToken: string;

    if (i === numHops - 1) {
      // Last hop
      nextToken = outputToken;
    } else {
      // Intermediate hop
      let potentialNextTokens = availableIntermediateTokens.filter(t => t !== currentToken && t !== previousIntermediateToken);
      if (potentialNextTokens.length === 0) {
        // Fallback if filtering leaves no options, might happen with small token pools
        // or very specific input/output. Pick any available intermediate not current.
        potentialNextTokens = availableIntermediateTokens.filter(t => t !== currentToken);
         if (potentialNextTokens.length === 0) {
            // Highly unlikely, but as a last resort, use a generic placeholder or break
            // For mock, let's assume we can always find one or output token is next
             if (numHops === i + 1) { // if this was meant to be the last hop
                nextToken = outputToken;
             } else {
                // This state indicates an issue with token pool or logic, force outputToken
                // to prevent infinite loop or error, effectively shortening the route.
                nextToken = outputToken;
                // Adjust numHops to reflect early termination if not already last hop
                // numHops = i + 1; // This line would break the loop condition. Better to just let it use outputToken.
             }
         }
      }
      nextToken = getRandomElement(potentialNextTokens) || outputToken; // Fallback to outputToken if random selection fails
      previousIntermediateToken = nextToken;
    }

    // Simulate per-hop fees and slippage
    const hopFeePercent = 0.002 + Math.random() * 0.002; // e.g., 0.2% to 0.4%
    const hopSlippagePercent = 0.003 + Math.random() * 0.004; // e.g., 0.3% to 0.7%

    const amountAfterFee = currentAmount * (1 - hopFeePercent);
    currentAmount = amountAfterFee * (1 - hopSlippagePercent);
    totalSlippageFactor *= (1 - hopSlippagePercent);

    route.push({
      dex: hopDex,
      tokenIn: currentToken,
      tokenOut: nextToken,
    });

    currentToken = nextToken;
    if (currentToken === outputToken && i < numHops -1) {
        // Reached output token earlier than expected, stop adding hops
        break;
    }
  }
  
  // Ensure the last hop's output is indeed the outputToken if loop finished early
  if (route.length > 0 && route[route.length-1].tokenOut !== outputToken && currentToken !== outputToken) {
    // This can happen if random token selection logic failed to make progress towards outputToken
    // or if availableIntermediateTokens was exhausted.
    // As a fallback, we can either try to add one final hop to outputToken
    // or adjust the last hop. For simplicity, let's adjust the last hop if possible.
    // Or, it implies the route could not be formed as requested.
    // For this mock, we'll assume the loop correctly terminates or is broken.
  }


  return {
    route,
    estimatedOutput: currentAmount,
    slippage: 1 - totalSlippageFactor,
  };
}
