import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface VendorEntry {
  id: string;
  category: string;
  assigned_vendor?: string | null;
  status: string;
  estimated_cost?: number | null;   // <-- Add this
  contact_number?: string[] | null;   // <-- Add this
  notes?: string | null;            // <-- Add this
  created_at?: string;
  updated_at?: string;
}

export function useVendors() {
  const [dbVendors, setDbVendors] = useState<VendorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase.from('vendors').select('*');
    if (data) setDbVendors(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time listener for multi-device sync
    const channel = supabase.channel('public:vendors')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendors' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { dbVendors, loading, fetchData };
}