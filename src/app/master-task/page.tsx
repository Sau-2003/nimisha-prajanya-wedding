"use client";

import { useState } from "react";
import { Check, ClipboardList, Trash2, RotateCcw, Plus, Pencil, X, Calendar, Image as ImageIcon, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useTasks } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers"; // Import shared hook

export default function TasksPage() {
  const { tasks, fetchData, loading } = useTasks();
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Team Management Modal States
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [newTeamMemberInput, setNewTeamMemberInput] = useState("");
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [editingMemberValue, setEditingMemberValue] = useState("");

  // Add Task States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [newTaskImage, setNewTaskImage] = useState<string | null>(null);

  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Edit Task States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingAssignedTo, setEditingAssignedTo] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const ongoingTasks = tasks
    .filter((t: any) => t.status === 'ongoing')
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const completedTasks = tasks
    .filter((t: any) => t.status === 'done')
    .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  const handleAddTeamMember = async () => {
    const trimmed = newTeamMemberInput.trim();
    if (trimmed) {
      await addTeamMember(trimmed);
      setNewTeamMemberInput("");
    }
  };

  const handleUpdateTeamMember = async (oldName: string) => {
    const trimmed = editingMemberValue.trim();
    if (trimmed) {
      await updateTeamMember(oldName, trimmed);
      setEditingMemberIndex(null);
      setEditingMemberValue("");
    }
  };

  const handleDeleteTeamMember = async (name: string) => {
    await deleteTeamMember(name);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 800; 
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) { height = Math.round(height * (MAX_WIDTH / width)); width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width = Math.round(width * (MAX_HEIGHT / height)); height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          if (isEditMode) setEditingTaskImage(compressedBase64);
          else setNewTaskImage(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    if (assignedTo.trim()) await addTeamMember(assignedTo.trim());
    
    try {
      const { error } = await supabase.from('tasks').insert({ 
        text: newTaskText.trim(), 
        status: 'ongoing',
        due_date: dueDate || null,
        assigned_to: assignedTo.trim() || null,
        image_url: newTaskImage || null,
        created_at: new Date().toISOString()
      });

      if (error) {
        alert("Failed to add task.");
        return;
      }

      setNewTaskText(""); 
      setDueDate("");
      setAssignedTo("");
      setNewTaskImage(null);
      setIsDialogOpen(false); 
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const saveEditedTask = async (id: string) => {
    if (!editingTaskText.trim()) return;
    if (editingAssignedTo.trim()) await addTeamMember(editingAssignedTo.trim());

    try {
      const { error } = await supabase.from('tasks').update({ 
        text: editingTaskText.trim(),
        due_date: editingTaskDate || null,
        assigned_to: editingAssignedTo.trim() || null,
        image_url: editingTaskImage || null
      }).eq('id', id);

      if (error) {
        alert("Failed to save changes.");
        return;
      }
      
      setEditingTaskId(null);
      setEditingTaskText("");
      setEditingTaskDate("");
      setEditingAssignedTo("");
      setEditingTaskImage(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
    setEditingTaskDate(task.due_date || "");
    setEditingAssignedTo(task.assigned_to || "");
    setEditingTaskImage(task.image_url || null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
    setEditingAssignedTo("");
    setEditingTaskImage(null);
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchData();
  };

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline break-all" onClick={(e) => e.stopPropagation()}>{part}</a>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading tasks...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-serif font-bold text-emerald-900 mb-2">
            <ClipboardList className="w-8 h-8 text-emerald-700" /> Global Task Board
          </h1>
          <p className="text-slate-500">Manage everything you need to do before the big day.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsTeamModalOpen(true)} variant="outline" className="border-slate-300 text-slate-700">
            <Settings className="w-4 h-4 mr-2" /> Manage Team
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      {/* Two-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-50/50 border rounded-xl overflow-hidden shadow-sm">
          <div className="border-b bg-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-serif text-slate-800">Ongoing Tasks</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{ongoingTasks.length}</span>
          </div>
          <div className="p-4 space-y-4 min-h-[300px]">
            {ongoingTasks.map((task: any) => {
              const overdue = isOverdue(task.due_date);
              return (
                <div key={task.id} className={`bg-white border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start group transition-colors ${overdue ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}`}>
                  {editingTaskId === task.id ? (
                    <div className="flex-1 flex flex-col gap-2 w-full">
                      <textarea
                        rows={2}
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        className="border border-emerald-500 rounded-lg outline-none px-2 py-2 text-slate-700 resize-none"          
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                        <input 
                          type={editingTaskDate ? "date" : "text"}
                          onFocus={(e) => (e.target.type = "date")}
                          onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                          value={editingTaskDate}
                          onChange={(e) => setEditingTaskDate(e.target.value)}
                          className="text-sm border rounded px-2 h-9 text-slate-600 outline-none focus:border-emerald-500 w-full"
                        />
                        <div className="relative w-full">
                          <div onClick={() => setOpenDropdownId(openDropdownId === task.id ? null : task.id)} className="text-sm border rounded px-2 h-9 text-slate-600 bg-white flex items-center justify-between cursor-pointer select-none">
                            <span className="truncate">{editingAssignedTo || "Assign to..."}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                          </div>
                          {openDropdownId === task.id && (
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
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={() => saveEditedTask(task.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 text-xs font-medium"><Check className="w-3.5 h-3.5 mr-1" /> Save</button>
                        <button onClick={cancelEditing} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 text-xs font-medium"><X className="w-3.5 h-3.5 mr-1" /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{task.created_at ? formatDate(task.created_at) : "Just now"}</span>
                        {task.assigned_to && (
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                            <User className="w-3 h-3 text-emerald-600" /> {task.assigned_to}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</p>
                    </div>
                  )}
                  {editingTaskId !== task.id && (
                    <div className="flex gap-2">
                      <button onClick={() => startEditing(task)} className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => updateTaskStatus(task.id, 'done')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Check className="w-4 h-4" /></button>
                      <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Column */}
        <div className="bg-slate-50/50 border rounded-xl overflow-hidden shadow-sm">
          <div className="border-b bg-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-serif text-slate-800">Completed Tasks</h2>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{completedTasks.length}</span>
          </div>
          <div className="p-4 space-y-4 min-h-[300px]">
            {completedTasks.map((task: any) => (
              <div key={task.id} className="bg-white border p-4 rounded-xl shadow-sm flex justify-between items-start group">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5 opacity-70">
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{task.created_at ? formatDate(task.created_at) : "Just now"}</span>
                    {task.assigned_to && (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {task.assigned_to}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 line-through">{renderTextWithLinks(task.text)}</p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button onClick={() => updateTaskStatus(task.id, 'ongoing')} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg"><RotateCcw className="w-4 h-4" /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <textarea
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"          
              placeholder="What needs to be done?"
              rows={3}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="date"
                className="w-full h-[42px] border px-3 rounded-lg outline-none text-sm bg-white" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
              <div className="relative h-[42px]">
                <div onClick={() => setOpenDropdownId(openDropdownId === 'add' ? null : 'add')} className="w-full h-full border px-3 rounded-lg text-sm bg-white flex items-center justify-between cursor-pointer select-none">
                  <span className="truncate">{assignedTo || "Assign To..."}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                </div>
                {openDropdownId === 'add' && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    <div className="p-1.5 border-b bg-slate-50 sticky top-0">
                      <input type="text" autoFocus value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Type custom name..." className="w-full text-xs px-2 py-1.5 border rounded outline-none" />
                    </div>
                    <div onClick={() => { setAssignedTo(""); setOpenDropdownId(null); }} className="px-3 py-2 text-xs text-slate-400 italic cursor-pointer">Unassigned</div>
                    {teamMembers.map((member) => (
                      <div key={member} onClick={() => { setAssignedTo(member); setOpenDropdownId(null); }} className="px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 cursor-pointer">{member}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button onClick={handleAddTask} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">Save Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Team Modal */}
      <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Manage Assignee Options</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <input type="text" placeholder="Add team member..." value={newTeamMemberInput} onChange={(e) => setNewTeamMemberInput(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none" />
              <Button onClick={handleAddTeamMember} className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="p-3 flex items-center justify-between text-sm bg-white">
                  {editingMemberIndex === index ? (
                    <div className="flex-1 flex gap-2 mr-2">
                      <input type="text" value={editingMemberValue} onChange={(e) => setEditingMemberValue(e.target.value)} className="flex-1 border rounded px-2 py-1 text-sm outline-none" />
                      <button onClick={() => handleUpdateTeamMember(member)} className="p-1 bg-emerald-50 text-emerald-600 rounded"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingMemberIndex(null)} className="p-1 bg-slate-100 text-slate-500 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium text-slate-700">{member}</span>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingMemberIndex(index); setEditingMemberValue(member); }} className="p-1.5 text-slate-400 hover:text-slate-600"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteTeamMember(member)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}