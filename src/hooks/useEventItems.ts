import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useEventItems(eventName: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('event_items')
      .select('*')
      .eq('event_name', eventName);
    
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    const channel = supabase.channel(`public:event_items:${eventName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_items' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventName]);

  // ADD fetchData HERE so the page can trigger it manually
  return { items, loading, fetchData }; 
}