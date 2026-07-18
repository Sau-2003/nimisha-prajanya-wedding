"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventOutfitPage() {
  const { eventName } = useParams();
  const router = useRouter();
  const rawName = eventName ? String(eventName) : 'event';
  const title = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data structure: { "General": [{url: "...", caption: "..."}, ...], "Bride": [...] }
  const [outfits, setOutfits] = useState<Record<string, any[]>>({ General: [] });
  const [activeTab, setActiveTab] = useState('General');
  const [newTabName, setNewTabName] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', rawName).single();
      
      // If the outfit data is still the old array format, convert it or start fresh
      let loadedOutfits = data?.entries?.outfit || { General: [] };
      if (Array.isArray(loadedOutfits)) {
          loadedOutfits = { General: [] }; 
      }
      
      setOutfits(loadedOutfits);
      setIsLoaded(true);
    }
    loadData();
  }, [rawName]);

  const syncToCloud = async (updatedOutfits: any) => {
    setOutfits(updatedOutfits);
    
    // Fetch full entries first to not overwrite other categories
    const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', rawName).single();
    const currentEntries = data?.entries || {};
    
    await supabase.from('event_workspaces').upsert({ 
      event_name: rawName, 
      entries: { ...currentEntries, outfit: updatedOutfits } 
    });
  };

  const handleAddTab = () => {
    if (!newTabName.trim() || outfits[newTabName]) return;
    const updated = { ...outfits, [newTabName.trim()]: [] };
    syncToCloud(updated);
    setActiveTab(newTabName.trim());
    setNewTabName('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      const newPhoto = { url: url.publicUrl, caption: newCaption || 'Attachment' };
      
      const updated = {
        ...outfits,
        [activeTab]: [...(outfits[activeTab] || []), newPhoto]
      };
      syncToCloud(updated);
      setNewCaption(''); // Reset caption input
    }
  };

  const deletePhoto = (index: number) => {
    const updated = {
      ...outfits,
      [activeTab]: outfits[activeTab].filter((_, i) => i !== index)
    };
    syncToCloud(updated);
  };

  if (!isLoaded) return <div className="p-12 text-center">Loading Outfits...</div>;

  const currentPhotos = outfits[activeTab] || [];

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-sm text-slate-500 hover:text-emerald-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to {title} Workspace
      </button>
      
      <h1 className="text-4xl font-serif font-bold text-emerald-900 mb-8">{title} Outfits</h1>

      {/* Tabs Row */}
      <div className="flex gap-2 overflow-x-auto mb-8 pb-2 border-b">
        {Object.keys(outfits).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {tab}
          </button>
        ))}
        <div className="flex items-center ml-4 gap-2">
          <input 
            type="text" 
            placeholder="New Category (e.g. Groom)" 
            className="border p-1.5 rounded text-sm w-40"
            value={newTabName}
            onChange={e => setNewTabName(e.target.value)}
          />
          <Button size="sm" variant="outline" onClick={handleAddTab}><Plus className="w-4 h-4"/></Button>
        </div>
      </div>

      {/* Attachment Input Area */}
      <div className="bg-slate-50 p-4 rounded-xl border mb-8 flex gap-4 items-center">
        <input 
          type="text" 
          placeholder="Type notes or photo caption here..." 
          className="flex-1 border p-2 rounded bg-white"
          value={newCaption}
          onChange={e => setNewCaption(e.target.value)}
        />
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
        <Button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 whitespace-nowrap">
          <ImageIcon className="w-4 h-4 mr-2" /> Attach Photo
        </Button>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentPhotos.length === 0 ? (
          <p className="text-slate-400 italic col-span-full">No attachments in {activeTab} yet.</p>
        ) : (
          currentPhotos.map((photo, idx) => (
            <div key={idx} className="border rounded-xl bg-white overflow-hidden shadow-sm relative group">
              <a href={photo.url} target="_blank" rel="noreferrer">
                <img src={photo.url} alt={photo.caption} className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
              </a>
              <div className="p-2 text-xs font-medium text-slate-700 truncate">
                {photo.caption}
              </div>
              <button 
                onClick={() => deletePhoto(idx)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}