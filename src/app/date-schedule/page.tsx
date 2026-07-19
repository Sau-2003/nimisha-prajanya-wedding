"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Check, Loader2 } from 'lucide-react';

export default function DateSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
  setLoading(true);

  // 1. Fetch Event Items - ONLY 'tasks' category
  const { data: eventData } = await supabase
    .from('event_items')
    .select('id, content, due_date, event_name, category')
    .not('due_date', 'is', null)
    .eq('category', 'tasks'); // Important: Only fetch 'tasks'

  // 2. Fetch Global Tasks - ONLY 'ongoing' status
  const { data: globalTasks } = await supabase
    .from('tasks')
    .select('id, text, due_date, status')
    .eq('status', 'ongoing') // Important: Only fetch 'ongoing'
    .not('due_date', 'is', null);

    const combined = [
      ...(eventData || []).map(item => ({
        id: item.id,
        content: item.content,
        due_date: item.due_date,
        event_name: item.event_name,
        isGlobal: false
      })),
      ...(globalTasks || []).map(task => ({
        id: task.id,
        content: task.text,
        due_date: task.due_date,
        event_name: 'master',
        isGlobal: true
      }))
    ];

    const sorted = combined.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    setSchedule(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Completion logic
  const markAsDone = async (item: any) => {
  if (item.isGlobal) {
    // Update 'tasks' table to 'done' (so it's caught by .eq('status', 'ongoing'))
    await supabase.from('tasks').update({ status: 'done' }).eq('id', item.id);
  } else {
    // Update 'event_items' table to 'taskDone' (so it's caught by .eq('category', 'tasks'))
    await supabase.from('event_items').update({ category: 'taskDone' }).eq('id', item.id);
  }
  fetchData(); // This will now fetch without the item you just completed
};

  if (loading) return <div className="p-12 text-center text-emerald-600"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-emerald-900 mb-8 font-serif">Date Schedule</h1>
      
      <div className="space-y-6">
        {Object.entries(
          schedule.reduce((groups, item) => {
            const date = new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            if (!groups[date]) groups[date] = [];
            groups[date].push(item);
            return groups;
          }, {} as Record<string, any[]>)
        ).map(([date, items]) => (
          <div key={date}>
            <h2 className="mb-3 text-lg font-semibold text-emerald-700">{date}</h2>
            <div className="space-y-3">
              {(items as any[]).map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{item.content}</p>
                    <p className="text-xs capitalize text-slate-500">
                      {item.isGlobal ? "Global Task" : item.event_name}
                    </p>
                  </div>
                  <button 
                    onClick={() => markAsDone(item)}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                    title="Mark Done"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}