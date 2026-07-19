"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export default function OutfitPage() {
  const { eventName } = useParams();
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    async function loadOutfits() {
      // Fetch the entries for this event
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', eventName).maybeSingle();
      if (data?.entries?.outfit) {
        setImages(data.entries.outfit);
      }
    }
    loadOutfits();
  }, [eventName]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to Supabase Storage
    const { data } = await supabase.storage.from('task-images').upload(`${Date.now()}_${file.name}`, file);
    if (data?.path) {
      const { data: url } = supabase.storage.from('task-images').getPublicUrl(data.path);
      const newOutfit = url.publicUrl;

      // Update the DB
      const updated = [...images, newOutfit];
      await supabase.from('event_workspaces').update({ 
        entries: { outfit: updated } 
      }).eq('event_name', eventName);
      
      setImages(updated);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-900 capitalize">{eventName} Outfits</h1>
      
      <div className="mb-6">
        <input type="file" onChange={handleUpload} accept="image/*" className="hidden" id="fileInput" />
        <Button onClick={() => document.getElementById('fileInput')?.click()}>
          <Plus className="w-4 h-4 mr-2" /> Add Outfit Image
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <Card key={idx} className="p-2">
            <img src={img} alt="Outfit" className="w-full h-64 object-cover rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}