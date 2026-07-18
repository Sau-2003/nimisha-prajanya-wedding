"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, ShoppingBag, Flame, Gamepad2, 
  Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2,
  Check, Image as ImageIcon, RotateCcw
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

  const [entries, setEntries] = useState<any>({ tasks: [], taskdone: [], outfit: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

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
    const updatedEntries = { ...entries, [activeCategory]: [...(entries[activeCategory] || []), newItem] };
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
    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      const entry = `ImageLink: ${url.publicUrl} | Caption: Attachment`;
      const updatedEntries = { ...entries, [activeCategory]: [...(entries[activeCategory] || []), entry] };
      syncToCloud(updatedEntries);
    }
  };

  const renderThumbnail = (itemString: string) => {
    const url = itemString.split(' | ')[0].replace('ImageLink: ', '');
    return (
      <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded">
        <img src={url} alt="thumbnail" className="w-12 h-12 object-cover rounded shadow-sm border" />
        <span className="text-sm text-blue-600 underline">View Full Image</span>
      </a>
    );
  };

  if (!isLoaded) return <div className="p-12 text-center text-emerald-600">Loading Workspace...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-emerald-900 mb-8">{title} Workspace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => {
          const items = entries[cat.id] || [];
          return (
            <button 
              key={cat.id} 
              onClick={() => {
                if (cat.id === 'outfit') {
                  router.push(`/events/${rawName}/outfits`);
                } else {
                  setActiveCategory(cat.id);
                  setIsDialogOpen(true);
                }
              }} 
              className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-all text-left flex flex-col"
            >
              <div className="flex items-center gap-3 mb-2">
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
                <h3 className="font-bold text-lg">{cat.name}</h3>
              </div>
              
              {/* Preview Section on the Tab */}
              <div className="text-sm text-slate-500 flex-1 space-y-1">
                {items.length === 0 ? (
                  <span className="italic text-slate-400">Empty</span>
                ) : (
                  items.slice(0, 2).map((item: string, i: number) => (
                    <div key={i} className="truncate">
                      {item.startsWith('ImageLink:') ? '📷 Attached Image' : `• ${item}`}
                    </div>
                  ))
                )}
                {items.length > 2 && <div className="text-xs font-bold text-slate-400">+{items.length - 2} more</div>}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage {activeCategory}</DialogTitle></DialogHeader>
          
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              className="flex-1 border p-2 rounded-lg" 
              value={newItem} 
              onChange={e => setNewItem(e.target.value)} 
              placeholder="Type new entry here..." 
              onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
            />
            <Button onClick={handleAddEntry} className="bg-emerald-600"><Plus className="w-4 h-4 mr-1"/> Add</Button>
            
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-4 h-4"/></Button>
          </div>

          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
            {(entries[activeCategory || ''] || []).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 border rounded bg-slate-50">
                <div className="flex-1 overflow-hidden pr-4">
                  {item.startsWith('ImageLink:') ? renderThumbnail(item) : <span className="text-sm">{item}</span>}
                </div>
                <div className="flex gap-2">
                  {activeCategory === 'tasks' && <button onClick={() => completeTask(idx)} className="text-green-600 p-1 hover:bg-green-100 rounded"><Check className="w-4 h-4"/></button>}
                  {activeCategory === 'taskdone' && <button onClick={() => revertTask(idx)} className="text-amber-600 p-1 hover:bg-amber-100 rounded"><RotateCcw className="w-4 h-4"/></button>}
                  <button onClick={() => { const u = {...entries, [activeCategory!]: entries[activeCategory!].filter((_:any,i:number)=>i!==idx)}; syncToCloud(u); }} className="text-red-500 p-1 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}