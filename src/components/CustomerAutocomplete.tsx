import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useCustomerSuggestions } from '@/hooks/useCustomerSuggestions';

interface CustomerAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCustomer: (name: string, phone: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function CustomerAutocomplete({
  value,
  onChange,
  onSelectCustomer,
  placeholder = 'Enter customer name',
  className = '',
  error = false,
  onKeyDown,
}: CustomerAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { data: suggestions = [], isLoading } = useCustomerSuggestions(inputValue);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(newValue.length >= 2);
  };

  const handleSelectCustomer = (name: string, phone: string) => {
    setInputValue(name);
    onSelectCustomer(name, phone);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={error ? 'border-destructive' : className}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((customer, index) => (
            <button
              key={`${customer.customer_name}-${customer.customer_phone}-${index}`}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => handleSelectCustomer(customer.customer_name, customer.customer_phone)}
            >
              <div className="font-medium">{customer.customer_name}</div>
              <div className="text-sm text-muted-foreground">{customer.customer_phone}</div>
            </button>
          ))}
        </div>
      )}
      {isOpen && isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
          Searching...
        </div>
      )}
    </div>
  );
}
