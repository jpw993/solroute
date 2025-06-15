
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

  // Generate 3 or 4 total hops (meaning 2 or 3 intermediate tokens)
  const numHops = Math.floor(Math.random() * 2) + 3; 

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
        // If filtering leaves no options (e.g., to avoid currentToken and previousIntermediateToken),
        // try picking any available intermediate token not equal to currentToken.
        potentialNextTokens = availableIntermediateTokens.filter(t => t !== currentToken);
      }
      
      if (potentialNextTokens.length === 0 || potentialNextTokens.every(t => t === outputToken) && i < numHops -2) {
         // If still no options or only output token is left and we need more intermediate hops
         // pick any token that is not current, not previous and not output.
         // This situation is rare but can happen if availableIntermediateTokens is small.
         const fallbackTokens = ALL_TOKEN_SYMBOLS.filter(
            t => t !== currentToken && t !== previousIntermediateToken && t !== outputToken
         );
         if (fallbackTokens.length > 0) {
            nextToken = getRandomElement(fallbackTokens);
         } else {
            // Absolute fallback: if no other choice, may lead to shorter route or direct to output.
            // This might mean we can't satisfy the "at least 2 intermediate hops" constraint perfectly.
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
      previousIntermediateToken = nextToken; 
    }

    const hopFeePercent = 0.002 + Math.random() * 0.002; // e.g., 0.2% to 0.4%
    // Ensure total slippage is < 0.1%. For max 4 hops, each hop slippage should be < 0.025%
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

    if (currentToken === outputToken && i < numHops - 1) {
      break; 
    }
  }
  
  // Ensure the final hop's output token is the desired outputToken if the loop terminated early
  // or intermediate selection forced an early path to outputToken.
  // The current logic tries to ensure last hop is to outputToken or breaks if outputToken is reached early.
  // If the loop completes and currentToken is not outputToken, it might indicate a flaw in intermediate token selection logic
  // or extreme token scarcity for a valid multi-hop route. For this mock, we assume the logic attempts its best.
  if (route.length > 0 && route[route.length-1].tokenOut !== outputToken && currentToken === outputToken) {
    // This case should ideally not be hit if logic correctly assigns nextToken = outputToken for the last hop.
    // However, if loop broke early after currentToken became outputToken, this is fine.
  } else if (route.length > 0 && route[route.length-1].tokenOut !== outputToken && currentToken !== outputToken) {
    // If the route doesn't end in the output token, try to add a final hop. This can happen if intermediate choices got exhausted.
    // This part is tricky; a robust solution might involve backtracking or more complex graph search if it were a real router.
    // For a mock, we can just append a direct hop if feasible or accept the route as is.
    // The current loop structure is designed to avoid this by setting nextToken=outputToken for the last planned hop.
  }


  return {
    route,
    estimatedOutput: currentAmount,
    slippage: 1 - totalSlippageFactor,
  };
}

