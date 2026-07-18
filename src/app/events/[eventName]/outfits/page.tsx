"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, ShoppingBag, Flame, Gamepad2, 
  Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2,
  Check, Image as ImageIcon, RotateCcw, ExternalLink
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
  
  // New state to hold the sum from the Google Sheet
  const [sheetTotal, setSheetTotal] = useState<number | null>(null);

  useEffect(() => {
    // 1. Load standard Workspace Data
    async function loadData() {
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', rawName).maybeSingle();
      if (data?.entries) setEntries(data.entries);
      setIsLoaded(true);
    }
    loadData();

    // 2. Fetch and Parse Google Sheet for Event Expenses
    async function fetchSheetExpenses() {
      try {
        // Fetch the Google Sheet as a CSV
        const res = await fetch('https://docs.google.com/spreadsheets/d/1o5cCLpPLm38YauUIZbmayh4ywXIFiMGCIhi85fQpnag/export?format=csv&gid=1406821983');
        const csvText = await res.text();
        
        const rows = csvText.split('\n');
        let sum = 0;
        
        // Loop through rows to parse CSV safely
        rows.forEach((row, index) => {
          if (index === 0) return; // Skip header row
          
          let arr = [];
          let quote = false;
          let col = '';
          for (let i = 0; i < row.length; i++) {
              let cc = row[i], nc = row[i+1];
              if (cc === '"' && quote && nc === '"') { col += cc; ++i; continue; }
              if (cc === '"') { quote = !quote; continue; }
              if (cc === ',' && !quote) { arr.push(col.trim()); col = ''; continue; }
              col += cc;
          }
          arr.push(col.trim());
          
          // Column C is index 2 (Amount), Column F is index 5 (Event Name)
          if (arr.length >= 6) {
            const amountStr = arr[2];
            const eventNameCol = arr[5];
            
            // Check if Column F matches the current event (case-insensitive)
            if (eventNameCol && eventNameCol.toLowerCase() === rawName.toLowerCase()) {
              // Strip currency symbols and commas to convert to a number
              const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ""));
              if (!isNaN(amount)) {
                sum += amount;
              }
            }
          }
        });
        
        setSheetTotal(sum);
      } catch (error) {
        console.error("Could not sync with Google Sheets", error);
      }
    }
    fetchSheetExpenses();
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

  const pendingCount = entries.tasks?.length || 0;
  const doneCount = entries.taskdone?.length || 0;
  const totalTasks = pendingCount + doneCount;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((doneCount / totalTasks) * 100);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-emerald-900">{title} Workspace</h1>
          
          {totalTasks > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {progressPercentage}% Completed
              </span>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {doneCount} / {totalTasks} Tasks
              </span>
            </div>
          )}
        </div>

        {totalTasks > 0 && (
          <div className="w-full max-w-md bg-slate-200 rounded-full h-2.5 shadow-inner">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map(cat => {
          const items = entries[cat.id] || [];
          const isExpenses = cat.id === 'expenses';

          return (
            <button 
              key={cat.id} 
              onClick={() => {
                if (cat.id === 'outfit') {
                  router.push(`/events/${rawName}/outfits`);
                } else if (isExpenses) {
                  router.push('/budget'); // Link expenses card directly to Budget page
                } else {
                  setActiveCategory(cat.id);
                  setIsDialogOpen(true);
                }
              }} 
              className={`p-6 rounded-2xl border bg-white hover:shadow-lg transition-all text-left flex flex-col ${isExpenses ? 'border-gold-300 bg-gold-50/10' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                </div>
                {isExpenses && <ExternalLink className="w-4 h-4 text-slate-400" />}
              </div>
              
              {isExpenses ? (
                // Custom Google Sheets View for Expenses Card
                <div className="mt-2 flex-1 flex flex-col justify-center">
                  {sheetTotal === null ? (
                    <span className="text-sm italic text-slate-400">Syncing with sheet...</span>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-emerald-700 font-serif">
                        ₹{sheetTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-medium text-slate-500 block mt-1">
                        Total {title} Expenses
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                // Standard Text Preview for other categories
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
              )}
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