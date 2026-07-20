"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2, Maximize2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type OutfitItem = {
  id: string;
  category: string;
  content: string; // Image URL
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
  
  // State for Full Screen Image Lightbox Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  // Derived tabs from DB items + locally created tabs
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
          content: urlData.publicUrl
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

  const deleteImage = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents opening full-screen view
    await supabase.from('event_items').delete().eq('id', id);
    fetchOutfits(); 
  };

  const addNewTab = () => {
    const name = prompt("Enter new outfit category (e.g., Sangeet, Reception):");
    if (name && name.trim()) {
      const formattedName = name.trim();
      setCustomTabs(prev => [...prev, formattedName]);
      setActiveTab(formattedName);
    }
  };

  const deleteTab = async (e: React.MouseEvent, tabToDelete: string) => {
    e.stopPropagation(); // Prevents tab switching when clicking delete
    
    if (confirm(`Are you sure you want to delete the "${tabToDelete}" category and all its images?`)) {
      // 1. Delete all DB items for this category
      await supabase
        .from('event_items')
        .delete()
        .eq('event_name', rawName)
        .eq('category', `outfit_${tabToDelete}`);

      // 2. Remove from local custom tabs
      const updatedCustomTabs = customTabs.filter(tab => tab !== tabToDelete);
      setCustomTabs(updatedCustomTabs);

      // 3. Switch active tab if the deleted tab was currently selected
      if (activeTab === tabToDelete) {
        const remainingTabs = allTabs.filter(tab => tab !== tabToDelete);
        setActiveTab(remainingTabs.length > 0 ? remainingTabs[0] : "Main Look");
      }

      // 4. Refetch remaining items
      fetchOutfits();
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
        <TabsList className="mb-6 flex flex-wrap h-auto bg-slate-100 p-1 rounded-lg gap-1">
          {allTabs.map(tab => (
            <div key={tab} className="relative group flex items-center">
              <TabsTrigger 
                value={tab} 
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm pr-6"
              >
                {tab}
              </TabsTrigger>
              
              {/* Delete Tab Button (Excludes default 'Main Look' tab) */}
              {tab !== "Main Look" && (
                <button
                  onClick={(e) => deleteTab(e, tab)}
                  className="absolute right-1.5 p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200/60 transition-colors"
                  title={`Delete ${tab} category`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
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
                <Card 
                  key={item.id} 
                  onClick={() => setSelectedImage(item.content)}
                  className="relative group p-2 overflow-hidden border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <img src={item.content} alt="Outfit" className="w-full h-64 object-cover rounded group-hover:scale-105 transition-transform duration-300" />
                  
                  {/* Expand Overlay Hint */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                    <Maximize2 className="w-6 h-6" />
                  </div>

                  {/* Delete Photo Button */}
                  <button 
                    onClick={(e) => deleteImage(e, item.id)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-80 md:opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- FULL SCREEN PHOTO LIGHTBOX --- */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none flex items-center justify-center sm:rounded-2xl">
          <DialogTitle className="sr-only">Full Screen Outfit View</DialogTitle>
          {selectedImage && (
            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
              <img 
                src={selectedImage} 
                alt="Full Outfit Preview" 
                className="max-w-full max-h-[85vh] object-contain rounded-lg" 
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-3 -right-3 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

