import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Task {
  id: string;
  content: string;
  event_name: string;
  due_date: string | null;
  category: string;
}

export function useAllTasks() {
  const [tasks, setTasks] = useState<Task[]>([]); // Use the interface here
  const [loading, setLoading] = useState(true);
  
  const fetchAllTasks = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('event_items')
      .select('*')
      .eq('category', 'tasks')
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('event_name', { ascending: true });
    
    setTasks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  return { tasks, loading, refresh: fetchAllTasks };
}