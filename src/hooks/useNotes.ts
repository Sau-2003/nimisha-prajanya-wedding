import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time listener for multi-device sync
    const channel = supabase.channel('public:notes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { notes, loading, fetchData };
}