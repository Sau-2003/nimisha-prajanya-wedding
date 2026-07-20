"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2, Maximize2, X, Pencil, ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";

type OutfitItem = {
  id: string;
  category: string;
  content: string; // Image URL
  text?: string;   // Image Caption
};

export default function OutfitPage() {
  const { eventName } = useParams();
  const router = useRouter();
  
  const rawName = eventName ? decodeURIComponent(String(eventName)) : 'event';

  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  
  const [activeTab, setActiveTab] = useState("Main Look");
  const [customTabs, setCustomTabs] = useState<string[]>([]);
  
  // State for Full Screen Lightbox & Editing
  const [selectedImage, setSelectedImage] = useState<OutfitItem | null>(null);
  const [editingItem, setEditingItem] = useState<OutfitItem | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

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
  const allTabs = Array.from(new Set(["Ideas", ...dbTabs, ...customTabs]));
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
          text: newCaption.trim() || 'Outfit Image', 
          content: urlData.publicUrl
        });

        if (dbError) {
          alert(`Database Error: ${dbError.message}`);
        } else {
          setNewCaption("");
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

  const openEditModal = (e: React.MouseEvent, item: OutfitItem) => {
    e.stopPropagation();
    setEditingItem(item);
    setEditCaption(item.text === 'Outfit Image' ? '' : item.text || '');
    setEditFile(null);
    setEditPreviewUrl(null);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      let finalImageUrl = editingItem.content;

      // If user uploaded a replacement image file
      if (editFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-images')
          .upload(`outfits/${Date.now()}_${editFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`, editFile);

        if (uploadError) {
          alert(`Image Upload Failed: ${uploadError.message}`);
          setSavingEdit(false);
          return;
        }

        if (uploadData?.path) {
          const { data: urlData } = supabase.storage.from('task-images').getPublicUrl(uploadData.path);
          finalImageUrl = urlData.publicUrl;
        }
      }

      // Update Supabase Record
      const { error: updateError } = await supabase
        .from('event_items')
        .update({
          text: editCaption.trim() || 'Outfit Image',
          content: finalImageUrl
        })
        .eq('id', editingItem.id);

      if (updateError) {
        alert(`Update Error: ${updateError.message}`);
      } else {
        setEditingItem(null);
        fetchOutfits();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }

    setSavingEdit(false);
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
      await supabase
        .from('event_items')
        .delete()
        .eq('event_name', rawName)
        .eq('category', `outfit_${tabToDelete}`);

      const updatedCustomTabs = customTabs.filter(tab => tab !== tabToDelete);
      setCustomTabs(updatedCustomTabs);

      if (activeTab === tabToDelete) {
        const remainingTabs = allTabs.filter(tab => tab !== tabToDelete);
        setActiveTab(remainingTabs.length > 0 ? remainingTabs[0] : "Main Look");
      }

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
          <div className="mb-6 bg-slate-50 border p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <input 
              type="text" 
              placeholder="Add optional image caption..."
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="flex-1 border p-2 rounded-lg bg-white outline-none text-sm focus:border-emerald-500"
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm whitespace-nowrap"
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
                  onClick={() => setSelectedImage(item)}
                  className="relative group p-2 overflow-hidden border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative overflow-hidden rounded">
                      <img src={item.content} alt={item.text || "Outfit"} className="w-full h-56 object-cover rounded group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Full-Screen Overlay Hint */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Image Caption */}
                    {item.text && item.text !== 'Outfit Image' && (
                      <p className="mt-2 text-xs font-medium text-slate-700 truncate px-1" title={item.text}>
                        {item.text}
                      </p>
                    )}
                  </div>

                  {/* Action Overlay Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-90 md:opacity-0 group-hover:opacity-100 transition-all z-10">
                    <button 
                      onClick={(e) => openEditModal(e, item)}
                      className="bg-white/90 hover:bg-white text-slate-700 p-1.5 rounded-full shadow-md transition-colors"
                      title="Edit Image or Caption"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => deleteImage(e, item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- EDIT CAPTION & IMAGE MODAL --- */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Outfit Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Image Preview</label>
              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-48 flex items-center justify-center">
                <img 
                  src={editPreviewUrl || editingItem?.content} 
                  alt="Edit preview" 
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Replace Image File</label>
              <input 
                type="file" 
                ref={editFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setEditFile(file);
                    setEditPreviewUrl(URL.createObjectURL(file));
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={() => editFileInputRef.current?.click()}
                className="w-full text-xs text-slate-600"
              >
                <ImageIcon className="w-3.5 h-3.5 mr-2" />
                {editFile ? editFile.name : "Choose New Image"}
              </Button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Caption</label>
              <input 
                type="text"
                placeholder="Enter caption..."
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full border p-2 rounded-lg outline-none text-sm focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit} className="bg-emerald-600 hover:bg-emerald-700">
              {savingEdit ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- FULL SCREEN PHOTO LIGHTBOX --- */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-black/95 border-none flex flex-col items-center justify-center sm:rounded-2xl">
          <DialogTitle className="sr-only">Full Screen Outfit View</DialogTitle>
          {selectedImage && (
            <div className="relative w-full max-h-[85vh] flex flex-col items-center justify-center">
              <img 
                src={selectedImage.content} 
                alt={selectedImage.text || "Full Outfit Preview"} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg" 
              />
              
              {selectedImage.text && selectedImage.text !== 'Outfit Image' && (
                <p className="mt-3 text-sm text-slate-200 text-center font-medium bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm max-w-md truncate">
                  {selectedImage.text}
                </p>
              )}

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