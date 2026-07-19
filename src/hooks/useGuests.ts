import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useGuests() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setGuests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time listener for multi-device sync
    const channel = supabase.channel('public:guests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { guests, loading, fetchData };
}