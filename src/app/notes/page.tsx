"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Pin, BookIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useNotes } from "@/hooks/useNotes"; 

function NoteCard({ 
  note, 
  onDelete, 
  onUpdate, 
  onImageClick
}: any) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom Cursor-Following Tooltip State
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Safely treat null/undefined as false for older notes
  const isPinned = Boolean(note.is_pinned);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
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

          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
          onUpdate(note.id, { image_url: compressedBase64 });
        };
        img.src = event.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || "");
  }, [note]);

  const formattedDate = note.created_at 
    ? new Date(note.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Just now";

  return (
    <div className={`relative bg-white w-full rounded-xl shadow-md border overflow-hidden group transition-all duration-300 ${
        isPinned ? 'border-slate-800 ring-1 ring-slate-800/20' : 'border-slate-100'
    }`}>
      
      {/* Top Right Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
        
        {/* PIN BUTTON */}
        <button 
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, isPinned ? "Unpin Note" : "Pin Note")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onUpdate(note.id, { is_pinned: !isPinned });
            setActiveTooltip(null);
          }}
          className={`p-2 rounded-lg transition-all shadow-sm ${
            isPinned 
              ? 'bg-slate-800 text-white opacity-100 hover:bg-slate-900' 
              : 'bg-slate-100 text-slate-500 opacity-50 md:group-hover:opacity-100 hover:bg-slate-200'
          }`}
        >
          <Pin className="w-4 h-4" fill={isPinned ? "currentColor" : "none"} />
        </button>

        {/* DELETE BUTTON */}
        <button 
          type="button"
          onMouseMove={(e) => handleTooltipMove(e, "Delete Note")}
          onMouseLeave={handleTooltipLeave}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
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
          className="text-xl font-sans text-indigo-600 tracking-widest uppercase w-full bg-transparent border-b-2 border-transparent hover:border-[#c4b5fd]/30 focus:border-[#c4b5fd] focus:outline-none transition-all"
          value={title}
          placeholder="ENTER TITLE..."
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          onBlur={() => onUpdate(note.id, { title })} 
        />
      </div>

      <div className="w-full px-4 md:px-10 pb-6">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => {
              onUpdate(note.id, { title, content });
              setIsEditing(false);
            }}
            rows={3}
            className="w-full resize-none border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#c4b5fd] transition-shadow"
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
            {content ? renderTextWithLinks(content) : <span className="text-slate-400 italic">Click to add notes...</span>}
          </div>
        )}

        {/* --- Image Preview Section --- */}
        {note.image_url && (
          <div className="mt-4 relative inline-block group/image ml-4">
            <img 
              src={note.image_url} 
              alt="Note attachment" 
              className="h-40 w-auto rounded-lg border border-slate-200 object-cover cursor-pointer hover:opacity-90 shadow-sm transition-opacity"
              onClick={() => onImageClick(note.image_url)}
            />
            <button 
              onClick={() => onUpdate(note.id, { image_url: null })} 
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 opacity-100 md:opacity-0 group-hover/image:opacity-100 transition-opacity shadow-md hover:bg-red-200"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- Toolbar --- */}
        <div className="mt-4 flex items-center px-4">
          <input 
            type="file" 
            accept="image/*" 
            id={`note-image-${note.id}`} 
            className="hidden" 
            onChange={handleImageUpload} 
          />
          <label 
            htmlFor={`note-image-${note.id}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors bg-slate-50 px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            <ImageIcon className="w-4 h-4" />
            {note.image_url ? "Change Image" : "Attach Image"}
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
export default function NotesPage() {
  const { notes, loading, fetchData } = useNotes();
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  
  const [pageTitle, setPageTitle] = useState("Wedding Notes");
  const [pageDesc, setPageDesc] = useState("Jot down your ideas.");
  
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle(localStorage.getItem("notes-page-title") || "Wedding Notes");
    setPageDesc(localStorage.getItem("notes-page-desc") || "Jot down your ideas.");
  }, []);

  // Safely sort Notes ensuring boolean comparisons
  useEffect(() => {
    if (notes) {
      const sorted = [...notes].sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        
        if (aPinned !== bPinned) {
          return aPinned ? -1 : 1;
        }
        
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setLocalNotes(sorted);
    }
  }, [notes]);

  const handleAddNote = async () => {
    const { error } = await supabase.from('notes').insert({ 
      title: 'NEW NOTE', 
      content: '', 
      is_pinned: false,
      created_at: new Date().toISOString()
    });
    
    if (error) {
      alert("Error adding note: " + error.message);
      return;
    }
    fetchData(); 
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: string) => {
    setLocalNotes(prev => prev.filter(n => n.id !== id));
    await supabase.from('notes').delete().eq('id', id);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: any) => {
    setLocalNotes((prev) => {
      const newNotes = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      
      return newNotes.sort((a, b) => {
        const aPinned = Boolean(a.is_pinned);
        const bPinned = Boolean(b.is_pinned);
        
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
    });

    const { error } = await supabase.from('notes').update(updates).eq('id', id);
    if (error) {
      alert("Database error: Check if is_pinned column exists! " + error.message);
      fetchData(); 
    } else {
      fetchData(); 
    }
  };

  if (loading) return <div className="p-12 text-center text-[#c4b5fd] font-bold">Loading Notes...</div>;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-emerald-900 flex items-center gap-3">
            <BookIcon className="w-8 h-8 text-emerald-700" /> Wedding Notes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Jot down your ideas.
          </p>
        </div>
                     
        <Button onClick={handleAddNote} className="bg-[#c4b5fd] hover:bg-[#a78bfa] text-slate-900 font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-6">
        {localNotes.length === 0 ? (
           <div className="text-center py-12 text-slate-400 italic">No notes yet. Click "Add Note" to get started!</div>
        ) : (
          localNotes.map((note: any) => (
            <NoteCard 
              key={note.id} 
              note={note} 
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
          <DialogTitle className="hidden">View Image</DialogTitle>
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