// src/components/TaskDisplay.tsx
import { Calendar } from "lucide-react";

export function TaskDisplay({ task, showDateHeader }: { task: any, showDateHeader: boolean }) {
  return (
    <>
      {showDateHeader && (
        <h2 className="text-sm font-bold text-emerald-700 uppercase tracking-widest mt-6 mb-3">
          {task.due_date 
            ? new Date(task.due_date).toLocaleDateString('en-US', { 
                weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' 
              }) 
            : "No Due Date"}
        </h2>
      )}
      
      <div className="flex justify-between items-center p-4 border rounded-xl bg-white shadow-sm border-slate-100 hover:shadow-md transition-shadow">
        <div>
          <p className="font-semibold text-slate-800">{task.content || task.text}</p>
          {task.event_name && (
            <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1 uppercase">
              {task.event_name}
            </p>
          )}
        </div>
        
        {task.due_date && (
          <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </>
  );
}