import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Tell TypeScript exactly what a Task looks like in the database
export interface TaskEntry {
  id: string;
  text: string;
  status: 'ongoing' | 'done';
  created_at?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Real-time listener: Syncs automatically when any device changes the data
    const channel = supabase.channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { tasks, loading, fetchData };
}