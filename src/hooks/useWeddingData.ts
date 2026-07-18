import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useWeddingData(table: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    const { data: results, error } = await supabase.from(table).select('*');
    if (results) setData(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time changes
    const channel = supabase.channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [table]);

  return { data, loading, fetchData };
}