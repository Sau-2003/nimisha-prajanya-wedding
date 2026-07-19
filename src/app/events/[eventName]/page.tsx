"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ClipboardList, ShoppingBag, Flame, Gamepad2, Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2, Check, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEventItems } from '@/hooks/useEventItems';

const CATEGORIES = [
  { id: 'tasks', name: 'Tasks', icon: ClipboardList, color: 'text-blue-500' },
  { id: 'taskdone', name: 'Task Done', icon: Check, color: 'text-green-600' },
  { id: 'items', name: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500' },
  { id: 'puja', name: 'Puja Items', icon: Flame, color: 'text-orange-500' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-purple-500' },
  { id: 'vendors', name: 'Vendors', icon: Briefcase, color: 'text-emerald-500' },
  { id: 'ideas', name: 'Ideas', icon: Lightbulb, color: 'text-yellow-500' },
  { id: 'outfit', name: 'Outfit', icon: Shirt, color: 'text-rose-500' },
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'text-slate-500' },
  { id: 'expenses', name: 'Expenses', icon: IndianRupee, color: 'text-gold-600' },
];

export default function SingleEventPage() {
  const { eventName } = useParams();
  const rawName = eventName ? decodeURIComponent(String(eventName)) : 'event';
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const { items: dbItems, loading, fetchData } = useEventItems(rawName);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [dueDate, setDueDate] = useState('');

  const getItemsForCategory = (catId: string) => (dbItems || []).filter((item: any) => item.category === catId);

  const handleAddEntry = async () => {
    if (!activeCategory || !newItem.trim()) return;
    await supabase.from('event_items').insert({
      event_name: rawName,
      category: activeCategory,
      content: newItem,
      due_date: activeCategory === 'tasks' ? (dueDate || null) : null
    });
    setNewItem('');
    setDueDate('');
    fetchData();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('event_items').delete().eq('id', id);
    fetchData();
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading Workspace...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-emerald-900 mb-8">{title} Workspace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setIsDialogOpen(true); }} className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-all text-left">
            <h3 className="font-bold text-lg">{cat.name}</h3>
          </button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage {activeCategory}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-2">
            <input className="border p-2 rounded" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Description..." />
            {activeCategory === 'tasks' && <input type="date" className="border p-2 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} />}
            <Button onClick={handleAddEntry}>Add</Button>
          </div>
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
            {getItemsForCategory(activeCategory || '').map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-3 border rounded bg-slate-50">
                <div>
                  <span className="text-sm">{item.content}</span>
                  {item.due_date && <div className="text-[10px] font-bold text-emerald-700 flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(item.due_date).toLocaleDateString()}</div>}
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}