'use client';

import type { Control } from 'react-hook-form';
import type { Token } from '@/lib/tokens';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Image from 'next/image'; // For potential future image icons

type TokenSelectProps = {
  control: Control<any>; // Control from react-hook-form
  name: string; // Field name in the form
  label: string;
  tokens: Token[];
  placeholder?: string;
  disabled?: boolean;
  disabledTokens?: string[]; // Array of token IDs to disable
};

export function TokenSelect({
  control,
  name,
  label,
  tokens,
  placeholder = 'Select a token',
  disabled = false,
  disabledTokens = [],
}: TokenSelectProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="h-12 rounded-lg text-base">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {tokens.map((token) => (
                <SelectItem
                  key={token.id}
                  value={token.id}
                  disabled={disabledTokens.includes(token.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <token.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">({token.name})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
