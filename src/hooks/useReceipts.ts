import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, ReceiptFormData, ReceiptStatus } from '@/types/receipt';
import { toast } from 'sonner';

export function useReceipts(searchQuery?: string) {
  return useQuery({
    queryKey: ['receipts', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('receipts')
        .select('*')
        .order('receipt_number', { ascending: false });

      if (searchQuery) {
        const q = searchQuery.trim();
        // Check if it's a numeric search (receipt number) - strip leading zeros
        const numericValue = parseInt(q, 10);
        const isNumeric = /^\d+$/.test(q) && !isNaN(numericValue);

        const orParts: string[] = [
          `customer_phone.ilike.%${q}%`,
          `customer_name.ilike.%${q}%`,
          `device_type.ilike.%${q}%`,
          `device_model.ilike.%${q}%`,
          `serial_number.ilike.%${q}%`,
          `accessories.ilike.%${q}%`,
        ];

        if (isNumeric) {
          // Allow searching by receipt number (handles "0001", "1", "4869", etc.)
          orParts.push(`receipt_number.eq.${numericValue}`);
        }

        const normalizedStatus = q.toLowerCase();
        if (['received', 'in_progress', 'completed', 'delivered', 'cancelled'].includes(normalizedStatus)) {
          orParts.push(`status.eq.${normalizedStatus}`);
        }

        query = query.or(orParts.join(','));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Receipt[];
    },
  });
}

export function useReceipt(id: string | undefined) {
  return useQuery({
    queryKey: ['receipt', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Receipt | null;
    },
    enabled: !!id,
  });
}

// Fetch all receipts in the same group (by group_id)
export function useGroupedReceipts(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ['grouped-receipts', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('group_id', groupId)
        .order('receipt_number', { ascending: true });
      if (error) throw error;
      return data as Receipt[];
    },
    enabled: !!groupId,
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: ReceiptFormData & { received_date?: string; group_id?: string }) => {
      const insertData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        device_type: formData.device_type,
        device_model: formData.device_model || null,
        serial_number: formData.serial_number || null,
        accessories: formData.accessories || null,
        problem_description: formData.problem_description,
        estimated_delivery_date: formData.estimated_delivery_date || null,
        device_password: formData.device_password || null,
        received_date: formData.received_date || new Date().toISOString(),
        group_id: formData.group_id || null,
      } as any;

      const { data, error } = await supabase
        .from('receipts')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return data as Receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['grouped-receipts'] });
      toast.success('Receipt created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create receipt: ' + error.message);
    },
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Receipt> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('receipts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated as Receipt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['receipt', data.id] });
      toast.success('Receipt updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update receipt: ' + error.message);
    },
  });
}

export function useUpdateReceiptStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      delivery_condition,
      delivered_by,
      delivery_date,
    }: {
      id: string;
      status: ReceiptStatus;
      delivery_condition?: string;
      delivered_by?: string;
      /** Explicit delivery date (YYYY-MM-DD). Falls back to today when omitted. */
      delivery_date?: string;
    }) => {
      const updateData: Partial<Receipt> = { status };

      if (status === 'delivered') {
        const today = new Date().toISOString().split('T')[0];
        updateData.actual_delivery_date = delivery_date || today;
        if (delivery_condition !== undefined) {
          updateData.delivery_condition = delivery_condition;
        }
        if (delivered_by !== undefined) {
          updateData.delivered_by = delivered_by;
        }
      }

      const { data, error } = await supabase
        .from('receipts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Receipt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['receipt', data.id] });
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
}

export function useReceiptStats() {
  return useQuery({
    queryKey: ['receipt-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('receipts')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data.length,
        received: data.filter(r => r.status === 'received').length,
        in_progress: data.filter(r => r.status === 'in_progress').length,
        completed: data.filter(r => r.status === 'completed').length,
        delivered: data.filter(r => r.status === 'delivered').length,
      };

      return stats;
    },
  });
}
