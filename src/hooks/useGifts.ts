import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useGifts() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching gifts:", error);
    } else {
      setGifts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { gifts, loading, fetchData };
}