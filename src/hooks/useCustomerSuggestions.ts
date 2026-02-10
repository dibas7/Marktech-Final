import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerSuggestion {
  customer_name: string;
  customer_phone: string;
}

export function useCustomerSuggestions(searchTerm: string) {
  return useQuery({
    queryKey: ['customer-suggestions', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      
      const { data, error } = await supabase
        .from('receipts')
        .select('customer_name, customer_phone')
        .ilike('customer_name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      
      // Remove duplicates based on name and phone
      const unique = data.reduce((acc: CustomerSuggestion[], curr) => {
        const exists = acc.find(
          (item) => item.customer_name === curr.customer_name && item.customer_phone === curr.customer_phone
        );
        if (!exists) {
          acc.push({
            customer_name: curr.customer_name,
            customer_phone: curr.customer_phone,
          });
        }
        return acc;
      }, []);
      
      return unique;
    },
    enabled: searchTerm.length >= 2,
  });
}
