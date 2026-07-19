"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OutfitItem = {
  id: string;
  category: string;
  content: string; // Changed back to 'content' to match your DB
};

export default function OutfitPage() {
  const { eventName } = useParams();
  const router = useRouter();
  
  const rawName = eventName ? decodeURIComponent(String(eventName)) : 'event';

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [activeTab, setActiveTab] = useState("Main Look");
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOutfits = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_items')
      .select('*')
      .eq('event_name', rawName)
      .like('category', 'outfit_%');

    if (!error && data) {
      setOutfitItems(data as OutfitItem[]);
    }
    setLoading(false);
  }, [rawName]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const dbTabs = Array.from(new Set(outfitItems.map(item => item.category.replace('outfit_', ''))));
  const allTabs = Array.from(new Set(["Main Look", ...dbTabs, ...customTabs]));
  const activeItems = outfitItems.filter(item => item.category === `outfit_${activeTab}`);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('task-images')
        .upload(`outfits/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`, file);
      
      if (uploadError) {
        alert(`Storage Error: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      if (data?.path) {
        const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(data.path);
        
        const { error: dbError } = await supabase.from('event_items').insert({
          event_name: rawName,
          category: `outfit_${activeTab}`,
          text: 'Outfit Image', 
          content: urlData.publicUrl // Changed back to 'content'
        });

        if (dbError) {
          alert(`Database Error: ${dbError.message}`);
        } else {
          fetchOutfits(); 
        }
      }
    } catch (err) {
      alert("An unexpected error occurred during upload.");
      console.error(err);
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteImage = async (id: string) => {
    await supabase.from('event_items').delete().eq('id', id);
    fetchOutfits(); 
  };

  const addNewTab = () => {
    const name = prompt("Enter new outfit category (e.g., Sangeet, Reception):");
    if (name && name.trim()) {
      const formattedName = name.trim();
      setCustomTabs([...customTabs, formattedName]);
      setActiveTab(formattedName);
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading Outfits...</div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to {rawName.charAt(0).toUpperCase() + rawName.slice(1)} Workspace
      </Button>
      
      <h1 className="text-3xl font-bold mb-6 text-emerald-900 capitalize">{rawName} Outfits</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex flex-wrap h-auto bg-slate-100 p-1 rounded-lg">
          {allTabs.map(tab => (
            <TabsTrigger key={tab} value={tab} className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              {tab}
            </TabsTrigger>
          ))}
          <Button variant="ghost" size="sm" onClick={addNewTab} className="ml-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
            <Plus className="w-4 h-4 mr-1"/> Add Category
          </Button>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <div className="mb-6">
            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              {uploading ? "Uploading..." : `Add Image to ${activeTab}`}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeItems.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400 border-2 border-dashed rounded-xl bg-slate-50">
                No images added for {activeTab} yet.
              </div>
            ) : (
              activeItems.map((item) => (
                <Card key={item.id} className="relative group p-2 overflow-hidden border-slate-200 shadow-sm">
                  {/* Changed back to item.content to render the image properly */}
                  <img src={item.content} alt="Outfit" className="w-full h-64 object-cover rounded" />
                  <button 
                    onClick={() => deleteImage(item.id)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-50 group-hover:opacity-100 transition-all shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}