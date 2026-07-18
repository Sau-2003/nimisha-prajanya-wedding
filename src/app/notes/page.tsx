"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, StickyNote } from "lucide-react";

interface NoteEntry {
  id: string;
  title: string;
  text: string;
}

export default function NotesPage() {
  const [pageTitle, setPageTitle] = useState("Wedding Notes");
  const [pageDesc, setPageDesc] = useState("Jot down your ideas, reminders, and vendor details.");
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load everything from localStorage on mount
  useEffect(() => {
    setPageTitle(localStorage.getItem("notes-page-title") || "Wedding Notes");
    setPageDesc(localStorage.getItem("notes-page-desc") || "Jot down your ideas, reminders, and vendor details.");
    const saved = localStorage.getItem("wedding-notes-data");
    setNotes(saved ? JSON.parse(saved) : [{ id: Date.now().toString(), title: "NOTES", text: "" }]);
    setIsLoaded(true);
  }, []);

  const saveAll = (newNotes: NoteEntry[]) => {
    setNotes(newNotes);
    localStorage.setItem("wedding-notes-data", JSON.stringify(newNotes));
  };

  const handleAddNote = () => {
    const newNotes = [...notes, { id: Date.now().toString(), title: "NOTES", text: "" }];
    saveAll(newNotes);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  if (!isLoaded) return null;

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
        {notes.map((note) => (
  <div key={note.id} className="relative bg-white w-full rounded-xl shadow-md border border-slate-100 overflow-hidden group">
    <button 
      onClick={() => saveAll(notes.filter(n => n.id !== note.id))}
      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
    >
      <Trash2 className="w-5 h-5" />
    </button>

    <div className="pt-8 pb-4 pl-12 md:pl-16 pr-8">
      {/* IMPROVED EDITABLE TITLE */}
      <input 
        type="text"
        className="text-5xl font-sans text-[#c4b5fd] tracking-widest uppercase w-full bg-transparent border-b-2 border-transparent hover:border-[#c4b5fd]/30 focus:border-[#c4b5fd] focus:outline-none transition-all"
        value={note.title}
        placeholder="ENTER TITLE..."
        onChange={(e) => {
          const updated = notes.map(n => n.id === note.id ? {...n, title: e.target.value.toUpperCase()} : n);
          saveAll(updated);
        }}
      />
    </div>

    <div className="relative w-full">
      <div className="absolute top-0 bottom-0 left-8 md:left-12 w-px bg-[#c4b5fd]"></div>
      <textarea
        className="w-full min-h-[400px] pl-12 md:pl-16 pr-8 py-0 bg-transparent focus:outline-none resize-y text-slate-700 text-lg font-sans"
        style={{ 
          lineHeight: '32px', 
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #c4b5fd 31px, #c4b5fd 32px)', 
          backgroundAttachment: 'local' 
        }}
        value={note.text}
        onChange={(e) => {
          const updated = notes.map(n => n.id === note.id ? {...n, text: e.target.value} : n);
          saveAll(updated);
        }}
        placeholder="Start typing your notes here..."
      />
    </div>
  </div>
))}
      </div>
    </div>
  );
}