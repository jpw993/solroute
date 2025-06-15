'use server';

/**
 * @fileOverview Finds the optimal route for swapping tokens using AI analysis of various DEXes.
 *
 * - findOptimalRoute - A function that handles the process of finding the optimal token swap route.
 * - FindOptimalRouteInput - The input type for the findOptimalRoute function.
 * - FindOptimalRouteOutput - The return type for the findOptimalRoute function.
 */

import {ai} from '@/ai/genkit';
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
  return findOptimalRouteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findOptimalRoutePrompt',
  input: {schema: FindOptimalRouteInputSchema},
  output: {schema: FindOptimalRouteOutputSchema},
  prompt: `You are an expert in decentralized exchanges (DEXes) on Solana.
  Given an input token, an output token, and an amount, you will find the optimal route for swapping the tokens.
  Consider factors such as slippage, fees, and liquidity across various DEXes.
  Provide the route as a series of hops, including the DEX used for each hop, the input token, and the output token.
  Also, provide the estimated output amount, fees, and slippage for the entire route.

  Input Token: {{{inputToken}}}
  Output Token: {{{outputToken}}}
  Amount: {{{amount}}}

  Respond in a valid JSON format.
  `,
});

const findOptimalRouteFlow = ai.defineFlow(
  {
    name: 'findOptimalRouteFlow',
    inputSchema: FindOptimalRouteInputSchema,
    outputSchema: FindOptimalRouteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
