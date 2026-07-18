"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StickyNote, Save } from "lucide-react";

export default function NotesCard() {
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  // Load saved notes from local storage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("wedding-notes") || "";
    setNotes(savedNotes);
  }, []);

  const handleSave = () => {
    localStorage.setItem("wedding-notes", notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Reset save status after 2s
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-slate-400" />
            Notes
          </div>
          <Button 
            onClick={handleSave} 
            size="sm" 
            className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
          >
            {isSaved ? "Saved!" : <><Save className="w-3 h-3 mr-1" /> Save</>}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          className="w-full h-64 p-3 border border-slate-200 rounded-lg text-sm focus:outline-emerald-500 resize-none bg-slate-50"
          placeholder="Jot down important reminders or details here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </CardContent>
    </Card>
  );
}