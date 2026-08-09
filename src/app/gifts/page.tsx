"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Pin, Gift, Bold, Italic, Strikethrough, Film, Music, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useGifts } from "@/hooks/useGifts";

// --- FLOATING TEXT FORMATTING TOOLBAR ---
function FloatingToolbar() {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Ensure selection is inside an editable cell to avoid showing it everywhere
      let node = selection.anchorNode as Node | null;
      let isEditable = false;
      while (node && node !== document.body) {
        if (node.nodeType === 1 && (node as HTMLElement).getAttribute('contenteditable') === 'true') {
          isEditable = true;
          break;
        }
        node = node.parentNode;
      }

      if (isEditable && rect.width > 0) {
        setPosition({
          top: rect.top - 44, // Position above the selection
          left: rect.left + rect.width / 2,
        });
      } else {
        setPosition(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  if (!position) return null;

  const applyFormat = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  return (
    <div 
      className="fixed z-[9999] flex items-center bg-slate-900 text-white rounded-md shadow-lg p-1 gap-1 -translate-x-1/2 transition-all animate-in fade-in zoom-in-95"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // Important: prevents losing text selection when clicking a button
    >
      <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={() => applyFormat('strikeThrough')} className="p-1.5 hover:bg-slate-700 rounded text-white transition-colors" title="Strikethrough">
        <Strikethrough className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- EDITABLE CELL COMPONENT FOR RICH TEXT ---
function EditableCell({ 
  value, 
  onChange, 
  onBlur,
  placeholder, 
  className = "",
  autoFocus = false
}: { 
  value: string, 
  onChange: (val: string) => void, 
  onBlur?: () => void,
  placeholder: string,
  className?: string,
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only update innerHTML if it changed externally (and isn't the active element to prevent cursor jumping)
    if (ref.current && value !== ref.current.innerHTML && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  const handleInput = () => {
    if (ref.current) {
      onChange(ref.current.innerHTML);
    }
  };

  const handleBlur = () => {
    handleInput();
    if (onBlur) onBlur();
  };

  return (
    <div
      ref={ref}
      contentEditable
      onInput={handleInput}
      onBlur={handleBlur}
      className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400/60 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through ${className}`}
      data-placeholder={placeholder}
      suppressContentEditableWarning
    />
  );
}

function GiftCard({ 
  gift, 
  onDelete, 
  onUpdate, 
  onMediaClick
}: any) {
  const [title, setTitle] = useState(gift.title);
  const [content, setContent] = useState(gift.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Custom Cursor-Following Tooltip State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Unified Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'item' } | { type: 'media', index: number } | null>(null);

  // Safely treat null/undefined as false for older entries
  const isPinned = Boolean(gift.is_pinned);

  const handleTooltipMove = (e: React.MouseEvent, text: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (activeTooltip !== text) setActiveTooltip(text);
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  // Safely auto-links URLs inside HTML strings without breaking HTML tags
  const linkifyHtml = (htmlText: string) => {
    if (!htmlText) return "";
    const urlRegex = /(?<!href="|src=")(https?:\/\/[^\s<]+)/g;
    return htmlText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>');
  };

  // Prevent entering edit mode if the user is just clicking an embedded link
  const handleBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
      e.stopPropagation();
      return; 
    }
    setIsEditing(true);
  };

  // MULTIPLE MEDIA UPLOAD HANDLER VIA SUPABASE STORAGE
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setIsUploading(true);

    try {
      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          // Create a unique filename
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          // 1. Upload file directly to Supabase Storage Bucket
          const { error: uploadError } = await supabase.storage
            .from('chadana-media') // replace with your bucket name if different
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // 2. Get the Public URL of the uploaded file
          const { data } = supabase.storage
            .from('chadana-media')
            .getPublicUrl(filePath);

          // 3. Determine base type for UI mapping (image, video, or audio)
          const baseType = file.type.startsWith('video/') ? 'video' 
                         : file.type.startsWith('audio/') ? 'audio' 
                         : 'image';

          return {
            url: data.publicUrl,
            type: baseType,
            caption: ""
          };
        })
      );

      const currentMedia = gift.images || gift.image_urls || [];
      const updatedMedia = [...currentMedia, ...uploadedMedia];

      // Save only the clean URLs and metadata into your DB table
      onUpdate(gift.id, { 
        images: updatedMedia,
        image_urls: updatedMedia 
      });
    } catch (error: any) {
      alert("Error uploading file: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset input so you can upload the same file again if needed
      e.target.value = ""; 
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'item') {
      onDelete(gift.id);
    } else if (deleteTarget.type === 'media') {
      const currentImages = gift.images || gift.image_urls || [];
      const updatedImages = currentImages.filter(
        (_: any, i: number) => i !== deleteTarget.index
      );

      onUpdate(gift.id, {
        images: updatedImages,
        image_urls: updatedImages
      });
      // Optionally: You could also write logic here to delete the file from the Supabase bucket to save space
    }

    setDeleteTarget(null);
  };

  useEffect(() => {
    setTitle(gift.title);
    setContent(gift.content || "");
  }, [gift]);

  const formattedDate = gift.created_at 
    ? new Date(gift.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Just now";

  const mediaList = gift.images || gift.image_urls || [];

  return (
    <div className={`relative bg-white w-full rounded-xl shadow-md border overflow-hidden group transition-all duration-300 ${
        isPinned ? 'border-emerald-800 ring-1 ring-emerald-800/20' : 'border-slate-100'
    }`}>
      
      {/* Top Right Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        
        {/* PIN BUTTON */}
        <button 
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, isPinned ? "Unpin Gift" : "Pin Gift")}
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
          onMouseMove={(e) => handleTooltipMove(e, "Delete Gift")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget({ type: 'item' });
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

        <EditableCell
          value={title}
          onChange={(val) => setTitle(val.toUpperCase())}
          onBlur={() => onUpdate(gift.id, { title })}
          placeholder="GIFT TITLE..."
          className="text-xl font-sans text-emerald-700 tracking-widest uppercase w-full bg-transparent border-b-2 border-transparent hover:border-emerald-200 focus:border-emerald-400 focus:outline-none transition-all block"
        />
      </div>

      <div className="w-full px-4 md:px-10 pb-6">
        {isEditing ? (
          <EditableCell
            value={content}
            onChange={(val) => setContent(val)}
            onBlur={() => {
              onUpdate(gift.id, { title, content });
              setIsEditing(false);
            }}
            autoFocus
            placeholder="Click to add description/links..."
            className="w-full border border-emerald-200 p-4 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 transition-shadow min-h-[80px] bg-slate-50/50 text-slate-700"
          />
        ) : (
          <div
            onClick={handleBodyClick}
            className="border border-transparent hover:border-slate-100 rounded-lg p-4 whitespace-pre-wrap break-words cursor-text min-h-[80px] transition-colors text-slate-600 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
            dangerouslySetInnerHTML={
              content 
                ? { __html: linkifyHtml(content) } 
                : { __html: '<span class="text-slate-400 italic">Click to add description/links...</span>' }
            }
          />
        )}

        {/* --- Multi-Media Preview Section --- */}
        {mediaList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 px-4 items-end">
            {mediaList.map((media: any, idx: number) => {
              const url = typeof media === 'string' ? media : media.url;
              const caption = typeof media === 'string' ? '' : (media.caption || '');
              
              // Infer type for older entries that might just be strings
              let type = media.type || 'image';
              if (typeof media === 'string' || !media.type) {
                if (url.startsWith('data:video')) type = 'video';
                else if (url.startsWith('data:audio')) type = 'audio';
              }

              return (
                <div key={idx} className="relative inline-block group/image min-w-[8rem]">
                  {type === 'image' && (
                    <img
                      src={url}
                      className="h-32 w-auto rounded-lg object-cover cursor-pointer bg-slate-100"
                      onClick={() => onMediaClick({ url, type })}
                    />
                  )}
                  
                  {type === 'video' && (
                    <div 
                      className="relative h-32 w-auto rounded-lg overflow-hidden bg-black cursor-pointer group"
                      onClick={() => onMediaClick({ url, type })}
                    >
                      <video src={url} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Play className="w-8 h-8 text-white opacity-70 drop-shadow-lg  opacity-0" />
                      </div>
                    </div>
                  )}

                  {type === 'audio' && (
                    <div className="flex flex-col items-center justify-center bg-slate-100 h-32 w-48 rounded-lg p-3">
                      <Play className="w-6 h-6 text-slate-400 mb-2 opacity-0" />
                      <audio src={url} controls className="w-full h-8" />
                    </div>
                  )}

                  {/* Caption Input */}
                  <EditableCell
                    value={caption}
                    onChange={(newVal) => {
                      const updatedMedia = [...mediaList];
                      if (typeof updatedMedia[idx] === 'string') {
                        updatedMedia[idx] = { url: updatedMedia[idx], caption: newVal, type };
                      } else {
                        updatedMedia[idx] = { ...updatedMedia[idx], caption: newVal };
                      }
                      onUpdate(gift.id, { images: updatedMedia, image_urls: updatedMedia });
                    }}
                    placeholder="Caption..."
                    className="mt-2 w-full text-xs text-center border-b border-slate-200 focus:border-emerald-500 focus:outline-none pb-1 bg-transparent block"
                  />

                  <button 
                    onClick={() => setDeleteTarget({ type: 'media', index: idx })} 
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-50 md:opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md hover:bg-red-200"
                    title="Remove Media"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- Toolbar --- */}
        <div className="mt-6 flex items-center px-4 gap-3">
          <input 
            type="file" 
            accept="image/*, video/*, audio/*" 
            multiple 
            id={`gift-media-${gift.id}`} 
            className="hidden" 
            onChange={handleMediaUpload}
            disabled={isUploading} 
          />
          <label 
            htmlFor={`gift-media-${gift.id}`}
            className={`flex items-center gap-2 text-xs text-slate-500 transition-colors bg-slate-50 border border-slate-200 px-3 py-2 rounded-md ${
              isUploading 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:text-emerald-700 cursor-pointer hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <Film className="w-4 h-4" />
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isUploading ? 'Uploading...' : 'Add'}
            </span> 
            {!isUploading && "Media"}
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

      {/* UNIFIED DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-600">
            Are you sure you want to delete this {deleteTarget?.type === 'media' ? 'media file' : 'item'}? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- MAIN PAGE ---
export default function GiftsPage() {
  const { gifts, loading, fetchData } = useGifts();
  const [localGifts, setLocalGifts] = useState<any[]>([]);
  
  const [fullScreenMedia, setFullScreenMedia] = useState<{ url: string, type: string } | null>(null);

  // Safely sort Gifts ensuring pinned items are on top
  useEffect(() => {
    if (gifts) {
      const sorted = [...gifts].sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }
        
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setLocalGifts(sorted);
    }
  }, [gifts]);

  const handleAddGift = async () => {
    const { error } = await supabase.from('gifts').insert({ 
      title: '', 
      content: '', 
      images: [],
      image_urls: [],
      is_pinned: false,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      alert("Error adding gift: " + error.message);
      return;
    }
    fetchData(); 
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: string) => {
    setLocalGifts(prev => prev.filter(n => n.id !== id));
    await supabase.from('gifts').delete().eq('id', id);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: any) => {
    setLocalGifts(prev => {
        const updated = prev.map(g =>
        g.id === id ? { ...g, ...updates } : g
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
        .from("gifts")
        .update(updates)
        .eq("id", id);

    if (error) {
        alert(error.message);
        fetchData(); // only on error if you want to restore
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Gifts...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen space-y-8">
      {/* Global Floating Toolbar for Rich Text Formatting */}
      <FloatingToolbar />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <Gift className="w-8 h-8 text-emerald-700" /> Wedding Gifts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track gifts you have received or ideas for what to give.
          </p>
        </div>
                    
        <Button onClick={handleAddGift} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Gift
        </Button>
      </div>

      {/* Gifts List */}
      <div className="space-y-6">
        {localGifts.length === 0 ? (
           <div className="text-center py-12 text-slate-400 italic">No gifts tracked yet. Click "Add Gift" to get started!</div>
        ) : (
          localGifts.map((gift: any) => (
            <GiftCard 
              key={gift.id} 
              gift={gift} 
              onDelete={handleDelete} 
              onUpdate={handleUpdate} 
              onMediaClick={setFullScreenMedia}
            />
          ))
        )}
      </div>

      {/* Full Screen Media Lightbox */}
      <Dialog open={!!fullScreenMedia} onOpenChange={(open) => !open && setFullScreenMedia(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:hover:bg-black/80">
          <DialogHeader className="sr-only">
            <DialogTitle>View Media</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {fullScreenMedia?.type === 'image' && (
              <img 
                src={fullScreenMedia.url} 
                alt="Full size view" 
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-md object-contain shadow-2xl bg-black" 
              />
            )}
            {fullScreenMedia?.type === 'video' && (
              <video 
                src={fullScreenMedia.url} 
                controls 
                autoPlay
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-md object-contain shadow-2xl bg-black" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}