import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useChadana() {
  const [chadana, setChadana] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chadana')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching chadana:", error);
    } else {
      setChadana(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { chadana, loading, fetchData };
}