"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, StickyNote } from "lucide-react";

interface NoteEntry {
  id: string;
  text: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved notes when the page opens
  useEffect(() => {
    const saved = localStorage.getItem("wedding-notes-data");
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      // Start with one blank note if empty
      setNotes([{ id: Date.now().toString(), text: "" }]);
    }
    setIsLoaded(true);
  }, []);

  // Save notes whenever they change
  const saveNotes = (updatedNotes: NoteEntry[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("wedding-notes-data", JSON.stringify(updatedNotes));
  };

  // Add a new note (goes down the page)
  const handleAddNote = () => {
    const newNotes = [...notes, { id: Date.now().toString(), text: "" }];
    saveNotes(newNotes);
    
    // Smooth scroll down to the newly added note
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  // Update text typing
  const handleUpdateNote = (id: string, newText: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, text: newText } : note
    );
    saveNotes(updatedNotes);
  };

  // Delete a note
  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    saveNotes(updatedNotes);
  };

  if (!isLoaded) return null; // Prevent flicker before loading local storage

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen space-y-8">
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 flex items-center gap-3">
            <StickyNote className="w-8 h-8 text-[#c4b5fd]" />
            Wedding Notes
          </h1>
          <p className="text-slate-500 mt-1">Jot down your ideas, reminders, and vendor details.</p>
        </div>
        
        <Button onClick={handleAddNote} className="bg-[#c4b5fd] hover:bg-[#a78bfa] text-slate-900 font-semibold shadow-sm">
          <Plus className="w-5 h-5 mr-2" />
          Add Note
        </Button>
      </div>

      {/* The Lined Notes List */}
      <div className="space-y-10">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className="relative bg-white w-full mx-auto rounded-xl shadow-md border border-slate-100 overflow-hidden group"
          >
            {/* Delete Button (Appears on hover) */}
            <button 
              onClick={() => handleDeleteNote(note.id)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 z-10"
              title="Delete Note"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Design modeled perfectly after 1131w-7gTxcKZdBQM.webp */}
            <div className="pt-8 pb-4 pl-12 md:pl-16 pr-8">
              <h2 className="text-5xl font-sans text-[#c4b5fd] tracking-widest uppercase">
                Notes
              </h2>
            </div>

            <div className="relative w-full">
              {/* Vertical Margin Line */}
              <div className="absolute top-0 bottom-0 left-8 md:left-12 w-px bg-[#c4b5fd]"></div>

              {/* Editable Text Area with Lined Background */}
              <textarea
                className="w-full min-h-[400px] pl-12 md:pl-16 pr-8 py-0 bg-transparent focus:outline-none resize-y text-slate-700 text-lg font-sans"
                style={{
                  lineHeight: '32px',
                  // Horizontal Lines mimicking the reference image exactly
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #c4b5fd 31px, #c4b5fd 32px)',
                  backgroundAttachment: 'local', // Ensures lines scroll cleanly with the text
                }}
                value={note.text}
                onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                placeholder="Start typing your notes here..."
              />
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center p-12 text-slate-400 italic">
            No notes yet. Click "Add Note" to create a new page!
          </div>
        )}
      </div>
    </div>
  );
}