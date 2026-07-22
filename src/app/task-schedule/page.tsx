"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Check, Loader2, CalendarClock, Image as ImageIcon, User, Users, Pencil, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const renderTextWithLinks = (text: string) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

export default function DateSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  // Tab State: "date" (default) or "assigned"
  const [activeTab, setActiveTab] = useState<'date' | 'assigned'>('date');

  // Edit Task States
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingAssignedTo, setEditingAssignedTo] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Event Items
    const { data: eventData } = await supabase
      .from('event_items')
      .select('id, content, due_date, event_name, category, image_url, assigned_to, created_at')
      .eq('category', 'tasks');

    // 2. Fetch Global Tasks
    const { data: globalTasks } = await supabase
      .from('tasks')
      .select('id, text, due_date, status, image_url, assigned_to, created_at')
      .eq('status', 'ongoing');

    const combined = [
      ...(eventData || []).map(item => ({
        id: item.id,
        content: item.content,
        due_date: item.due_date,
        created_at: item.created_at,
        event_name: item.event_name,
        image_url: item.image_url,
        assigned_to: item.assigned_to,
        isGlobal: false
      })),
      ...(globalTasks || []).map(task => ({
        id: task.id,
        content: task.text,
        due_date: task.due_date,
        created_at: task.created_at,
        event_name: 'master',
        image_url: task.image_url,
        assigned_to: task.assigned_to,
        isGlobal: true
      }))
    ];

    const sorted = combined.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setSchedule(sorted);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Completion logic
  const markAsDone = async (item: any) => {
    if (item.isGlobal) {
      await supabase.from('tasks').update({ status: 'done' }).eq('id', item.id);
    } else {
      await supabase.from('event_items').update({ category: 'taskDone' }).eq('id', item.id);
    }
    fetchData(); 
  };

  // Start Editing
  const startEditing = (item: any) => {
    setEditingItemId(item.id);
    setEditingTaskText(item.content);
    setEditingTaskDate(item.due_date || "");
    setEditingAssignedTo(item.assigned_to || "");
    setEditingTaskImage(item.image_url || null);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
    setEditingAssignedTo("");
    setEditingTaskImage(null);
  };

  // Save Edited Item
  const saveEditedItem = async (item: any) => {
    if (!editingTaskText.trim()) return;

    if (item.isGlobal) {
      await supabase.from('tasks').update({
        text: editingTaskText.trim(),
        due_date: editingTaskDate || null,
        assigned_to: editingAssignedTo.trim() || null,
        image_url: editingTaskImage || null
      }).eq('id', item.id);
    } else {
      await supabase.from('event_items').update({
        content: editingTaskText.trim(),
        due_date: editingTaskDate || null,
        assigned_to: editingAssignedTo.trim() || null,
        image_url: editingTaskImage || null
      }).eq('id', item.id);
    }

    cancelEditing();
    fetchData();
  };

  // COMPRESSED IMAGE UPLOAD FOR EDIT
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500; 
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.5);
        setEditingTaskImage(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper to check if a task is overdue
  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="p-12 text-center text-emerald-600"><Loader2 className="animate-spin inline" /></div>;
  
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <CalendarClock className="w-8 h-8 text-emerald-600" />
            Task Schedule
          </h1>
          <p className="mt-2 text-slate-500">
            View all upcoming global and event tasks organized by due date or assigned person.
          </p>
        </div>

        {/* Tab Selection Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab('date')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'date'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-600" /> By Due Date
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assigned'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" /> By Assigned Person
          </button>
        </div>
      </div>

      {/* VIEW 1: DIVIDED BY DUE DATE */}
      {activeTab === 'date' && (
        <div className="space-y-6">
          {Object.entries(
            schedule.reduce((groups, item) => {
              const dueDateKey = item.due_date 
                ? new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Unscheduled Tasks";

              if (!groups[dueDateKey]) groups[dueDateKey] = [];
              groups[dueDateKey].push(item);
              return groups;
            }, {} as Record<string, any[]>)
          ).sort(([dateA], [dateB]) => {
            if (dateA === "Unscheduled Tasks") return 1;
            if (dateB === "Unscheduled Tasks") return -1;
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          }).map(([dueDateKey, items]) => {
            const isUnscheduled = dueDateKey === "Unscheduled Tasks";
            const groupHasOverdue = !isUnscheduled && (items as any[]).some(item => isOverdue(item.due_date));

            return (
              <div key={dueDateKey}>
                <h2 className={`mb-3 text-lg font-semibold ${isUnscheduled ? 'text-slate-600' : groupHasOverdue ? 'text-red-600' : 'text-emerald-700'}`}>
                  Due: {dueDateKey}
                </h2>

                <div className="space-y-3">
                  {(items as any[]).map((item) => {
                    const overdue = !isUnscheduled && isOverdue(item.due_date);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
                          overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Calendar className={`w-5 h-5 mt-0.5 shrink-0 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} />

                        {/* EDIT MODE */}
                        {editingItemId === item.id ? (
                          <div className="flex-1 flex flex-col gap-3 w-full">
                            <textarea 
                              value={editingTaskText}
                              onChange={(e) => setEditingTaskText(e.target.value)}
                              className="border border-emerald-500 rounded-lg outline-none p-2.5 text-slate-700 text-sm w-full resize-none"
                              rows={2}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input 
                                type={editingTaskDate ? "date" : "text"}
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                placeholder="Due Date"
                                value={editingTaskDate}
                                onChange={(e) => setEditingTaskDate(e.target.value)}
                                className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                              />

                              <input 
                                type="text"
                                placeholder="Assigned To"
                                value={editingAssignedTo}
                                onChange={(e) => setEditingAssignedTo(e.target.value)}
                                className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                              />

                              {editingTaskImage ? (
                                <div className="h-9 rounded border border-emerald-200 relative overflow-hidden group flex items-center justify-center shrink-0">
                                  <img src={editingTaskImage} className="w-full h-full object-cover" alt="" />
                                  <button onClick={() => setEditingTaskImage(null)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative h-9">
                                  <input type="file" accept="image/*" id={`edit-img-${item.id}`} className="hidden" onChange={handleImageUpload} />
                                  <label htmlFor={`edit-img-${item.id}`} className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50 text-xs">
                                    <ImageIcon className="w-3 h-3 mr-1" /> Image
                                  </label>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end gap-2 mt-1">
                              <Button variant="outline" onClick={cancelEditing} className="h-8 px-3 text-xs">Cancel</Button>
                              <Button onClick={() => saveEditedItem(item)} className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">Save</Button>
                            </div>
                          </div>
                        ) : (
                          
                          /* DISPLAY MODE */
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                              <p className="text-xs capitalize text-slate-500 font-medium">
                                {item.isGlobal ? "Global Task" : item.event_name}
                              </p>
                              {item.assigned_to && (
                                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                  <User className="w-3 h-3 text-emerald-600" /> {item.assigned_to}
                                </span>
                              )}
                            </div>

                            <p className={`font-semibold whitespace-pre-wrap break-words ${overdue ? 'text-red-900' : 'text-slate-800'}`}>
                              {renderTextWithLinks(item.content)}
                            </p>

                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1.5 opacity-70">
                              Entered on: {item.created_at ? formatDate(item.created_at) : "Just now"}
                            </p>

                            {item.image_url && (
                              <div 
                                className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[120px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
                                onClick={() => setExpandedImage(item.image_url)}
                              >
                                <img 
                                  src={item.image_url} 
                                  alt="Task attachment" 
                                  className="w-full h-auto object-cover" 
                                  onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {editingItemId !== item.id && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => startEditing(item)} className="p-2 border border-slate-200 text-slate-400 bg-white rounded-full hover:bg-slate-50 hover:text-slate-600" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => markAsDone(item)}
                              className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                              title="Mark Done"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: BY ASSIGNED PERSON & SUB-DIVIDED BY DUE DATE */}
      {activeTab === 'assigned' && (
        <div className="space-y-8">
          {Object.entries(
            schedule.reduce((groups, item) => {
              const person = item.assigned_to && item.assigned_to.trim() !== "" 
                ? item.assigned_to.trim() 
                : "Unassigned Tasks";

              if (!groups[person]) groups[person] = [];
              groups[person].push(item);
              return groups;
            }, {} as Record<string, any[]>)
          ).map(([person, personItems]) => {
            
            const dueDateGroups = (personItems as any[]).reduce((subGroups, item) => {
              const dueDateKey = item.due_date 
                ? new Date(item.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "Unscheduled Tasks";

              if (!subGroups[dueDateKey]) subGroups[dueDateKey] = [];
              subGroups[dueDateKey].push(item);
              return subGroups;
            }, {} as Record<string, any[]>);

            const sortedDueDateEntries = Object.entries(dueDateGroups).sort(([dateA], [dateB]) => {
              if (dateA === "Unscheduled Tasks") return 1;
              if (dateB === "Unscheduled Tasks") return -1;
              return new Date(dateA).getTime() - new Date(dateB).getTime();
            });

            return (
              <div key={person} className="border-b pb-6 last:border-b-0">
                <h2 className="mb-4 text-xl font-bold text-emerald-900 flex items-center gap-2">
                  <User className="w-6 h-6 text-emerald-600" /> {person}
                  <span className="bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {(personItems as any[]).length}
                  </span>
                </h2>

                <div className="space-y-4 pl-4 border-l-2 border-emerald-100">
                  {sortedDueDateEntries.map(([dueDateKey, items]) => {
                    const isUnscheduled = dueDateKey === "Unscheduled Tasks";

                    return (
                      <div key={dueDateKey} className="space-y-3">
                        <h3 className={`text-sm font-semibold ${isUnscheduled ? 'text-slate-500' : 'text-emerald-700'}`}>
                          Due: {dueDateKey}
                        </h3>

                        <div className="space-y-3">
                          {(items as any[]).map((item) => {
                            const overdue = !isUnscheduled && isOverdue(item.due_date);

                            return (
                              <div
                                key={item.id}
                                className={`flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors ${
                                  overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-white'
                                }`}
                              >
                                <Calendar className={`w-5 h-5 mt-0.5 shrink-0 ${overdue ? 'text-red-500' : 'text-emerald-600'}`} />

                                {/* EDIT MODE */}
                                {editingItemId === item.id ? (
                                  <div className="flex-1 flex flex-col gap-3 w-full">
                                    <textarea 
                                      value={editingTaskText}
                                      onChange={(e) => setEditingTaskText(e.target.value)}
                                      className="border border-emerald-500 rounded-lg outline-none p-2.5 text-slate-700 text-sm w-full resize-none"
                                      rows={2}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <input 
                                        type={editingTaskDate ? "date" : "text"}
                                        onFocus={(e) => (e.target.type = "date")}
                                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                        placeholder="Due Date"
                                        value={editingTaskDate}
                                        onChange={(e) => setEditingTaskDate(e.target.value)}
                                        className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                                      />

                                      <input 
                                        type="text"
                                        placeholder="Assigned To"
                                        value={editingAssignedTo}
                                        onChange={(e) => setEditingAssignedTo(e.target.value)}
                                        className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                                      />

                                      {editingTaskImage ? (
                                        <div className="h-9 rounded border border-emerald-200 relative overflow-hidden group flex items-center justify-center shrink-0">
                                          <img src={editingTaskImage} className="w-full h-full object-cover" alt="" />
                                          <button onClick={() => setEditingTaskImage(null)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="relative h-9">
                                          <input type="file" accept="image/*" id={`edit-img-2-${item.id}`} className="hidden" onChange={handleImageUpload} />
                                          <label htmlFor={`edit-img-2-${item.id}`} className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50 text-xs">
                                            <ImageIcon className="w-3 h-3 mr-1" /> Image
                                          </label>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-end gap-2 mt-1">
                                      <Button variant="outline" onClick={cancelEditing} className="h-8 px-3 text-xs">Cancel</Button>
                                      <Button onClick={() => saveEditedItem(item)} className="h-8 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">Save</Button>
                                    </div>
                                  </div>
                                ) : (
                                  
                                  /* DISPLAY MODE */
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                      <p className="text-xs capitalize text-slate-500 font-medium">
                                        {item.isGlobal ? "Global Task" : item.event_name}
                                      </p>
                                    </div>

                                    <p className={`font-semibold whitespace-pre-wrap break-words ${overdue ? 'text-red-900' : 'text-slate-800'}`}>
                                      {renderTextWithLinks(item.content)}
                                    </p>

                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1.5 opacity-70">
                                      Entered on: {item.created_at ? formatDate(item.created_at) : "Just now"}
                                    </p>

                                    {item.image_url && (
                                      <div 
                                        className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[120px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
                                        onClick={() => setExpandedImage(item.image_url)}
                                      >
                                        <img 
                                          src={item.image_url} 
                                          alt="Task attachment" 
                                          className="w-full h-auto object-cover" 
                                          onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {editingItemId !== item.id && (
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => startEditing(item)} className="p-2 border border-slate-200 text-slate-400 bg-white rounded-full hover:bg-slate-50 hover:text-slate-600" title="Edit">
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => markAsDone(item)}
                                      className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                                      title="Mark Done"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Image Lightbox Modal */}
      <Dialog open={!!expandedImage} onOpenChange={(open) => !open && setExpandedImage(null)}>
        <DialogContent 
          className="max-w-screen-lg w-[90vw] bg-transparent border-none shadow-none flex items-center justify-center p-0 [&>button]:bg-black/50 [&>button]:text-white [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2 focus-visible:outline-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {expandedImage && (
            <img 
              src={expandedImage} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              alt="Expanded preview" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                setExpandedImage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}