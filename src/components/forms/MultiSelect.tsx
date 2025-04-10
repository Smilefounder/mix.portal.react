'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface MultiSelectProps {
  id?: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function MultiSelect({
  id,
  name,
  value = [],
  onChange,
  options,
  placeholder = 'Select items...',
  disabled = false,
  className
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = value.map(
    (v) => options.find((option) => option.value === v)?.label
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id || name}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          <div className='flex flex-wrap gap-1'>
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <Badge
                  key={label}
                  variant='secondary'
                  className='mr-1 mb-1'
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(
                      value.filter(
                        (v) =>
                          v !== options.find((o) => o.label === label)?.value
                      )
                    );
                  }}
                >
                  {label}
                  <span className='ml-1'>×</span>
                </Badge>
              ))
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No item found.</CommandEmpty>
          <CommandGroup className='max-h-64 overflow-auto'>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  const isSelected = value.includes(option.value);
                  let newValue: string[];
                  
                  if (isSelected) {
                    newValue = value.filter((v) => v !== option.value);
                  } else {
                    newValue = [...value, option.value];
                  }
                  
                  onChange(newValue);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 