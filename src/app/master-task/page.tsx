"use client";

import { useState } from "react";
import { 
  Check, Trash2, RotateCcw, Plus, LayoutList, Pencil, X, Calendar
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

  // Edit Task States
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskDate, setEditingTaskDate] = useState("");

  // Filter tasks
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
  const completedTasks = tasks.filter(t => t.status === 'done');

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    await supabase.from('tasks').insert({ 
      text: newTaskText.trim(), 
      status: 'ongoing',
      due_date: dueDate || null
    });
    setNewTaskText(""); 
    setDueDate("");
    setIsDialogOpen(false); 
    fetchData();
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const saveEditedTask = async (id: string) => {
    if (!editingTaskText.trim()) return;
    await supabase.from('tasks').update({ 
      text: editingTaskText.trim(),
      due_date: editingTaskDate || null
    }).eq('id', id);
    
    setEditingTaskId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
    fetchData();
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
    setEditingTaskDate(task.due_date || "");
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskText("");
    setEditingTaskDate("");
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
            {ongoingTasks.map(task => (
              <div key={task.id} className="bg-white border p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-start group">
                
                {/* Conditionally render input field OR text */}
                {editingTaskId === task.id ? (
                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <input 
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      placeholder="Task description"
                      className="border-b border-emerald-500 outline-none px-1 py-1 text-slate-700"
                    />
                    <div className="flex gap-2 items-center">
                      <input 
                        type="date"
                        value={editingTaskDate}
                        onChange={(e) => setEditingTaskDate(e.target.value)}
                        className="text-sm border rounded px-2 py-1 text-slate-600 outline-none focus:border-emerald-500"
                      />
                      <button onClick={() => saveEditedTask(task.id)} className="p-1.5 ml-auto bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={cancelEditing} className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-slate-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="text-slate-700 whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</p>
                    {task.due_date && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> {formatDate(task.due_date)}
                      </p>
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
            {completedTasks.map(task => (
              <div key={task.id} className="bg-white border p-4 rounded-xl shadow-sm flex justify-between items-start group">
                <div className="flex-1">
                  <p className="text-slate-400 line-through whitespace-pre-wrap break-words">{renderTextWithLinks(task.text)}</p>
                  {task.due_date && (
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(task.due_date)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
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
          </div>
        </div>

      </div>

      {/* Add Task Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <input 
              className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" 
              placeholder="What needs to be done?" 
              value={newTaskText} 
              onChange={e => setNewTaskText(e.target.value)} 
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600">Target Date (Optional)</label>
              <input 
                type="date"
                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
              />
            </div>
            <Button onClick={handleAddTask} className="w-full bg-emerald-600 hover:bg-emerald-700 mt-2">
              Save Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
