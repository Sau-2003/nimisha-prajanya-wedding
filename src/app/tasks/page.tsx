// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Check, Plus, RotateCcw, Trash2, LayoutList } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import { useTasks, TaskEntry } from "@/hooks/useTasks"; // <-- New Cloud Hook

// export default function TaskBoardPage() {
//   // 1. Fetch live data from Supabase
//   const { tasks, loading, fetchData } = useTasks();
  
//   // Filter tasks into their respective columns dynamically
//   const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
//   const doneTasks = tasks.filter(t => t.status === 'done');
  
//   // State for the pop-up
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [newTaskText, setNewTaskText] = useState("");

//   // --- CLOUD FUNCTIONS ---
//   const handleAddTask = async () => {
//     if (!newTaskText.trim()) return;
    
//     // We added error checking here
//     const { error } = await supabase.from('tasks').insert({
//       text: newTaskText.trim(),
//       status: 'ongoing'
//     });
    
//     if (error) {
//       alert("DATABASE ERROR: " + error.message);
//       console.error(error);
//       return;
//     }
    
//     fetchData(); // Force instant refresh
//     setNewTaskText("");
//     setIsDialogOpen(false);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleAddTask();
//     }
//   };

//   const markAsDone = async (task: TaskEntry) => {
//     await supabase.from('tasks').update({ status: 'done' }).eq('id', task.id);
//     fetchData();
//   };

//   const revertToOngoing = async (task: TaskEntry) => {
//     await supabase.from('tasks').update({ status: 'ongoing' }).eq('id', task.id);
//     fetchData();
//   };

//   const deleteTask = async (taskId: string) => {
//     await supabase.from('tasks').delete().eq('id', taskId);
//     fetchData();
//   };

//   if (loading) return <div className="p-12 text-center text-emerald-600 font-medium">Loading Tasks...</div>;

//   return (
//     <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
//         <div>
//           <h1 className="font-serif text-3xl font-bold text-emerald-900 flex items-center gap-3">
//             <LayoutList className="w-8 h-8 text-emerald-600" />
//             Global Task Board
//           </h1>
//           <p className="text-slate-500 mt-1">Manage everything you need to do before the big day.</p>
//         </div>
        
//         <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">
//           <Plus className="w-5 h-5 mr-2" /> New Task
//         </Button>
//       </div>

//       {/* Task Columns */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
//         {/* ONGOING TASKS COLUMN */}
//         <Card className="border-slate-200 shadow-sm bg-slate-50/50">
//           <CardHeader className="pb-4 border-b border-slate-200 mb-4 bg-white rounded-t-xl">
//             <CardTitle className="text-lg text-slate-800 flex justify-between">
//               Ongoing Tasks
//               <span className="bg-blue-100 text-blue-700 py-0.5 px-2.5 rounded-full text-sm">
//                 {ongoingTasks.length}
//               </span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {ongoingTasks.length === 0 ? (
//               <p className="text-center text-slate-400 py-8 italic">No ongoing tasks. You are all caught up!</p>
//             ) : (
//               ongoingTasks.map(task => (
//                 <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-emerald-300 transition-colors">
//                   <span className="text-slate-700 font-medium">{task.text}</span>
//                   <div className="flex gap-2">
//                     <button onClick={() => markAsDone(task)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" title="Mark as Done">
//                       <Check className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors" title="Delete">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//         {/* DONE TASKS COLUMN */}
//         <Card className="border-slate-200 shadow-sm bg-slate-50/50">
//           <CardHeader className="pb-4 border-b border-slate-200 mb-4 bg-white rounded-t-xl">
//             <CardTitle className="text-lg text-slate-800 flex justify-between">
//               Completed Tasks
//               <span className="bg-emerald-100 text-emerald-700 py-0.5 px-2.5 rounded-full text-sm">
//                 {doneTasks.length}
//               </span>
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {doneTasks.length === 0 ? (
//               <p className="text-center text-slate-400 py-8 italic">Completed tasks will appear here.</p>
//             ) : (
//               doneTasks.map(task => (
//                 <div key={task.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm opacity-75 hover:opacity-100 transition-opacity">
//                   <span className="text-slate-500 line-through">{task.text}</span>
//                   <div className="flex gap-2">
//                     <button onClick={() => revertToOngoing(task)} className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-md transition-colors" title="Revert to Ongoing">
//                       <RotateCcw className="w-4 h-4" />
//                     </button>
//                     <button onClick={() => deleteTask(task.id)} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors" title="Delete">
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </CardContent>
//         </Card>

//       </div>

//       {/* Add Task Pop-up Modal */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Add a New Task</DialogTitle>
//           </DialogHeader>
//           <div className="flex flex-col gap-4 mt-4">
//             <input 
//               autoFocus
//               type="text" 
//               placeholder="What needs to be done?" 
//               className="w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
//               value={newTaskText}
//               onChange={(e) => setNewTaskText(e.target.value)}
//               onKeyDown={handleKeyDown}
//             />
//             <Button onClick={handleAddTask} className="w-full bg-emerald-600 hover:bg-emerald-700">
//               Save Task
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, RotateCcw, Trash2, LayoutList, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTasks, TaskEntry } from "@/hooks/useTasks";

export default function TaskBoardPage() {
  const { tasks, loading, fetchData } = useTasks();
  
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
  const doneTasks = tasks.filter(t => t.status === 'done');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");

  // --- CLOUD FUNCTIONS ---
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

  const markAsDone = async (task: TaskEntry) => {
    await supabase.from('tasks').update({ status: 'done' }).eq('id', task.id);
    fetchData();
  };

  const revertToOngoing = async (task: TaskEntry) => {
    await supabase.from('tasks').update({ status: 'ongoing' }).eq('id', task.id);
    fetchData();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    fetchData();
  };

  if (loading) return <div className="p-12 text-center text-emerald-600 font-medium">Loading Tasks...</div>;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
          <LayoutList className="w-8 h-8 text-emerald-600" /> Global Task Board
        </h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600">New Task</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-slate-50/50">
          <CardHeader><CardTitle>Ongoing Tasks ({ongoingTasks.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {ongoingTasks.map(task => (
              <div key={task.id} className="p-4 bg-white border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-medium">{task.text}</span>
                  <div className="flex gap-2">
                    <button onClick={() => markAsDone(task)} className="p-1 text-emerald-600"><Check className="w-4 h-4" /></button>
                    <button onClick={() => deleteTask(task.id)} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {task.due_date && (
                  <div className="flex items-center text-xs text-emerald-600 font-bold bg-emerald-50 w-fit px-2 py-1 rounded">
                    <Calendar className="w-3 h-3 mr-1" /> {new Date(task.due_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-50/50">
           <CardHeader><CardTitle>Completed Tasks ({doneTasks.length})</CardTitle></CardHeader>
           <CardContent className="space-y-3">
             {doneTasks.map(task => (
               <div key={task.id} className="p-4 bg-white border rounded-lg opacity-75">
                 <span className="text-slate-500 line-through">{task.text}</span>
                 <div className="flex gap-2 mt-2">
                   <button onClick={() => revertToOngoing(task)} className="text-amber-600"><RotateCcw className="w-4 h-4" /></button>
                   <button onClick={() => deleteTask(task.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                 </div>
               </div>
             ))}
           </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <input className="border p-3 rounded" placeholder="Task..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)} />
          <input type="date" className="border p-3 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <Button onClick={handleAddTask}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}