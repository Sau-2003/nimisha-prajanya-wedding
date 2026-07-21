"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Pin, Gem } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useChadana } from "@/hooks/useChadana"; 

function ChadanaCard({ 
  gift, 
  onDelete, 
  onUpdate, 
  onImageClick
}: any) {
  const [title, setTitle] = useState(gift.title);
  const [content, setContent] = useState(gift.content || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom Cursor-Following Tooltip State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Safely treat null/undefined as false for older entries
  const isPinned = Boolean(gift.is_pinned);

  const handleTooltipMove = (e: React.MouseEvent, text: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (activeTooltip !== text) setActiveTooltip(text);
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all relative z-10 hover:text-blue-800"
            onClick={(e) => e.stopPropagation()} 
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // MULTIPLE IMAGE UPLOAD HANDLER
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    const newBase64Images = await Promise.all(
      files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              
              const MAX_WIDTH = 500; 
              const MAX_HEIGHT = 500;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round(height * (MAX_WIDTH / width));
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round(width * (MAX_HEIGHT / height));
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);

              resolve(canvas.toDataURL("image/jpeg", 0.5));
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const formattedNewImages = newBase64Images.map((url: string) => ({
      url,
      caption: ""
    }));

    const currentImages = gift.images || gift.image_urls || [];
    const updatedImages = [...currentImages, ...formattedNewImages];

    onUpdate(gift.id, { 
      images: updatedImages,
      image_urls: updatedImages 
    });
  };

  const removeImage = (indexToRemove: number) => {
    const currentImages = gift.images || gift.image_urls || [];
    const updatedImages = currentImages.filter(
      (_: any, i: number) => i !== indexToRemove
    );

    onUpdate(gift.id, {
      images: updatedImages,
      image_urls: updatedImages
    });
  };

  useEffect(() => {
    setTitle(gift.title);
    setContent(gift.content || "");
  }, [gift]);

  const formattedDate = gift.created_at 
    ? new Date(gift.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Just now";

  const imagesList = gift.images || gift.image_urls || [];

  return (
    <div className={`relative bg-white w-full rounded-xl shadow-md border overflow-hidden group transition-all duration-300 ${
        isPinned ? 'border-emerald-800 ring-1 ring-emerald-800/20' : 'border-slate-100'
    }`}>
      
      {/* Top Right Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        
        {/* PIN BUTTON */}
        <button 
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, isPinned ? "Unpin Chadana" : "Pin Chadana")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate(gift.id, { is_pinned: !isPinned });
            setActiveTooltip(null);
          }}
          className={`p-2 rounded-lg transition-all shadow-sm ${
            isPinned 
              ? 'bg-emerald-800 text-white opacity-100 hover:bg-emerald-900' 
              : 'bg-slate-100 text-slate-500 opacity-50 md:group-hover:opacity-100 hover:bg-slate-200'
          }`}
        >
          <Pin className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} />
        </button>

        {/* DELETE BUTTON */}
        <button 
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, "Delete Chadana")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(gift.id);
            setActiveTooltip(null);
          }}
          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-50 md:opacity-50 md:group-hover:opacity-100 transition-opacity shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-6 pb-4 pl-6 md:pl-10 pr-32">
        {/* DATE DISPLAY */}
        <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1.5 ml-1">
          {formattedDate}
        </div>

        <input 
          type="text"
          className="text-xl font-sans text-emerald-700 tracking-widest uppercase w-full bg-transparent border-b-2 border-transparent hover:border-emerald-200 focus:border-emerald-400 focus:outline-none transition-all"
          value={title}
          placeholder="CHADANA TITLE..."
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          onBlur={() => onUpdate(gift.id, { title })} 
        />
      </div>

      <div className="w-full px-4 md:px-10 pb-6">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              onUpdate(gift.id, { title, content });
              setIsEditing(false);
            }}
            rows={3}
            className="w-full resize-none border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-shadow"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="border border-transparent hover:border-slate-100 rounded-lg p-4 whitespace-pre-wrap break-words cursor-text min-h-[80px] transition-colors"
          >
            {content ? renderTextWithLinks(content) : <span className="text-slate-400 italic">Click to add description/links...</span>}
          </div>
        )}

        {/* --- Multi-Image Preview Section --- */}
        {imagesList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 px-4">
            {imagesList.map((image: any, idx: number) => {
              const imgUrl = typeof image === 'string' ? image : image.url;
              const imgCaption = typeof image === 'string' ? '' : (image.caption || '');

              return (
                <div key={idx} className="relative inline-block group/image">
                  <img
                    src={imgUrl}
                    className="h-32 rounded-lg object-cover cursor-pointer"
                    onClick={() => onImageClick(imgUrl)}
                  />

                  {/* Caption Input */}
                  <input
                    type="text"
                    value={imgCaption}
                    placeholder="Caption..."
                    className="mt-2 w-full text-xs text-center border-b border-slate-200 focus:border-emerald-500 focus:outline-none pb-1 bg-transparent"
                    onChange={(e) => {
                      const updatedImages = [...imagesList];
                      if (typeof updatedImages[idx] === 'string') {
                        updatedImages[idx] = { url: updatedImages[idx], caption: e.target.value };
                      } else {
                        updatedImages[idx] = { ...updatedImages[idx], caption: e.target.value };
                      }
                      onUpdate(gift.id, { images: updatedImages, image_urls: updatedImages });
                    }}
                  />

                  <button 
                    onClick={() => removeImage(idx)} 
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-100 md:opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md hover:bg-red-200"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- Toolbar --- */}
        <div className="mt-6 flex items-center px-4">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            id={`gift-image-${gift.id}`} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <label 
            htmlFor={`gift-image-${gift.id}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-700 cursor-pointer transition-colors bg-slate-50 border border-slate-200 px-3 py-2 rounded-md hover:bg-slate-100"
          >
            <ImageIcon className="w-4 h-4" />
            Add Images
          </label>
        </div>
      </div>

      {/* RENDER CURSOR-FOLLOWING TOOLTIP */}
      {activeTooltip && (
        <div 
          className="fixed z-[100] px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: mousePos.x + 12, top: mousePos.y + 16 }}
        >
          {activeTooltip}
        </div>
      )}
    </div>
  );
}

// --- MAIN PAGE ---
export default function ChadanaPage() {
  const { chadana, loading, fetchData } = useChadana();
  const [localChadana, setLocalChadana] = useState<any[]>([]);
  
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Safely sort Chadana ensuring pinned items are on top
  useEffect(() => {
    if (chadana) {
      const sorted = [...chadana].sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }
        
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setLocalChadana(sorted);
    }
  }, [chadana]);

  const handleAddChadana = async () => {
    const { error } = await supabase.from('chadana').insert({ 
      title: 'NEW CHADANA', 
      content: '', 
      images: [],
      image_urls: [],
      is_pinned: false,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      alert("Error adding chadana: " + error.message);
      return;
    }
    fetchData(); 
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: string) => {
    setLocalChadana(prev => prev.filter(n => n.id !== id));
    await supabase.from('chadana').delete().eq('id', id);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: any) => {
    setLocalChadana((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      );

      return updated.sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);

        if (aPinned !== bPinned) return aPinned ? -1 : 1;

        return (
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
        );
      });
    });

    const { error } = await supabase
      .from("chadana")
      .update(updates)
      .eq("id", id);

    if (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Chadana...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <Gem className="w-8 h-8 text-emerald-700" /> Chadana
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track chadana ideas.
          </p>
        </div>
                    
        <Button onClick={handleAddChadana} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Chadana Ideas
        </Button>
      </div>

      {/* Chadana List */}
      <div className="space-y-6">
        {localChadana.length === 0 ? (
           <div className="text-center py-12 text-slate-400 italic">No chadana tracked yet. Click "Add Chadana Ideas" to get started!</div>
        ) : (
          localChadana.map((gift: any) => (
            <ChadanaCard 
              key={gift.id} 
              gift={gift} 
              onDelete={handleDelete} 
              onUpdate={handleUpdate} 
              onImageClick={setFullScreenImage}
            />
          ))
        )}
      </div>

      {/* Full Screen Image Lightbox */}
      <Dialog open={!!fullScreenImage} onOpenChange={(open) => !open && setFullScreenImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:hover:bg-black/80">
          <DialogHeader className="sr-only">
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {fullScreenImage && (
              <img 
                src={fullScreenImage} 
                alt="Full size view" 
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-md object-contain shadow-2xl" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}