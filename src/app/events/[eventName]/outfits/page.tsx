"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OutfitPage() {
  const { eventName } = useParams();
  const [outfitData, setOutfitData] = useState<Record<string, string[]>>({ "Main Look": [] });
  const [activeTab, setActiveTab] = useState("Main Look");

  useEffect(() => {
    async function loadOutfits() {
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', eventName).maybeSingle();
      if (data?.entries?.outfits) {
        setOutfitData(data.entries.outfits);
      }
    }
    loadOutfits();
  }, [eventName]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      const updated = { 
        ...outfitData, 
        [activeTab]: [...(outfitData[activeTab] || []), url.publicUrl] 
      };
      await supabase.from('event_workspaces').update({ entries: { outfits: updated } }).eq('event_name', eventName);
      setOutfitData(updated);
    }
  };

  const deleteImage = async (url: string) => {
    const updated = {
      ...outfitData,
      [activeTab]: outfitData[activeTab].filter(img => img !== url)
    };
    await supabase.from('event_workspaces').update({ entries: { outfits: updated } }).eq('event_name', eventName);
    setOutfitData(updated);
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-900 capitalize">{eventName} Outfits</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {Object.keys(outfitData).map(tab => (
            <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
          <Button variant="ghost" size="sm" onClick={() => {
            const name = prompt("New tab name:");
            if (name) setOutfitData({...outfitData, [name]: []});
          }}><Plus className="w-4 h-4"/></Button>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="mb-6">
            <input type="file" onChange={handleUpload} accept="image/*" className="hidden" id="fileInput" />
            <Button onClick={() => document.getElementById('fileInput')?.click()}>Add Image</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {outfitData[activeTab]?.map((img, idx) => (
              <Card key={idx} className="relative group p-2">
                <img src={img} alt="Outfit" className="w-full h-64 object-cover rounded" />
                <button 
                  onClick={() => deleteImage(img)}
                  className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}