"use client";

import { useState } from "react";
import { 
  Check, Trash2, RotateCcw, Plus, LayoutList, Pencil, X, Calendar, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useTasks } from "@/hooks/useTasks";

export default function TasksPage() {
  const { tasks, fetchData, loading } = useTasks();
  
  // Add Task States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newTaskImage, setNewTaskImage] = useState<string | null>(null);

  const isMobile =
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Edit Task States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");
  const [editingTaskImage, setEditingTaskImage] = useState<string | null>(null);

  // Full Screen Image State
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Filter tasks
  const ongoingTasks = tasks.filter((t: any) => t.status === 'ongoing');
  const completedTasks = tasks.filter((t: any) => t.status === 'done');

  // Handle Image Selection with AUTO COMPRESSION
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Create an invisible canvas to compress the image
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          // Max dimensions to prevent massive base64 strings
          const MAX_WIDTH = 800; 
          const MAX_HEIGHT = 800;

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

          // Compress to JPEG at 70% quality (drastically reduces file size)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          if (isEditMode) {
            setEditingTaskImage(compressedBase64);
          } else {
            setNewTaskImage(compressedBase64);
          }
        };
        img.src = event.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      const { error } = await supabase.from('tasks').insert({ 
        text: newTaskText.trim(), 
        status: 'ongoing',
        due_date: dueDate || null,
        image_url: newTaskImage || null
      });

      if (error) {
        console.error("Insert error:", error);
        alert("Failed to add task. The image still might be too large for the database format.");
        return;
      }

      setNewTaskText(""); 
      setDueDate("");
      setNewTaskImage(null);
      setIsDialogOpen(false); 
      fetchData();
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const saveEditedTask = async (id: string) => {
    if (!editingTaskText.trim()) return;

    try {
      const { error } = await supabase.from('tasks').update({ 
        text: editingTaskText.trim(),
        due_date: editingTaskDate || null,
        image_url: editingTaskImage || null
      }).eq('id', id);

      if (error) {
        console.error("Update error:", error);
        alert("Failed to save changes. The image might be too large.");
        return;
      }
      
      setEditingTaskId(null);
      setEditingTaskText("");
      setEditingTaskDate("");
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
    setEditingTaskImage(task.image_url || null);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
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
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Helper to format dates nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <div className="p-12 text-center text-emerald-600">Loading tasks...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-serif font-bold text-emerald-900 mb-2">
            <LayoutList className="w-8 h-8 text-emerald-700" /> 
            Global Task Board
          </h1>
          <p className="text-slate-500">Manage everything you need to do before the big day.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Task
        </Button>
      </div>

      {/* Two-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ongoing Tasks Column */}
        <div className="bg-slate-50/50 border rounded-xl overflow-hidden shadow-sm">
          <div className="border-b bg-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-serif text-slate-800">Ongoing Tasks</h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {ongoingTasks.length}
            </span>
          </div>
          <div className="p-4 space-y-4 min-h-[300px]">
            {ongoingTasks.map((task: any) => (
              <div key={task.id} className="bg-white border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start group">
                
                {/* EDIT MODE */}
                {editingTaskId === task.id ? (
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <textarea
                      rows={2}
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          saveEditedTask(task.id);
                        }
                      }}
                      placeholder="Task description"
                      className="border border-emerald-500 rounded-lg outline-none px-2 py-2 text-slate-700 resize-none"              
                    />
                    
                    {/* Image Preview in Edit Mode */}
                    {editingTaskImage && (
                      <div className="relative inline-block w-max mt-1 mb-1">
                        <img src={editingTaskImage} alt="Preview" className="h-16 w-auto rounded-md border border-slate-200 object-cover" />
                        <button onClick={() => setEditingTaskImage(null)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 hover:bg-red-200 shadow-sm">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2 items-center h-8">
                      <input 
                        type={editingTaskDate ? "date" : "text"}
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                        placeholder="Due Date"
                        value={editingTaskDate}
                        onChange={(e) => setEditingTaskDate(e.target.value)}
                        className="text-sm border rounded px-2 h-full text-slate-600 outline-none focus:border-emerald-500 w-1/3"
                      />
                      
                      <div className="flex-1 relative h-full">
                        <input 
                          type="file"
                          accept="image/*"
                          id={`edit-image-${task.id}`}
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, true)}
                        />
                        <label 
                          htmlFor={`edit-image-${task.id}`} 
                          className="flex items-center justify-center w-full h-full border border-dashed rounded cursor-pointer text-slate-500 hover:bg-slate-50 text-xs"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {editingTaskImage ? "Change Image" : "Attach Image"}
                        </label>
                      </div>

                      <button onClick={() => saveEditedTask(task.id)} className="p-1.5 h-full ml-auto bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEditing} className="p-1.5 h-full bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200 flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  
                  /* DISPLAY MODE */
                  <div className="flex-1">
                    <p className="text-slate-700 whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</p>
                    
                    {task.due_date && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {formatDate(task.due_date)}
                      </p>
                    )}

                    {task.image_url && (
                      <div 
                        onClick={() => setFullScreenImage(task.image_url)}
                        className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[150px] shadow-sm cursor-pointer hover:opacity-90 transition-opacity relative group"
                      >
                        <img src={task.image_url} alt="Attached item" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions (Hidden while editing) */}
                {editingTaskId !== task.id && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => updateTaskStatus(task.id, 'done')}
                      className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      title="Mark as done"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {ongoingTasks.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No ongoing tasks.</p>
            )}
          </div>
        </div>

        {/* Completed Tasks Column */}
        <div className="bg-slate-50/50 border rounded-xl overflow-hidden shadow-sm">
          <div className="border-b bg-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-serif text-slate-800">Completed Tasks</h2>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
              {completedTasks.length}
            </span>
          </div>
          <div className="p-4 space-y-4 min-h-[300px]">
            {completedTasks.map((task: any) => (
              <div key={task.id} className="bg-white border p-4 rounded-xl shadow-sm flex justify-between items-start group">
                <div className="flex-1">
                  <p className="text-slate-400 line-through whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</p>
                  
                  {task.due_date && (
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(task.due_date)}
                    </p>
                  )}

                  {task.image_url && (
                    <div 
                      onClick={() => setFullScreenImage(task.image_url)}
                      className="mt-3 rounded-lg border border-slate-200 overflow-hidden w-full max-w-[150px] shadow-sm opacity-60 cursor-pointer hover:opacity-100 transition-opacity"
                    >
                      <img src={task.image_url} alt="Attached item" className="w-full h-auto object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'ongoing')}
                    className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                    title="Undo completion"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {completedTasks.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8 border-2 border-dashed border-slate-100 rounded-xl">No completed tasks yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Add Task Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            
            {/* Image Preview Area */}
            {newTaskImage && (
              <div className="relative inline-block w-max">
                <img src={newTaskImage} alt="Preview" className="h-28 w-auto rounded-lg border border-slate-200 object-cover shadow-sm" />
                <button 
                  onClick={() => setNewTaskImage(null)} 
                  className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1.5 hover:bg-red-200 shadow-md transition-colors"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <textarea
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none"             
              placeholder="What needs to be done?"
              rows={3}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (!isMobile && e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
            />
            
            <div className="grid grid-cols-2 gap-3 h-[42px]">
              <div className="relative h-full">
                <input 
                  type={dueDate ? "date" : "text"}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => { if (!e.target.value) e.target.type = "text"; }}
                  className="w-full h-full border px-3 rounded-lg outline-none focus:border-emerald-500 text-sm text-slate-700 bg-white" 
                  placeholder="Target Date (Optional)"
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </div>
              
              <div className="relative h-full">
                <input 
                  type="file"
                  accept="image/*"
                  id="add-new-image"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                <label 
                  htmlFor="add-new-image" 
                  className="flex items-center justify-center w-full h-full border border-dashed rounded-lg cursor-pointer text-sm transition-colors bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {newTaskImage ? "Change Image" : "Attach Image"}
                </label>
              </div>
            </div>

            <Button onClick={handleAddTask} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">
              Save Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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