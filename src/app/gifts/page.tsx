"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Pin, Gift, Bold, Italic, Strikethrough, Film, Music, Play, ClipboardList, Pencil, Check } from "lucide-react";
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
          top: rect.top - 44, 
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
      onMouseDown={(e) => e.preventDefault()} 
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

// --- AUTO RESIZE TEXTAREA FOR MASTERLIST ---
function AutoResizeTextarea({ value, onChange, placeholder, className }: any) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`w-full bg-white border border-emerald-300 rounded-md outline-none resize-none overflow-hidden block p-1.5 focus:ring-2 focus:ring-emerald-200 transition-all ${className}`}
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
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'item' } | { type: 'media', index: number } | null>(null);
  const isPinned = Boolean(gift.is_pinned);

  const handleTooltipMove = (e: React.MouseEvent, text: string) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (activeTooltip !== text) setActiveTooltip(text);
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  const linkifyHtml = (htmlText: string) => {
    if (!htmlText) return "";
    const urlRegex = /(?<!href="|src=")(https?:\/\/[^\s<]+)/g;
    return htmlText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">$1</a>');
  };

  const handleBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
      e.stopPropagation();
      return; 
    }
    setIsEditing(true);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setIsUploading(true);

    try {
      const uploadedMedia = await Promise.all(
        files.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('chadana-media')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('chadana-media')
            .getPublicUrl(filePath);

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

      onUpdate(gift.id, { 
        images: updatedMedia,
        image_urls: updatedMedia 
      });
    } catch (error: any) {
      alert("Error uploading file: " + error.message);
    } finally {
      setIsUploading(false);
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
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
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

        {mediaList.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 px-4 items-end">
            {mediaList.map((media: any, idx: number) => {
              const url = typeof media === 'string' ? media : media.url;
              const caption = typeof media === 'string' ? '' : (media.caption || '');
              
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

      {activeTooltip && (
        <div 
          className="fixed z-[100] px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ left: mousePos.x + 12, top: mousePos.y + 16 }}
        >
          {activeTooltip}
        </div>
      )}

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

// --- MASTERLIST INTERFACE ---
interface MasterlistItem {
  id: string;
  event: string;
  item: string;
  quantity: string;
  price: string;
  checked: boolean;
}

// --- MAIN PAGE ---
export default function GiftsPage() {
  const { gifts, loading, fetchData } = useGifts();
  const [localGifts, setLocalGifts] = useState<any[]>([]);
  
  const [fullScreenMedia, setFullScreenMedia] = useState<{ url: string, type: string } | null>(null);

  // Masterlist State
  const [isMasterlistOpen, setIsMasterlistOpen] = useState(false);
  const [masterlistItems, setMasterlistItems] = useState<MasterlistItem[]>([]);
  
  // Track Deletion
  const [masterlistDeleteTarget, setMasterlistDeleteTarget] = useState<string | null>(null);

  // Track Editing
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MasterlistItem>>({});

  // Fetch Masterlist items from Supabase when the modal is opened
  useEffect(() => {
    if (isMasterlistOpen) {
      const fetchMasterlist = async () => {
        const { data, error } = await supabase
          .from('gift_masterlist')
          .select('*')
          .order('created_at', { ascending: true });
          
        if (!error && data) {
          setMasterlistItems(data);
        } else {
          console.error("Error fetching masterlist:", error);
        }
      };
      fetchMasterlist();
    } else {
      // Clean up states when modal closes
      setEditingRowId(null);
      setEditForm({});
    }
  }, [isMasterlistOpen]);

  // Sort Masterlist so checked items go to the bottom
  const sortedMasterlist = useMemo(() => {
    return [...masterlistItems].sort((a, b) => {
      if (a.checked === b.checked) return 0;
      return a.checked ? 1 : -1;
    });
  }, [masterlistItems]);

  // Insert to DB and state
  const addMasterlistItem = async () => {
    const newItem = {
      event: '',
      item: '',
      quantity: '',
      price: '',
      checked: false
    };
    
    const { data, error } = await supabase
      .from('gift_masterlist')
      .insert([newItem])
      .select()
      .single();

    if (!error && data) {
      setMasterlistItems([...masterlistItems, data]);
      // Open the new row in edit mode automatically
      startEditingRow(data);
      // Scroll to bottom
      setTimeout(() => {
        const container = document.getElementById("masterlist-scroll-container");
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    } else {
      console.error("Error adding item:", error);
    }
  };

  // ------------------ EXPLICIT EDITING LOGIC ------------------

  const startEditingRow = (item: MasterlistItem) => {
    setEditingRowId(item.id);
    setEditForm(item);
  };

  const cancelEditingRow = () => {
    setEditingRowId(null);
    setEditForm({});
  };

  const saveEditingRow = async () => {
    if (!editingRowId) return;

    // Update Local State
    setMasterlistItems(prev => prev.map(item => 
      item.id === editingRowId ? { ...item, ...editForm } : item
    ));

    // Update Remote State
    const { error } = await supabase
      .from('gift_masterlist')
      .update({
        event: editForm.event,
        item: editForm.item,
        quantity: editForm.quantity,
        price: editForm.price
      })
      .eq('id', editingRowId);

    if (error) console.error("Error saving edit:", error);

    // Reset Edit State
    setEditingRowId(null);
    setEditForm({});
  };

  const updateEditForm = (field: keyof MasterlistItem, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // -------------------------------------------------------------

  // Confirm and Execute Deletion from DB and state
  const confirmMasterlistDelete = async () => {
    if (!masterlistDeleteTarget) return;
    setMasterlistItems(prev => prev.filter(item => item.id !== masterlistDeleteTarget));
    await supabase.from('gift_masterlist').delete().eq('id', masterlistDeleteTarget);
    setMasterlistDeleteTarget(null);
    if (editingRowId === masterlistDeleteTarget) {
      setEditingRowId(null);
    }
  };

  // Instantly toggles checkmark locally and remotely
  const toggleMasterlistCheck = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Local
    setMasterlistItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: newStatus } : item
    ));
    // Remote
    await supabase.from('gift_masterlist').update({ checked: newStatus }).eq('id', id);
  };

  useEffect(() => {
    if (gifts) {
      const sorted = [...gifts].sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
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
        const updated = prev.map(g => g.id === id ? { ...g, ...updates } : g);
        return updated.sort((a, b) => {
          const aPinned = Boolean(a.is_pinned);
          const bPinned = Boolean(b.is_pinned);
          if (aPinned !== bPinned) return aPinned ? -1 : 1;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    });

    const { error } = await supabase.from("gifts").update(updates).eq("id", id);
    if (error) {
        alert(error.message);
        fetchData();
    }
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-bold">Loading Gifts...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen space-y-8">
      <FloatingToolbar />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <Gift className="w-8 h-8 text-emerald-700" /> Wedding Gifts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track gifts you have received or ideas for what to give.
          </p>
        </div>
                    
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsMasterlistOpen(true)} className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 shadow-sm transition-colors">
            <ClipboardList className="w-4 h-4 mr-2" /> Masterlist
          </Button>
          <Button onClick={handleAddGift} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Add Gift
          </Button>
        </div>
      </div>

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

      {/* Masterlist Modal - max-h-[90vh] makes it shrink-wrap exactly to the rows height until it gets too big! */}
      <Dialog open={isMasterlistOpen} onOpenChange={setIsMasterlistOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-2xl font-serif text-emerald-900 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-700" /> Gift Masterlist
            </DialogTitle>
          </DialogHeader>
          
          <div id="masterlist-scroll-container" className="flex-1 overflow-auto mt-4 pr-2">
            <table className="w-full min-w-[600px] border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b-2 border-slate-200 text-left text-sm text-slate-500 font-semibold tracking-wide">
                  <th className="pb-3 pt-2 w-12 text-center">Done</th>
                  <th className="pb-3 pt-2 px-3">Event</th>
                  <th className="pb-3 pt-2 px-3">Item</th>
                  <th className="pb-3 pt-2 px-3 w-28">Quantity</th>
                  <th className="pb-3 pt-2 px-3 w-32">Price</th>
                  <th className="pb-3 pt-2 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMasterlist.map((item) => {
                  const isEditing = editingRowId === item.id;
                  
                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-100 group transition-all duration-300 ${
                        item.checked ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="p-3 text-center align-top">
                        <input 
                          type="checkbox" 
                          checked={item.checked}
                          onChange={() => toggleMasterlistCheck(item.id, item.checked)}
                          className="w-4 h-4 mt-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition-all"
                        />
                      </td>

                      {/* --- EVENT COLUMN --- */}
                      <td className="p-2 align-top">
                        {isEditing ? (
                          <AutoResizeTextarea 
                            value={editForm.event || ''} 
                            onChange={(val: string) => updateEditForm('event', val)}
                            placeholder="Event name..."
                          />
                        ) : (
                          <div className={`mt-1.5 px-1.5 ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.event || <span className="text-slate-300 italic">Empty</span>}
                          </div>
                        )}
                      </td>

                      {/* --- ITEM COLUMN --- */}
                      <td className="p-2 align-top">
                        {isEditing ? (
                          <AutoResizeTextarea 
                            value={editForm.item || ''} 
                            onChange={(val: string) => updateEditForm('item', val)}
                            placeholder="Item description..."
                          />
                        ) : (
                          <div className={`mt-1.5 px-1.5 whitespace-pre-wrap ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.item || <span className="text-slate-300 italic">Empty</span>}
                          </div>
                        )}
                      </td>

                      {/* --- QUANTITY COLUMN --- */}
                      <td className="p-2 align-top">
                        {isEditing ? (
                          <input 
                            type="number" 
                            value={editForm.quantity || ''} 
                            onChange={(e) => updateEditForm('quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-full bg-white border border-emerald-300 rounded-md outline-none p-1.5 focus:ring-2 focus:ring-emerald-200 transition-all"
                          />
                        ) : (
                          <div className={`mt-1.5 px-1.5 ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.quantity || '-'}
                          </div>
                        )}
                      </td>

                      {/* --- PRICE COLUMN --- */}
                      <td className="p-2 align-top">
                        {isEditing ? (
                          <div className="flex items-center">
                            <span className="text-slate-400 mr-2">₹</span>
                            <input 
                              type="number" 
                              value={editForm.price || ''} 
                              onChange={(e) => updateEditForm('price', e.target.value)}
                              placeholder="Price"
                              className="w-full bg-white border border-emerald-300 rounded-md outline-none p-1.5 focus:ring-2 focus:ring-emerald-200 transition-all"
                            />
                          </div>
                        ) : (
                          <div className={`mt-1.5 px-1.5 flex items-center ${item.checked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {item.price ? (
                              <>
                                <span className={`mr-1 ${item.checked ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                                {item.price}
                              </>
                            ) : '-'}
                          </div>
                        )}
                      </td>

                      {/* --- ACTIONS COLUMN --- */}
                      <td className="p-2 text-center align-top">
                        <div className="flex items-center justify-center gap-1 mt-1 opacity-75 group-hover:opacity-100 transition-opacity">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={saveEditingRow}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={cancelEditingRow}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => startEditingRow(item)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Edit Item"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setMasterlistDeleteTarget(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {sortedMasterlist.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                      No items in masterlist yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="shrink-0 mt-4 flex justify-start pt-2 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={addMasterlistItem}
              className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" /> Add New Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Masterlist Item Deletion */}
      <Dialog open={!!masterlistDeleteTarget} onOpenChange={(open) => !open && setMasterlistDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900">Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-600">
            Are you sure you want to delete this item from the masterlist? This action cannot be undone.
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setMasterlistDeleteTarget(null)}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={confirmMasterlistDelete}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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