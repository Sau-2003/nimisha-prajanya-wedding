import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useEventItems(eventName: string) {
  const [items, setItems] = useState<any[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('event_items')
      .select('*')
      .eq('event_name', eventName);
    
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [eventName]);

  // IMPORTANT: You MUST return the object here
  return { items, loading, fetchData };
}