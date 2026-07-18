"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function OutfitGallery() {
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchGallery() {
      // 1. Fetch all event entries
      const { data, error } = await supabase.from('event_workspaces').select('entries');
      
      if (error || !data) {
        setIsLoaded(true);
        return;
      }
      
      // 2. Safely extract outfit photos without crashing
      const allEntries = data.flatMap(d => {
        // CRASH FIX: Check if entries and outfit actually exist before reading them
        if (!d.entries || !d.entries.outfit) return [];
        
        // CRASH FIX: Ensure it's actually an array
        if (!Array.isArray(d.entries.outfit)) return [];
        
        return d.entries.outfit;
      });
        
      const formatted = allEntries
        .filter(item => typeof item === 'string' && item.startsWith('ImageLink:'))
        .map(item => ({
            url: item.split(' | ')[0].replace('ImageLink: ', ''),
            caption: item.split(' | ')[1]?.replace('Caption: ', '') || 'Outfit'
        }));
      
      setImages(formatted);
      setIsLoaded(true);
    }
    
    fetchGallery();
  }, []);

  if (!isLoaded) return <div className="p-12 text-center text-emerald-600">Loading Gallery...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-serif font-bold text-emerald-900 mb-8">Outfit Gallery</h1>
      
      {images.length === 0 ? (
        <div className="text-slate-500 bg-slate-50 p-8 rounded-xl text-center">
          No outfit photos found yet. Go to an event and upload some!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-white"
            >
              <img 
                src={img.url} 
                alt="Outfit" 
                className="w-full h-64 object-cover"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Unavailable'; }} 
              />
              <div className="p-4">
                <p className="text-sm text-slate-600 font-medium truncate">{img.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}