"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  CheckCircle2, CalendarDays, LayoutList, Check, 
  Plus, RotateCcw, Trash2, Calendar, CalendarHeart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useTasks, TaskEntry } from "@/hooks/useTasks";
import { differenceInDays, differenceInWeeks } from 'date-fns';

const EVENTS_DATA = [
  { name: 'Puja', date: 'Jan 27, 2027', link: '/events/puja', color: 'bg-purple-500' },
  { name: 'Mehendi', date: 'Jan 29, 2027', link: '/events/mehendi', color: 'bg-emerald-500' },
  { name: 'Tilak', date: 'Jan 30, 2027', link: '/events/tilak', color: 'bg-green-500' },
  { name: 'Sangeet', date: 'Jan 30, 2027', link: '/events/sangeet', color: 'bg-blue-500' },
  { name: 'Haldi', date: 'Jan 31, 2027', link: '/events/haldi', color: 'bg-yellow-500' },
  { name: 'Reception', date: 'Jan 31, 2027', link: '/events/reception', color: 'bg-red-500' },
  { name: 'Phere', date: 'Jan 31, 2027', link: '/events/phere', color: 'bg-indigo-500' },
  { name: 'Pagphere', date: 'Feb 1, 2027', link: '/events/Pagphere', color: 'bg-violet-500' },
  { name: 'Vidai', date: 'Feb 1, 2027', link: '/events/vidai', color: 'bg-rose-500' },
];

export default function Dashboard() {
  const { tasks, fetchData } = useTasks();
  const ongoingTasks = tasks.filter(t => t.status === 'ongoing');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    await supabase.from('tasks').insert({ text: newTaskText.trim(), status: 'ongoing', due_date: dueDate || null });
    setNewTaskText(""); setDueDate(""); setIsDialogOpen(false); fetchData();
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-serif text-4xl font-bold text-slate-900">Nimisha & Prajanya</h1>
        <div className="text-right">
          <p className="text-lg text-slate-500 flex items-center gap-2"><CalendarHeart /> Jan 31, 2027</p>
        </div>
      </div>

      {/* Engagement Photo */}
      <div className="rounded-2xl overflow-hidden shadow-xl">
        <Image src="/engagement.jpg" alt="Our Proposal" width={1200} height={600} className="w-full h-auto" />
      </div>

      {/* Main Grid: Tasks + Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Task Board */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-lg flex items-center gap-2"><LayoutList /> Tasks</CardTitle>
            <Button size="sm" onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4" /></Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {ongoingTasks.slice(0, 5).map(task => (
              <div key={task.id} className="p-3 bg-slate-50 rounded-md text-sm">{task.text}</div>
            ))}
          </CardContent>
        </Card>

        {/* Event Schedule */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 /> Event Schedule</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EVENTS_DATA.map((evt) => (
              <Link key={evt.name} href={evt.link} className="p-4 border rounded-xl flex items-center gap-3 hover:border-emerald-500 transition-colors">
                <div className={`w-1.5 h-12 rounded-full ${evt.color}`}></div>
                <div>
                  <p className="font-medium">{evt.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {evt.date}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Task Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <input className="border p-3 rounded" placeholder="Task..." value={newTaskText} onChange={e => setNewTaskText(e.target.value)} />
          <input type="date" className="border p-3 rounded" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <Button onClick={handleAddTask}>Save Task</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}