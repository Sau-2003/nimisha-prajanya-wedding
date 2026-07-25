"use client";

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Check, Loader2, CalendarClock, Image as ImageIcon, User, Users, Pencil, X, Trash2, Bold, Italic, Strikethrough, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "@/hooks/useTeamMembers"; // Import team members hook

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

// Safely auto-links URLs inside HTML strings without breaking HTML formatting tags
const linkifyHtml = (htmlText: string) => {
  if (!htmlText) return "";
  const urlRegex = /(?<!href="|src=")(https?:\/\/[^\s<]+)/g;
  return htmlText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-700 underline break-all">$1</a>');
};

export default function DateSchedulePage() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const { teamMembers, addTeamMember } = useTeamMembers(); // Pull in team members

  // Tab State: "date" (default) or "assigned"
  const [activeTab, setActiveTab] = useState<'date' | 'assigned'>('date');

  // Edit Task States
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingAssignedTo, setEditingAssignedTo] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);
  
  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

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

  // Delete logic
  const confirmItemDelete = async () => {
    if (!itemToDelete) return;
    if (itemToDelete.isGlobal) {
      await supabase.from('tasks').delete().eq('id', itemToDelete.id);
    } else {
      await supabase.from('event_items').delete().eq('id', itemToDelete.id);
    }
    setItemToDelete(null);
    fetchData();
  };

  // Start Editing
  const startEditing = (item: any) => {
    setEditingItemId(item.id);
    setEditingTaskText(item.content);
    setEditingTaskDate(item.due_date || "");
    setEditingAssignedTo(item.assigned_to || "");
    setEditingTaskImage(item.image_url || null);
    setOpenDropdownId(null);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
    setEditingAssignedTo("");
    setEditingTaskImage(null);
    setOpenDropdownId(null);
  };

  // Save Edited Item
  const saveEditedItem = async (item: any) => {
    const plainTextContent = editingTaskText.replace(/<[^>]*>?/gm, '').trim();
    if (!plainTextContent) {
      cancelEditing();
      return;
    }

    if (editingAssignedTo.trim()) {
      await addTeamMember(editingAssignedTo.trim());
    }

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
      {/* Global floating formatting toolbar */}
      <FloatingToolbar />

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
                            <EditableCell 
                              value={editingTaskText}
                              onChange={(val) => setEditingTaskText(val)}
                              placeholder="Task description..."
                              className="border border-emerald-500 rounded-lg outline-none p-2.5 text-slate-700 text-sm w-full min-h-[60px] bg-white"
                              autoFocus
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                              <input 
                                type={editingTaskDate ? "date" : "text"}
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                placeholder="Due Date"
                                value={editingTaskDate}
                                onChange={(e) => setEditingTaskDate(e.target.value)}
                                className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                              />

                              <div className="relative w-full">
                                <div onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)} className="text-sm border rounded px-2 h-9 text-slate-600 bg-white flex items-center justify-between cursor-pointer select-none">
                                  <span className="truncate">{editingAssignedTo || "Assign to..."}</span>
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                                </div>
                                {openDropdownId === item.id && (
                                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                    <div className="p-1 border-b bg-slate-50 sticky top-0">
                                      <input
                                        type="text"
                                        autoFocus
                                        value={editingAssignedTo}
                                        onChange={(e) => setEditingAssignedTo(e.target.value)}
                                        placeholder="Type custom name..."
                                        className="w-full text-xs px-2 py-1 border rounded bg-white outline-none focus:border-emerald-500 text-slate-700"
                                      />
                                    </div>
                                    <div onClick={() => { setEditingAssignedTo(""); setOpenDropdownId(null); }} className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 cursor-pointer italic">Unassigned</div>
                                    {teamMembers.map((member) => (
                                      <div key={member} onClick={() => { setEditingAssignedTo(member); setOpenDropdownId(null); }} className="px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer truncate">{member}</div>
                                    ))}
                                  </div>
                                )}
                              </div>

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

                            <div 
                              className={`font-semibold whitespace-pre-wrap break-words [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through ${overdue ? 'text-red-900' : 'text-slate-800'}`}
                              dangerouslySetInnerHTML={{ __html: linkifyHtml(item.content) }}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
                                  e.stopPropagation();
                                }
                              }}
                            />

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
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="p-2 border border-red-100 text-red-400 bg-white rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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
                                    <EditableCell 
                                      value={editingTaskText}
                                      onChange={(val) => setEditingTaskText(val)}
                                      placeholder="Task description..."
                                      className="border border-emerald-500 rounded-lg outline-none p-2.5 text-slate-700 text-sm w-full min-h-[60px] bg-white"
                                      autoFocus
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                                      <input 
                                        type={editingTaskDate ? "date" : "text"}
                                        onFocus={(e) => (e.target.type = "date")}
                                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                                        placeholder="Due Date"
                                        value={editingTaskDate}
                                        onChange={(e) => setEditingTaskDate(e.target.value)}
                                        className="border rounded px-2 h-9 outline-none text-sm text-slate-600 bg-white w-full"
                                      />

                                      <div className="relative w-full">
                                        <div onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)} className="text-sm border rounded px-2 h-9 text-slate-600 bg-white flex items-center justify-between cursor-pointer select-none">
                                          <span className="truncate">{editingAssignedTo || "Assign to..."}</span>
                                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                                        </div>
                                        {openDropdownId === item.id && (
                                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 max-h-48 overflow-y-auto">
                                            <div className="p-1 border-b bg-slate-50 sticky top-0">
                                              <input
                                                type="text"
                                                autoFocus
                                                value={editingAssignedTo}
                                                onChange={(e) => setEditingAssignedTo(e.target.value)}
                                                placeholder="Type custom name..."
                                                className="w-full text-xs px-2 py-1 border rounded bg-white outline-none focus:border-emerald-500 text-slate-700"
                                              />
                                            </div>
                                            <div onClick={() => { setEditingAssignedTo(""); setOpenDropdownId(null); }} className="px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-100 cursor-pointer italic">Unassigned</div>
                                            {teamMembers.map((member) => (
                                              <div key={member} onClick={() => { setEditingAssignedTo(member); setOpenDropdownId(null); }} className="px-3 py-1.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer truncate">{member}</div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

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

                                    <div 
                                      className={`font-semibold whitespace-pre-wrap break-words [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_strike]:line-through [&_s]:line-through ${overdue ? 'text-red-900' : 'text-slate-800'}`}
                                      dangerouslySetInnerHTML={{ __html: linkifyHtml(item.content) }}
                                      onClick={(e) => {
                                        if ((e.target as HTMLElement).tagName.toLowerCase() === 'a') {
                                          e.stopPropagation();
                                        }
                                      }}
                                    />

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
                                    <button
                                      onClick={() => setItemToDelete(item)}
                                      className="p-2 border border-red-100 text-red-400 bg-white rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
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

      {/* --- CONFIRM ITEM DELETE MODAL --- */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-slate-600">Are you sure you want to delete this item? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancel</Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={confirmItemDelete}>
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}