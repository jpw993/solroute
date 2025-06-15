
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

  const availableIntermediateTokens = ALL_TOKEN_SYMBOLS.filter(
    t => t !== inputToken && t !== outputToken
  );

  let previousIntermediateToken = ''; // To avoid A -> B -> A type hops if possible

  for (let i = 0; i < numHops; i++) {
    const hopDex = getRandomElement(DEX_POOL);
    let nextToken: string;

    if (i === numHops - 1) {
      // Last hop always goes to the output token
      nextToken = outputToken;
    } else {
      // Intermediate hop
      let potentialNextTokens = availableIntermediateTokens.filter(
        t => t !== currentToken && t !== previousIntermediateToken
      );

      if (potentialNextTokens.length === 0) {
        // If filtering leaves no options, try picking any available intermediate token not equal to currentToken.
        potentialNextTokens = availableIntermediateTokens.filter(t => t !== currentToken);
      }
      
      // If we are choosing the first intermediate token (i=0) or second (i=1), and outputToken is the only choice, 
      // but we still need more intermediate hops (which is true if i < numHops - 2), this is an issue.
      // For numHops = 3, this condition `i < numHops - 2` means `i < 1`, so it applies only for `i=0`.
      // The goal is to select two distinct intermediate tokens.
      if (potentialNextTokens.length === 0 || (potentialNextTokens.every(t => t === outputToken) && i < numHops -2) ) {
         const fallbackTokens = ALL_TOKEN_SYMBOLS.filter(
            t => t !== currentToken && t !== previousIntermediateToken && t !== outputToken
         );
         if (fallbackTokens.length > 0) {
            nextToken = getRandomElement(fallbackTokens);
         } else {
            // This case should be rare with enough tokens. If hit, it means we can't find 2 distinct intermediates.
            // For a mock, we might pick outputToken early.
            nextToken = outputToken; 
         }
      } else if (potentialNextTokens.includes(outputToken) && i < numHops - 2 ) {
        // Avoid output token if we still need more intermediate hops
        const nonOutputPotential = potentialNextTokens.filter(t => t !== outputToken);
        if (nonOutputPotential.length > 0) {
            nextToken = getRandomElement(nonOutputPotential);
        } else {
            nextToken = getRandomElement(potentialNextTokens); // Fallback to any, including output if only option
        }
      } else {
        nextToken = getRandomElement(potentialNextTokens);
      }
      previousIntermediateToken = currentToken; // Current token becomes previous for the *next* hop's intermediate selection
    }

    const hopFeePercent = 0.002 + Math.random() * 0.002; // e.g., 0.2% to 0.4%
    // Ensure total slippage is < 0.1%. For 3 hops, each hop slippage should be < ~0.033%
    // Let's set hopSlippagePercent to be between 0.01% and 0.02%
    const hopSlippagePercent = 0.0001 + Math.random() * 0.0001; 

    const amountAfterFee = currentAmount * (1 - hopFeePercent);
    currentAmount = amountAfterFee * (1 - hopSlippagePercent);
    totalSlippageFactor *= (1 - hopSlippagePercent);

    route.push({
      dex: hopDex,
      tokenIn: currentToken,
      tokenOut: nextToken,
    });

    currentToken = nextToken;
    if (i < numHops -1) { // Only set previousIntermediateToken if it's an intermediate token
        previousIntermediateToken = nextToken;
    }


    if (currentToken === outputToken && i < numHops - 1) {
      // This means an intermediate token selection accidentally led to the output token early.
      // For a strict 3-hop (2 intermediate) route, this path should complete all 3 hops.
      // We will let the loop continue and the last hop will be correctly set to outputToken.
      // However, the 'previousIntermediateToken' update needs care.
      // If we hit output token early, the next "intermediate" hop might try to pick it again if not careful.
      // The current logic for picking `nextToken` attempts to handle this.
      // For a mock, we can assume the token pool is diverse enough to mostly avoid this.
      // If `nextToken` became `outputToken` at `i=0`, then at `i=1`, `currentToken` is `outputToken`.
      // `potentialNextTokens` would filter out `outputToken`.
      // The `if (i === numHops - 1)` ensures the last hop is to `outputToken`.
      // Let's ensure the route ends properly.
      break; 
    }
  }
  
  // Final check to ensure the route structure is as expected.
  // If the loop broke early, or if not enough distinct intermediate tokens were found,
  // the route might be shorter than 3 hops. We'll pad it if necessary for the mock.
  // However, the `numHops = 3` and the loop structure should generally produce 3 hops.

  // Ensure the very last hop's tokenOut is indeed the outputToken
  if (route.length > 0 && route[route.length - 1].tokenOut !== outputToken) {
    if (route.length === numHops) { // If we have 3 hops, but the last one isn't to outputToken
        route[route.length - 1].tokenOut = outputToken; // Force it
    }
    // If route is shorter than numHops, it implies an early exit or issue finding intermediate.
    // For this mock, we assume the for loop with numHops=3 constructs the desired structure.
  }


  return {
    route,
    estimatedOutput: currentAmount,
    slippage: 1 - totalSlippageFactor,
  };
}

