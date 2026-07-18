"use client";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function EventGallery() {
  const { eventName } = useParams();
  const [outfitData, setOutfitData] = useState<any>({});

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('event_workspaces').select('entries').eq('event_name', eventName).single();
      setOutfitData(data?.entries.outfit || {});
    }
    fetch();
  }, [eventName]);

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-serif text-emerald-900 mb-8 capitalize">{eventName} Outfit Gallery</h1>
      {Object.entries(outfitData).map(([tab, photos]: [string, any]) => (
        <div key={tab} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">{tab}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {photos.map((p: any, i: number) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden border">
                <img src={p.url} className="w-full h-64 object-cover transition-transform group-hover:scale-105" />
                <div className="p-3 bg-white text-sm font-medium">{p.caption}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}