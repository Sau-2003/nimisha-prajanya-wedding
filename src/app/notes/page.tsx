"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useNotes } from "@/hooks/useNotes"; 

// --- SUB-COMPONENT: Handles typing cleanly without lagging the app ---
function NoteCard({ note, onDelete, onUpdate, onImageClick }: any) {
  // Local state keeps typing fast & smooth
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [isEditing, setIsEditing] = useState(false);

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

  // Handle Image Upload with Hyper-Compression for Database Storage
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
          
          // Compress to max 500x500px to keep base64 string tiny
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

          // Compress to JPEG at 50% quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);

          // Save immediately to database
          onUpdate(note.id, { image_url: compressedBase64 });
        };
        img.src = event.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Sync if database changes from another device
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content || "");
  }, [note]);

  return (
    <div className="relative bg-white w-full rounded-xl shadow-md border border-slate-100 overflow-hidden group">
      <button 
        onClick={() => onDelete(note.id)}
        className="absolute top-6 right-6 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-50 md:opacity-50 md:group-hover:opacity-100 transition-opacity z-10 shadow-sm"
        title="Delete Note"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <div className="pt-8 pb-4 pl-12 md:pl-16 pr-8">
        <input 
          type="text"
          className="text-2xl font-sans text-indigo-600 tracking-widest uppercase w-full bg-transparent border-b-2 border-transparent hover:border-[#c4b5fd]/30 focus:border-[#c4b5fd] focus:outline-none transition-all"
          value={title}
          placeholder="ENTER TITLE..."
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          onBlur={() => onUpdate(note.id, { title })} 
        />
      </div>

      <div className="w-full px-4 md:px-12 pb-4">
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
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors bg-slate-50 px-3 py-1.5 rounded-md hover:bg-slate-100"
          >
            <ImageIcon className="w-4 h-4" />
            {note.image_url ? "Change Image" : "Attach Image"}
          </label>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function NotesPage() {
  const { notes, loading, fetchData } = useNotes();
  
  const [pageTitle, setPageTitle] = useState("Wedding Notes");
  const [pageDesc, setPageDesc] = useState("Jot down your ideas.");
  
  // Full screen image state
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle(localStorage.getItem("notes-page-title") || "Wedding Notes");
    setPageDesc(localStorage.getItem("notes-page-desc") || "Jot down your ideas.");
  }, []);

  const handleAddNote = async () => {
    const { error } = await supabase.from('notes').insert({ title: 'NEW NOTE', content: '' });
    if (error) {
      alert("Error adding note: " + error.message);
      return;
    }
    fetchData(); 
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id);
    fetchData();
  };

  const handleUpdate = async (id: string, updates: any) => {
    const { error } = await supabase.from('notes').update(updates).eq('id', id);
    if (error) {
      alert("Database error: " + error.message);
    }
  };

  if (loading) return <div className="p-12 text-center text-[#c4b5fd] font-bold">Loading Notes...</div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1">
          <input 
            className="font-serif text-3xl font-bold text-slate-900 w-full focus:outline-none"
            value={pageTitle}
            onChange={(e) => { setPageTitle(e.target.value); localStorage.setItem("notes-page-title", e.target.value); }}
          />
          <input 
            className="text-slate-500 mt-1 w-full focus:outline-none"
            value={pageDesc}
            onChange={(e) => { setPageDesc(e.target.value); localStorage.setItem("notes-page-desc", e.target.value); }}
          />
        </div>
        <Button onClick={handleAddNote} className="bg-[#c4b5fd] hover:bg-[#a78bfa] text-slate-900 font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" /> Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-10">
        {notes.length === 0 ? (
           <div className="text-center py-12 text-slate-400 italic">No notes yet. Click "Add Note" to get started!</div>
        ) : (
          notes.map((note: any) => (
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