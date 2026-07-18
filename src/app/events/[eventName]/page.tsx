"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ClipboardList, ShoppingBag, Flame, Gamepad2, 
  Briefcase, Lightbulb, Shirt, StickyNote, IndianRupee, Plus, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = [
  { id: 'tasks', name: 'Tasks', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'items', name: 'Items Needed', icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { id: 'puja', name: 'Puja Items', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { id: 'vendors', name: 'Vendors', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'ideas', name: 'Ideas', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { id: 'outfit', name: 'Outfit', icon: Shirt, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { id: 'notes', name: 'Notes', icon: StickyNote, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'expenses', name: 'Expenses', icon: IndianRupee, color: 'text-gold-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
];

export default function SingleEventPage() {
  const params = useParams();
  const rawName = (params?.eventName as string) || 'Event';
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // App State
  const [entries, setEntries] = useState<Record<string, string[]>>({
    tasks: ['Book venue', 'Finalize guest list'],
    items: ['Return gifts (x50)'],
    expenses: ['₹25,000 - Advance for decor']
  });
  
  // Dialog State (One smart dialog instead of 9)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  // Find the currently active module data
  const activeModule = CATEGORIES.find(c => c.id === activeCategory);
  const activeEntries = activeCategory ? (entries[activeCategory] || []) : [];

  const handleAddEntry = () => {
    if (!activeCategory || !newItem.trim()) return;
    setEntries(prev => ({
      ...prev,
      [activeCategory]: [...(prev[activeCategory] || []), newItem]
    }));
    setNewItem(''); 
  };

  const handleDeleteEntry = (index: number) => {
    if (!activeCategory) return;
    setEntries(prev => ({
      ...prev,
      [activeCategory]: (prev[activeCategory] || []).filter((_, i) => i !== index)
    }));
  };

  const openModal = (categoryId: string) => {
    setActiveCategory(categoryId);
    setNewItem('');
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-emerald-100 pb-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-emerald-900 dark:text-emerald-50">
            {title} Workspace
          </h1>
          <p className="text-slate-500 mt-2">Manage all details, items, and vendors for {title}.</p>
        </div>
      </div>

      {/* The Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mt-8">
        {CATEGORIES.map((module, i) => {
          const Icon = module.icon;
          const currentEntries = entries[module.id] || [];

          return (
            <motion.div key={module.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <button 
                onClick={() => openModal(module.id)}
                className="w-full text-left bg-white dark:bg-slate-950 p-4 lg:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 hover:shadow-md transition-all group cursor-pointer block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${module.bg} transition-colors`}>
                    <Icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-full">
                    {currentEntries.length} items
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{module.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {currentEntries.length > 0 ? currentEntries[0] : 'Click to add items...'}
                </p>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* The Single Smart Pop-up */}
      {activeModule && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                <activeModule.icon className={`w-6 h-6 ${activeModule.color}`} />
                Manage {activeModule.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder={`Add new to ${activeModule.name}...`}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEntry()}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="button" onClick={handleAddEntry} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {activeEntries.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8 italic">No entries yet. Add one above!</p>
                ) : (
                  activeEntries.map((item, index) => (
                    <div key={`${item}-${index}`} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault(); 
                          e.stopPropagation();
                          handleDeleteEntry(index);
                        }}
                        className="text-slate-400 hover:text-red-500 p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}