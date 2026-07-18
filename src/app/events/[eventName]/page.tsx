"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, ShoppingBag, Flame, Gamepad2, 
  Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2,
  Check, Image as ImageIcon, RotateCcw, LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const router = useRouter();
  const rawName = eventName ? String(eventName) : 'event';
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entries, setEntries] = useState<any>({ outfit: { General: [] }, tasks: [], taskdone: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', rawName).maybeSingle();
      if (data?.entries) setEntries(data.entries);
      setIsLoaded(true);
    }
    loadData();
  }, [rawName]);

  const syncToCloud = async (updatedEntries: any) => {
    setEntries(updatedEntries);
    await supabase.from('event_workspaces').upsert({ event_name: rawName, entries: updatedEntries });
  };

  const handleAddEntry = () => {
    if (!activeCategory || !newItem.trim()) return;
    const updatedEntries = { 
      ...entries, 
      [activeCategory]: [...(entries[activeCategory] || []), newItem] 
    };
    syncToCloud(updatedEntries);
    setNewItem('');
  };

  const completeTask = (index: number) => {
    const task = entries['tasks'][index];
    const updatedEntries = { 
      ...entries, 
      tasks: entries['tasks'].filter((_: any, i: number) => i !== index),
      taskdone: [...(entries['taskdone'] || []), task]
    };
    syncToCloud(updatedEntries);
  };

  const revertTask = (index: number) => {
    const task = entries['taskdone'][index];
    const updatedEntries = { 
      ...entries, 
      taskdone: entries['taskdone'].filter((_: any, i: number) => i !== index),
      tasks: [...(entries['tasks'] || []), task]
    };
    syncToCloud(updatedEntries);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCategory) return;
    const caption = prompt("Enter a caption:", "Beautiful Photo");
    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      const entry = `ImageLink: ${url.publicUrl} | Caption: ${caption}`;
      const updatedEntries = { ...entries, [activeCategory]: [...(entries[activeCategory] || []), entry] };
      syncToCloud(updatedEntries);
    }
  };

  if (!isLoaded) return <div className="p-12 text-center text-emerald-600">Loading...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-emerald-900 mb-8">{title} Workspace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setIsDialogOpen(true); }} className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-all text-left">
            <cat.icon className={`w-8 h-8 ${cat.color} mb-4`} />
            <h3 className="font-bold text-lg">{cat.name}</h3>
          </button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage {activeCategory}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <textarea className="w-full border p-3 rounded-lg min-h-[100px]" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add items..." />
            <div className="flex gap-2">
              <Button onClick={handleAddEntry} className="flex-1 bg-emerald-600">Add</Button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}><ImageIcon /></Button>
            </div>
            {activeCategory === 'outfit' && (
              <Button variant="secondary" className="w-full" onClick={() => router.push(`/events/${rawName}/gallery`)}>
                <LayoutGrid className="mr-2"/> View Outfit Gallery
              </Button>
            )}
          </div>
          <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
            {(entries[activeCategory || ''] || []).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded">
                {item.startsWith('ImageLink:') ? <a href={item.split(' | ')[0].replace('ImageLink: ', '')} target="_blank" className="text-blue-600 underline">View Image</a> : <span>{item}</span>}
                <div className="flex gap-2">
                  {activeCategory === 'tasks' && <button onClick={() => completeTask(idx)} className="text-green-600"><Check /></button>}
                  {activeCategory === 'taskdone' && <button onClick={() => revertTask(idx)} className="text-amber-600"><RotateCcw /></button>}
                  <button onClick={() => { const u = {...entries, [activeCategory!]: entries[activeCategory!].filter((_:any,i:number)=>i!==idx)}; syncToCloud(u); }} className="text-red-500"><Trash2 /></button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}