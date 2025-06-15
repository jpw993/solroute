
'use server';

/**
 * @fileOverview Finds a basic route for swapping tokens using a simple internal model.
 *
 * - findOptimalRoute - A function that handles the process of finding a token swap route.
 * - FindOptimalRouteInput - The input type for the findOptimalRoute function.
 * - FindOptimalRouteOutput - The return type for the findOptimalRoute function.
 */

import {z} from 'genkit';

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
  fees: z.number().describe('The estimated fees for the entire route'),
  slippage: z.number().describe('The estimated slippage for the entire route'),
});
export type FindOptimalRouteOutput = z.infer<typeof FindOptimalRouteOutputSchema>;

export async function findOptimalRoute(input: FindOptimalRouteInput): Promise<FindOptimalRouteOutput> {
  const { inputToken, outputToken, amount } = input;

  let intermediateTokenSymbol: string;

  if (inputToken !== 'USDC' && outputToken !== 'USDC') {
    intermediateTokenSymbol = 'USDC';
  } else if (inputToken !== 'SOL' && outputToken !== 'SOL') {
    intermediateTokenSymbol = 'SOL';
  } else {
    intermediateTokenSymbol = 'RAY'; // Fallback if both USDC and SOL are endpoints
    // Ensure RAY is not also an endpoint, for a more robust mock this could be refined
    if (intermediateTokenSymbol === inputToken || intermediateTokenSymbol === outputToken) {
        // If RAY is also an endpoint, pick another distinct token if available or a generic placeholder
        const otherTokens = ['JUP', 'BONK', 'ETH', 'BTC']; // Example other tokens
        const distinctToken = otherTokens.find(t => t !== inputToken && t !== outputToken);
        intermediateTokenSymbol = distinctToken || 'ANY_INTERMEDIATE'; // A generic placeholder if no distinct found
    }
  }


  const dex1 = 'Raydium';
  const dex2 = 'Orca';

  const feeHop1Percent = 0.0025; // 0.25%
  const slippageHop1Percent = 0.005; // 0.5%
  const feeHop2Percent = 0.0030; // 0.30%
  const slippageHop2Percent = 0.006; // 0.6%

  // Calculate amount after first hop (fees and slippage)
  const amountAfterFee1 = amount * (1 - feeHop1Percent);
  const amountAfterSlippage1 = amountAfterFee1 * (1 - slippageHop1Percent);
  const intermediateAmountObtained = amountAfterSlippage1;

  // Calculate amount after second hop (fees and slippage)
  const amountAfterFee2 = intermediateAmountObtained * (1 - feeHop2Percent);
  const estimatedOutputAmount = amountAfterFee2 * (1 - slippageHop2Percent);

  // Calculate total fees
  const fee1Value = amount * feeHop1Percent;
  const fee2Value = intermediateAmountObtained * feeHop2Percent; // Fee on the amount entering hop 2
  const totalFeesValue = fee1Value + fee2Value;

  // Calculate combined slippage factor for the entire route
  const combinedSlippageFactor = 1 - (1 - slippageHop1Percent) * (1 - slippageHop2Percent);

  const route: FindOptimalRouteOutput['route'] = [
    {
      dex: dex1,
      tokenIn: inputToken,
      tokenOut: intermediateTokenSymbol,
    },
    {
      dex: dex2,
      tokenIn: intermediateTokenSymbol,
      tokenOut: outputToken,
    },
  ];

  return {
    route,
    estimatedOutput: estimatedOutputAmount,
    fees: totalFeesValue,
    slippage: combinedSlippageFactor, // Representing total slippage percentage
  };
}

