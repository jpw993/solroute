
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SwapFormValues } from '@/schemas/swap-schema';
import { SwapFormSchema } from '@/schemas/swap-schema';
import type { Token } from '@/lib/tokens';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TokenSelect } from './token-select';
import { ArrowDownUp, Search, Loader2, ArrowRightLeft } from 'lucide-react';

type TokenSwapCardProps = {
  tokens: Token[];
  onSubmit: (data: SwapFormValues) => Promise<void>;
  isLoading: boolean;
  walletConnected: boolean;
};

export function TokenSwapCard({ tokens, onSubmit, isLoading, walletConnected }: TokenSwapCardProps) {
  const form = useForm<SwapFormValues>({
    resolver: zodResolver(SwapFormSchema),
    defaultValues: {
      inputTokenId: '',
      outputTokenId: '',
      amount: '', // Keep this as good practice
    },
  });

  const { control, handleSubmit, watch, setValue, getValues } = form;
  const inputTokenId = watch('inputTokenId');
  const outputTokenId = watch('outputTokenId');

  const handleSwitchTokens = () => {
    const currentInputId = getValues('inputTokenId');
    const currentOutputId = getValues('outputTokenId');
    setValue('inputTokenId', currentOutputId, { shouldValidate: true });
    setValue('outputTokenId', currentInputId, { shouldValidate: true });
  };
  
  const selectedInputToken = tokens.find(t => t.id === inputTokenId);

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
          <ArrowRightLeft className="h-6 w-6 text-primary" />
          Swap Tokens
        </CardTitle>
        <CardDescription>Select tokens and amount to find the best route.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TokenSelect
              control={control}
              name="inputTokenId"
              label="From"
              tokens={tokens}
              placeholder="Select input token"
              disabled={isLoading || !walletConnected}
              disabledTokens={[outputTokenId]}
            />

            <div className="flex items-center justify-center my-[-0.5rem]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSwitchTokens}
                disabled={isLoading || !walletConnected}
                aria-label="Switch input and output tokens"
                className="rounded-full border hover:bg-accent/10"
              >
                <ArrowDownUp className="h-5 w-5 text-primary" />
              </Button>
            </div>

            <TokenSelect
              control={control}
              name="outputTokenId"
              label="To"
              tokens={tokens}
              placeholder="Select output token"
              disabled={isLoading || !walletConnected}
              disabledTokens={[inputTokenId]}
            />
            
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Swap</FormLabel>
                  <FormControl>
                    <div className="relative">
                       <Input
                        type="number"
                        placeholder="0.00"
                        name={field.name}
                        value={field.value ?? ''} // Ensure value is never undefined
                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={isLoading || !walletConnected || !inputTokenId}
                        className="h-12 rounded-lg text-base pr-16"
                        step="any"
                      />
                      {selectedInputToken && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                          {selectedInputToken.symbol}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  {selectedInputToken && selectedInputToken.balance !== undefined && walletConnected && (
                     <div className="text-xs text-muted-foreground mt-1">
                       Balance: {selectedInputToken.balance.toLocaleString(undefined, { maximumFractionDigits: selectedInputToken.decimals })} {selectedInputToken.symbol}
                       <Button 
                         variant="link" 
                         size="sm" 
                         className="p-0 h-auto ml-1 text-primary"
                         onClick={() => setValue('amount', selectedInputToken.balance || 0, { shouldValidate: true })}
                       >
                         Max
                       </Button>
                     </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading || !walletConnected}
              className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-150 ease-in-out active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Finding Route...' : 'Find Optimal Route'}
            </Button>
            {!walletConnected && (
              <p className="text-sm text-center text-destructive">Please connect your wallet to swap tokens.</p>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
